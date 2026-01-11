// ==== File: js/firebase-config.js ====

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Konfigurasi ini diambil dari kode Arduino Anda untuk memastikan sinkronisasi
const firebaseConfig = {
  apiKey: "AIzaSyBU342VhDqSaLhCcvvn6BFH9jRpoE-ca8c",
  authDomain: "suhu-4d6bd.firebaseapp.com",
  databaseURL: "https://suhu-4d6bd-default-rtdb.firebaseio.com",
  projectId: "suhu-4d6bd",
  storageBucket: "suhu-4d6bd.appspot.com", // Perbaikan kecil, .appspot.com adalah format umum
  messagingSenderId: "489903971730",
  appId: "1:489903971730:web:4ada7961e52bdb5f8e754b"
};

const app = initializeApp(firebaseConfig);
const firestoreDB = getFirestore(app);
const realtimeDB = getDatabase(app);

export { firestoreDB, realtimeDB };