// ==== File: js/firebase-config.js ====

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Konfigurasi ini diambil dari kode Arduino Anda untuk memastikan sinkronisasi
const firebaseConfig = {
  apiKey: "AIzaSyAhiRjtrFVFKr99eWL-jtxKnmBTFafvcxk",
  authDomain: "kwhmeter-c92c7.firebaseapp.com",
  databaseURL: "https://kwhmeter-c92c7-default-rtdb.firebaseio.com",
  projectId: "kwhmeter-c92c7",
  storageBucket: "kwhmeter-c92c7.firebasestorage.app", // Perbaikan kecil, .appspot.com adalah format umum
  messagingSenderId: "533045697275",
  appId: "1:533045697275:web:6de44f6bed3899de2d2e5e""
};

const app = initializeApp(firebaseConfig);
const firestoreDB = getFirestore(app);
const realtimeDB = getDatabase(app);


export { firestoreDB, realtimeDB };
