import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANyPGc4qhbug6mOPP6xt8pqAziNB8WBJk",
  authDomain: "arduino-node-d7dd9.firebaseapp.com",
  projectId: "arduino-node-d7dd9",
  storageBucket: "arduino-node-d7dd9.appspot.com",
  messagingSenderId: "1039381278094",
  appId: "1:1039381278094:web:a53ac928828ab07f1648df",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
