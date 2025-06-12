import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDXKj-ZsNWqkwxvB7iYMgSzXKY1WmUkutw",
  authDomain: "haikal-ef006.firebaseapp.com",
  projectId: "haikal-ef006",
  storageBucket: "haikal-ef006.firebasestorage.app",
  messagingSenderId: "11927917023",
  appId: "1:11927917023:web:11135a87b63106fe56346a",
  measurementId: "G-8B1KZ5DLJ4"
};

let app;
let auth;
let db;

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
} catch (error) {
  console.error('Firebase initialization error:', error);
  app = null;
  auth = null;
  db = null;
}

export { auth, db, app };