/**
 * DAFTAR-PEGAWAI.JS - Manajemen SIMPEG Akurat (Modal Jumbo Grid & Auto-Calculations)
 * Nama Tabel Database: daftar_pegawai
 */

let pegawaiTerpilihId = null;

function renderDaftarPegawaiComponent() {
    // Tarik data setelah komponen termuat di DOM
    setTimeout(() => querySemuaPegawai(), 100);

    return `
        <!-- Bagian Atas: Tombol Aksi & Cari -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-4">
            <div class="relative w-full sm:w-72">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" id="cari-pegawai" oninput="querySemuaPegawai()" placeholder="Cari nama, NIP, atau NIK..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
            </div>
            <button onclick="bukaModalPegawai()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer">
                <i class="fa-solid fa-user-plus"></i>
                Tambah Pegawai Baru
            </button>
        </div>

        <!-- Tabel Kontainer -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse table-auto min-w-[1200px]">
                    <thead>
                        <tr class="bg-slate-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th class="py-3.5 px-4 w-12 text-center">No</th>
                            <th class="py-3.5 px-4">Pegawai / NIP / NIK</th>
                            <th class="py-3.5 px-4">Jabatan & Ruangan</th>
                            <th class="py-3.5 px-4">Golongan & Kelompok</th>
                            <th class="py-3.5 px-4">Masa Kerja RS</th>
                            <th class="py-3.5 px-4">Legalitas BPJS & NPWP</th>
                            <th class="py-3.5 px-4 text-center">Status</th>
                            <th class="py-3.5 px-4 w-24 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabel-body-pegawai" class="divide-y divide-gray-100 text-xs text-gray-700">
                        <tr>
                            <td colspan="8" class="py-8 text-center text-gray-400">
                                <i class="fa-solid fa-circle-notch fa-spin text-lg text-blue-500 mb-2 block"></i>
                                Menghubungkan basis data kepegawaian...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ======================================================= -->
        <!-- MODAL JUMBO GRID (SINKRONISASI DATA KESELURUHAN)         -->
        <!-- ======================================================= -->
        <div id="modal-pegawai" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onclick="tutupModalPegawai()"></div>
            
            <div class="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-5xl overflow-hidden flex flex-col relative z-10 transform scale-95 transition-all duration-200 my-8">
                <!-- Header -->
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <div class="flex items-center gap-2.5">
                        <div id="modal-icon-container" class="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <div>
                            <h3 id="modal-judul" class="text-sm font-black text-gray-900">Formulir Profil Pegawai</h3>
                            <p class="text-[10px] text-gray-400 font-medium">Pengisian komprehensif master data kepegawaian institusi sakit</p>
                        </div>
                    </div>
                    <button onclick="tutupModalPegawai()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- Form Jumbo Grid Space -->
                <form onsubmit="handleSimpanPegawai(event)" class="p-6 space-y-6 overflow-y-auto max-h-[78vh] bg-slate-50/50">
                    
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        <!-- GRID KOLOM 1: IDENTITAS UTAMA & AKUN -->
                        <div class="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-3.5">
                            <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5"><i class="fa-solid fa-address-card text-slate-400"></i> 1. Identitas Pokok</h4>
                            
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">NIP (Nomor Induk Pegawai) *</label>
                                <input type="text" id="form-nip" oninput="autoHitungTmtCpns()" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Contoh: 199405122021031002">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">NIK KTP *</label>
                                <input type="text" id="form-nik" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="16 digit NIK">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Lengkap & Gelar *</label>
                                <input type="text" id="form-nama" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Nama Lengkap">
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Jenis Kelamin</label>
                                    <select id="form-jenis-kelamin" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                        <option value="LAKI-LAKI">Laki-Laki</option>
                                        <option value="PEREMPUAN">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Agama</label>
                                    <select id="form-agama" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                        <option value="ISLAM">ISLAM</option>
                                        <option value="KRISTEN">KRISTEN</option>
                                        <option value="KHATOLIK">KHATOLIK</option>
                                        <option value="BUDHA">BUDHA</option>
                                        <option value="HINDU">HINDU</option>
                                        <option value="KHONGHUCHU">KHONGHUCHU</option>
                                    </select>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tempat Lahir</label>
                                    <input type="text" id="form-tempat-lahir" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Kota Lahir">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Tanggal Lahir</label>
                                    <input type="date" id="form-tanggal-lahir" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                </div>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kontak (No. HP / WA)</label>
                                <input type="text" id="form-no-telp" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="08...">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Aktif</label>
                                <input type="email" id="form-email" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="name@hospital.com">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Alamat Tinggal Sesuai KTP</label>
                                <textarea id="form-alamat" rows="2" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Nama Jalan, RT/RW, Kecamatan"></textarea>
                            </div>
                        </div>

                        <!-- GRID KOLOM 2: JABATAN, RUANGAN, & TMT GOLONGAN -->
                        <div class="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-3.5">
                            <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5"><i class="fa-solid fa-sitemap text-slate-400"></i> 2. Penugasan & Kepangkatan</h4>
                            
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status Kepegawaian</label>
                                <select id="form-status" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                    <option value="AKTIF">AKTIF</option>
                                    <option value="MUTASI">MUTASI</option>
                                    <option value="PENSIUN">PENSIUN</option>
                                    <option value="PENSIUN DINI">PENSIUN DINI</option>
                                    <option value="MENGUNDURKAN DIRI">MENGUNDURKAN DIRI</option>
                                    <option value="LAINNYA">LAINNYA</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kelompok Pegawai</label>
                                <select id="form-kelompok" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                    <option value="ASN">ASN</option>
                                    <option value="APBD">APBD</option>
                                    <option value="BLUD">BLUD</option>
                                    <option value="KONSULTAN">KONSULTAN</option>
                                    <option value="MAGANG">MAGANG</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Kelompok Jabatan</label>
                                <select id="form-kelompok-jabatan" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                    <option value="MANAGEMENT">MANAGEMENT</option>
                                    <option value="TENAGA MEDIS">TENAGA MEDIS</option>
                                    <option value="TENAGA KESEHATAN">TENAGA KESEHATAN</option>
                                    <option value="TENAGA PENUNJANG MEDIS">TENAGA PENUNJANG MEDIS</option>
                                    <option value="TENAGA ADMINISTRASI">TENAGA ADMINISTRASI</option>
                                    <option value="TENAGA NON ADMINISTRASI">TENAGA NON ADMINISTRASI</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Golongan / Ruang</label>
                                <select id="form-gol" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
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
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Jabatan</label>
                                    <input type="text" id="form-jabatan" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Misal: Perawat Mahir">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Unit Ruangan Kerja</label>
                                    <input type="text" id="form-ruangan" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="ICU, IGD, RM, dll">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">TMT Pangkat</label>
                                    <input type="date" id="form-tmt-pangkat" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">TMT Berikutnya</label>
                                    <input type="date" id="form-tmt-berikutnya" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rentang BUP (Tahun)</label>
                                    <input type="number" id="form-rentang-bup" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="58 atau 60">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">TMT Pensiun</label>
                                    <input type="date" id="form-tmt-pensiun" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                </div>
                            </div>
                        </div>

                        <!-- GRID KOLOM 3: OTOMATISASI MASUK RS, HISTORI AKADEMIK, KELUARGA & FINANSIAL -->
                        <div class="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-3.5">
                            <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5"><i class="fa-solid fa-calculator text-slate-400"></i> 3. Kalkulasi & Berkas Data</h4>
                            
                            <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                                <div>
                                    <label class="block text-[9px] font-black text-slate-500 uppercase mb-1">TMT CPNS (Auto NIP)</label>
                                    <input type="date" id="form-tmt-cpns" readonly class="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-mono text-gray-500 outline-none cursor-not-allowed">
                                </div>
                                <div>
                                    <label class="block text-[9px] font-black text-slate-500 uppercase mb-1">Masuk RS *</label>
                                    <input type="date" id="form-masuk-rs" oninput="autoKalkulasiMasaKerja()" required class="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-mono outline-none">
                                </div>
                                <div class="col-span-2 mt-1">
                                    <label class="block text-[9px] font-black text-slate-500 uppercase mb-0.5">Masa Kerja Rumah Sakit</label>
                                    <input type="text" id="form-masa-kerja-rs" readonly class="w-full p-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded text-xs font-bold font-mono outline-none cursor-not-allowed" placeholder="Otomatis terhitung...">
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-1.5">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Jenjang</label>
                                    <input type="text" id="form-jenjang" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs" placeholder="S1, D3">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Fakultas</label>
                                    <input type="text" id="form-fakultas" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs" placeholder="Kesehatan">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1">Jurusan</label>
                                    <input type="text" id="form-jurusan" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs" placeholder="Keperawatan">
                                </div>
                            </div>

                            <div class="grid grid-cols-3 gap-1.5 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                                <div class="col-span-3"><span class="text-[9px] font-black text-amber-700 uppercase">Hubungan Keluarga</span></div>
                                <div class="col-span-2">
                                    <select id="form-status-keluarga" class="w-full p-1.5 bg-white border border-gray-300 rounded text-[11px]">
                                        <option value="BELUM KAWIN">BELUM KAWIN</option>
                                        <option value="KAWIN">KAWIN</option>
                                        <option value="CERAI HIDUP">CERAI HIDUP</option>
                                        <option value="CERAI MATI">CERAI MATI</option>
                                    </select>
                                </div>
                                <div>
                                    <input type="number" id="form-jumlah-anak" class="w-full p-1.5 bg-white border border-gray-300 rounded text-xs" placeholder="Jml Anak" min="0">
                                </div>
                                <div class="col-span-3">
                                    <input type="text" id="form-nama-pasangan" class="w-full p-1.5 bg-white border border-gray-300 rounded text-xs" placeholder="Nama Suami / Istri">
                                </div>
                            </div>

                            <div class="space-y-2">
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5"><i class="fa-solid fa-credit-card text-emerald-600 mr-1"></i>No. BPJS Kesehatan</label>
                                    <input type="text" id="form-no-bpjsn" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono" placeholder="00012345678">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5"><i class="fa-solid fa-shield-halved text-purple-600 mr-1"></i>No. BPJS Ketenagakerjaan / TASPEN</label>
                                    <input type="text" id="form-no-bpjsket-taspen" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono" placeholder="Nomor Kepesertaan">
                                </div>
                                <div>
                                    <label class="block text-[10px] font-bold text-gray-500 uppercase mb-0.5"><i class="fa-solid fa-percent text-red-500 mr-1"></i>Nomor NPWP</label>
                                    <input type="text" id="form-npwp" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono" placeholder="Tarif Pajak NPWP">
                                </div>
                            </div>

                        </div>
                    </div>

                    <!-- Tombol Form Submit -->
                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
                        <button type="button" onclick="tutupModalPegawai()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-xs cursor-pointer transition-all">Batal</button>
                        <button type="submit" id="btn-simpan-pegawai" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-all shadow-md">Simpan Seluruh Data Kepegawaian</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// =======================================================
// OTOMATISASI DAN FORMULASI LOGIKA JAVASCRIPT
// =======================================================

function autoHitungTmtCpns() {
    const nip = document.getElementById('form-nip').value.trim();
    const tmtCpnsInput = document.getElementById('form-tmt-cpns');
    
    if (nip.length >= 14) {
        const thn = nip.substring(8, 12);
        const bln = nip.substring(12, 14);
        const tgl = "01";

        if (!isNaN(thn) && !isNaN(bln)) {
            tmtCpnsInput.value = `${thn}-${bln}-${tgl}`;
            return;
        }
    }
    tmtCpnsInput.value = "";
}

function autoKalkulasiMasaKerja() {
    const tanggalMasukStr = document.getElementById('form-masuk-rs').value;
    const infoMasaKerja = document.getElementById('form-masa-kerja-rs');
    
    if (!tanggalMasukStr) {
        infoMasaKerja.value = "";
        return;
    }

    const masuk = new Date(tanggalMasukStr);
    const sekarang = new Date();

    if (masuk > sekarang) {
        infoMasaKerja.value = "Tanggal masuk melampaui hari ini";
        return;
    }

    let tahunDiff = sekarang.getFullYear() - masuk.getFullYear();
    let bulanDiff = Bird = sekarang.getMonth() - masuk.getMonth();
    let hariDiff = sekarang.getDate() - masuk.getDate();

    if (hariDiff < 0) {
        bulanDiff--;
        const bulanLalu = new Date(sekarang.getFullYear(), Bird, 0).getDate();
        hariDiff += bulanLalu;
    }

    if (bulanDiff < 0) {
        tahunDiff--;
        bulanDiff += 12;
    }

    infoMasaKerja.value = `${tahunDiff} TAHUN ${bulanDiff} BULAN ${hariDiff} HARI`;
}
function autoHitungTmtPensiun() {
    const tanggalLahirStr = document.getElementById('form-tanggal-lahir').value;
    const bupInput = document.getElementById('form-rentang-bup').value;
    const tmtPensiunInput = document.getElementById('form-tmt-pensiun');

    // Jika tanggal lahir atau rentang BUP belum diisi, kosongkan TMT Pensiun
    if (!tanggalLahirStr || !bupInput) {
        tmtPensiunInput.value = "";
        return;
    }

    const bupTahun = parseInt(bupInput);
    if (isNaN(bupTahun) || bupTahun <= 0) {
        tmtPensiunInput.value = "";
        return;
    }

    const lahir = new Date(tanggalLahirStr);
    
    // 1. Hitung tahun saat menyentuh usia pensiun
    let tahunPensiun = lahir.getFullYear() + bupTahun;
    let bulanPensiun = lahir.getMonth(); // 0 = Januari, 1 = Februari, dst.

    // 2. Rumus Administrasi: TMT Pensiun adalah tanggal 1 di bulan BERIKUTNYA
    // Kita naikkan bulannya sebesar +1
    bulanPensiun = bulanPensiun + 1;

    // Jika bulan menjadi 12 (artinya lahir di bulan Desember), maka maju ke Januari tahun depan
    if (bulanPensiun > 11) {
        bulanPensiun = 0;
        tahunPensiun = tahunPensiun + 1;
    }

    // Format ke string YYYY-MM-DD dengan tanggal selalu "01"
    const mm = String(bulanPensiun + 1).padStart(2, '0');
    const yyyy = tahunPensiun;
    
    tmtPensiunInput.value = `${yyyy}-${mm}-01`;
}

// Tarik data dari tabel: daftar_pegawai
async function querySemuaPegawai() {
    const tbody = document.getElementById('tabel-body-pegawai');
    if (!tbody) return;

    if (!window.supabase || typeof window.supabase.from !== 'function') {
        tbody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-amber-600 font-semibold"><i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>Sinkronisasi Supabase SDK...</td></tr>`;
        setTimeout(querySemuaPegawai, 1000);
        return;
    }

    const kataKunci = document.getElementById('cari-pegawai') ? document.getElementById('cari-pegawai').value.trim() : '';
    
    try {
        // Tembak tabel 'daftar_pegawai'
        let query = supabase.from('daftar_pegawai').select('*').order('created_at', { ascending: false });
        
        if (kataKunci !== '') {
            query = query.or(`nama.ilike.%${kataKunci}%,nip.ilike.%${kataKunci}%,nik.ilike.%${kataKunci}%,jabatan.ilike.%${kataKunci}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-gray-400 font-medium"><i class="fa-solid fa-folder-open text-xl block mb-2 opacity-60"></i>Database kosong. Silakan entri data baru.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map((item, index) => {
            let statusStyle = 'bg-gray-100 text-gray-700 border-gray-300';
            if (item.status === 'AKTIF') statusStyle = 'bg-emerald-50 text-emerald-600 border-emerald-200';
            else if (item.status === 'MUTASI') statusStyle = 'bg-blue-50 text-blue-600 border-blue-200';
            else if (item.status?.startsWith('PENSIUN')) statusStyle = 'bg-amber-50 text-amber-600 border-amber-200';
            else if (item.status === 'MENGUNDURKAN DIRI') statusStyle = 'bg-rose-50 text-rose-600 border-rose-200';

            return `
                <tr class="hover:bg-slate-50/80 transition-all border-b border-gray-100 text-[11px]">
                    <td class="py-3 px-4 text-center font-mono text-gray-400 font-bold">${index + 1}</td>
                    <td class="py-3 px-4">
                        <p class="font-black text-gray-900 text-xs">${item.nama}</p>
                        <p class="text-[10px] font-mono text-gray-500 mt-0.5">NIP: ${item.nip || '-'}</p>
                        <p class="text-[9px] font-mono text-gray-400">NIK: ${item.nik || '-'}</p>
                    </td>
                    <td class="py-3 px-4">
                        <p class="font-bold text-gray-800">${item.jabatan || '-'}</p>
                        <p class="text-[10px] text-indigo-600 font-medium"><i class="fa-solid fa-door-open mr-1"></i>${item.ruangan || 'Belum Ditentukan'}</p>
                        <p class="text-[9px] text-gray-400 font-semibold uppercase">${item.kelompok_jabatan || '-'}</p>
                    </td>
                    <td class="py-3 px-4">
                        <p class="font-bold text-gray-700">${item.gol || '-'}</p>
                        <span class="inline-block px-1.5 py-0.2 bg-purple-50 text-purple-600 border border-purple-200 rounded text-[9px] font-bold mt-1">${item.kelompok || 'BLUD'}</span>
                    </td>
                    <td class="py-3 px-4 font-mono text-gray-600">
                        <p class="font-bold text-slate-800">${item.masa_kerja_rs || '-'}</p>
                        <p class="text-[9px] text-gray-400">Masuk: ${item.masuk_rs || '-'}</p>
                    </td>
                    <td class="py-3 px-4 font-mono text-[10px] space-y-0.5">
                        <p><span class="text-gray-400 font-bold">BPJS KES :</span> ${item.no_bpjsn || '-'}</p>
                        <p><span class="text-gray-400 font-bold">BPJS KET :</span> ${item.no_bpjsket_taspen || '-'}</p>
                        <p><span class="text-gray-400 font-bold">NPWP     :</span> ${item.npwp || '-'}</p>
                    </td>
                    <td class="py-3 px-4 text-center">
                        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusStyle}">${item.status || 'AKTIF'}</span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center justify-center gap-1">
                            <button onclick="ambilPegawaiSatuData('${item.id_pegawai || item.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md transition-all cursor-pointer" title="Edit Seluruh Data">
                                <i class="fa-solid fa-pen-to-square text-sm"></i>
                            </button>
                            <button onclick="hapusPegawai('${item.id_pegawai || item.id}', '${item.nama}')" class="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-all cursor-pointer" title="Hapus Permanen">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="8" class="py-6 text-center text-rose-600 font-semibold"><i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>Gagal menarik data: ${err.message}</td></tr>`;
    }
}

function bukaModalPegawai() {
    pegawaiTerpilihId = null; 
    document.getElementById('modal-judul').innerText = "Tambah Pegawai Baru (Data Lengkap)";
    document.getElementById('modal-icon-container').className = "p-2 bg-blue-50 text-blue-600 rounded-lg text-sm";
    document.getElementById('modal-icon-container').innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
    
    const fields = [
        'form-nip', 'form-nik', 'form-nama', 'form-tempat-lahir', 'form-tanggal-lahir',
        'form-no-telp', 'form-email', 'form-alamat', 'form-jabatan', 'form-ruangan',
        'form-tmt-pangkat', 'form-tmt-berikutnya', 'form-rentang-bup', 'form-tmt-pensiun',
        'form-tmt-cpns', 'form-masuk-rs', 'form-masa-kerja-rs', 'form-jenjang', 'form-fakultas',
        'form-jurusan', 'form-jumlah-anak', 'form-nama-pasangan', 'form-no-bpjsn',
        'form-no-bpjsket-taspen', 'form-npwp'
    ];
    fields.forEach(f => { if(document.getElementById(f)) document.getElementById(f).value = ""; });
    
    document.getElementById('form-jenis-kelamin').value = "LAKI-LAKI";
    document.getElementById('form-agama').value = "ISLAM";
    document.getElementById('form-status').value = "AKTIF";
    document.getElementById('form-kelompok').value = "ASN";
    document.getElementById('form-kelompok-jabatan').value = "TENAGA KESEHATAN";
    document.getElementById('form-gol').value = "Penata Muda / III/a";
    document.getElementById('form-status-keluarga').value = "BELUM KAWIN";

    document.getElementById('modal-pegawai').classList.remove('hidden');
}

async function ambilPegawaiSatuData(id) {
    try {
        // Mengambil rincian dari tabel 'daftar_pegawai'
        let response = await supabase.from('daftar_pegawai').select('*').eq('id_pegawai', id);
        if(response.error || response.data.length === 0) {
            response = await supabase.from('daftar_pegawai').select('*').eq('id', id);
        }
        
        if (response.error || response.data.length === 0) throw new Error("Data pegawai tidak ditemukan.");
        const data = response.data[0];

        pegawaiTerpilihId = id;

        document.getElementById('modal-judul').innerText = "Edit Seluruh Data Pegawai";
        document.getElementById('modal-icon-container').className = "p-2 bg-amber-50 text-amber-600 rounded-lg text-sm";
        document.getElementById('modal-icon-container').innerHTML = `<i class="fa-solid fa-user-pen"></i>`;

        document.getElementById('form-nip').value = data.nip || "";
        document.getElementById('form-nik').value = data.nik || "";
        document.getElementById('form-nama').value = data.nama || "";
        document.getElementById('form-jenis-kelamin').value = data.jenis_kelamin || "LAKI-LAKI";
        document.getElementById('form-agama').value = data.agama || "ISLAM";
        document.getElementById('form-tempat-lahir').value = data.tempat_lahir || "";
        document.getElementById('form-tanggal-lahir').value = data.tanggal_lahir || "";
        document.getElementById('form-no-telp').value = data.no_telp || "";
        document.getElementById('form-email').value = data.email || "";
        document.getElementById('form-alamat').value = data.alamat || "";
        document.getElementById('form-status').value = data.status || "AKTIF";
        document.getElementById('form-kelompok').value = data.kelompok || "ASN";
        document.getElementById('form-kelompok-jabatan').value = data.kelompok_jabatan || "TENAGA KESEHATAN";
        document.getElementById('form-gol').value = data.gol || "Penata Muda / III/a";
        document.getElementById('form-jabatan').value = data.jabatan || "";
        document.getElementById('form-ruangan').value = data.ruangan || "";
        document.getElementById('form-tmt-pangkat').value = data.tmt_pangkat || "";
        document.getElementById('form-tmt-berikutnya').value = data.tmt_berikutnya || "";
        document.getElementById('form-rentang-bup').value = data.rentang_bup || "";
        document.getElementById('form-tmt-pensiun').value = data.tmt_pensiun || "";
        document.getElementById('form-tmt-cpns').value = data.tmt_cpns || "";
        document.getElementById('form-masuk-rs').value = data.masuk_rs || "";
        document.getElementById('form-masa-kerja-rs').value = data.masa_kerja_rs || "";
        document.getElementById('form-jenjang').value = data.jenjang || "";
        document.getElementById('form-fakultas').value = data.fakultas || "";
        document.getElementById('form-jurusan').value = data.jurusan || "";
        document.getElementById('form-status-keluarga').value = data.status_keluarga || "BELUM KAWIN";
        document.getElementById('form-jumlah-anak').value = data.jumlah_anak || 0;
        document.getElementById('form-nama-pasangan').value = data.nama_pasangan || "";
        document.getElementById('form-no-bpjsn').value = data.no_bpjsn || "";
        document.getElementById('form-no-bpjsket-taspen').value = data.no_bpjsket_taspen || "";
        document.getElementById('form-npwp').value = data.npwp || "";

        document.getElementById('modal-pegawai').classList.remove('hidden');
    } catch (err) {
        alert("Gagal memuat rincian pegawai:\n" + err.message);
    }
}

function tutupModalPegawai() {
    document.getElementById('modal-pegawai').classList.add('hidden');
}

async function handleSimpanPegawai(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-simpan-pegawai');
    
    autoHitungTmtCpns();
    autoKalkulasiMasaKerja();

    const payload = {
        nip: document.getElementById('form-nip').value.trim(),
        nik: document.getElementById('form-nik').value.trim(),
        nama: document.getElementById('form-nama').value.trim(),
        jenis_kelamin: document.getElementById('form-jenis-kelamin').value,
        agama: document.getElementById('form-agama').value,
        tempat_lahir: document.getElementById('form-tempat-lahir').value.trim(),
        tanggal_lahir: document.getElementById('form-tanggal-lahir').value || null,
        no_telp: document.getElementById('form-no-telp').value.trim(),
        email: document.getElementById('form-email').value.trim(),
        alamat: document.getElementById('form-alamat').value.trim(),
        status: document.getElementById('form-status').value,
        kelompok: document.getElementById('form-kelompok').value,
        kelompok_jabatan: document.getElementById('form-kelompok-jabatan').value,
        gol: document.getElementById('form-gol').value,
        jabatan: document.getElementById('form-jabatan').value.trim(),
        ruangan: document.getElementById('form-ruangan').value.trim(),
        tmt_pangkat: document.getElementById('form-tmt-pangkat').value || null,
        tmt_berikutnya: document.getElementById('form-tmt-berikutnya').value || null,
        rentang_bup: document.getElementById('form-rentang-bup').value ? parseInt(document.getElementById('form-rentang-bup').value) : null,
        tmt_pensiun: document.getElementById('form-tmt-pensiun').value || null,
        tmt_cpns: document.getElementById('form-tmt-cpns').value || null,
        masuk_rs: document.getElementById('form-masuk-rs').value || null,
        masa_kerja_rs: document.getElementById('form-masa-kerja-rs').value,
        jenjang: document.getElementById('form-jenjang').value.trim(),
        fakultas: document.getElementById('form-fakultas').value.trim(),
        jurusan: document.getElementById('form-jurusan').value.trim(),
        status_keluarga: document.getElementById('form-status-keluarga').value,
        jumlah_anak: document.getElementById('form-jumlah-anak').value ? parseInt(document.getElementById('form-jumlah-anak').value) : 0,
        nama_pasangan: document.getElementById('form-nama-pasangan').value.trim(),
        no_bpjsn: document.getElementById('form-no-bpjsn').value.trim(),
        no_bpjsket_taspen: document.getElementById('form-no-bpjsket-taspen').value.trim(),
        npwp: document.getElementById('form-npwp').value.trim()
    };

    btn.disabled = true;
    btn.innerText = "Mengarsipkan Data Ke Database...";

    try {
        if (pegawaiTerpilihId === null) {
            // Insert ke tabel 'daftar_pegawai'
            const { error } = await supabase.from('daftar_pegawai').insert([payload]);
            if (error) throw error;
        } else {
            // Update ke tabel 'daftar_pegawai'
            let res = await supabase.from('daftar_pegawai').update(payload).eq('id_pegawai', pegawaiTerpilihId);
            if(res.error) {
                res = await supabase.from('daftar_pegawai').update(payload).eq('id', pegawaiTerpilihId);
            }
            if (res.error) throw res.error;
        }

        tutupModalPegawai();
        querySemuaPegawai();
    } catch (err) {
        alert("Gagal melakukan aksi simpan:\n" + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Simpan Seluruh Data Kepegawaian";
    }
}

async function hapusPegawai(id, nama) {
    const konfirmasi = confirm(`Hapus permanen berkas data milik "${nama}"?\nTindakan ini langsung menghapus data dari Supabase.`);
    if (!konfirmasi) return;

    try {
        // Delete dari tabel 'daftar_pegawai'
        let res = await supabase.from('daftar_pegawai').delete().eq('id_pegawai', id);
        if(res.error) {
            res = await supabase.from('daftar_pegawai').delete().eq('id', id);
        }
        if (res.error) throw res.error;
        querySemuaPegawai();
    } catch (err) {
        alert("Gagal menghapus entri:\n" + err.message);
    }
}
