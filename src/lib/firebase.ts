import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8IllSm8bFXBODlaHdS93XVOeeu1pqwoM",
  authDomain: "quikshopping-prototype-1.firebaseapp.com",
  projectId: "quikshopping-prototype-1",
  storageBucket: "quikshopping-prototype-1.firebasestorage.app",
  messagingSenderId: "1015325806600",
  appId: "1:1015325806600:web:34297399073bb6a85701bd",
  measurementId: "G-WKFDFQ5R2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;