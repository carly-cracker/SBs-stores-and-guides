import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAoLKwJc-cb0wDk817Jj4dmRiV_EQmtg3c",
    authDomain: "sb-s-stores-and-guides.firebaseapp.com",
    projectId: "sb-s-stores-and-guides",
    storageBucket: "sb-s-stores-and-guides.firebasestorage.app",
    messagingSenderId: "83802134031",
    appId: "1:83802134031:web:9f4e79a406c12c7ed2757a"
  };
  
  const app = initializeApp(firebaseConfig);
  
  export const auth = getAuth(app);
  export const db = getFirestore(app)