/**
 * DAFTAR-PEGAWAI.JS - Manajemen CRUD Pegawai dengan Data Menyeluruh
 */

let pegawaiTerpilihId = null;

// Fungsi Utama: Mengembalikan template HTML awal tempat tabel dan modal bersarang
function renderDaftarPegawaiComponent() {
    // Jalankan penarikan data pertama kali setelah komponen terpasang
    setTimeout(() => querySemuaPegawai(), 100);

    return `
        <!-- Bagian Atas: Tombol Aksi & Cari -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div class="relative w-full sm:w-72">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" id="cari-pegawai" oninput="querySemuaPegawai()" placeholder="Cari nama, NIP, atau Jabatan..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
            </div>
            <button onclick="bukaModalPegawai()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer">
                <i class="fa-solid fa-user-plus"></i>
                Tambah Pegawai Baru
            </button>
        </div>

        <!-- Wadah untuk Tabel Data -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse table-auto">
                    <thead>
                        <tr class="bg-slate-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th class="py-3.5 px-4 w-12 text-center">No</th>
                            <th class="py-3.5 px-4">Identitas Pegawai</th>
                            <th class="py-3.5 px-4">Kontak & Keluarga</th>
                            <th class="py-3.5 px-4">Jabatan & Pangkat</th>
                            <th class="py-3.5 px-4">Izin Kerja (STR/SIK)</th>
                            <th class="py-3.5 px-4">Status</th>
                            <th class="py-3.5 px-4 w-24 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabel-body-pegawai" class="divide-y divide-gray-100 text-xs text-gray-700">
                        <tr>
                            <td colspan="7" class="py-8 text-center text-gray-400">
                                <i class="fa-solid fa-circle-notch fa-spin text-lg text-blue-500 mb-2 block"></i>
                                Memuat seluruh data dari Supabase...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- MODAL FORM DATA SELURUHNYA (LENGKAP)       -->
        <!-- ========================================== -->
        <div id="modal-pegawai" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onclick="tutupModalPegawai()"></div>
            
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-2xl overflow-hidden flex flex-col relative z-10 transform scale-95 transition-all duration-200">
                <!-- Header Modal -->
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <div class="flex items-center gap-2.5">
                        <div id="modal-icon-container" class="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <div>
                            <h3 id="modal-judul" class="text-sm font-black text-gray-900">Tambah Pegawai Baru</h3>
                            <p class="text-[10px] text-gray-400 font-medium">Formulir Isian Berkas Profil Kepegawaian Menyeluruh</p>
                        </div>
                    </div>
                    <button onclick="tutupModalPegawai()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- Form Inputs Lengkap -->
                <form onsubmit="handleSimpanPegawai(event)" class="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                    
                    <!-- KELOMPOK 1: DATA PERSONAL -->
                    <div>
                        <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1 mb-3"><i class="fa-solid fa-user text-slate-400 mr-1.5"></i>1. Identitas Pribadi</h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">NIK / NIP / ID Karyawan *</label>
                                <input type="text" id="form-nip" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Masukkan Nomor Induk">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Lengkap & Gelar *</label>
                                <input type="text" id="form-nama" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Nama Lengkap">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nomor HP / WhatsApp</label>
                                <input type="text" id="form-no-hp" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="08...">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pendidikan Terakhir</label>
                                <input type="text" id="form-riwayat-pendidikan" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Misal: S1 Keperawatan, D3 Kebidanan">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 2: JABATAN & MANAJEMEN -->
                    <div>
                        <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1 mb-3"><i class="fa-solid fa-sitemap text-slate-400 mr-1.5"></i>2. Status Kerja & Jabatan</h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kelompok Kepegawaian</label>
                                <select id="form-kelompok" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                    <option value="ASN">ASN (PNS / PPPK)</option>
                                    <option value="BLUD">BLUD Kontrak</option>
                                    <option value="APBD">Tenaga APBD / Honorer</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Status Keaktifan</label>
                                <select id="form-status" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                                    <option value="AKTIF">AKTIF</option>
                                    <option value="CUTI">SEDANG CUTI</option>
                                    <option value="MUTASI">PROSES MUTASI</option>
                                    <option value="NON-AKTIF">NON-AKTIF</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Jabatan Utama</label>
                                <input type="text" id="form-jabatan" required class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Misal: Perawat Terampil">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pangkat / Golongan Ruang</label>
                                <input type="text" id="form-riwayat-pangkat" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Misal: Penata Muda / III a">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 3: IZIN KERJA & HUBUNGAN -->
                    <div>
                        <h4 class="text-[11px] font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1 mb-3"><i class="fa-solid fa-file-shield text-slate-400 mr-1.5"></i>3. Legalitas & Keluarga</h4>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nomor STR (Surat Tanda Registrasi)</label>
                                <input type="text" id="form-str" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="STR-0000000">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nomor SIK (Surat Izin Kerja)</label>
                                <input type="text" id="form-sik" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="SIK-0000000">
                            </div>
                            <div class="sm:col-span-2">
                                <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">Data Keluarga (Suami/Istri/Anak & Kontak Darurat)</label>
                                <textarea id="form-data-keluarga" rows="2" class="w-full p-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" placeholder="Contoh: Istri: Siti Aminah, Anak: Rian. No Darurat: 08123..."></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Tombol Aksi -->
                    <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-4">
                        <button type="button" onclick="tutupModalPegawai()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold text-xs cursor-pointer transition-all">Batal</button>
                        <button type="submit" id="btn-simpan-pegawai" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-all shadow-sm">Simpan Seluruh Data</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Fungsi Tarik Data Komprehensif dari Supabase
async function querySemuaPegawai() {
    const tbody = document.getElementById('tabel-body-pegawai');
    if (!tbody) return;

    // Proteksi jika Supabase SDK gagal dimuat
    if (!window.supabase || typeof window.supabase.from !== 'function') {
        tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-amber-600 font-semibold"><i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>Menghubungkan ke layanan Supabase...</td></tr>`;
        setTimeout(querySemuaPegawai, 1000);
        return;
    }

    const kataKunci = document.getElementById('cari-pegawai') ? document.getElementById('cari-pegawai').value.trim() : '';
    
    try {
        let query = supabase.from('pegawai').select('*').order('created_at', { ascending: false });
        
        if (kataKunci !== '') {
            query = query.or(`nama.ilike.%${kataKunci}%,nip.ilike.%${kataKunci}%,jabatan.ilike.%${kataKunci}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (typeof updateDashboardCounters === 'function') updateDashboardCounters(data);

        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-gray-400 font-medium"><i class="fa-solid fa-folder-open text-xl block mb-2 opacity-60"></i>Belum ada data pegawai. Silakan klik "Tambah Pegawai Baru".</td></tr>`;
            return;
        }

        // Tampilkan seluruh data kolom di baris tabel
        tbody.innerHTML = data.map((item, index) => {
            const badgeWarna = item.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200';
            const kelompokWarna = item.kelompok === 'ASN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-100 text-slate-600 border-gray-300';
            
            return `
                <tr class="hover:bg-slate-50/80 transition-all border-b border-gray-100">
                    <td class="py-3 px-4 text-center font-mono text-gray-400 font-bold">${index + 1}</td>
                    <td class="py-3 px-4">
                        <p class="font-bold text-gray-900">${item.nama}</p>
                        <p class="text-[10px] font-mono text-gray-400 mt-0.5"><i class="fa-solid fa-id-card mr-1"></i>${item.nip || '-'}</p>
                    </td>
                    <td class="py-3 px-4 max-w-[180px] truncate">
                        <p class="font-semibold"><i class="fa-solid fa-phone text-[10px] text-gray-400 mr-1"></i>${item.no_hp || '-'}</p>
                        <p class="text-[10px] text-gray-400 truncate mt-0.5" title="${item.data_keluarga || ''}"><i class="fa-solid fa-people-roof text-[10px] mr-1"></i>${item.data_keluarga || 'Belum diisi'}</p>
                    </td>
                    <td class="py-3 px-4">
                        <p class="font-bold text-gray-800">${item.jabatan || '-'}</p>
                        <p class="text-[10px] text-blue-500 mt-0.5"><i class="fa-solid fa-award mr-1"></i>Pangkat: ${item.riwayat_pangkat || '-'}</p>
                        <p class="text-[9px] text-gray-400"><i class="fa-solid fa-graduation-cap mr-1"></i>Edu: ${item.riwayat_pendidikan || '-'}</p>
                    </td>
                    <td class="py-3 px-4 text-[10px] space-y-0.5">
                        <p class="font-mono"><span class="text-gray-400 font-bold">STR:</span> ${item.str || '-'}</p>
                        <p class="font-mono"><span class="text-gray-400 font-bold">SIK:</span> ${item.sik || '-'}</p>
                    </td>
                    <td class="py-3 px-4 space-y-1">
                        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${kelompokWarna}">${item.kelompok || 'BLUD'}</span><br>
                        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeWarna}">${item.status || 'AKTIF'}</span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="ambilPegawaiSatuData('${item.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md transition-all cursor-pointer" title="Ubah Data Menyeluruh">
                                <i class="fa-solid fa-pen-to-square text-sm"></i>
                            </button>
                            <button onclick="hapusPegawai('${item.id}', '${item.nama}')" class="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-md transition-all cursor-pointer" title="Hapus Permanen">
                                <i class="fa-solid fa-trash-can text-sm"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-rose-600 font-semibold"><i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>Gagal memuat: ${err.message}</td></tr>`;
    }
}

// Buka Modal: Bersihkan form untuk entri baru (Insert)
function bukaModalPegawai() {
    pegawaiTerpilihId = null; 
    
    document.getElementById('modal-judul').innerText = "Tambah Pegawai Baru";
    document.getElementById('modal-icon-container').className = "p-2 bg-blue-50 text-blue-600 rounded-lg text-sm";
    document.getElementById('modal-icon-container').innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
    
    // Reset seluruh field input kosong kembali
    document.getElementById('form-nip').value = "";
    document.getElementById('form-nama').value = "";
    document.getElementById('form-jabatan').value = "";
    document.getElementById('form-kelompok').value = "ASN";
    document.getElementById('form-status').value = "AKTIF";
    document.getElementById('form-no-hp').value = "";
    document.getElementById('form-riwayat-pangkat').value = "";
    document.getElementById('form-riwayat-pendidikan').value = "";
    document.getElementById('form-str').value = "";
    document.getElementById('form-sik').value = "";
    document.getElementById('form-data-keluarga').value = "";

    document.getElementById('modal-pegawai').classList.remove('hidden');
}

// Buka Modal & Tarik Seluruh Kolom untuk Diedit (Update)
async function ambilPegawaiSatuData(id) {
    try {
        const { data, error } = await supabase.from('pegawai').select('*').eq('id', id).single();
        if (error) throw error;

        pegawaiTerpilihId = data.id;

        document.getElementById('modal-judul').innerText = "Ubah Data Pegawai Menyeluruh";
        document.getElementById('modal-icon-container').className = "p-2 bg-amber-50 text-amber-600 rounded-lg text-sm";
        document.getElementById('modal-icon-container').innerHTML = `<i class="fa-solid fa-user-pen"></i>`;

        // Inject seluruh nilai kolom database ke field form modal
        document.getElementById('form-nip').value = data.nip || "";
        document.getElementById('form-nama').value = data.nama || "";
        document.getElementById('form-jabatan').value = data.jabatan || "";
        document.getElementById('form-kelompok').value = data.kelompok || "ASN";
        document.getElementById('form-status').value = data.status || "AKTIF";
        document.getElementById('form-no-hp').value = data.no_hp || "";
        document.getElementById('form-riwayat-pangkat').value = data.riwayat_pangkat || "";
        document.getElementById('form-riwayat-pendidikan').value = data.riwayat_pendidikan || "";
        document.getElementById('form-str').value = data.str || "";
        document.getElementById('form-sik').value = data.sik || "";
        document.getElementById('form-data-keluarga').value = data.data_keluarga || "";

        document.getElementById('modal-pegawai').classList.remove('hidden');
    } catch (err) {
        alert("Gagal memuat rincian data pegawai:\n" + err.message);
    }
}

function tutupModalPegawai() {
    document.getElementById('modal-pegawai').classList.add('hidden');
}

// Menyimpan Seluruh Data Masuk (Insert / Update Lengkap)
async function handleSimpanPegawai(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-simpan-pegawai');
    
    // Bangun paket data menyeluruh untuk dipasok ke Supabase
    const payload = {
        nip: document.getElementById('form-nip').value.trim(),
        nama: document.getElementById('form-nama').value.trim(),
        jabatan: document.getElementById('form-jabatan').value.trim(),
        kelompok: document.getElementById('form-kelompok').value,
        status: document.getElementById('form-status').value,
        no_hp: document.getElementById('form-no-hp').value.trim(),
        riwayat_pangkat: document.getElementById('form-riwayat-pangkat').value.trim(),
        riwayat_pendidikan: document.getElementById('form-riwayat-pendidikan').value.trim(),
        str: document.getElementById('form-str').value.trim(),
        sik: document.getElementById('form-sik').value.trim(),
        data_keluarga: document.getElementById('form-data-keluarga').value.trim()
    };

    btn.disabled = true;
    btn.innerText = "Memproses Penyimpanan...";

    try {
        if (pegawaiTerpilihId === null) {
            const { error } = await supabase.from('pegawai').insert([payload]);
            if (error) throw error;
        } else {
            const { error } = await supabase.from('pegawai').update(payload).eq('id', pegawaiTerpilledId || pegawaiTerpilihId);
            if (error) throw error;
        }

        tutupModalPegawai();
        querySemuaPegawai();
    } catch (err) {
        alert("Gagal mengarsipkan data menyeluruh:\n" + err.message);
    } finally {
        btn.disabled = false;
        btn.innerText = "Simpan Seluruh Data";
    }
}

async function hapusPegawai(id, nama) {
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus data pegawai "${nama}" secara permanen?\nTindakan ini tidak bisa dibatalkan.`);
    if (!konfirmasi) return;

    try {
        const { error } = await supabase.from('pegawai').delete().eq('id', id);
        if (error) throw error;
        querySemuaPegawai();
    } catch (err) {
        alert("Gagal menghapus entri:\n" + err.message);
    }
}
