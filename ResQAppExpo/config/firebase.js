// src/config/firebase.js

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ✅ Replace these placeholders with actual values from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBUSm-I4BTGsqR67BWlqqH3g-XKCLd-6Jc",
  authDomain: "resq-88278.firebaseapp.com",
  projectId: "resq-88278",
  storageBucket: "resq-88278.firebasestorage.app",
  messagingSenderId: "230747971786",
  appId: "1:230747971786:web:7580c88730a0dea3321433"
};

// ✅ Prevent reinitialization of Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize Firestore and Storage instances
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export for use in your app
export { db, storage };
