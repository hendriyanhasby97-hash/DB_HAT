// Fungsi utama untuk memuat komponen Daftar Pegawai
function renderDaftarPegawaiComponent() {
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
                    <input type="text" placeholder="Cari nama, NIP, atau NIK..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
                </div>
            </div>
            
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                        <tr class="bg-gray-100/70 text-gray-600 text-xs uppercase font-bold border-b border-gray-200">
                            <th class="p-4">Pegawai</th>
                            <th class="p-4">NIP / NIK</th>
                            <th class="p-4">Jabatan / Gol</th>
                            <th class="p-4">Ruangan</th>
                            <th class="p-4">Status</th>
                            <th class="p-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm divide-y divide-gray-100 text-gray-700">
                        <tr class="hover:bg-gray-50/50 transition">
                            <td class="p-4">
                                <div class="flex items-center gap-3">
                                    <div class="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">BS</div>
                                    <div>
                                        <p class="font-semibold text-gray-900">Dr. Budi Santoso, Sp.B</p>
                                        <p class="text-xs text-gray-500">budi.santoso@instansi.go.id</p>
                                    </div>
                                </div>
                            </td>
                            <td class="p-4">
                                <p class="font-mono text-xs text-gray-900 font-medium">NIP: 199208122019031002</p>
                                <p class="font-mono text-xs text-gray-400">NIK: 320102XXXXXXXXXX</p>
                            </td>
                            <td class="p-4">
                                <p class="font-medium text-gray-800">Dokter Spesialis Bedah</p>
                                <p class="text-xs text-gray-500">Gol: IV/a (Pembina)</p>
                            </td>
                            <td class="p-4 text-gray-600 font-medium">Instalasi Bedah Sentral</td>
                            <td class="p-4">
                                <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">AKTIF</span>
                            </td>
                            <td class="p-4 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL JUMBO FORM INPUT PEGAWAI -->
        <div id="modal-pegawai" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
                <!-- Header Modal -->
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2"><i class="fa-solid fa-id-card-clip text-blue-600"></i> Formulir Biodata Pegawai</h3>
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
                                <input type="number" id="p_rentang_bup" placeholder="e.g. 58 atau 60" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">TMT Pensiun</label>
                                <input type="date" id="p_tmt_pensiun" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
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
                                <input type="date" id="p_tanggal_lahir" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
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
    `;
}

// --- AUTOMATION LOGIC FUNCTIONS ---

// 1. Ekstraksi TMT CPNS Otomatis dari 18 digit NIP
function hitungTmtCpnsDariNip(nipValue) {
    const cleanNip = nipValue.replace(/\s+/g, ''); // bersihkan spasi jika ada
    const targetInput = document.getElementById('p_tmt_cpns');
    
    if (!targetInput) return;

    // Pola NIP: YYYYMMDD YYYYMM X XXX (Total 18 Angka)
    // Angka ke-9 s/d 14 melambangkan Tahun & Bulan CPNS (Index ke-8 hingga ke-13)
    if (cleanNip.length >= 14) {
        const tahunStr = cleanNip.substring(8, 12); // Ambil 4 angka Tahun pengangkatan
        const bulanStr = cleanNip.substring(12, 14); // Ambil 2 angka Bulan pengangkatan
        const tanggalStr = "01"; // Standar TMT CPNS biasanya ditetapkan per tanggal 1
        
        // Format standar input type="date" adalah YYYY-MM-DD
        targetInput.value = `${tahunStr}-${bulanStr}-${tanggalStr}`;
    } else {
        targetInput.value = "";
    }
}

// 2. Kalkulasi Masa Kerja Rumah Sakit Dinamis (Tahun, Bulan, Hari)
function hitungMasaKerjaRs(tanggalMasukStr) {
    const targetInput = document.getElementById('p_masa_kerja_rs');
    if (!targetInput || !tanggalMasukStr) return;

    const tglMasuk = new Date(tanggalMasukStr);
    const tglSekarang = new Date();

    if (tglMasuk > tglSekarang) {
        targetInput.value = "Tanggal masuk tidak boleh melebihi hari ini";
        return;
    }

    let tahun = tglSekarang.getFullYear() - tglMasuk.getFullYear();
    let bulan = tglSekarang.getMonth() - tglMasuk.getMonth();
    let hari = tglSekarang.getDate() - tglMasuk.getDate();

    // Penyesuaian jika hitungan hari minus
    if (hari < 0) {
        bulan--;
        // Ambil jumlah hari pada bulan sebelumnya
        const bulanLalu = new Date(tglSekarang.getFullYear(), tglSekarang.getMonth(), 0).getDate();
        hari += bulanLalu;
    }

    // Penyesuaian jika hitungan bulan minus
    if (bulan < 0) {
        tahun--;
        bulan += 12;
    }

    targetInput.value = `${tahun} TAHUN ${bulan} BULAN ${hari} HARI`;
}

// --- CONTROLLER ACTIONS UNTUK MODAL ---
function openTambahPegawaiModal() {
    const modal = document.getElementById('modal-pegawai');
    if (modal) modal.classList.remove('hidden');
}

function closeTambahPegawaiModal() {
    const modal = document.getElementById('modal-pegawai');
    if (modal) modal.classList.add('hidden');
}
