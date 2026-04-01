import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];

export const isFirebaseConfigured = requiredKeys.every(
  (key) => !!firebaseConfig[key],
);

export const firebaseSetupMessage =
  'Firebase is not configured. Add your VITE_FIREBASE_* values to enable shared response storage.';

let db = null;
let realtimeDb = null;
let firebaseBackend = 'local';

if (isFirebaseConfigured) {
  const app = initializeApp(firebaseConfig);

  // Prefer Realtime Database when a database URL is available.
  // This project already carries an RTDB URL in env comments, so this keeps
  // the app working even when Firestore is not enabled in the Firebase console.
  if (firebaseConfig.databaseURL) {
    realtimeDb = getDatabase(app);
    firebaseBackend = 'realtime-database';
  } else {
    db = getFirestore(app);
    firebaseBackend = 'firestore';
  }
}

export { db, firebaseBackend, realtimeDb };
