// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration object (from Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyD3tkdwkjOyq2qgWRxVCsubAc4LGRY0Vyc",
  authDomain: "embeddedproject-98fbc.firebaseapp.com",
  projectId: "embeddedproject-98fbc",
  storageBucket: "embeddedproject-98fbc.appspot.com",
  messagingSenderId: "908186178961",
  appId: "1:908186178961:web:3bcf6d10b270f74ea8f630",
  measurementId: "G-01TTMJHY9D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Authentication

export { db, auth };
