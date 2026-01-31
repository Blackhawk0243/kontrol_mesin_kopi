// ==== File: js/dashboard.js ====
import { firestoreDB } from './firebase-config.js';
import { 
    collection, query, orderBy, onSnapshot, where, limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let suhuChart;
let unsubscribeFirestore = null;

// --- Fungsi Update Angka Terbaru ---
function listenForLatest() {
    // Pastikan firestoreDB sudah ter-import dengan benar
    const colRef = collection(firestoreDB, 'temperature_logs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(1));

    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const t1 = Number(data.temperature1 || 0).toFixed(2);
            const t2 = Number(data.temperature2 || 0).toFixed(2);

            if(document.getElementById('suhu-1-display')) 
                document.getElementById('suhu-1-display').innerText = `${t1} °C`;
            if(document.getElementById('suhu-2-display')) 
                document.getElementById('suhu-2-display').innerText = `${t2} °C`;
            if(document.getElementById('last-update')) 
                document.getElementById('last-update').innerText = "Update: " + data.timestamp;
        }
    });
}

// --- Fungsi Load Grafik ---
function loadChartData(range = 'live') {
    if (unsubscribeFirestore) unsubscribeFirestore();
    const colRef = collection(firestoreDB, 'temperature_logs');
    let q;

    if (range === 'live') {
        q = query(colRef, orderBy('timestamp', 'desc'), limit(10));
    } else {
        const now = new Date();
        let startTime = range === '1hour' ? new Date(now.getTime() - 3600000) : new Date(now.getTime() - 86400000);
        q = query(colRef, where('timestamp', '>=', startTime.toISOString()), orderBy('timestamp', 'asc'));
    }

    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const labels = [], d1 = [], d2 = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            labels.push(new Date(data.timestamp));
            d1.push(Number(data.temperature1));
            d2.push(Number(data.temperature2));
        });

        if (range === 'live') { labels.reverse(); d1.reverse(); d2.reverse(); }
        updateChart(labels, d1, d2);
    }, (error) => {
        console.error("❌ Firestore Error:", error.message);
    });
}

function updateChart(labels, data1, data2) {
    if (!suhuChart) return;
    suhuChart.data.labels = labels;
    suhuChart.data.datasets[0].data = data1;
    suhuChart.data.datasets[1].data = data2;
    suhuChart.update();
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
    // Pastikan fungsi initializeChart() sudah Anda definisikan sebelumnya
    if (typeof initializeChart === 'function') initializeChart();
    listenForLatest();
    loadChartData('live');
});
