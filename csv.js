document.addEventListener('DOMContentLoaded', function() {
    const monitorBtn = document.getElementById('monitor-btn');
    const historyBtn = document.getElementById('history-btn');
    const updateTimeElement = document.getElementById('update-time');
    const csvStatus = document.getElementById('csv-status');
    let isMonitoring = false;
    let intervalId;
    
    // Inisialisasi array untuk menyimpan data
    let recordedData = JSON.parse(localStorage.getItem('shipRecordedData')) || [];

    monitorBtn.addEventListener('click', function() {
        if (!isMonitoring) {
            startMonitoring();
        } else {
            stopMonitoring();
        }
    });
    
    // Event listener untuk tombol riwayat perjalanan
    historyBtn.addEventListener('click', function() {
        exportToCSV();
    });

    function startMonitoring() {
        isMonitoring = true;
        monitorBtn.textContent = 'Berhenti Pantau';
        monitorBtn.classList.add('active');
        csvStatus.textContent = 'Sedang merekam data...';

        // Ambil data pertama kali
        captureAndSaveData();
        
        // Mulai interval untuk mengambil dan menyimpan data
        intervalId = setInterval(captureAndSaveData, 5000); // Setiap 5 detik
    }

    function stopMonitoring() {
        isMonitoring = false;
        monitorBtn.textContent = 'Mulai Pantau';
        monitorBtn.classList.remove('active');
        csvStatus.textContent = 'Perekaman data berhenti';

        // Hentikan interval
        clearInterval(intervalId);
        
        // Ekspor data ke CSV saat berhenti
        exportToCSV();
    }

    function captureAndSaveData() {
        // Ambil data kapal saat ini dari elemen HTML
        const shipData = {
            id: document.getElementById('ship-id').textContent,
            latitude: document.getElementById('ship-lat').textContent,
            longitude: document.getElementById('ship-lon').textContent,
            speed: document.getElementById('ship-speed').textContent.replace(' knot', ''),
            heading: document.getElementById('ship-heading').textContent.replace('°', ''),
            status: document.getElementById('ship-status').textContent,
            timestamp: new Date().toISOString()
        };
        
        // Simpan data ke array
        recordedData.push(shipData);
        
        // Simpan array ke localStorage
        localStorage.setItem('shipRecordedData', JSON.stringify(recordedData));
        
        // Update UI
        updateLastUpdateTime();
        csvStatus.textContent = 'Data berhasil disimpan secara lokal';
        
        console.log('Data disimpan:', shipData);
    }

    function exportToCSV() {
        // Ambil data dari localStorage
        const data = JSON.parse(localStorage.getItem('shipRecordedData')) || [];
        
        if (data.length === 0) {
            alert('Tidak ada data yang terekam');
            return;
        }
        
        // Buat header CSV
        const headers = Object.keys(data[0]).join(',');
        
        // Buat baris data
        const dataRows = data.map(item => Object.values(item).join(','));
        
        // Gabungkan menjadi konten CSV
        const csvContent = `${headers}\n${dataRows.join('\n')}`;
        
        // Buat blob dan download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        csvStatus.textContent = 'Data berhasil diekspor ke CSV';
    }

    function updateLastUpdateTime() {
        const now = new Date();
        updateTimeElement.textContent = `Update Terakhir: ${now.toLocaleString('id-ID')}`;
    }
    
    // Fungsi untuk membersihkan data
    function clearRecordedData() {
        if (confirm('Apakah Anda yakin ingin menghapus semua data yang terekam?')) {
            recordedData = [];
            localStorage.removeItem('shipRecordedData');
            csvStatus.textContent = 'Data berhasil dihapus';
        }
    }
    
    // Tambahkan tombol clear data jika diperlukan
    // Contoh: document.getElementById('clear-btn').addEventListener('click', clearRecordedData);
    
    // Cek ukuran data yang tersimpan
    function checkStorageSize() {
        const data = localStorage.getItem('shipRecordedData') || '';
        const sizeInKB = Math.round((data.length * 2) / 1024);
        
        if (sizeInKB > 4000) { // Mendekati batas 5MB
            alert(`Peringatan: Penyimpanan data hampir penuh (${sizeInKB}KB). Silakan ekspor dan hapus data.`);
        }
        
        return sizeInKB;
    }
    
    // Cek ukuran penyimpanan saat aplikasi dimuat
    checkStorageSize();
});
