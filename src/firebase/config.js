import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, query, where, getDocs, arrayUnion, arrayRemove, deleteDoc, deleteField, increment } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const LOCAL_STORAGE_KEY_FIREBASE_CFG = 'brutalist_planner_firebase_config';

// User's default Firebase configuration
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBWG8HMnsQw5MZyA7cvFBdoSC0eU1CvvsA",
  authDomain: "course-registration-f82e3.firebaseapp.com",
  projectId: "course-registration-f82e3",
  storageBucket: "course-registration-f82e3.firebasestorage.app",
  messagingSenderId: "941783175553",
  appId: "1:941783175553:web:040a8bc77610bce8c29880",
  measurementId: "G-GMYXG1FH8B"
};

export function getStoredFirebaseConfig() {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FIREBASE_CFG);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to parse stored firebase config", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  localStorage.setItem(LOCAL_STORAGE_KEY_FIREBASE_CFG, JSON.stringify(config));
}

let app = null;
let auth = null;
let db = null;
let storage = null;

export function initFirebase(customConfig = null) {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey) {
    return { isConfigured: false, auth: null, db: null, storage: null };
  }

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    return { isConfigured: true, auth, db, storage };
  } catch (err) {
    console.error("Firebase init error:", err);
    return { isConfigured: false, error: err.message, auth: null, db: null, storage: null };
  }
}

export async function loginWithGoogle() {
  const { isConfigured, auth } = initFirebase();
  if (!isConfigured || !auth) {
    throw new Error("Firebase가 아직 설정되지 않았습니다.");
  }
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export async function logoutUser() {
  const { auth } = initFirebase();
  if (auth) {
    await firebaseSignOut(auth);
  }
}

export async function updateUserProfile(user, newName, statusMessage) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !user) return false;

  try {
    // 1. Update Firebase Auth Profile if name changed
    if (newName && newName !== user.displayName) {
      await updateProfile(user, { displayName: newName });
    }

    // 2. Save to users collection
    const userRef = doc(db, 'users', user.uid);
    const userUpdates = {};
    if (newName) userUpdates.name = newName;
    if (statusMessage !== undefined) userUpdates.statusMessage = statusMessage;
    await setDoc(userRef, userUpdates, { merge: true });

    // 3. Update user's name and status in all rooms they belong to
    const q = query(collection(db, 'rooms'), where('memberIds', 'array-contains', user.uid));
    const querySnapshot = await getDocs(q);
    
    // Process each room individually
    const promises = querySnapshot.docs.map(roomDoc => {
      const roomRef = doc(db, 'rooms', roomDoc.id);
      const updates = {};
      if (newName) updates[`memberDetails.${user.uid}.name`] = newName;
      if (statusMessage !== undefined) updates[`memberDetails.${user.uid}.statusMessage`] = statusMessage;
      
      return Object.keys(updates).length > 0 ? updateDoc(roomRef, updates) : Promise.resolve();
    });
    
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error("Error updating user profile:", err);
    return false;
  }
}

export async function getUserProfile(userId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !userId) return null;

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return null;
  }
}

export async function updateMemberSharedPlan(roomId, userId, newSharedPlanId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !userId) return false;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      [`memberDetails.${userId}.sharedPlanId`]: newSharedPlanId
    });
    return true;
  } catch (e) {
    console.error("Error updating member shared plan:", e);
    return false;
  }
}

// Cloud Storage for Schedule Data in Firestore
export async function saveScheduleToFirestore(userId, scheduleData) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !userId) return false;
  
  try {
    const userRef = doc(db, 'user_schedules', userId);
    await setDoc(userRef, {
      updatedAt: new Date().toISOString(),
      scheduleData: JSON.stringify(scheduleData)
    }, { merge: true });
    return true;
  } catch (e) {
    console.error("Error saving schedule to Firestore:", e);
    return false;
  }
}

export async function loadScheduleFromFirestore(userId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !userId) return null;

  try {
    const userRef = doc(db, 'user_schedules', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists() && docSnap.data().scheduleData) {
      return JSON.parse(docSnap.data().scheduleData);
    }
  } catch (e) {
    console.error("Error loading schedule from Firestore:", e);
  }
  return null;
}

// ==========================================
// Shared Rooms (공유 시간표 방) Functions
// ==========================================

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createRoom(ownerId, ownerName, roomName, isPublic, sharedPlanId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !ownerId) return null;

  try {
    let inviteCode = generateInviteCode();
    // In a real app, check if inviteCode is unique. For now, assume it's unique enough.
    
    const roomData = {
      name: roomName,
      isPublic,
      inviteCode,
      ownerId,
      createdAt: new Date().toISOString(),
      memberIds: [ownerId],
      memberDetails: {
        [ownerId]: { name: ownerName, joinedAt: new Date().toISOString(), sharedPlanId: sharedPlanId || 'default' }
      }
    };

    const roomRef = await addDoc(collection(db, 'rooms'), roomData);
    return { id: roomRef.id, ...roomData };
  } catch (e) {
    console.error("Error creating room:", e);
    return null;
  }
}

export async function joinRoomByCode(inviteCode, userId, userName, sharedPlanId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !userId) return { success: false, message: 'Not initialized' };

  try {
    const q = query(collection(db, 'rooms'), where('inviteCode', '==', inviteCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: '방 코드를 찾을 수 없습니다.' };
    }

    const roomDoc = querySnapshot.docs[0];
    const roomData = roomDoc.data();

    if (roomData.memberIds.includes(userId)) {
      return { success: false, message: '이미 참여중인 방입니다.' };
    }

    // Update room with new member
    await updateDoc(roomDoc.ref, {
      memberIds: arrayUnion(userId),
      [`memberDetails.${userId}`]: { name: userName, joinedAt: new Date().toISOString(), sharedPlanId: sharedPlanId || 'default' }
    });

    return { success: true, room: { id: roomDoc.id, ...roomData, memberIds: [...roomData.memberIds, userId] } };
  } catch (e) {
    console.error("Error joining room:", e);
    return { success: false, message: '방 참여 중 오류가 발생했습니다.' };
  }
}

export async function removeMember(roomId, userId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !userId) return false;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      memberIds: arrayRemove(userId),
      [`memberDetails.${userId}`]: deleteField()
    });
    return true;
  } catch (e) {
    console.error("Error removing member:", e);
    return false;
  }
}

export async function updateRoomInfo(roomId, updates) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId) return false;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, updates);
    return true;
  } catch (e) {
    console.error("Error updating room info:", e);
    return false;
  }
}

export async function deleteRoom(roomId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId) return false;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await deleteDoc(roomRef);
    return true;
  } catch (e) {
    console.error("Error deleting room:", e);
    return false;
  }
}

export async function transferOwnership(roomId, newOwnerId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !newOwnerId) return false;

  try {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ownerId: newOwnerId
    });
    return true;
  } catch (e) {
    console.error("Error transferring ownership:", e);
    return false;
  }
}

export async function fetchRoomsForUser(userId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !userId) return [];

  try {
    const q = query(collection(db, 'rooms'), where('memberIds', 'array-contains', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error fetching user rooms:", e);
    return [];
  }
}

export async function fetchPublicRooms() {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db) return [];

  try {
    const q = query(collection(db, 'rooms'), where('isPublic', '==', true));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error fetching public rooms:", e);
    return [];
  }
}

// ==========================================
// Shared Room Board (방 게시판) Functions
// ==========================================

export async function fetchPosts(roomId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId) return [];

  try {
    const postsRef = collection(db, 'rooms', roomId, 'posts');
    const querySnapshot = await getDocs(postsRef);
    const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by createdAt descending (newest first)
    return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (e) {
    console.error("Error fetching posts:", e);
    return [];
  }
}

export async function addPost(roomId, userId, userName, category, title, content, poll = null) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !userId || !content) return null;

  try {
    const postsRef = collection(db, 'rooms', roomId, 'posts');
    const postData = {
      authorId: userId,
      authorName: userName,
      category: category || '일반',
      title: title || '(제목 없음)',
      content,
      createdAt: new Date().toISOString(),
      likes: [],
      views: 0
    };
    
    if (poll && poll.options && poll.options.length > 0) {
      postData.poll = {
        multipleChoice: poll.multipleChoice || false,
        options: poll.options.map((opt, idx) => ({ id: idx, text: opt, votes: [] }))
      };
    }

    const newDoc = await addDoc(postsRef, postData);
    
    // Update room lastActivityAt
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { lastActivityAt: new Date().toISOString() });
    
    return { id: newDoc.id, ...postData };
  } catch (e) {
    console.error("Error adding post:", e);
    return null;
  }
}

export async function deletePost(roomId, postId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId) return false;

  try {
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    await deleteDoc(postRef);
    return true;
  } catch (e) {
    console.error("Error deleting post:", e);
    return false;
  }
}

export async function updatePost(roomId, postId, category, title, content) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId || !content) return false;

  try {
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    await updateDoc(postRef, {
      category: category || '일반',
      title: title || '(제목 없음)',
      content,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (e) {
    console.error("Error updating post:", e);
    return false;
  }
}

export async function incrementPostView(roomId, postId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId) return false;

  try {
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    await updateDoc(postRef, {
      views: increment(1)
    });
    return true;
  } catch (e) {
    console.error("Error incrementing views:", e);
    return false;
  }
}

export async function togglePostLike(roomId, postId, userId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId || !userId) return false;

  try {
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return false;

    const data = postSnap.data();
    const currentLikes = data.likes || [];
    const isLiked = currentLikes.includes(userId);
    
    const newLikes = isLiked 
      ? currentLikes.filter(id => id !== userId)
      : [...currentLikes, userId];
      
    await updateDoc(postRef, { likes: newLikes });
    return { isLiked: !isLiked, likesCount: newLikes.length };
  } catch (e) {
    console.error("Error toggling like:", e);
    return false;
  }
}

export async function votePoll(roomId, postId, userId, optionId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId || !userId) return false;

  try {
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return false;

    const data = postSnap.data();
    if (!data.poll || !data.poll.options) return false;

    let newOptions = [...data.poll.options];
    
    if (!data.poll.multipleChoice) {
      // Remove user from all other options first
      newOptions = newOptions.map(opt => ({
        ...opt,
        votes: opt.votes.filter(id => id !== userId)
      }));
    }

    // Toggle vote on selected option
    const targetOption = newOptions.find(o => o.id === optionId);
    if (targetOption) {
      if (targetOption.votes.includes(userId)) {
        targetOption.votes = targetOption.votes.filter(id => id !== userId);
      } else {
        targetOption.votes.push(userId);
      }
    }

    await updateDoc(postRef, { 'poll.options': newOptions });
    return newOptions;
  } catch (e) {
    console.error("Error voting on poll:", e);
    return false;
  }
}

export async function fetchComments(roomId, postId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId) return [];

  try {
    const commentsRef = collection(db, 'rooms', roomId, 'posts', postId, 'comments');
    const querySnapshot = await getDocs(commentsRef);
    const comments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort by createdAt ascending (oldest first)
    return comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } catch (e) {
    console.error("Error fetching comments:", e);
    return [];
  }
}

export async function addComment(roomId, postId, userId, userName, content, parentId = null) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId || !userId || !content) return null;

  try {
    const commentsRef = collection(db, 'rooms', roomId, 'posts', postId, 'comments');
    const commentData = {
      authorId: userId,
      authorName: userName,
      content,
      parentId,
      createdAt: new Date().toISOString()
    };
    const newDoc = await addDoc(commentsRef, commentData);
    
    // Increment comment count on post
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    await updateDoc(postRef, { commentCount: increment(1) }).catch(() => {});

    // Update room lastActivityAt
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, { lastActivityAt: new Date().toISOString() }).catch(() => {});

    return { id: newDoc.id, ...commentData };
  } catch (e) {
    console.error("Error adding comment:", e);
    return null;
  }
}

export async function deleteComment(roomId, postId, commentId) {
  const { isConfigured, db } = initFirebase();
  if (!isConfigured || !db || !roomId || !postId || !commentId) return false;

  try {
    const commentRef = doc(db, 'rooms', roomId, 'posts', postId, 'comments', commentId);
    await deleteDoc(commentRef);

    // Decrement comment count on post
    const postRef = doc(db, 'rooms', roomId, 'posts', postId);
    await updateDoc(postRef, { commentCount: increment(-1) }).catch(() => {});

    return true;
  } catch (e) {
    console.error("Error deleting comment:", e);
    return false;
  }
}

export async function uploadImage(file, path = 'images') {
  const { isConfigured, storage } = initFirebase();
  if (!isConfigured || !storage || !file) return null;

  try {
    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e) {
    console.error("Error uploading image:", e);
    return null;
  }
}
