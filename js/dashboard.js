// ==== File: js/dashboard.js ====
import { firestoreDB } from './firebase-config.js';
import { 
    collection, query, orderBy, onSnapshot, where, limit 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Fungsi Update Tampilan Real-time (Suhu & Jam) ---
function listenForLatestTemperatures() {
    const q = query(
        collection(firestoreDB, 'temperature_logs'),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            
            // Konversi ke angka dan tampilkan ke ID yang benar
            const t1 = Number(data.temperature1 || 0).toFixed(2);
            const t2 = Number(data.temperature2 || 0).toFixed(2);

            const d1 = document.getElementById('suhu-1-display');
            const d2 = document.getElementById('suhu-2-display');
            const lu = document.getElementById('last-update');

            if (d1) d1.innerText = `${t1} °C`;
            if (d2) d2.innerText = `${t2} °C`;
            if (lu) lu.innerText = `Terakhir Update: ${data.timestamp}`;
        }
    }, (error) => {
        console.error("❌ Error real-time update:", error);
    });
}

// --- Fungsi Load Chart Data (Grafik) ---
function loadChartData(timeRange = 'live') {
    if (window.unsubscribeFirestore) window.unsubscribeFirestore();

    let q;
    const colRef = collection(firestoreDB, 'temperature_logs');

    if (timeRange === 'live') {
        q = query(colRef, orderBy('timestamp', 'desc'), limit(15));
    } else {
        const now = new Date();
        let startTime;
        if (timeRange === '1hour') startTime = new Date(now.getTime() - 3600000);
        else startTime = new Date(now.getTime() - 86400000);

        q = query(
            colRef,
            where('timestamp', '>=', startTime.toISOString()),
            orderBy('timestamp', 'asc')
        );
    }

    window.unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const labels = [];
        const temp1 = [];
        const temp2 = [];

        snapshot.forEach((doc) => {
            const d = doc.data();
            labels.push(new Date(d.timestamp));
            temp1.push(Number(d.temperature1));
            temp2.push(Number(d.temperature2));
        });

        if (timeRange === 'live') {
            labels.reverse(); temp1.reverse(); temp2.reverse();
        }
        
        // Panggil fungsi update grafik (pastikan fungsi updateChart sudah ada)
        if (typeof updateChart === "function") {
            updateChart(labels, temp1, temp2);
        }
    }, (error) => {
        console.error("❌ Error chart:", error);
    });
}

// Jalankan saat halaman siap
document.addEventListener('DOMContentLoaded', () => {
    listenForLatestTemperatures();
    loadChartData('live');
});
