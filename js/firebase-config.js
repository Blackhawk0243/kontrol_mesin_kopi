<script type="module">
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
      // Ambil dokumen pertama (karena kita limit 1)
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      console.log("Data Terbaru:", data);

      // Update Tampilan HTML
      if (document.getElementById("temp1")) {
        document.getElementById("temp1").innerText = data.temperature1.toFixed(1) + " °C";
      }
      if (document.getElementById("temp2")) {
        document.getElementById("temp2").innerText = data.temperature2.toFixed(1) + " °C";
      }
      
      // Tampilkan jam update terakhir
      if (document.getElementById("last-update")) {
         document.getElementById("last-update").innerText = "Update: " + data.timestamp;
      }
      
    } else {
      console.log("Database kosong.");
    }
  }, (error) => {
    console.error("Error:", error);
    // PENTING: Jika error di console browser bilang "The query requires an index",
    // Klik link yang muncul di error itu untuk membuat Index di Firebase Console.
  });
</script>
