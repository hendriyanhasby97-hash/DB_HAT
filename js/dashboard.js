import { supabase } from './koneksi.js';

export async function renderDashboard(container) {
    container.innerHTML = `
        <div style="padding: 20px; background: #f8fafc; border-radius: 10px; min-height: 80vh;">
            <h3 style="color:#0f172a; margin-bottom: 25px;"><i class="fas fa-tachometer-alt"></i> Dashboard Monitoring Kelengkapan Data</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h4 style="color:#64748b; font-size: 0.8rem; margin:0;">TOTAL PEGAWAI</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; margin: 10px 0;" id="txt-total-pegawai">0</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #10b981; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h4 style="color:#64748b; font-size: 0.8rem; margin:0;">SUDAH LENGKAP</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; margin: 10px 0;" id="txt-lengkap">0</p>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #ef4444; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h4 style="color:#64748b; font-size: 0.8rem; margin:0;">BELUM LENGKAP</h4>
                    <p style="font-size: 1.5rem; font-weight: bold; margin: 10px 0;" id="txt-belum-lengkap">0</p>
                </div>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <h4 style="margin-bottom: 15px;"><i class="fas fa-chart-pie"></i> Visualisasi Kelengkapan Data</h4>
                <div style="max-width: 400px; margin: auto;">
                    <canvas id="chartKelengkapan"></canvas>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px; color:#10b981;"><i class="fas fa-check-circle"></i> Sudah Lengkap</h4>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" style="background:#16a34a;" id="btnSudahExcel"><i class="fas fa-file-excel"></i> Excel</button>
                        <button class="btn" style="background:#dc2626;" id="btnSudahPDF"><i class="fas fa-file-pdf"></i> PDF</button>
                    </div>
                </div>
                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px; color:#ef4444;"><i class="fas fa-exclamation-circle"></i> Belum Lengkap</h4>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" style="background:#16a34a;" id="btnBelumExcel"><i class="fas fa-file-excel"></i> Excel</button>
                        <button class="btn" style="background:#dc2626;" id="btnBelumPDF"><i class="fas fa-file-pdf"></i> PDF</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --- LOGIKA DATA ---
    const [
        { data: semuaPegawai },
        { data: dataSIK },
        { data: dataSTR }
    ] = await Promise.all([
        supabase.from('pegawai').select('nik, nama, email, no_telp, jabatan, kelompok_jabatan'),
        supabase.from('berkas_sik').select('nik'),
        supabase.from('berkas_str').select('nik')
    ]);

    const nikSIK = new Set((dataSIK || []).map(i => i.nik));
    const nikSTR = new Set((dataSTR || []).map(i => i.nik));
    const wajib = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];

    const sudahLengkap = [];
    const belumLengkap = [];

    (semuaPegawai || []).forEach(p => {
        const isLengkap = (p.email && p.no_telp) && 
                          (!wajib.includes(p.kelompok_jabatan) || (nikSIK.has(p.nik) && nikSTR.has(p.nik)));
        
        const dataObj = { 
            "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', 
            "Kekurangan": isLengkap ? "-" : "Data belum lengkap/dokumen kurang" 
        };

        if (isLengkap) sudahLengkap.push(dataObj);
        else belumLengkap.push(dataObj);
    });

    // Update Angka Statistik
    document.getElementById('txt-total-pegawai').innerText = semuaPegawai.length;
    document.getElementById('txt-lengkap').innerText = sudahLengkap.length;
    document.getElementById('txt-belum-lengkap').innerText = belumLengkap.length;

    // Render Chart
    const ctx = document.getElementById('chartKelengkapan').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sudah Lengkap', 'Belum Lengkap'],
            datasets: [{ data: [sudahLengkap.length, belumLengkap.length], backgroundColor: ['#10b981', '#ef4444'] }]
        }
    });

    // --- LOGIKA DOWNLOAD ---
    const download = (data, title) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    document.getElementById('btnSudahExcel').onclick = () => download(sudahLengkap, "Pegawai_Sudah_Lengkap");
    document.getElementById('btnBelumExcel').onclick = () => download(belumLengkap, "Pegawai_Belum_Lengkap");
    // (PDF bisa ditambahkan dengan fungsi jsPDF yang sama seperti sebelumnya)
}
