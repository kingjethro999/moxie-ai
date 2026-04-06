// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBwi5FcHTOb2Cg8lfHFXFFE1FxTWEBEFLw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "moxie-ai-d8063.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "moxie-ai-d8063",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "moxie-ai-d8063.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "651981156267",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:651981156267:web:9e1b04bab5fdaaf5472cee",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GYLRX88HNB",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://moxie-ai-d8063-default-rtdb.firebaseio.com/",
};

// Initialize Firebase (prevent duplicate init)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Realtime Database
export const database = getDatabase(app);

// Auth
export const auth = getAuth(app);

export default app;