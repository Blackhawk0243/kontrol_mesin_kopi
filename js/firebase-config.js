// ==== File: js/firebase-config.js ====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhiRjtrFVFKr99eWL-jtxKnmBTFafvcxk", 
    authDomain: "kwhmeter-c92c7.firebaseapp.com",
    projectId: "kwhmeter-c92c7",
    storageBucket: "kwhmeter-c92c7.appspot.com",
    messagingSenderId: "533045697275",
    appId: "1:533045697275:web:6de44f6bed3899de2d2e5e"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Export agar bisa digunakan di dashboard.js
export const firestoreDB = getFirestore(app);

console.log("✅ Firebase Config Loaded");
