// ==== File: js/dashboard.js ====
import { firestoreDB } from './firebase-config.js';
import { 
    collection, query, orderBy, onSnapshot, where, limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let suhuChart;
let currentChartData = { labels: [], data1: [], data2: [] };
let unsubscribeFirestore = null;
let currentLiveLimit = 10;

// --- 1. Inisialisasi Grafik ---
function initializeChart() {
    const canvas = document.getElementById('suhuChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    suhuChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Suhu 1 (°C)', data: [], borderColor: '#fbbf24', tension: 0.4, fill: true, backgroundColor: 'rgba(251, 191, 36, 0.1)' },
                { label: 'Suhu 2 (°C)', data: [], borderColor: '#3b82f6', tension: 0.4, fill: true, backgroundColor: 'rgba(59, 130, 246, 0.1)' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: 'time', time: { unit: 'minute' }, ticks: { color: '#94a3b8' } },
                y: { ticks: { color: '#94a3b8' } }
            },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    });
}

// --- 2. Update Tampilan Real-time ---
function listenForLatest() {
    const q = query(collection(firestoreDB, 'temperature_logs'), orderBy('timestamp', 'desc'), limit(1));
    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            const t1 = Number(data.temperature1 || 0).toFixed(1);
            const t2 = Number(data.temperature2 || 0).toFixed(1);
            
            const d1 = document.getElementById('suhu-1-display');
            const d2 = document.getElementById('suhu-2-display');
            const lu = document.getElementById('last-update');

            if(d1) d1.innerText = t1 + " °C";
            if(d2) d2.innerText = t2 + " °C";
            if(lu) lu.innerText = "Update: " + data.timestamp;
        }
    });
}

// --- 3. Load Data Grafik ---
function loadChartData(range = 'live') {
    if (unsubscribeFirestore) unsubscribeFirestore();
    const colRef = collection(firestoreDB, 'temperature_logs');
    let q;

    if (range === 'live') {
        q = query(colRef, orderBy('timestamp', 'desc'), limit(currentLiveLimit));
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
        
        suhuChart.data.labels = labels;
        suhuChart.data.datasets[0].data = d1;
        suhuChart.data.datasets[1].data = d2;
        suhuChart.update();
        currentChartData = { labels, data1: d1, data2: d2 };
    }, (err) => {
        console.error("❌ Firestore Error:", err.message);
    });
}

// --- 4. Inisialisasi ---
document.addEventListener('DOMContentLoaded', () => {
    initializeChart();
    listenForLatest();
    loadChartData('live');

    // Event filter tombol
    document.querySelectorAll('[data-time-range]').forEach(btn => {
        btn.addEventListener('click', () => loadChartData(btn.dataset.timeRange));
    });
});
