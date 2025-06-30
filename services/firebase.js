import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD4URsW4aiFRDgn72VvF_KwTwAImzscacc",
  authDomain: "alfi-c6f58.firebaseapp.com",
  databaseURL: "https://alfi-c6f58-default-rtdb.firebaseio.com",
  projectId: "alfi-c6f58",
  storageBucket: "alfi-c6f58.firebasestorage.app",
  messagingSenderId: "839280828747",
  appId: "1:839280828747:web:861a79a41c70ab6445c8ce",
  measurementId: "G-FE00Y2NMJF"
};

let app;
let auth;
let db;
let rtdb;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
  } catch (error) {
    if (error.code === 'auth/already-initialized') {
      auth = getAuth(app);
    } else {
      console.warn('Auth initialization error:', error);
      auth = getAuth(app);
    }
  }

  try {
    db = getFirestore(app);
  } catch (error) {
    console.error('Firestore initialization error:', error);
    db = null;
  }

  try {
    rtdb = getDatabase(app);
    console.log('✅ RTDB initialized for mode-based architecture');
  } catch (error) {
    console.error('⚠️ RTDB initialization error:', error);
    rtdb = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
  auth = null;
  db = null;
  rtdb = null;
}

export { auth, db, rtdb, app };