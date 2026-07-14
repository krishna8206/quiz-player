import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration using Vite environment variables.
// If these are not provided, the app will gracefully fall back to LocalStorage.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let db = null;
let isFirebaseConfigured = false;

// Check if credentials are present
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    isFirebaseConfigured = true;
    console.log("Firebase initialized successfully with project ID:", firebaseConfig.projectId);
  } catch (error) {
    console.warn("Firebase initialization failed:", error);
  }
} else {
  console.log("Firebase environment variables missing. Running in LocalStorage fallback mode.");
}

export { db, isFirebaseConfigured };
