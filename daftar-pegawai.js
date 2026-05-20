// Global State untuk menyimpan data pegawai sementara setelah diambil dari Supabase
let DATA_PEGAWAI_LOCAL = [];
let EDIT_MODE_ID = null; // Menyimpan ID pegawai jika sedang dalam mode edit

// Fungsi utama untuk memuat komponen Daftar Pegawai
function renderDaftarPegawaiComponent() {
    // Jalankan fetch data sesaat setelah komponen dirender ke DOM
    setTimeout(() => {
        fetchPegawaiDariSupabase();
        initFormSubmitListener();
    }, 100);

    return `
        <!-- HEADER COMPONENT -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
                <p class="text-sm text-gray-500">Manajemen database seluruh pegawai yang terdaftar di sistem.</p>
            </div>
            <button onclick="openTambahPegawaiModal()" class="bg-blue-600 text-white text-sm px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 shadow-sm transition flex items-center gap-2 cursor-pointer">
                <i class="fa-solid fa-user-plus"></i> Tambah Pegawai Baru
            </button>
        </div>

        <!-- TABEL DATA PEGAWAI -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div class="relative w-full sm:w-72">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-3 text-gray-400 text-sm"></i>
                    <input type="text" id="p_cari_pegawai" oninput="handleCariPegawai(this.value)" placeholder="Cari nama, NIP, atau NIK..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr class="bg-gray-100/70 text-gray-600 text-xs uppercase font-bold border-b border-gray-200">
                            <th class="p-4">Pegawai</th>
                            <th class="p-4">NIP / NIK</th>
                            <th class="p-4">Jabatan / Gol</th>
                            <th class="p-4">Kelompok / Rumpun</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabel-pegawai-body" class="text-sm divide-y divide-gray-100 text-gray-700">
                        <tr>
                            <td colspan="6" class="p-8 text-center text-gray-400">
                                <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat data dari Supabase...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL JUMBO FORM INPUT & EDIT PEGAWAI -->
        <div id="modal-pegawai" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
                <!-- Header Modal -->
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 id="modal-title" class="text-lg font-bold text-gray-900 flex items-center gap-2"><i class="fa-solid fa-id-card-clip text-blue-600"></i> Formulir Biodata Pegawai</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Input data kepegawaian terintegrasi kalkulasi otomatis</p>
                    </div>
                    <button onclick="closeTambahPegawaiModal()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <!-- Form Body -->
                <form id="form-pegawai-supabase" class="flex-1 p-6 overflow-y-auto space-y-8 text-sm">
                    
                    <!-- KELOMPOK 1: IDENTITAS & KEPEGAWAIAN UTAMA -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-user-tie mr-1"></i> Identitas & Status Utama</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                                <input type="text" id="p_nama" required class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">NIK (KTP) *</label>
                                <input type="text" id="p_nik" maxlength="16" required class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">NIP (18 Digit)</label>
                                <input type="text" id="p_nip" maxlength="18" placeholder="Contoh: 199208122019031002" class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 outline-none font-mono" oninput="hitungTmtCpnsDariNip(this.value)">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Status Kepegawaian</label>
                                <select id="p_status" class="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                    <option value="AKTIF">AKTIF</option>
                                    <option value="MUTASI">MUTASI</option>
                                    <option value="PENSIUN">PENSIUN</option>
                                    <option value="PENSIUN DINI">PENSIUN DINI</option>
                                    <option value="MENGUNDURKAN DIRI">MENGUNDURKAN DIRI</option>
                                    <option value="LAINNYA">LAINNYA</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Golongan / Pangkat</label>
                                <select id="p_gol" class="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-blue-500 bg-white">
                                    <option value="Pembina Utama / IV/e">Pembina Utama / IV/e</option>
                                    <option value="Pembina Utama Madya / IV/d">Pembina Utama Madya / IV/d</option>
                                    <option value="Pembina Utama Muda / IV/c">Pembina Utama Muda / IV/c</option>
                                    <option value="Pembina Tk.I / IV/b">Pembina Tk.I / IV/b</option>
                                    <option value="Pembina / IV/a">Pembina / IV/a</option>
                                    <option value="Penata Tk.I / III/d">Penata Tk.I / III/d</option>
                                    <option value="Penata / III/c">Penata / III/c</option>
                                    <option value="Penata Muda Tk.I / III/b">Penata Muda Tk.I / III/b</option>
                                    <option value="Penata Muda / III/a">Penata Muda / III/a</option>
                                    <option value="Pengatur Tk.I / II/d">Pengatur Tk.I / II/d</option>
                                    <option value="Pengatur / II/c">Pengatur / II/c</option>
                                    <option value="Pengatur Muda Tk.I / II/b">Pengatur Muda Tk.I / II/b</option>
                                    <option value="Pengatur Muda / II/a">Pengatur Muda / II/a</option>
                                    <option value="Juru Tk. I / I/d">Juru Tk. I / I/d</option>
                                    <option value="Juru / I/c">Juru / I/c</option>
                                    <option value="Juru Muda Tk.I / I/b">Juru Muda Tk.I / I/b</option>
                                    <option value="Juru Muda / I/a">Juru Muda / I/a</option>
                                    <option value="Honorarium">Honorarium</option>
                                    <option value="Konsultan">Konsultan</option>
                                    <option value="Magang">Magang</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jabatan Saat Ini</label>
                                <input type="text" id="p_jabatan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                                <select id="p_jenis_kelamin" class="w-full rounded-lg border border-gray-300 p-2 outline-none bg-white">
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Agama</label>
                                <select id="p_agama" class="w-full rounded-lg border border-gray-300 p-2 outline-none bg-white">
                                    <option value="ISLAM">ISLAM</option>
                                    <option value="KRISTEN">KRISTEN</option>
                                    <option value="KHATOLIK">KHATOLIK</option>
                                    <option value="BUDHA">BUDHA</option>
                                    <option value="HINDU">HINDU</option>
                                    <option value="KHONGHUCHU">KHONGHUCHU</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Ruangan / Unit Kerja</label>
                                <input type="text" id="p_ruangan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 2: RIWAYAT TANGGAL & MASA KERJA -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-calendar-days mr-1"></i> Linimasa Masa Kerja & Pensiun</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">TMT Pangkat</label>
                                <input type="date" id="p_tmt_pangkat" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">TMT Berikutnya</label>
                                <input type="date" id="p_tmt_berikutnya" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">TMT CPNS <span class="text-blue-600 font-bold">(Auto NIP)</span></label>
                                <input type="date" id="p_tmt_cpns" readonly class="w-full rounded-lg border border-gray-100 bg-gray-100 p-2 outline-none text-gray-600 font-medium">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Masuk RS *</label>
                                <input type="date" id="p_masuk_rs" required class="w-full rounded-lg border border-gray-300 p-2 outline-none" onchange="hitungMasaKerjaRs(this.value)">
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Masa Kerja RS <span class="text-blue-600 font-bold">(Kalkulator Otomatis)</span></label>
                                <input type="text" id="p_masa_kerja_rs" readonly placeholder="Pilih tanggal masuk RS..." class="w-full rounded-lg border border-gray-100 bg-gray-100 p-2 outline-none text-slate-800 font-semibold">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Rentang BUP (Usia Pensiun)</label>
                                <input type="number" id="p_rentang_bup" placeholder="e.g. 58 atau 60" class="w-full rounded-lg border border-gray-300 p-2 outline-none" oninput="hitungTmtPensiun()">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">TMT Pensiun <span class="text-blue-600 font-bold">(Otomatis Tgl 1)</span></label>
                                <input type="date" id="p_tmt_pensiun" readonly class="w-full rounded-lg border border-gray-100 bg-gray-100 p-2 outline-none text-gray-600 font-medium">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 3: KELAHIRAN & DATA KELUARGA -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-people-roof mr-1"></i> Kelahiran & Informasi Keluarga</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Tempat Lahir</label>
                                <input type="text" id="p_tempat_lahir" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Lahir</label>
                                <input type="date" id="p_tanggal_lahir" class="w-full rounded-lg border border-gray-300 p-2 outline-none" onchange="hitungTmtPensiun()">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Status Pernikahan</label>
                                <select id="p_status_keluarga" class="w-full rounded-lg border border-gray-300 p-2 outline-none bg-white">
                                    <option value="Belum Kawin">Belum Kawin</option>
                                    <option value="Kawin">Kawin</option>
                                    <option value="Cerai Hidup">Cerai Hidup</option>
                                    <option value="Cerai Mati">Cerai Mati</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Pasangan</label>
                                <input type="text" id="p_nama_pasangan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jumlah Anak</label>
                                <input type="number" id="p_jumlah_anak" value="0" min="0" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div class="md:col-span-3">
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Alamat Rumah Lengkap</label>
                                <input type="text" id="p_alamat" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 4: RUMPUN PENDIDIKAN -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-graduation-cap mr-1"></i> Pendidikan Terakhir</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jenjang Pendidikan</label>
                                <input type="text" id="p_jenjang" placeholder="e.g. D3, S1, Profesi" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Fakultas</label>
                                <input type="text" id="p_fakultas" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jurusan / Prodi</label>
                                <input type="text" id="p_jurusan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 5: REGISTRASI, JAMINAN, PAJAK & KELOMPOK JABATAN -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-file-invoice-dollar mr-1"></i> Klasifikasi Jaminan & Kelompok</h4>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Kelompok Pegawai</label>
                                <select id="p_kelompok" class="w-full rounded-lg border border-gray-300 p-2 outline-none bg-white">
                                    <option value="ASN">ASN</option>
                                    <option value="APBD">APBD</option>
                                    <option value="BLUD">BLUD</option>
                                    <option value="KONSULTAN">KONSULTAN</option>
                                    <option value="MAGANG">MAGANG</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Kelompok Jabatan</label>
                                <select id="p_kelompok_jabatan" class="w-full rounded-lg border border-gray-300 p-2 outline-none bg-white">
                                    <option value="MANAGEMENT">MANAGEMENT</option>
                                    <option value="TENAGA MEDIS">TENAGA MEDIS</option>
                                    <option value="TENAGA KESEHATAN">TENAGA KESEHATAN</option>
                                    <option value="TENAGA PENUNJANG MEDIS">TENAGA PENUNJANG MEDIS</option>
                                    <option value="TENAGA ADMNISTRASI">TENAGA ADMNISTRASI</option>
                                    <option value="TENAGA NON ADMINISTRASI">TENAGA NON ADMINISTRASI</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">No. BPJS Kesehatan</label>
                                <input type="text" id="p_no_bpjsn" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">No. BPJS Ketenagakerjaan / Taspen</label>
                                <input type="text" id="p_no_bpjsket_taspen" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">NPWP</label>
                                <input type="text" id="p_npwp" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 6: KONTAK INTEGRASI -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-address-book mr-1"></i> Kontak Penghubung</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Email Aktif *</label>
                                <input type="email" id="p_email" required placeholder="name@example.com" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">No. Telp / WhatsApp *</label>
                                <input type="text" id="p_no_telp" required placeholder="08XXXXXXXXXX" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- Area Tombol Aksi Form -->
                    <div class="border-t border-gray-200 pt-4 flex justify-end gap-3 bg-white sticky bottom-0">
                        <button type="button" onclick="closeTambahPegawaiModal()" class="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Batal</button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md cursor-pointer">Simpan ke Supabase</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- MODAL VIEW DETAIL PEGAWAI (READ-ONLY) -->
        <div id="modal-view-pegawai" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 class="text-base font-bold text-gray-900 flex items-center gap-2"><i class="fa-solid fa-circle-info text-blue-500"></i> Detail Informasi Pegawai</h3>
                    <button onclick="closeViewPegawaiModal()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"><i class="fa-solid fa-xmark text-base"></i></button>
                </div>
                <div id="view-modal-content" class="p-6 overflow-y-auto space-y-4 text-xs">
                    <!-- Konten detail diisi dinamis oleh JavaScript -->
                </div>
                <div class="border-t border-gray-100 p-4 bg-gray-50 flex justify-end rounded-b-2xl">
                    <button onclick="closeViewPegawaiModal()" class="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 cursor-pointer">Tutup Detail</button>
                </div>
            </div>
        </div>
    `;
}

// --- DATABASE OPERATIONS (SUPABASE CRUD) ---

// 1. Ambil Data (READ)
async function fetchPegawaiDariSupabase() {
    const tbody = document.getElementById('tabel-pegawai-body');
    if (!tbody) return;

    try {
        // Asumsi variabel 'supabase' sudah dideklarasikan global di index.html / app.js Anda
        const { data, error } = await supabase
            .from('pegawai')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        DATA_PEGAWAI_LOCAL = data || [];
        renderTabelPegawai(DATA_PEGAWAI_LOCAL);

    } catch (error) {
        console.error("Gagal mengambil data:", error.message);
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-red-500 font-medium"><i class="fa-solid fa-triangle-exclamation mr-2"></i> Error: ${error.message}</td></tr>`;
    }
}

// Render Data array ke elemen baris tabel HTML
function renderTabelPegawai(listPegawai) {
    const tbody = document.getElementById('tabel-pegawai-body');
    if (!tbody) return;

    if (listPegawai.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-12 text-center text-gray-400 font-medium"><i class="fa-solid fa-box-open text-2xl block mb-2 text-gray-300"></i> Tidak ada data pegawai ditemukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = listPegawai.map(p => {
        const inisial = p.nama ? p.nama.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '??';
        
        // Atur warna label badge status kepegawaian
        let statusBadgeColor = 'bg-gray-50 text-gray-700 border-gray-200';
        if (p.status === 'AKTIF') statusBadgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        else if (['PENSIUN', 'PENSIUN DINI'].includes(p.status)) statusBadgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
        else if (p.status === 'MENGUNDURKAN DIRI') statusBadgeColor = 'bg-red-50 text-red-700 border-red-200';

        return `
            <tr class="hover:bg-gray-50/50 transition">
                <td class="p-4">
                    <div class="flex items-center gap-3">
                        <div class="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">${inisial}</div>
                        <div>
                            <p class="font-semibold text-gray-900">${p.nama || '-'}</p>
                            <p class="text-xs text-gray-400 font-mono">${p.email || '-'}</p>
                        </div>
                    </div>
                </td>
                <td class="p-4">
                    <p class="font-mono text-xs text-gray-900 font-medium">${p.nip ? 'NIP: ' + p.nip : 'NIP: -'}</p>
                    <p class="font-mono text-xs text-gray-400">NIK: ${p.nik || '-'}</p>
                </td>
                <td class="p-4">
                    <p class="font-medium text-gray-800">${p.jabatan || '-'}</p>
                    <p class="text-xs text-gray-500">${p.golongan || '-'}</p>
                </td>
                <td class="p-4">
                    <p class="font-medium text-gray-700">${p.kelompok || '-'}</p>
                    <p class="text-xs text-gray-400">${p.kelompok_jabatan || '-'}</p>
                </td>
                <td class="p-4">
                    <span class="px-2.5 py-0.5 border ${statusBadgeColor} rounded-full text-xs font-semibold">${p.status || 'AKTIF'}</span>
                </td>
                <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                        <button onclick="viewDetailPegawai('${p.id}')" title="Lihat Detail" class="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition cursor-pointer"><i class="fa-solid fa-eye"></i></button>
                        <button onclick="editPegawaiData('${p.id}')" title="Edit Data" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="hapusPegawaiData('${p.id}', '${p.nama}')" title="Hapus Data" class="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 2. Kirim Data (CREATE & UPDATE)
function initFormSubmitListener() {
    const form = document.getElementById('form-pegawai-supabase');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // Memetakan input value dari DOM Form ke struktur field database Supabase
        const payload = {
            nama: document.getElementById('p_nama').value,
            nik: document.getElementById('p_nik').value,
            nip: document.getElementById('p_nip').value,
            status: document.getElementById('p_status').value,
            golongan: document.getElementById('p_gol').value,
            jabatan: document.getElementById('p_jabatan').value,
            jenis_kelamin: document.getElementById('p_jenis_kelamin').value,
            agama: document.getElementById('p_agama').value,
            ruangan: document.getElementById('p_ruangan').value,
            tmt_pangkat: document.getElementById('p_tmt_pangkat').value || null,
            tmt_berikutnya: document.getElementById('p_tmt_berikutnya').value || null,
            tmt_cpns: document.getElementById('p_tmt_cpns').value || null,
            masuk_rs: document.getElementById('p_masuk_rs').value || null,
            masa_kerja_rs: document.getElementById('p_masa_kerja_rs').value,
            rentang_bup: document.getElementById('p_rentang_bup').value ? parseInt(document.getElementById('p_rentang_bup').value, 10) : null,
            tmt_pensiun: document.getElementById('p_tmt_pensiun').value || null,
            tempat_lahir: document.getElementById('p_tempat_lahir').value,
            tanggal_lahir: document.getElementById('p_tanggal_lahir').value || null,
            status_pernikahan: document.getElementById('p_status_keluarga').value,
            nama_pasangan: document.getElementById('p_nama_pasangan').value,
            jumlah_anak: parseInt(document.getElementById('p_jumlah_anak').value, 10) || 0,
            alamat: document.getElementById('p_alamat').value,
            jenjang_pendidikan: document.getElementById('p_jenjang').value,
            fakultas: document.getElementById('p_fakultas').value,
            jurusan: document.getElementById('p_jurusan').value,
            kelompok: document.getElementById('p_kelompok').value,
            kelompok_jabatan: document.getElementById('p_kelompok_jabatan').value,
            no_bpjs_kesehatan: document.getElementById('p_no_bpjsn').value,
            no_bpjs_ket_taspen: document.getElementById('p_no_bpjsket_taspen').value,
            npwp: document.getElementById('p_npwp').value,
            email: document.getElementById('p_email').value,
            no_telp: document.getElementById('p_no_telp').value
        };

        try {
            let response;
            
            if (EDIT_MODE_ID) {
                // Jika EDIT_MODE_ID terisi, lakukan UPDATE data
                response = await supabase
                    .from('pegawai')
                    .update(payload)
                    .eq('id', EDIT_MODE_ID);
            } else {
                // Jika tidak ada ID, lakukan INSERT data baru
                response = await supabase
                    .from('pegawai')
                    .insert([payload]);
            }

            if (response.error) throw response.error;

            alert(EDIT_MODE_ID ? "Data pegawai berhasil diperbarui!" : "Pegawai baru berhasil ditambahkan!");
            closeTambahPegawaiModal();
            fetchPegawaiDariSupabase(); // Reload isi tabel secara otomatis

        } catch (error) {
            console.error("Proses simpan gagal:", error.message);
            alert("Terjadi masalah saat menyimpan data: " + error.message);
        }
    };
}

// 3. Hapus Data (DELETE)
async function hapusPegawaiData(id, nama) {
    if (!confirm(`Apakah Anda benar-benar yakin ingin menghapus data pegawai "${nama}"?`)) return;

    try {
        const { error } = await supabase
            .from('pegawai')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert("Data pegawai terhapus.");
        fetchPegawaiDariSupabase(); // Refresh isi tabel
    } catch (error) {
        alert("Gagal menghapus data: " + error.message);
    }
}

// --- ACTION LOGICS (VIEW & EDIT FILLER) ---

// Aksi Tampilkan Detail (VIEW)
function viewDetailPegawai(id) {
    const pegawai = DATA_PEGAWAI_LOCAL.find(p => p.id === id);
    if (!pegawai) return;

    const contentArea = document.getElementById('view-modal-content');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
            <div><span class="text-gray-400 block font-medium">Nama Lengkap</span> <strong class="text-sm text-gray-900">${pegawai.nama || '-'}</strong></div>
            <div><span class="text-gray-400 block font-medium">Jenis Kelamin / Agama</span> <span class="text-gray-800 font-semibold">${pegawai.jenis_kelamin || '-'} / ${pegawai.agama || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">NIP</span> <span class="font-mono text-gray-900 font-medium">${pegawai.nip || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">NIK (KTP)</span> <span class="font-mono text-gray-900 font-medium">${pegawai.nik || '-'}</span></div>
        </div>
        <div class="grid grid-cols-3 gap-4 border-b border-gray-100 pb-3">
            <div><span class="text-gray-400 block font-medium">Status Pegawai</span> <strong class="text-blue-600">${pegawai.status || '-'}</strong></div>
            <div><span class="text-gray-400 block font-medium">Golongan</span> <span class="text-gray-800 font-semibold">${pegawai.golongan || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">Jabatan</span> <span class="text-gray-800 font-semibold">${pegawai.jabatan || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">Kelompok</span> <span class="text-gray-800 font-semibold">${pegawai.kelompok || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">Kelompok Jabatan</span> <span class="text-gray-800 font-semibold">${pegawai.kelompok_jabatan || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">Ruangan</span> <span class="text-gray-800 font-semibold">${pegawai.ruangan || '-'}</span></div>
        </div>
        <div class="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
            <div><span class="text-gray-400 block font-medium">TMT CPNS</span> <span class="text-gray-800 font-medium">${pegawai.tmt_cpns || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">Masa Kerja Rumah Sakit</span> <strong class="text-emerald-700">${pegawai.masa_kerja_rs || '-'}</strong></div>
            <div><span class="text-gray-400 block font-medium">TMT Pensiun (BUP ${pegawai.rentang_bup || '-'} Thn)</span> <span class="text-gray-800 font-medium">${pegawai.tmt_pensiun || '-'}</span></div>
            <div><span class="text-gray-400 block font-medium">Kontak HP / Email</span> <span class="text-gray-800 font-medium">${pegawai.no_telp || '-'} / ${pegawai.email || '-'}</span></div>
        </div>
        <div>
            <span class="text-gray-400 block font-medium">Alamat Tinggal</span>
            <span class="text-gray-800">${pegawai.alamat || '-'}</span>
        </div>
    `;

    document.getElementById('modal-view-pegawai').classList.remove('hidden');
}

// Persiapan Form untuk Pengubahan (EDIT)
function editPegawaiData(id) {
    const p = DATA_PEGAWAI_LOCAL.find(item => item.id === id);
    if (!p) return;

    EDIT_MODE_ID = id; // Nyalakan flag mode edit ke ID ini

    // Ubah judul dan teks tombol di modal form
    document.getElementById('modal-title').innerHTML = `<i class="fa-solid fa-user-pen text-amber-500"></i> Ubah / Edit Data Pegawai`;
    
    // Inject seluruh value dari record database ke dalam elemen form
    document.getElementById('p_nama').value = p.nama || "";
    document.getElementById('p_nik').value = p.nik || "";
    document.getElementById('p_nip').value = p.nip || "";
    document.getElementById('p_status').value = p.status || "AKTIF";
    document.getElementById('p_gol').value = p.golongan || "Pembina / IV/a";
    document.getElementById('p_jabatan').value = p.jabatan || "";
    document.getElementById('p_jenis_kelamin').value = p.jenis_kelamin || "Laki-laki";
    document.getElementById('p_agama').value = p.agama || "ISLAM";
    document.getElementById('p_ruangan').value = p.ruangan || "";
    document.getElementById('p_tmt_pangkat').value = p.tmt_pangkat || "";
    document.getElementById('p_tmt_berikutnya').value = p.tmt_berikutnya || "";
    document.getElementById('p_tmt_cpns').value = p.tmt_cpns || "";
    document.getElementById('p_masuk_rs').value = p.masuk_rs || "";
    document.getElementById('p_masa_kerja_rs').value = p.masa_kerja_rs || "";
    document.getElementById('p_rentang_bup').value = p.rentang_bup || "";
    document.getElementById('p_tmt_pensiun').value = p.tmt_pensiun || "";
    document.getElementById('p_tempat_lahir').value = p.tempat_lahir || "";
    document.getElementById('p_tanggal_lahir').value = p.tanggal_lahir || "";
    document.getElementById('p_status_keluarga').value = p.status_pernikahan || "Belum Kawin";
    document.getElementById('p_nama_pasangan').value = p.nama_pasangan || "";
    document.getElementById('p_jumlah_anak').value = p.jumlah_anak || 0;
    document.getElementById('p_alamat').value = p.alamat || "";
    document.getElementById('p_jenjang').value = p.jenjang_pendidikan || "";
    document.getElementById('p_fakultas').value = p.fakultas || "";
    document.getElementById('p_jurusan').value = p.jurusan || "";
    document.getElementById('p_kelompok').value = p.kelompok || "ASN";
    document.getElementById('p_kelompok_jabatan').value = p.kelompok_jabatan || "MANAGEMENT";
    document.getElementById('p_no_bpjsn').value = p.no_bpjs_kesehatan || "";
    document.getElementById('p_no_bpjsket_taspen').value = p.no_bpjs_ket_taspen || "";
    document.getElementById('p_npwp').value = p.npwp || "";
    document.getElementById('p_email').value = p.email || "";
    document.getElementById('p_no_telp').value = p.no_telp || "";

    // Tampilkan modal yang kini berfungsi sebagai form edit
    document.getElementById('modal-pegawai').classList.remove('hidden');
}

// Fungsi live-search lokal untuk menyaring isi tabel tanpa re-fetch database
function handleCariPegawai(keyword) {
    const key = keyword.toLowerCase();
    const hasilSaring = DATA_PEGAWAI_LOCAL.filter(p => 
        (p.nama && p.nama.toLowerCase().includes(key)) ||
        (p.nip && p.nip.includes(key)) ||
        (p.nik && p.nik.includes(key))
    );
    renderTabelPegawai(hasilSaring);
}

// --- AUTOMATION FORM CALCULATIONS ---
function hitungTmtCpnsDariNip(nipValue) {
    const cleanNip = nipValue.replace(/\s+/g, '');
    const targetInput = document.getElementById('p_tmt_cpns');
    if (!targetInput) return;

    if (cleanNip.length >= 14) {
        const tahunStr = cleanNip.substring(8, 12);
        const bulanStr = cleanNip.substring(12, 14);
        targetInput.value = `${tahunStr}-${bulanStr}-01`;
    } else {
        targetInput.value = "";
    }
}

function hitungMasaKerjaRs(tanggalMasukStr) {
    const targetInput = document.getElementById('p_masa_kerja_rs');
    if (!targetInput || !tanggalMasukStr) return;

    const tglMasuk = new Date(tanggalMasukStr);
    const tglSekarang = new Date();
    if (tglMasuk > tglSekarang) { targetInput.value = "Format Tanggal Salah"; return; }

    let tahun = tglSekarang.getFullYear() - tglMasuk.getFullYear();
    let bulan = tglSekarang.getMonth() - tglMasuk.getMonth();
    let hari = tglSekarang.getDate() - tglMasuk.getDate();

    if (hari < 0) {
        bulan--;
        const bulanLalu = new Date(tglSekarang.getFullYear(), tglSekarang.getMonth(), 0).getDate();
        hari += bulanLalu;
    }
    if (bulan < 0) { tahun--; bulan += 12; }
    targetInput.value = `${tahun} TAHUN ${bulan} BULAN ${hari} HARI`;
}

function hitungTmtPensiun() {
    const tglLahirStr = document.getElementById('p_tanggal_lahir').value;
    const bupStr = document.getElementById('p_rentang_bup').value;
    const targetInput = document.getElementById('p_tmt_pensiun');

    if (!targetInput || !tglLahirStr || !bupStr) { if(targetInput) targetInput.value = ""; return; }

    const tglLahir = new Date(tglLahirStr);
    let tahunPensiun = tglLahir.getFullYear() + parseInt(bupStr, 10);
    let bulanPensiun = tglLahir.getMonth() + 1;

    if (bulanPensiun > 11) { bulanPensiun = 0; tahunPensiun += 1; }

    const mm = String(bulanPensiun + 1).padStart(2, '0');
    targetInput.value = `${tahunPensiun}-${mm}-01`;
}

// --- CONTROLLER OPEN / CLOSE MODAL ---
function openTambahPegawaiModal() {
    EDIT_MODE_ID = null; // Reset ke mode insert data baru
    document.getElementById('form-pegawai-supabase').reset();
    document.getElementById('modal-title').innerHTML = `<i class="fa-solid fa-id-card-clip text-blue-600"></i> Formulir Biodata Pegawai`;
    const modal = document.getElementById('modal-pegawai');
    if (modal) modal.classList.remove('hidden');
}

function closeTambahPegawaiModal() {
    const modal = document.getElementById('modal-pegawai');
    if (modal) modal.classList.add('hidden');
}

function closeViewPegawaiModal() {
    const modal = document.getElementById('modal-view-pegawai');
    if (modal) modal.classList.add('hidden');
}
