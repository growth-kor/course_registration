import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

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
