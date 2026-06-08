import { supabase } from './koneksi.js';

export async function renderDashboard(container) {
    // Tampilan Dashboard dengan 2 Panel (Sudah Lengkap & Belum Lengkap)
    container.innerHTML = `
        <div style="padding: 20px; background: #f8fafc; border-radius: 10px; min-height: 80vh;">
            <h3 style="color:#0f172a; margin-bottom: 25px;"><i class="fas fa-chart-pie"></i> Dashboard Rekapitulasi Data HRIS</h3>
            
            <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color:#334155;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Data Pegawai Sudah Lengkap / Mengedit</h4>
                <p style="font-size: 0.9rem; color:#64748b; margin-bottom: 15px;">Daftar pegawai yang sudah melengkapi profil dan dokumen perizinan wajib (SIK/STR) sesuai jabatannya.</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn" style="background:#16a34a; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnSudahExcel">
                        <i class="fas fa-file-excel"></i> Download Excel
                    </button>
                    <button class="btn" style="background:#dc2626; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnSudahPDF">
                        <i class="fas fa-file-pdf"></i> Download PDF
                    </button>
                </div>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <h4 style="margin-bottom: 15px; color:#334155;"><i class="fas fa-exclamation-triangle" style="color:#ef4444;"></i> Data Pegawai Belum Lengkap</h4>
                <p style="font-size: 0.9rem; color:#64748b; margin-bottom: 15px;">Daftar pegawai yang belum melengkapi kontak (Email/No Telp) atau belum mengupload dokumen wajib (SIK/STR).</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="btn" style="background:#16a34a; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnBelumExcel">
                        <i class="fas fa-file-excel"></i> Download Excel
                    </button>
                    <button class="btn" style="background:#dc2626; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnBelumPDF">
                        <i class="fas fa-file-pdf"></i> Download PDF
                    </button>
                </div>
            </div>
        </div>
    `;

    // Fungsi Utama untuk Menganalisa Data Cerdas
    async function getRekapanData() {
        // Ambil data dari 3 tabel sekaligus agar prosesnya cepat
        const [
            { data: semuaPegawai },
            { data: dataSIK },
            { data: dataSTR }
        ] = await Promise.all([
            supabase.from('pegawai').select('nik, nama, email, no_telp, jabatan, kelompok_jabatan'),
            supabase.from('berkas_sik').select('nik'),
            supabase.from('berkas_str').select('nik')
        ]);

        const nikSIK = new Set((dataSIK || []).map(item => item.nik));
        const nikSTR = new Set((dataSTR || []).map(item => item.nik));

        const sudahLengkap = [];
        const belumLengkap = [];
        
        // Kelompok jabatan yang diwajibkan punya SIK & STR
        const wajibPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];

        (semuaPegawai || []).forEach(p => {
            // Syarat 1: Profil minimal harus punya email atau no telepon
            const isProfilLengkap = p.email || p.no_telp;
            
            // Cek apakah jabatan ini wajib punya SIK/STR
            const wajibIzin = wajibPerizinan.includes(p.kelompok_jabatan);
            
            const hasSIK = nikSIK.has(p.nik);
            const hasSTR = nikSTR.has(p.nik);

            let kekurangan = [];

            if (!isProfilLengkap) kekurangan.push("Kontak (Email/Telp) Kosong");
            if (wajibIzin && !hasSIK) kekurangan.push("SIK/SIP Belum Ada");
            if (wajibIzin && !hasSTR) kekurangan.push("STR Belum Ada");

            // Jika tidak ada kekurangan, berarti pegawai sudah melengkapi/mengedit data
            if (kekurangan.length === 0) {
                sudahLengkap.push({
                    "NIK": p.nik,
                    "Nama": p.nama,
                    "Jabatan": p.jabatan || '-',
                    "Kelompok": p.kelompok_jabatan || '-',
                    "Status": "Sudah Lengkap"
                });
            } else {
                belumLengkap.push({
                    "NIK": p.nik,
                    "Nama": p.nama,
                    "Jabatan": p.jabatan || '-',
                    "Kekurangan Data": kekurangan.join(", ")
                });
            }
        });

        return { sudahLengkap, belumLengkap };
    }

    // =========================================================
    // AKSI TOMBOL: SUDAH MENGISI / LENGKAP
    // =========================================================
    document.getElementById('btnSudahExcel').onclick = async () => {
        document.getElementById('btnSudahExcel').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Proses...`;
        const { sudahLengkap } = await getRekapanData();
        
        if (sudahLengkap.length === 0) {
            alert("Belum ada pegawai yang melengkapi datanya.");
        } else {
            const ws = XLSX.utils.json_to_sheet(sudahLengkap);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sudah Lengkap");
            XLSX.writeFile(wb, `Data_Pegawai_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx`);
        }
        document.getElementById('btnSudahExcel').innerHTML = `<i class="fas fa-file-excel"></i> Download Excel`;
    };

    document.getElementById('btnSudahPDF').onclick = async () => {
        document.getElementById('btnSudahPDF').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Proses...`;
        const { sudahLengkap } = await getRekapanData();
        
        if (sudahLengkap.length === 0) {
            alert("Belum ada pegawai yang melengkapi datanya.");
        } else {
            const { jsPDF } = window.jspdf; 
            const doc = new jsPDF();
            doc.text("Laporan Pegawai Sudah Melengkapi Data", 14, 15);
            const rows = sudahLengkap.map((i, index) => [index + 1, i.NIK, i.Nama, i.Jabatan, i.Status]);
            doc.autoTable({ head: [["No", "NIK", "Nama", "Jabatan", "Status"]], body: rows, startY: 20 });
            doc.save(`Data_Pegawai_Lengkap_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        document.getElementById('btnSudahPDF').innerHTML = `<i class="fas fa-file-pdf"></i> Download PDF`;
    };

    // =========================================================
    // AKSI TOMBOL: BELUM MENGISI / TIDAK LENGKAP
    // =========================================================
    document.getElementById('btnBelumExcel').onclick = async () => {
        document.getElementById('btnBelumExcel').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Proses...`;
        const { belumLengkap } = await getRekapanData();
        
        if (belumLengkap.length === 0) {
            alert("Luar biasa! Semua pegawai sudah melengkapi data.");
        } else {
            const ws = XLSX.utils.json_to_sheet(belumLengkap);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Belum Lengkap");
            XLSX.writeFile(wb, `Data_Pegawai_Belum_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx`);
        }
        document.getElementById('btnBelumExcel').innerHTML = `<i class="fas fa-file-excel"></i> Download Excel`;
    };

    document.getElementById('btnBelumPDF').onclick = async () => {
        document.getElementById('btnBelumPDF').innerHTML = `<i class="fas fa-spinner fa-spin"></i> Proses...`;
        const { belumLengkap } = await getRekapanData();
        
        if (belumLengkap.length === 0) {
            alert("Luar biasa! Semua pegawai sudah melengkapi data.");
        } else {
            const { jsPDF } = window.jspdf; 
            const doc = new jsPDF('landscape'); // Landscape karena teks kekurangan mungkin panjang
            doc.text("Laporan Kekurangan Data Pegawai", 14, 15);
            const rows = belumLengkap.map((i, index) => [index + 1, i.NIK, i.Nama, i.Jabatan, i["Kekurangan Data"]]);
            doc.autoTable({ head: [["No", "NIK", "Nama", "Jabatan", "Keterangan Kekurangan"]], body: rows, startY: 20 });
            doc.save(`Data_Pegawai_Belum_Lengkap_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        document.getElementById('btnBelumPDF').innerHTML = `<i class="fas fa-file-pdf"></i> Download PDF`;
    };
}
