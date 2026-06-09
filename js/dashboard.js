import { supabase } from './koneksi.js';

export async function renderDashboard(container) {
    // Tampilkan loading spinner saat data sedang ditarik dari database
    container.innerHTML = `
        <div style="padding: 50px 20px; text-align: center; color: #64748b;">
            <h2><i class="fas fa-spinner fa-spin"></i> Memuat Dashboard Demografi...</h2>
        </div>
    `;

    try {
        // 1. AMBIL SELURUH DATA PEGAWAI
        const { data: pegawai, error } = await supabase.from('pegawai').select('*');
        if (error) throw error;

        // 2. LOGIKA PERHITUNGAN ANGKA UTAMA
        const currentYear = new Date().getFullYear().toString();
        const totalPegawai = pegawai.length;
        
        // Filter Data Pegawai
        const pegawaiAktifData = pegawai.filter(p => p.status === 'Aktif');
        const totalAktif = pegawaiAktifData.length;
        
        const totalMasuk = pegawai.filter(p => p.masuk_rs && p.masuk_rs.startsWith(currentYear)).length;
        const totalKeluar = pegawai.filter(p => ['Resign', 'Pensiun', 'Mutasi', 'Meninggal'].includes(p.status)).length;

        // 3. FUNGSI BANTUAN UNTUK MENGHITUNG KATEGORI (HANYA PEGAWAI AKTIF)
        const hitungKategori = (data, key) => {
            const counts = {};
            data.forEach(item => {
                const val = item[key] ? item[key].trim() : 'Belum Diisi';
                counts[val] = (counts[val] || 0) + 1;
            });
            // Urutkan dari jumlah terbanyak ke terkecil
            return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
        };

        const rekapJabatan = hitungKategori(pegawaiAktifData, 'kelompok_jabatan');
        const rekapJK = hitungKategori(pegawaiAktifData, 'jenis_kelamin');
        const rekapAgama = hitungKategori(pegawaiAktifData, 'agama');
        const rekapPendidikan = hitungKategori(pegawaiAktifData, 'jenjang');

        // 4. RENDER STRUKTUR HTML DASHBOARD
        container.innerHTML = `
            <style>
                .dash-title { color:#0f172a; margin-bottom: 25px; }
                .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display:flex; align-items:center; gap:20px; }
                .stat-icon { width: 60px; height: 60px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size: 1.8rem; color:white; }
                .stat-info h4 { margin:0; color:#64748b; font-size:0.85rem; text-transform:uppercase; font-weight:600; letter-spacing:0.5px;}
                .stat-info p { margin: 5px 0 0 0; font-size: 1.8rem; font-weight:bold; color:#0f172a; }
                
                .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 25px; }
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
                
                .panel { background: white; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .panel h4 { margin-top:0; color:#334155; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; }
                
                table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                th { background: #f8fafc; color: #475569; font-weight: 600; }
                td:last-child, th:last-child { text-align: center; }
            </style>

            <div style="padding: 20px; background: #f8fafc; border-radius: 10px; min-height: 80vh;">
                <h3 class="dash-title"><i class="fas fa-chart-line" style="color:#3b82f6;"></i> Dashboard Demografi Kepegawaian</h3>
                
                <div class="grid-4">
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #3b82f6;"><i class="fas fa-users"></i></div>
                        <div class="stat-info"><h4>Total Pegawai</h4><p>${totalPegawai}</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #10b981;"><i class="fas fa-user-check"></i></div>
                        <div class="stat-info"><h4>Pegawai Aktif</h4><p>${totalAktif}</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #f59e0b;"><i class="fas fa-user-plus"></i></div>
                        <div class="stat-info"><h4>Masuk (${currentYear})</h4><p>${totalMasuk}</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="background: #ef4444;"><i class="fas fa-user-minus"></i></div>
                        <div class="stat-info"><h4>Pegawai Keluar</h4><p>${totalKeluar}</p></div>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="panel">
                        <h4><i class="fas fa-briefcase"></i> Kelompok Jabatan (Aktif)</h4>
                        <div style="position: relative; height: 250px;"><canvas id="chartJabatan"></canvas></div>
                    </div>
                    <div class="panel">
                        <h4><i class="fas fa-venus-mars"></i> Jenis Kelamin (Aktif)</h4>
                        <div style="position: relative; height: 250px;"><canvas id="chartJK"></canvas></div>
                    </div>
                    <div class="panel">
                        <h4><i class="fas fa-graduation-cap"></i> Pendidikan (Aktif)</h4>
                        <div style="position: relative; height: 250px;"><canvas id="chartPendidikan"></canvas></div>
                    </div>
                    <div class="panel">
                        <h4><i class="fas fa-praying-hands"></i> Agama (Aktif)</h4>
                        <div style="position: relative; height: 250px;"><canvas id="chartAgama"></canvas></div>
                    </div>
                </div>

                <div class="grid-2">
                    <div class="panel">
                        <h4>Rekapitulasi Kelompok Jabatan</h4>
                        <table>
                            <thead><tr><th>Kelompok Jabatan</th><th>Jumlah Pegawai</th></tr></thead>
                            <tbody id="tabelJabatan"></tbody>
                        </table>
                    </div>
                    <div class="panel">
                        <h4>Rekapitulasi Jenis Kelamin</h4>
                        <table>
                            <thead><tr><th>Jenis Kelamin</th><th>Jumlah Pegawai</th></tr></thead>
                            <tbody id="tabelJK"></tbody>
                        </table>
                    </div>
                    <div class="panel">
                        <h4>Rekapitulasi Tingkat Pendidikan</h4>
                        <table>
                            <thead><tr><th>Jenjang Pendidikan</th><th>Jumlah Pegawai</th></tr></thead>
                            <tbody id="tabelPendidikan"></tbody>
                        </table>
                    </div>
                    <div class="panel">
                        <h4>Rekapitulasi Agama</h4>
                        <table>
                            <thead><tr><th>Agama</th><th>Jumlah Pegawai</th></tr></thead>
                            <tbody id="tabelAgama"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // 5. RENDER DIAGRAM MENGGUNAKAN CHART.JS
        const chartPalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

        const drawChart = (canvasId, type, dataObj) => {
            const ctx = document.getElementById(canvasId).getContext('2d');
            const labels = Object.keys(dataObj);
            const values = Object.values(dataObj);
            
            new Chart(ctx, {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Jumlah Pegawai',
                        data: values,
                        backgroundColor: type === 'doughnut' ? chartPalette : '#3b82f6',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: type === 'doughnut', position: 'right' } },
                    scales: type === 'bar' ? { y: { beginAtZero: true, ticks: { stepSize: 1 } } } : {}
                }
            });
        };

        // Gambar Chart
        drawChart('chartJabatan', 'bar', rekapJabatan);
        drawChart('chartJK', 'doughnut', rekapJK);
        drawChart('chartPendidikan', 'bar', rekapPendidikan);
        drawChart('chartAgama', 'bar', rekapAgama);

        // 6. RENDER DATA KE DALAM TABEL
        const drawTable = (tableId, dataObj) => {
            const tbody = document.getElementById(tableId);
            let html = '';
            for (const [kategori, jumlah] of Object.entries(dataObj)) {
                html += `<tr><td>${kategori}</td><td><strong>${jumlah}</strong></td></tr>`;
            }
            if (Object.keys(dataObj).length === 0) html = `<tr><td colspan="2" style="text-align:center;">Tidak ada data</td></tr>`;
            tbody.innerHTML = html;
        };

        // Isi Tabel
        drawTable('tabelJabatan', rekapJabatan);
        drawTable('tabelJK', rekapJK);
        drawTable('tabelPendidikan', rekapPendidikan);
        drawTable('tabelAgama', rekapAgama);

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="padding: 20px; color: red;"><h3>Gagal memuat Dashboard: ${err.message}</h3></div>`;
    }
}
