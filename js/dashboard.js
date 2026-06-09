import { supabase } from './koneksi.js';

export async function renderDashboard(container) {
    container.innerHTML = `
        <style>
            .dash-title { color:#0f172a; margin-bottom: 25px; }
            .stat-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; }
            .stat-info h4 { margin:0; color:#64748b; font-size:0.75rem; text-transform:uppercase; font-weight:700; letter-spacing:0.5px;}
            .stat-info p { margin: 5px 0 0 0; font-size: 2.2rem; font-weight:800; color:#0f172a; }
            .stat-icon { width: 50px; height: 50px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-size: 1.5rem; }
            
            .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 20px; margin-bottom: 30px; }
            
            .panel { background: white; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .panel h4 { margin-top:0; color:#1e293b; margin-bottom: 20px; padding-bottom: 10px; display:flex; align-items:center; gap:10px; border-bottom: 1px solid #f1f5f9; font-size: 1.1rem; }
            
            .chart-table-container { display: flex; align-items: center; gap: 20px; }
            .chart-box { flex: 0 0 40%; position: relative; height: 220px; display:flex; justify-content:center; }
            .table-box { flex: 1; }
            
            table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
            th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            th { color: #64748b; font-weight: 600; background: #f8fafc; }
            td:nth-child(2), th:nth-child(2), td:nth-child(3), th:nth-child(3) { text-align: center; font-weight: 600; }
            
            .badge-belum { background: #ffedd5; color: #ea580c; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; border: 1px solid #fdba74; font-weight: 600; }
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 5px; }
        </style>

        <div style="padding: 20px; background: #f8fafc; border-radius: 10px; min-height: 80vh;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
                <h3 class="dash-title" style="margin:0;"><i class="fas fa-bars"></i> DASHBOARD STATISTIK SDM</h3>
            </div>
            
            <div class="grid-4">
                <div class="stat-card">
                    <div class="stat-info"><p id="txt-total">0</p><h4>Total Pegawai</h4></div>
                    <div class="stat-icon" style="background: #e0f2fe; color: #0284c7;"><i class="fas fa-users"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info"><p id="txt-aktif">0</p><h4>Pegawai Aktif</h4></div>
                    <div class="stat-icon" style="background: #dcfce7; color: #16a34a;"><i class="fas fa-user-check"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info"><p id="txt-masuk">0</p><h4>Pegawai Masuk</h4></div>
                    <div class="stat-icon" style="background: #fef3c7; color: #d97706;"><i class="fas fa-door-open"></i></div>
                </div>
                <div class="stat-card">
                    <div class="stat-info"><p id="txt-keluar">0</p><h4>Pegawai Keluar</h4></div>
                    <div class="stat-icon" style="background: #fee2e2; color: #dc2626;"><i class="fas fa-sign-out-alt"></i></div>
                </div>
            </div>

            <div class="grid-2">
                <div class="panel">
                    <h4><i class="fas fa-praying-hands" style="color:#3b82f6;"></i> Rekapitulasi Agama</h4>
                    <div class="chart-table-container">
                        <div class="chart-box"><canvas id="chartAgama"></canvas></div>
                        <div class="table-box">
                            <table>
                                <thead><tr><th>Agama</th><th>Jml</th><th>%</th></tr></thead>
                                <tbody id="tabelAgama"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="panel">
                    <h4><i class="fas fa-venus-mars" style="color:#ec4899;"></i> Jenis Kelamin</h4>
                    <div class="chart-table-container">
                        <div class="chart-box"><canvas id="chartJK"></canvas></div>
                        <div class="table-box">
                            <table>
                                <thead><tr><th>Jenis Kelamin</th><th>Jml</th><th>%</th></tr></thead>
                                <tbody id="tabelJK"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="panel">
                    <h4><i class="fas fa-id-badge" style="color:#10b981;"></i> Kelompok Pegawai</h4>
                    <div class="chart-table-container">
                        <div class="chart-box"><canvas id="chartKelPegawai"></canvas></div>
                        <div class="table-box">
                            <table>
                                <thead><tr><th>Kelompok</th><th>Jml</th><th>%</th></tr></thead>
                                <tbody id="tabelKelPegawai"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="panel">
                    <h4><i class="fas fa-briefcase" style="color:#f59e0b;"></i> Kelompok Jabatan</h4>
                    <div class="chart-table-container">
                        <div class="chart-box"><canvas id="chartKelJabatan"></canvas></div>
                        <div class="table-box">
                            <table>
                                <thead><tr><th>Jabatan</th><th>Jml</th><th>%</th></tr></thead>
                                <tbody id="tabelKelJabatan"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <h3 style="color:#0f172a; margin: 40px 0 20px 0; border-top: 1px solid #e2e8f0; padding-top: 20px;"><i class="fas fa-download"></i> Download Rekapitulasi Kekurangan Data</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div class="panel" style="margin-bottom:0;">
                    <h4 style="color:#ef4444; border:none; padding:0;"><i class="fas fa-exclamation-triangle"></i> Belum Lengkap SIK</h4>
                    <p style="font-size:0.85rem; color:#64748b; margin-bottom:15px; min-height:40px;">Pegawai medis/nakes yang belum mengunggah dokumen SIK/SIP di portal.</p>
                    <div style="display:flex; gap:10px;">
                        <button class="btn" style="background:#16a34a;" id="btnSikExcel"><i class="fas fa-file-excel"></i> Excel</button>
                        <button class="btn" style="background:#dc2626;" id="btnSikPDF"><i class="fas fa-file-pdf"></i> PDF</button>
                    </div>
                </div>
                <div class="panel" style="margin-bottom:0;">
                    <h4 style="color:#ef4444; border:none; padding:0;"><i class="fas fa-exclamation-triangle"></i> Belum Lengkap STR</h4>
                    <p style="font-size:0.85rem; color:#64748b; margin-bottom:15px; min-height:40px;">Pegawai medis/nakes yang belum mengunggah dokumen STR di portal.</p>
                    <div style="display:flex; gap:10px;">
                        <button class="btn" style="background:#16a34a;" id="btnStrExcel"><i class="fas fa-file-excel"></i> Excel</button>
                        <button class="btn" style="background:#dc2626;" id="btnStrPDF"><i class="fas fa-file-pdf"></i> PDF</button>
                    </div>
                </div>
                <div class="panel" style="margin-bottom:0;">
                    <h4 style="color:#ef4444; border:none; padding:0;"><i class="fas fa-exclamation-triangle"></i> Belum Lengkap Profil</h4>
                    <p style="font-size:0.85rem; color:#64748b; margin-bottom:15px; min-height:40px;">Pegawai yang belum melengkapi seluruh (23 kolom) data kepegawaian.</p>
                    <div style="display:flex; gap:10px;">
                        <button class="btn" style="background:#16a34a;" id="btnProfilExcel"><i class="fas fa-file-excel"></i> Excel</button>
                        <button class="btn" style="background:#dc2626;" id="btnProfilPDF"><i class="fas fa-file-pdf"></i> PDF</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- PENGAMBILAN DATA ---
    const [
        { data: semuaPegawai },
        { data: dataSIK },
        { data: dataSTR }
    ] = await Promise.all([
        supabase.from('pegawai').select('*'),
        supabase.from('berkas_sik').select('nik'),
        supabase.from('berkas_str').select('nik')
    ]);

    const pegawaiValid = semuaPegawai || [];
    const currentYear = new Date().getFullYear().toString();
    
    // Angka Statistik Utama
    const totalPegawai = pegawaiValid.length;
    const pegawaiAktif = pegawaiValid.filter(p => p.status === 'Aktif');
    const totalAktif = pegawaiAktif.length;
    const totalMasuk = pegawaiValid.filter(p => p.masuk_rs && p.masuk_rs.startsWith(currentYear)).length;
    const totalKeluar = pegawaiValid.filter(p => ['Resign', 'Pensiun', 'Mutasi', 'Meninggal'].includes(p.status)).length;

    document.getElementById('txt-total').innerText = totalPegawai;
    document.getElementById('txt-aktif').innerText = totalAktif;
    document.getElementById('txt-masuk').innerText = totalMasuk;
    document.getElementById('txt-keluar').innerText = totalKeluar;

    // --- FUNGSI MENGHITUNG KATEGORI & PERSENTASE ---
    function hitungStatistik(data, key) {
        const result = { diisi: {}, belum: 0, total: data.length };
        data.forEach(item => {
            const val = item[key];
            if (!val || String(val).trim() === '' || val === '-') {
                result.belum += 1;
            } else {
                result.diisi[val] = (result.diisi[val] || 0) + 1;
            }
        });
        return result;
    }

    const statAgama = hitungStatistik(pegawaiAktif, 'agama');
    const statJK = hitungStatistik(pegawaiAktif, 'jenis_kelamin');
    const statKelPegawai = hitungStatistik(pegawaiAktif, 'kelompok_pegawai');
    const statKelJabatan = hitungStatistik(pegawaiAktif, 'kelompok_jabatan');

    const chartPalette = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#14b8a6', '#f97316'];

    function renderTabelDanChart(canvasId, tabelId, chartType, statData) {
        const labels = Object.keys(statData.diisi);
        const values = Object.values(statData.diisi);
        
        // Render Chart
        new Chart(document.getElementById(canvasId).getContext('2d'), {
            type: chartType,
            data: { labels: labels, datasets: [{ data: values, backgroundColor: chartPalette, borderWidth: 1 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        // Render Tabel
        const tbody = document.getElementById(tabelId);
        let html = '';
        labels.forEach(label => {
            const count = statData.diisi[label];
            const percent = statData.total === 0 ? 0 : ((count / statData.total) * 100).toFixed(1);
            html += `<tr><td>${label}</td><td>${count}</td><td style="color:#3b82f6;">${percent}%</td></tr>`;
        });
        
        // Render Baris "Belum Mengisi Data"
        const percentBelum = statData.total === 0 ? 0 : ((statData.belum / statData.total) * 100).toFixed(1);
        html += `
            <tr>
                <td><span class="badge-belum">Belum Mengisi Data</span></td>
                <td style="color:#ea580c;">${statData.belum}</td>
                <td style="color:#ea580c;">${percentBelum}%</td>
            </tr>
        `;
        tbody.innerHTML = html;
    }

    renderTabelDanChart('chartAgama', 'tabelAgama', 'pie', statAgama);
    renderTabelDanChart('chartJK', 'tabelJK', 'doughnut', statJK);
    renderTabelDanChart('chartKelPegawai', 'tabelKelPegawai', 'pie', statKelPegawai);
    renderTabelDanChart('chartKelJabatan', 'tabelKelJabatan', 'doughnut', statKelJabatan);

    // --- LOGIKA PENGUMPULAN DATA KEKURANGAN (UNTUK DOWNLOAD) ---
    const nikSIK = new Set((dataSIK || []).map(item => item.nik));
    const nikSTR = new Set((dataSTR || []).map(item => item.nik));
    const wajibPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];

    const belumSIK = [];
    const belumSTR = [];
    const belumProfil = [];

    pegawaiValid.forEach(p => {
        const wajibIzin = wajibPerizinan.includes(p.kelompok_jabatan);
        
        if (wajibIzin && !nikSIK.has(p.nik)) belumSIK.push({ "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', "Keterangan": "Belum Upload SIK" });
        if (wajibIzin && !nikSTR.has(p.nik)) belumSTR.push({ "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', "Keterangan": "Belum Upload STR" });

        const reqFields = {
            'Kel. Pegawai': p.kelompok_pegawai, 'Kel. Jabatan': p.kelompok_jabatan, 'Golongan': p.gol, 'TMT Pangkat': p.tmt_pangkat,
            'TMT Berikutnya': p.tmt_berikutnya, 'Jabatan': p.jabatan, 'Jenis Kelamin': p.jenis_kelamin, 'Agama': p.agama,
            'Masuk RS': p.masuk_rs, 'Masa Kerja RS': p.masa_kerja_rs, 'Tempat Lahir': p.tempat_lahir, 'Tanggal Lahir': p.tanggal_lahir,
            'Status Keluarga': p.status_keluarga, 'Alamat': p.alamat, 'Jenjang': p.jenjang, 'Fakultas': p.fakultas, 'Jurusan': p.jurusan,
            'Ruangan': p.ruangan, 'BPJS Kes': p.no_bpjsn, 'BPJS TK': p.no_bpjsket_taspen, 'NPWP': p.npwp, 'Email': p.email, 'No Telp': p.no_telp
        };

        let ketProfil = [];
        for (const [key, val] of Object.entries(reqFields)) {
            if ((key === 'TMT Pangkat' || key === 'TMT Berikutnya') && (p.kelompok_pegawai !== 'ASN' && p.kelompok_pegawai !== 'PNS')) continue;
            if (!val || String(val).trim() === '') ketProfil.push(key);
        }

        if (ketProfil.length > 0) belumProfil.push({ "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', "Data Kosong": ketProfil.join(", ") });
    });

    // --- FUNGSI EXPORT ---
    const setBtnLoading = (id, loading, txt) => {
        const b = document.getElementById(id);
        if(loading) { b.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Proses`; b.disabled = true; } 
        else { b.innerHTML = txt; b.disabled = false; }
    };

    const downloadExcel = (data, name) => {
        if(data.length === 0) return alert("Luar biasa! Tidak ada pegawai yang bermasalah pada kategori ini.");
        const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap"); XLSX.writeFile(wb, `${name}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const downloadPDF = (data, title, name) => {
        if(data.length === 0) return alert("Luar biasa! Tidak ada pegawai yang bermasalah pada kategori ini.");
        const doc = new window.jspdf.jsPDF('l', 'mm', 'a4'); doc.text(title, 14, 15);
        const head = title.includes("Profil") ? [["No", "NIK", "Nama", "Jabatan", "Rincian Data Kosong"]] : [["No", "NIK", "Nama", "Jabatan", "Keterangan"]];
        const rows = data.map((i, idx) => [index + 1, i.NIK, i.Nama, i.Jabatan, i["Data Kosong"] || i.Keterangan]);
        doc.autoTable({ head: head, body: rows, startY: 20 }); doc.save(`${name}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    // Pasang Event Download
    document.getElementById('btnSikExcel').onclick = () => { setBtnLoading('btnSikExcel',true); downloadExcel(belumSIK, "Belum_SIK"); setBtnLoading('btnSikExcel',false,'<i class="fas fa-file-excel"></i> Excel'); };
    document.getElementById('btnSikPDF').onclick = () => { setBtnLoading('btnSikPDF',true); downloadPDF(belumSIK, "Rekap Pegawai Belum SIK", "Belum_SIK"); setBtnLoading('btnSikPDF',false,'<i class="fas fa-file-pdf"></i> PDF'); };
    
    document.getElementById('btnStrExcel').onclick = () => { setBtnLoading('btnStrExcel',true); downloadExcel(belumSTR, "Belum_STR"); setBtnLoading('btnStrExcel',false,'<i class="fas fa-file-excel"></i> Excel'); };
    document.getElementById('btnStrPDF').onclick = () => { setBtnLoading('btnStrPDF',true); downloadPDF(belumSTR, "Rekap Pegawai Belum STR", "Belum_STR"); setBtnLoading('btnStrPDF',false,'<i class="fas fa-file-pdf"></i> PDF'); };
    
    document.getElementById('btnProfilExcel').onclick = () => { setBtnLoading('btnProfilExcel',true); downloadExcel(belumProfil, "Belum_Profil"); setBtnLoading('btnProfilExcel',false,'<i class="fas fa-file-excel"></i> Excel'); };
    document.getElementById('btnProfilPDF').onclick = () => { setBtnLoading('btnProfilPDF',true); downloadPDF(belumProfil, "Rekap Pegawai Belum Melengkapi Profil", "Belum_Profil"); setBtnLoading('btnProfilPDF',false,'<i class="fas fa-file-pdf"></i> PDF'); };
}
