import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 追加

const firebaseConfig = {
  projectId: "design-subscription-5675-d0f6d",
  appId: "1:202925749880:web:617285fad1f4b694dc5f8d",
  storageBucket: "design-subscription-5675-d0f6d.firebasestorage.app",
  apiKey: "AIzaSyAETkVKpJ4kyWhmnx9IhjbqoA9_-f01vPw",
  authDomain: "design-subscription-5675-d0f6d.firebaseapp.com",
  messagingSenderId: "202925749880"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app); // これを必ず追加してください