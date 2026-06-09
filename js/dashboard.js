import { supabase } from './koneksi.js';

export async function renderDashboard(container) {
    container.innerHTML = `
        <div style="padding: 20px; background: #f8fafc; border-radius: 10px; min-height: 80vh;">
            <h3 style="color:#0f172a; margin-bottom: 25px;"><i class="fas fa-chart-pie"></i> Dashboard Rekapitulasi Data HRIS</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                
                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom: 15px; color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> Data Pegawai Belum Lengkap SIK</h4>
                    <p style="font-size: 0.9rem; color:#64748b; margin-bottom: 20px; min-height: 45px;">Daftar pegawai yang wajib memiliki SIK/SIP namun belum mengunggah dokumennya di portal.</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn" style="background:#16a34a; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnSikExcel">
                            <i class="fas fa-file-excel"></i> Download Excel
                        </button>
                        <button class="btn" style="background:#dc2626; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnSikPDF">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                    </div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom: 15px; color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> Data Pegawai Belum Lengkap STR</h4>
                    <p style="font-size: 0.9rem; color:#64748b; margin-bottom: 20px; min-height: 45px;">Daftar pegawai yang wajib memiliki STR namun belum mengunggah dokumennya di portal.</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn" style="background:#16a34a; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnStrExcel">
                            <i class="fas fa-file-excel"></i> Download Excel
                        </button>
                        <button class="btn" style="background:#dc2626; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnStrPDF">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                    </div>
                </div>

                <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom: 15px; color:#ef4444;"><i class="fas fa-exclamation-triangle"></i> Data Pegawai Belum Lengkap Profil</h4>
                    <p style="font-size: 0.9rem; color:#64748b; margin-bottom: 20px; min-height: 45px;">Daftar pegawai yang belum melengkapi data kontak dasar (seperti Email atau No Telepon).</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <button class="btn" style="background:#16a34a; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnProfilExcel">
                            <i class="fas fa-file-excel"></i> Download Excel
                        </button>
                        <button class="btn" style="background:#dc2626; color:white; padding: 10px 15px; border:none; border-radius:5px; cursor:pointer;" id="btnProfilPDF">
                            <i class="fas fa-file-pdf"></i> Download PDF
                        </button>
                    </div>
                </div>

            </div>
        </div>
    `;

    // 1. FUNGSI UNTUK MERUBAH TEKS TOMBOL SAAT LOADING
    const setBtnLoading = (btnId, isProcessing, originalText) => {
        const btn = document.getElementById(btnId);
        if (isProcessing) {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Proses...`;
            btn.disabled = true;
        } else {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    };

    // 2. FUNGSI UTAMA MENGAMBIL & MEMISAHKAN DATA
    async function fetchKategoriData() {
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
        
        // Kelompok jabatan yang diwajibkan upload izin
        const wajibPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];

        const belumSIK = [];
        const belumSTR = [];
        const belumProfil = [];

        (semuaPegawai || []).forEach(p => {
            const wajibIzin = wajibPerizinan.includes(p.kelompok_jabatan);
            
            // Cek SIK
            if (wajibIzin && !nikSIK.has(p.nik)) {
                belumSIK.push({ "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', "Keterangan": "Belum Upload SIK" });
            }
            
            // Cek STR
            if (wajibIzin && !nikSTR.has(p.nik)) {
                belumSTR.push({ "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', "Keterangan": "Belum Upload STR" });
            }

            // Cek Profil (Email atau No Telp belum diisi)
            if (!p.email || !p.no_telp) {
                let ket = [];
                if (!p.email) ket.push("Email");
                if (!p.no_telp) ket.push("No Telp");
                belumProfil.push({ "NIK": p.nik, "Nama": p.nama, "Jabatan": p.jabatan || '-', "Keterangan": `${ket.join(" & ")} belum diisi` });
            }
        });

        return { belumSIK, belumSTR, belumProfil };
    }

    // 3. FUNGSI EKSPOR EXCEL
    function exportKeExcel(data, fileName) {
        if (data.length === 0) {
            alert("Luar biasa! Tidak ada pegawai yang bermasalah pada kategori ini.");
            return;
        }
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap");
        XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    }

    // 4. FUNGSI EKSPOR PDF
    function exportKePDF(data, title, fileName) {
        if (data.length === 0) {
            alert("Luar biasa! Tidak ada pegawai yang bermasalah pada kategori ini.");
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.text(title, 14, 15);
        const rows = data.map((i, index) => [index + 1, i.NIK, i.Nama, i.Jabatan, i.Keterangan]);
        doc.autoTable({ head: [["No", "NIK", "Nama", "Jabatan", "Keterangan"]], body: rows, startY: 20 });
        doc.save(`${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    // ==========================================
    // PASANG EVENT LISTENER KE TOMBOL SIK
    // ==========================================
    document.getElementById('btnSikExcel').onclick = async function() {
        setBtnLoading('btnSikExcel', true);
        const { belumSIK } = await fetchKategoriData();
        exportKeExcel(belumSIK, "Belum_Lengkap_SIK");
        setBtnLoading('btnSikExcel', false, '<i class="fas fa-file-excel"></i> Download Excel');
    };
    document.getElementById('btnSikPDF').onclick = async function() {
        setBtnLoading('btnSikPDF', true);
        const { belumSIK } = await fetchKategoriData();
        exportKePDF(belumSIK, "Laporan Pegawai Belum Memiliki SIK/SIP", "Belum_Lengkap_SIK");
        setBtnLoading('btnSikPDF', false, '<i class="fas fa-file-pdf"></i> Download PDF');
    };

    // ==========================================
    // PASANG EVENT LISTENER KE TOMBOL STR
    // ==========================================
    document.getElementById('btnStrExcel').onclick = async function() {
        setBtnLoading('btnStrExcel', true);
        const { belumSTR } = await fetchKategoriData();
        exportKeExcel(belumSTR, "Belum_Lengkap_STR");
        setBtnLoading('btnStrExcel', false, '<i class="fas fa-file-excel"></i> Download Excel');
    };
    document.getElementById('btnStrPDF').onclick = async function() {
        setBtnLoading('btnStrPDF', true);
        const { belumSTR } = await fetchKategoriData();
        exportKePDF(belumSTR, "Laporan Pegawai Belum Memiliki STR", "Belum_Lengkap_STR");
        setBtnLoading('btnStrPDF', false, '<i class="fas fa-file-pdf"></i> Download PDF');
    };

    // ==========================================
    // PASANG EVENT LISTENER KE TOMBOL PROFIL
    // ==========================================
    document.getElementById('btnProfilExcel').onclick = async function() {
        setBtnLoading('btnProfilExcel', true);
        const { belumProfil } = await fetchKategoriData();
        exportKeExcel(belumProfil, "Belum_Lengkap_Profil");
        setBtnLoading('btnProfilExcel', false, '<i class="fas fa-file-excel"></i> Download Excel');
    };
    document.getElementById('btnProfilPDF').onclick = async function() {
        setBtnLoading('btnProfilPDF', true);
        const { belumProfil } = await fetchKategoriData();
        exportKePDF(belumProfil, "Laporan Pegawai Belum Melengkapi Profil", "Belum_Lengkap_Profil");
        setBtnLoading('btnProfilPDF', false, '<i class="fas fa-file-pdf"></i> Download PDF');
    };
}
