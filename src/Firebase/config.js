import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserSessionPersistence, onAuthStateChanged, signOut, browserLocalPersistence} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {getFirestore, setDoc, doc, addDoc, collection, query, getDocs, getDoc, deleteDoc, updateDoc} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyCayk8QNCwkr_QWgSGWubIKFJYxTvQUZ_c",
    authDomain: "surveyapp-cbc28.firebaseapp.com",
    projectId: "surveyapp-cbc28",
    storageBucket: "surveyapp-cbc28.firebasestorage.app",
    messagingSenderId: "1001051629392",
    appId: "1:1001051629392:web:b29244e9fe7788145b2e55",
    measurementId: "G-GP4Q2R8WM0"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const user = auth.currentUser;

async function signInWithSession(email, password) {
  try {
    await setPersistence(auth, browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Giriş başarılı:", userCredential.user);
    alert("GİRİŞ BAŞARILI");

    return userCredential.user;
  } catch (error) {
    console.error("Giriş sırasında hata oluştu:", error.message);
    return null;
  }
}

export {app, auth, db, doc, setDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, user, onAuthStateChanged, setPersistence, browserSessionPersistence, browserLocalPersistence, signInWithSession, signOut, addDoc, collection, getAuth, query, getDocs, getDoc, deleteDoc, updateDoc}