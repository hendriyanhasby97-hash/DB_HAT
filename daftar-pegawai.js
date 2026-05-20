/**
 * DAFTAR-PEGAWAI.JS - Komponen Manajemen Pegawai (Supabase CRUD)
 * Berisi logika render UI, validasi form, dan interaksi database.
 */

// State Aplikasi Lokal
let DATA_PEGAWAI_LOCAL = [];
let MODE_FORM = "TAMBAH"; // Pilihan: "TAMBAH", "EDIT", "DETAIL"
let ID_PEGAWAI_TERPILIH = null;

/**
 * 1. FUNGSI UTAMA: Dipanggil oleh app.js untuk merender kerangka halaman
 */
function renderDaftarPegawaiComponent() {
    // Jalankan penarikan data dari Supabase secara asinkron setelah kerangka terpasang
    setTimeout(() => {
        fetchPegawaiDariSupabase();
    }, 50);

    return `
        <!-- Bagian Atas: Tombol Aksi & Pencarian -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
            <div class="relative flex-1 max-w-md">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input type="text" id="input-cari-pegawai" oninput="handleCariPegawai(this.value)" placeholder="Cari nama atau NIP pegawai..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
            </div>
            <button onclick="bukaModalForm('TAMBAH')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer">
                <i class="fa-solid fa-plus text-xs"></i>
                Tambah Pegawai Baru
            </button>
        </div>

        <!-- Bagian Tengah: Tabel Data -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th class="py-3 px-4">Pegawai</th>
                            <th class="py-3 px-4">NIP</th>
                            <th class="py-3 px-4">Kelompok</th>
                            <th class="py-3 px-4">Jabatan / Unit</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabel-body-pegawai" class="divide-y divide-gray-100 text-sm text-gray-700">
                        <!-- Data diisi otomatis oleh fungsi renderTabelPegawai -->
                    </tbody>
                </table>
            </div>
            <div id="tabel-empty-state" class="hidden flex-col items-center justify-center py-16 text-gray-400">
                <i class="fa-solid fa-folder-open text-4xl mb-3 text-slate-300"></i>
                <p class="text-sm font-medium">Belum ada data pegawai.</p>
            </div>
        </div>

        <!-- BAGIAN BAWAH: MODAL FORM (TAMBAH / EDIT / DETAIL) -->
        <div id="modal-form-pegawai" class="hidden fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 transform transition-all scale-100">
                <!-- Header Modal -->
                <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
                    <h3 id="modal-title" class="font-bold text-gray-900 text-base">Form Pegawai</h3>
                    <button onclick="tutupModalForm()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                        <i class="fa-solid fa-xmark text-lg"></i>
                    </button>
                </div>
                <!-- Isi Form -->
                <form id="form-pegawai" onsubmit="handleSimpanPegawai(event)" class="p-6 space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nama Lengkap</label>
                            <input type="text" id="form-nama" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">NIP / Nomor Identitas</label>
                            <input type="text" id="form-nip" required class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Kelompok</label>
                                <select id="form-kelompok" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                    <option value="ASN">ASN</option>
                                    <option value="BLUD">BLUD</option>
                                    <option value="APBD">APBD</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Status Keaktifan</label>
                                <select id="form-status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                    <option value="AKTIF">AKTIF</option>
                                    <option value="CUTI">CUTI</option>
                                    <option value="NON-AKTIF">NON-AKTIF</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Jabatan</label>
                            <input type="text" id="form-jabatan" required placeholder="Contoh: Perawat Ahli Pertama" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Unit Kerja</label>
                            <input type="text" id="form-unit" required placeholder="Contoh: Ruang Rawat Inap A" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                        </div>
                    </div>
                    <!-- Footer Tombol -->
                    <div class="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                        <button type="button" onclick="tutupModalForm()" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-slate-50 transition-all cursor-pointer">Batal</button>
                        <button type="submit" id="btn-submit-form" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-xs transition-all cursor-pointer">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

/**
 * 2. DATABASE OPERATIONS: Tarik data dari table 'pegawai' di Supabase
 */
async function fetchPegawaiDariSupabase() {
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        DATA_PEGAWAI_LOCAL = data || [];
        renderTabelPegawai(DATA_PEGAWAI_LOCAL);

        // Update indikator counter widget yang ada di index.html secara otomatis
        if (typeof updateDashboardCounters === 'function') {
            updateDashboardCounters(DATA_PEGAWAI_LOCAL);
        }
    } catch (err) {
        console.error("Gagal memuat data Supabase:", err.message);
        alert("Terjadi kesalahan sinkronisasi database: " + err.message);
    }
}

/**
 * 3. RENDER LOGIC: Membangun baris tabel HTML dari array data
 */
function renderTabelPegawai(listPegawai) {
    const tbody = document.getElementById('tabel-body-pegawai');
    const emptyState = document.getElementById('tabel-empty-state');
    
    if (!tbody) return;
    tbody.innerHTML = "";

    if (listPegawai.length === 0) {
        emptyState.classList.remove('hidden');
        emptyState.classList.add('flex');
        return;
    }

    emptyState.classList.remove('flex');
    emptyState.classList.add('hidden');

    listPegawai.forEach(p => {
        // Atur warna badge status
        let statusClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (p.status === "CUTI") statusClass = "bg-amber-50 text-amber-700 border-amber-200";
        if (p.status === "NON-AKTIF") statusClass = "bg-rose-50 text-rose-700 border-rose-200";

        // Atur warna label kelompok
        let badgeKelompok = "bg-purple-100 text-purple-800";
        if (p.kelompok === "BLUD") badgeKelompok = "bg-blue-100 text-blue-800";
        if (p.kelompok === "APBD") badgeKelompok = "bg-amber-100 text-amber-800";

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50/80 transition-colors";
        tr.innerHTML = `
            <td class="py-3.5 px-4 font-semibold text-gray-900">${p.nama || '-'}</td>
            <td class="py-3.5 px-4 text-gray-500 font-mono text-xs">${p.nip || '-'}</td>
            <td class="py-3.5 px-4">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeKelompok}">${p.kelompok || '-'}</span>
            </td>
            <td class="py-3.5 px-4">
                <div class="font-medium text-gray-800">${p.jabatan || '-'}</div>
                <div class="text-xs text-gray-400 mt-0.5">${p.unit || '-'}</div>
            </td>
            <td class="py-3.5 px-4">
                <span class="px-2 py-0.5 rounded-md text-xs font-bold border ${statusClass}">${p.status || 'AKTIF'}</span>
            </td>
            <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-1">
                    <button onclick="bukaModalForm('DETAIL', '${p.id}')" class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer" title="Detail"><i class="fa-solid fa-eye"></i></button>
                    <button onclick="bukaModalForm('EDIT', '${p.id}')" class="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-all cursor-pointer" title="Ubah"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button onclick="handleHapusPegawai('${p.id}', '${p.nama}')" class="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * 4. SEARCH ACTION: Memfilter tabel secara lokal
 */
function handleCariPegawai(keyword) {
    const kw = keyword.toLowerCase().trim();
    if (kw === "") {
        renderTabelPegawai(DATA_PEGAWAI_LOCAL);
    } else {
        const filtered = DATA_PEGAWAI_LOCAL.filter(p => 
            (p.nama && p.nama.toLowerCase().includes(kw)) || 
            (p.nip && p.nip.toLowerCase().includes(kw)) ||
            (p.jabatan && p.jabatan.toLowerCase().includes(kw))
        );
        renderTabelPegawai(filtered);
    }
}

/**
 * 5. MODAL INTERACTION: Mengatur buka/tutup jendela form
 */
function bukaModalForm(mode, id = null) {
    MODE_FORM = mode;
    ID_PEGAWAI_TERPILIH = id;
    
    const modal = document.getElementById('modal-form-pegawai');
    const title = document.getElementById('modal-title');
    const btnSubmit = document.getElementById('btn-submit-form');
    const form = document.getElementById('form-pegawai');
    
    form.reset();
    btnSubmit.classList.remove('hidden');
    
    // Aktifkan kembali semua elemen input (setelah kemungkinan dinonaktifkan di mode DETAIL)
    Array.from(form.elements).forEach(el => el.disabled = false);

    if (mode === 'TAMBAH') {
        title.innerText = "Tambah Pegawai Baru";
        btnSubmit.innerText = "Simpan Baru";
    } else {
        // Cari objek data pegawai yang sesuai di lokal array
        const p = DATA_PEGAWAI_LOCAL.find(item => item.id == id);
        if (!p) return;

        // Isikan data ke dalam input form
        document.getElementById('form-nama').value = p.nama || "";
        document.getElementById('form-nip').value = p.nip || "";
        document.getElementById('form-kelompok').value = p.kelompok || "ASN";
        document.getElementById('form-status').value = p.status || "AKTIF";
        document.getElementById('form-jabatan').value = p.jabatan || "";
        document.getElementById('form-unit').value = p.unit || "";

        if (mode === 'EDIT') {
            title.innerText = `Ubah Data: ${p.nama}`;
            btnSubmit.innerText = "Simpan Perubahan";
        } else if (mode === 'DETAIL') {
            title.innerText = `Detail Data: ${p.nama}`;
            btnSubmit.classList.add('hidden'); // Sembunyikan tombol simpan
            // Kunci semua input agar bertindak sebagai read-only tampilan berkas
            Array.from(form.elements).forEach(el => el.disabled = true);
        }
    }
    
    modal.classList.remove('hidden');
}

function tutupModalForm() {
    document.getElementById('modal-form-pegawai').classList.add('hidden');
}

/**
 * 6. CRUD CREATE & UPDATE ACTIONS: Mengirim data ke Supabase
 */
async function handleSimpanPegawai(event) {
    event.preventDefault();
    
    const payload = {
        nama: document.getElementById('form-nama').value.trim(),
        nip: document.getElementById('form-nip').value.trim(),
        kelompok: document.getElementById('form-kelompok').value,
        status: document.getElementById('form-status').value,
        jabatan: document.getElementById('form-jabatan').value.trim(),
        unit: document.getElementById('form-unit').value.trim()
    };

    try {
        if (MODE_FORM === 'TAMBAH') {
            // Jalankan Perintah INSERT
            const { error } = await supabase
                .from('pegawai')
                .insert([payload]);
                
            if (error) throw error;
        } else if (MODE_FORM === 'EDIT') {
            // Jalankan Perintah UPDATE
            const { error } = await supabase
                .from('pegawai')
                .update(payload)
                .eq('id', ID_PEGAWAI_TERPILIH);
                
            if (error) throw error;
        }

        tutupModalForm();
        // Segarkan data tabel secara asinkron dari server database
        fetchPegawaiDariSupabase();
        
    } catch (err) {
        console.error("Gagal menyimpan data:", err.message);
        alert("Gagal memproses data ke database: " + err.message);
    }
}

/**
 * 7. CRUD DELETE ACTION: Menghapus baris pegawai dari Supabase
 */
async function handleHapusPegawai(id, nama) {
    const konfirmasi = confirm(`Apakah Anda yakin ingin menghapus data pegawai "${nama}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!konfirmasi) return;

    try {
        const { error } = await supabase
            .from('pegawai')
            .delete()
            .eq('id', id);

        if (error) throw error;
        
        // Segarkan data setelah berhasil dihapus
        fetchPegawaiDariSupabase();
    } catch (err) {
        console.error("Gagal menghapus data:", err.message);
        alert("Gagal menghapus data dari database: " + err.message);
    }
}
