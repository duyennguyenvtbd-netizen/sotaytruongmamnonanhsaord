import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration for Trường Mầm non Ánh Sao
export const firebaseConfig = {
  apiKey: "AIzaSyBY82n06fWlKOzfPoE9XfRV0LQzmAUB9WQ",
  authDomain: "sotaytruongmamnonanhsao.firebaseapp.com",
  projectId: "sotaytruongmamnonanhsao",
  storageBucket: "sotaytruongmamnonanhsao.firebasestorage.app",
  messagingSenderId: "300000653666",
  appId: "1:300000653666:web:ff08b81c4e0fe2bd3efc3b"
};

// Initialize Firebase safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
