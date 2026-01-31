// ==== File: js/dashboard.js (Versi Monitoring Saja) ====

import { firestoreDB } from './firebase-config.js';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    where, 
    limit
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Catatan: Realtime Database import dihapus karena tidak lagi digunakan untuk kontrol tombol

// --- Variabel Global ---
let suhuChart;
let currentChartData = { labels: [], data1: [], data2: [] };
let unsubscribeFirestore = null;
let currentLiveLimit = 10; // Default limit untuk data live

// --- Inisialisasi Chart.js ---
function initializeChart() {
    const canvas = document.getElementById('suhuChart');
    if (!canvas) {
        console.error("❌ Element 'suhuChart' tidak ditemukan!");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient1.addColorStop(0, 'rgba(251, 191, 36, 0.5)');
    gradient1.addColorStop(1, 'rgba(251, 191, 36, 0.05)');

    const gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
    gradient2.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient2.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
    
    suhuChart = new Chart(ctx, { 
        type: 'line', 
        data: { 
            labels: [], 
            datasets: [
                { 
                    label: 'Suhu 1 (°C)', 
                    data: [], 
                    borderColor: 'rgb(251, 191, 36)', 
                    backgroundColor: gradient1, 
                    borderWidth: 3, 
                    tension: 0.4, 
                    fill: true, 
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(251, 191, 36)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7 
                },
                { 
                    label: 'Suhu 2 (°C)', 
                    data: [], 
                    borderColor: 'rgb(59, 130, 246)', 
                    backgroundColor: gradient2, 
                    borderWidth: 3, 
                    tension: 0.4, 
                    fill: true, 
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7 
                }
            ] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            interaction: { intersect: false, mode: 'index' }, 
            plugins: { 
                legend: { 
                    labels: { color: 'white', font: { size: 14, family: "'Inter', sans-serif" } },
                    position: 'top'
                },
                tooltip: { 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    titleColor: 'rgb(251, 191, 36)', 
                    bodyColor: 'white', 
                    borderColor: 'rgba(255,255,255,0.1)', 
                    borderWidth: 1, 
                    cornerRadius: 8, 
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    callbacks: {
                        title: (tooltipItems) => {
                            if (tooltipItems.length > 0) {
                                const date = new Date(tooltipItems[0].parsed.x);
                                return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - ' + date.toLocaleDateString('id-ID');
                            }
                            return '';
                        },
                        label: (context) => ` ${context.dataset.label}: ${context.parsed.y.toFixed(2)}°C`
                    }
                } 
            }, 
            scales: { 
                x: { 
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'dd/MM/yyyy HH:mm:ss',
                        displayFormats: {
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            day: 'dd/MM'
                        }
                    },
                    ticks: { 
                        color: 'rgba(255, 255, 255, 0.6)',
                        maxTicksLimit: 8,
                        font: { size: 11 }
                    }, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    border: { display: false }
                }, 
                y: { 
                    beginAtZero: false, 
                    ticks: { 
                        color: 'rgba(255, 255, 255, 0.6)', 
                        callback: (value) => value + '°C',
                        font: { size: 11 }
                    }, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    border: { display: false } // Menghapus garis border axis Y agar lebih bersih
                } 
            } 
        } 
    });
    console.log("✅ Chart initialized successfully");
}

// --- Listener Data Suhu Terbaru (Real-time Display) ---
function listenForLatestTemperatures() {
    const q = query(
        collection(firestoreDB, 'temperature_logs'),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            // Gunakan Number() untuk memastikan konversi dari string ke angka
            const t1 = Number(data.temperature1).toFixed(2);
            const t2 = Number(data.temperature2).toFixed(2);

            document.getElementById('suhu-1-display').innerText = `${t1} °C`;
            document.getElementById('suhu-2-display').innerText = `${t2} °C`;
        }
    });
}

// --- Fungsi Update Chart ---
function updateChart(labels, data1, data2) {
    if (!suhuChart) return;
    suhuChart.data.labels = labels;
    suhuChart.data.datasets[0].data = data1;
    suhuChart.data.datasets[1].data = data2;
    suhuChart.update();
    currentChartData = { labels, data1, data2 };
}

// --- Load Data dari Firestore untuk Grafik ---
function loadChartData(timeRange = 'live') {
    if (!firestoreDB) return;
    if (unsubscribeFirestore) unsubscribeFirestore();

    let q;
    const colRef = collection(firestoreDB, 'temperature_logs');

    if (timeRange === 'live') {
        // Mode Live: Ambil N data terbaru tanpa filter waktu agar pasti muncul
        q = query(colRef, orderBy('timestamp', 'desc'), limit(currentLiveLimit));
    } else {
        const now = new Date();
        let startTime;
        // Hitung mundur waktu
        if (timeRange === '1hour') startTime = new Date(now.getTime() - 3600000);
        else if (timeRange === '6hours') startTime = new Date(now.getTime() - 21600000);
        else startTime = new Date(now.getTime() - 86400000);

        const startTimeString = startTime.toISOString(); 
        
        // QUERY INI WAJIB PAKAI INDEKS (Langkah 1)
        q = query(
            colRef,
            where('timestamp', '>=', startTimeString),
            orderBy('timestamp', 'asc')
        );
    }

    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        console.log("Total dokumen ditemukan:", snapshot.size); // Cek apakah data masuk
        const dataPoints = [];
        
        snapshot.forEach((doc) => {
            const d = doc.data();
            // Paksa konversi ke Number untuk menghindari error tipe data String vs Double
            dataPoints.push({
                date: new Date(d.timestamp),
                temp1: parseFloat(d.temperature1 || 0),
                temp2: parseFloat(d.temperature2 || 0)
            });
        });

        if (timeRange === 'live') dataPoints.reverse();
        updateChart(dataPoints.map(p => p.date), dataPoints.map(p => p.temp1), dataPoints.map(p => p.temp2));
    }, (err) => {
        console.error("Firestore Error:", err.message);
    });
}
    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const dataPoints = [];
        if (snapshot.empty) {
            console.warn("⚠️ Query berhasil tapi tidak ada data ditemukan.");
        }
    }

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Validasi data agar tidak error jika ada field kosong
            if (data.timestamp && data.temperature1 !== undefined && data.temperature2 !== undefined) {
                const date = new Date(data.timestamp);
                if (!isNaN(date.getTime())) {
                    dataPoints.push({ 
                        date, 
                        temp1: parseFloat(data.temperature1), 
                        temp2: parseFloat(data.temperature2) 
                    });
                }
            }
        });

        if (timeRange === 'live') {
            dataPoints.reverse(); // Urutkan dari lama ke baru untuk grafik
        }

        const labels = dataPoints.map(p => p.date);
        const temperatures1 = dataPoints.map(p => p.temp1);
        const temperatures2 = dataPoints.map(p => p.temp2);

        updateChart(labels, temperatures1, temperatures2);
    }, (error) => {
        console.error("❌ Firestore query error:", error);
        // Jika error "index", klik link yang muncul di console log browser
    });
}

// --- Fungsi Download CSV ---
function downloadChartDataAsCSV() {
    const { labels, data1, data2 } = currentChartData;
    if (labels.length === 0) {
        alert("Tidak ada data untuk diunduh.");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Waktu,Suhu 1 (°C),Suhu 2 (°C)\r\n";
    labels.forEach((label, index) => {
        const date = new Date(label);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
        const temp1 = data1[index] !== undefined ? data1[index].toFixed(2) : '';
        const temp2 = data2[index] !== undefined ? data2[index].toFixed(2) : '';
        csvContent += `"${formattedDate}",${temp1},${temp2}\r\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.setAttribute("download", `data_suhu_monitoring_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- Inisialisasi Dashboard ---
function initializeDashboard() {
    console.log("🚀 Initializing Monitoring Dashboard...");
    
    initializeChart();
    listenForLatestTemperatures();
    
    // Setup Tombol Filter Waktu
    const timeButtons = document.querySelectorAll('[data-time-range]');
    const limitButtons = document.querySelectorAll('[data-live-limit]');
    const limitContainer = document.getElementById('live-limit-container');

    const activeClasses = ['active', 'bg-yellow-500', 'text-slate-900'];

    timeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const timeRange = button.getAttribute('data-time-range');
            
            // Update UI tombol aktif
            timeButtons.forEach(btn => btn.classList.remove(...activeClasses));
            button.classList.add(...activeClasses);

            // Tampilkan/Sembunyikan opsi limit (hanya untuk Live)
            limitContainer.classList.toggle('hidden', timeRange !== 'live');
            
            loadChartData(timeRange);
        });
    });

    limitButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            currentLiveLimit = parseInt(button.getAttribute('data-live-limit'), 10);
            
            limitButtons.forEach(btn => btn.classList.remove(...activeClasses));
            button.classList.add(...activeClasses);
            
            // Pastikan kita kembali ke mode Live jika limit diklik
            const liveButton = document.querySelector('[data-time-range="live"]');
            if (!liveButton.classList.contains('active')) {
                timeButtons.forEach(btn => btn.classList.remove(...activeClasses));
                liveButton.classList.add(...activeClasses);
                limitContainer.classList.remove('hidden');
            }
            
            loadChartData('live');
        });
    });

    // Set default state (Live mode, 10 data points)
    const liveButton = document.querySelector('[data-time-range="live"]');
    if (liveButton) {
        liveButton.classList.add(...activeClasses);
        limitContainer.classList.remove('hidden');
    }
    const defaultLimitButton = document.querySelector('[data-live-limit="10"]');
    if (defaultLimitButton) {
        defaultLimitButton.classList.add(...activeClasses);
    }
    
    loadChartData('live');
    
    document.getElementById('downloadCsvBtn')?.addEventListener('click', downloadChartDataAsCSV);
    console.log("✅ Dashboard siap.");
}


document.addEventListener('DOMContentLoaded', initializeDashboard);



