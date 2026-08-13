import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, updateDoc, query, where, getDocs, arrayUnion } from 'firebase/firestore';

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

export function initFirebase(customConfig = null) {
  const config = customConfig || getStoredFirebaseConfig();
  if (!config || !config.apiKey) {
    return { isConfigured: false, auth: null, db: null };
  }

  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    return { isConfigured: true, auth, db };
  } catch (err) {
    console.error("Firebase init error:", err);
    return { isConfigured: false, error: err.message, auth: null, db: null };
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

export async function createRoom(ownerId, ownerName, roomName, isPublic) {
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
        [ownerId]: { name: ownerName, joinedAt: new Date().toISOString() }
      }
    };

    const roomRef = await addDoc(collection(db, 'rooms'), roomData);
    return { id: roomRef.id, ...roomData };
  } catch (e) {
    console.error("Error creating room:", e);
    return null;
  }
}

export async function joinRoomByCode(inviteCode, userId, userName) {
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
      [`memberDetails.${userId}`]: { name: userName, joinedAt: new Date().toISOString() }
    });

    return { success: true, room: { id: roomDoc.id, ...roomData, memberIds: [...roomData.memberIds, userId] } };
  } catch (e) {
    console.error("Error joining room:", e);
    return { success: false, message: '방 참여 중 오류가 발생했습니다.' };
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
