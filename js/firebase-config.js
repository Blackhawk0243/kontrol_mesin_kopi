
  // Import fungsi Query (query, orderBy, limit, collection)
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getFirestore, collection, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyAhiRjtrFVFKr99eWL-jtxKnmBTFafvcxk", 
    authDomain: "kwhmeter-c92c7.firebaseapp.com",
    projectId: "kwhmeter-c92c7",
    storageBucket: "kwhmeter-c92c7.appspot.com",
    messagingSenderId: "533045697275", // Sesuaikan jika perlu
    appId: "1:533045697275:web:6de44f6bed3899de2d2e5e"          // Sesuaikan jika perlu
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // ==================================================================
  // LOGIKA BARU: QUERY DATA TERAKHIR
  // ==================================================================
  
  // 1. Masuk ke koleksi "temperature_logs"
  const logsCollection = collection(db, "temperature_logs");

  // 2. Buat Query: "Urutkan timestamp dari Z ke A (Terbaru), ambil 1 saja"
  const q = query(logsCollection, orderBy("timestamp", "desc"), limit(1));

  console.log("Menunggu data terbaru masuk...");

  // 3. Dengarkan hasil Query
  onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      console.log("Data Terbaru dari ESP32:", data);

      // Gunakan Number() untuk memastikan data diperlakukan sebagai angka
      const t1 = Number(data.temperature1);
      const t2 = Number(data.temperature2);

      // Perbaiki ID: Sesuaikan dengan dashboard.html (biasanya suhu-1-display)
      const display1 = document.getElementById("suhu-1-display");
      const display2 = document.getElementById("suhu-2-display");

      if (display1) display1.innerText = t1.toFixed(2) + " °C";
      if (display2) display2.innerText = t2.toFixed(2) + " °C";
      
      const lastUpdate = document.getElementById("last-update");
      if (lastUpdate) lastUpdate.innerText = "Update: " + data.timestamp;
      
    } else {
      console.log("Database kosong.");
    }
  }, (error) => {
    console.error("Firestore Error:", error);
  });
</script>


