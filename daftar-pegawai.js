/**
 * DAFTAR-PEGAWAI.JS - Manajemen CRUD Pegawai dengan Modal Pop-up
 */

// State Global untuk menyimpan data pegawai yang sedang diedit (null artinya mode Tambah)
let pegawaiTerpilihId = null;

// Fungsi Utama: Mengembalikan template HTML awal tempat tabel dan modal akan bersarang
function renderDaftarPegawaiComponent() {
    // Jalankan penarikan data pertama kali setelah komponen terpasang
    setTimeout(() => querySemuaPegawai(), 100);

    return `
        <!-- Bagian Atas: Tombol Aksi & Cari -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <div class="relative w-full sm:w-72">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" id="cari-pegawai" oninput="querySemuaPegawai()" placeholder="Cari nama atau NIP..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
            </div>
            <button onclick="bukaModalPegawai()" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer">
                <i class="fa-solid fa-user-plus"></i>
                Tambah Pegawai Baru
            </button>
        </div>

        <!-- Wadah untuk Tabel Data -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            <th class="py-3.5 px-4 w-12 text-center">No</th>
                            <th class="py-3.5 px-4">Pegawai</th>
                            <th class="py-3.5 px-4">Kelompok & Status</th>
                            <th class="py-3.5 px-4">Jabatan</th>
                            <th class="py-3.5 px-4 w-28 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabel-body-pegawai" class="divide-y divide-gray-100 text-xs text-gray-700">
                        <tr>
                            <td colspan="5" class="py-8 text-center text-gray-400">
                                <i class="fa-solid fa-circle-notch fa-spin text-lg text-blue-500 mb-2 block"></i>
                                Memuat data dari Supabase...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- MODAL FORM (TAMBAH / EDIT PEGAWAI)          -->
        <!-- ========================================== -->
        <div id="modal-pegawai" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop gelap transparan -->
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onclick="tutupModalPegawai()"></div>
            
            <!-- Konten Box Modal -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col relative z-10 transform scale-95 transition-all duration-200">
                <!-- Header Modal -->
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <div class="flex items-center gap-2.5">
                        <div id="modal-icon-container" class="p-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <div>
                            <h3 id="modal-judul" class="text-sm font-black text-gray-900">Tambah Pegawai Baru</h3>
                            <p class="text-[10px] text-gray-400 font-medium">Isi formulir data di bawah ini secara lengkap</p>
                        </div>
                    </div>
                    <button onclick="tutupModalPegawai()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <i class="fa-solid fa-xmark text-sm"></i>
                    </button>
                </div>

                <!-- Form Inputs -->
                <form onsubmit="handleSimpanPegawai(event)" class="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor Induk / NIP / NIK</label>
                            <input type="text" id="form-nip" required class="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Contoh: 1989011...">
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap & Gelar</label>
                            <input type="text" id="form-nama" required class="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Nama tanpa singkatan">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Kelompok Kepegawaian</label>
                            <select id="form-kelompok" class="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                <option value="ASN">ASN (PNS / PPPK)</option>
                                <option value="BLUD">BLUD Kontrak</option>
                                <option value="APBD">Tenaga APBD / Honorer</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Keaktifan</label>
                            <select id="form-status" class="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                <option value="AKTIF">AKTIF</option>
                                <option value="CUTI">SEDANG CUTI</option>
                                <option value="MUTASI">PROSES MUTASI</option>
                                <option value="NON-AKTIF">NON-AKTIF</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Jabatan / Penugasan</label>
                        <input type="text" id="form-jabatan" required class="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" placeholder="Misal: Perawat Penyelia, Pranata Komputer">
                    </div>

                    <!-- Footer Tombol Aksi di Modal -->
                    <div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 mt-4">
                        <button type="button" onclick="tutupModalPegawai()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold text-xs transition-all cursor-pointer">
                            Batal
                        </button>
                        <button type="submit" id="btn-simpan-pegawai" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer">
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Fungsi Tarik Data dari Supabase
async function querySemuaPegawai() {
    const tbody = document.getElementById('tabel-body-pegawai');
    const kataKunci = document.getElementById('cari-pegawai') ? document.getElementById('cari-pegawai').value.trim() : '';
    
    try {
        let query = supabase.from('pegawai').select('*').order('created_at', { ascending: false });
        
        if (kataKunci !== '') {
            query = query.or(`nama.ilike.%${kataKunci}%,nip.ilike.%${kataKunci}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Panggil update counter widget di index.html jika fungsi tersedia
        if (typeof updateDashboardCounters === 'function') updateDashboardCounters(data);

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="py-8 text-center text-gray-400 font-medium">
                        <i class="fa-solid fa-folder-open text-xl block mb-2 opacity-60"></i>
                        Tidak ada data pegawai ditemukan.
                    </td>
                </tr>
            `;
            return;
        }

        // Susun Baris Tabel
        tbody.innerHTML = data.map((item, index) => {
            const badgeWarna = item.status === 'AKTIF' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200';
            const kelompokWarna = item.kelompok === 'ASN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-100 text-slate-600 border-gray-300';
            
            return `
                <tr class="hover:bg-slate-50/80 transition-all">
                    <td class="py-3 px-4 text-center font-mono text-gray-400 font-bold">${index + 1}</td>
                    <td class="py-3 px-4">
                        <p class="font-bold text-gray-900">${item.nama}</p>
                        <p class="text-[10px] font-mono text-gray-400 mt-0.5">${item.nip || '-'}</p>
                    </td>
                    <td class="py-3 px-4 space-y-1">
                        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${kelompokWarna}">${item.kelompok || 'BLUD'}</span>
                        <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeWarna}">${item.status || 'AKTIF'}</span>
                    </td>
                    <td class="py-3 px-4 font-medium text-gray-600">${item.jabatan || '-'}</td>
                    <td class="py-3 px-4">
                        <div class="flex items-center justify-center gap-1.5">
                            <button onclick="ambilPegawaiSatuData('${item.id}')" class="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-md transition-all cursor-pointer" title="Ubah Data">
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
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-6 text-center text-rose-600 font-semibold">
                    <i class="fa-solid fa-triangle-exclamation text-lg mb-1 block"></i>
                    Gagal mengambil data: ${err.message}
                </td>
            </tr>
        `;
    }
}

// Fungsi Membuka Modal (Mode Tambah Karyawan Baru)
function bukaModalPegawai() {
    pegawaiTerpilihId = null; // Reset ID (menandakan ini data baru)
    
    // Reset teks form ke mode tambah
    document.getElementById('modal-judul').innerText = "Tambah Pegawai Baru";
    document.getElementById('modal-icon-container').className = "p-2 bg-blue-50 text-blue-600 rounded-lg text-sm";
    document.getElementById('modal-icon-container').innerHTML = `<i class="fa-solid fa-user-plus"></i>`;
    
    // Bersihkan semua kotak input
    document.getElementById('form-nip').value = "";
    document.getElementById('form-nama').value = "";
    document.getElementById('form-jabatan').value = "";
    document.getElementById('form-kelompok').value = "ASN";
    document.getElementById('form-status').value = "AKTIF";

    // Tampilkan modal secara visual
    const modal = document.getElementById('modal-pegawai');
    modal.classList.remove('hidden');
}

// Fungsi Membuka Modal & Mengisi Data Otomatis (Mode Edit)
async function ambilPegawaiSatuData(id) {
    try {
        const { data, error } = await supabase.from('pegawai').select('*').eq('id', id).single();
        if (error) throw error;

        // Set ID global untuk penanda operasi update
        pegawaiTerpilihId = data.id;

        // Sesuaikan elemen judul modal ke mode edit
        document.getElementById('modal-judul').innerText = "Ubah Data Pegawai";
        document.getElementById('modal-icon-container').className = "p-2 bg-amber-50 text-amber-600 rounded-lg text-sm";
        document.getElementById('modal-icon-container').innerHTML = `<i class="fa-solid fa-user-pen"></i>`;

        // Masukkan data dari tabel ke formulir input modal
        document.getElementById('form-nip').value = data.nip || "";
        document.getElementById('form-nama').value = data.nama || "";
        document.getElementById('form-jabatan').value = data.jabatan || "";
        document.getElementById('form-kelompok').value = data.kelompok || "ASN";
        document.getElementById('form-status').value = data.status || "AKTIF";

        // Tampilkan modal
        document.getElementById('modal-pegawai').classList.remove('hidden');
    } catch (err) {
        alert("Gagal memuat detail data pegawai:\n" + err.message);
    }
}

// Menutup Box Jendela Modal
function tutupModalPegawai() {
    document.getElementById('modal-pegawai').classList.add('hidden');
}

// Proses Eksekusi Simpan (Gabungan Insert / Update)
async function handleSimpanPegawai(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-simpan-pegawai');
    
    // Kumpulkan payload data dari form input
    const payload = {
        nip: document.getElementById('form-nip').value.trim(),
        nama: document.getElementById('form-nama').value.trim(),
        jabatan: document.getElementById('form-jabatan').value.trim(),
        kelompok: document.getElementById('form-kelompok').value,
        status: document.getElementById('form-status').value
    };

    // Ubah status tombol menjadi loading
    btn.disabled = true;
    btn.innerText = "Menyimpan...";

    try {
        if (pegawaiTerpilihId === null) {
            // JALANAN LOGIKA: DATA BARU (INSERT)
            const { error } = await supabase.from('pegawai').insert([payload]);
            if (error) throw error;
        } else {
            // JALANAN LOGIKA: UBAH DATA (UPDATE)
            const { error } = await supabase.from('pegawai').update(payload).eq('id', pegawaiTerpilihId);
            if (error) throw error;
        }

        // Jika sukses, tutup jendela dialog, lalu segarkan isi tabel data
        tutupModalPegawai();
        querySemuaPegawai();
    } catch (err) {
        alert("Gagal memproses pengarsipan data:\n" + err.message);
    } finally {
        // Kembalikan ke keadaan tombol semula
        btn.disabled = false;
        btn.innerText = "Simpan Data";
    }
}

// Fungsi Hapus Permanen Pegawai
async function hapusPegawai(id, nama) {
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus data pegawai "${nama}" secara permanen?\nTindakan ini tidak bisa dibatalkan.`);
    if (!konfirmasi) return;

    try {
        const { error } = await supabase.from('pegawai').delete().eq('id', id);
        if (error) throw error;
        
        // Segarkan ulang data tabel sesudah data terhapus
        querySemuaPegawai();
    } catch (err) {
        alert("Gagal menghapus entri:\n" + err.message);
    }
}
