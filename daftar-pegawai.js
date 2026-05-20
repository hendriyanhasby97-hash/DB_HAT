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
                <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <select class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-600 focus:outline-none">
                        <option value="">Semua Status</option>
                        <option value="PNS">PNS</option>
                        <option value="PPPK">PPPK</option>
                        <option value="Honorer">Honorer</option>
                    </select>
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
                        <!-- Data Dummy Tampilan -->
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
                                <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">PNS Aktif</span>
                            </td>
                            <td class="p-4 text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer" title="Detail / Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL JUMBO FORM INPUT PEGAWAI (33 KOLOM DATA SUPABASE) -->
        <div id="modal-pegawai" class="hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh]">
                <!-- Header Modal -->
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2"><i class="fa-solid fa-id-card-clip text-blue-600"></i> Formulir Biodata Pegawai</h3>
                        <p class="text-xs text-gray-500 mt-0.5">Input lengkap sesuai kolom skema database Supabase</p>
                    </div>
                    <button onclick="closeTambahPegawaiModal()" class="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <!-- Form Body (Scrollable grid) -->
                <form id="form-pegawai-supabase" class="flex-1 p-6 overflow-y-auto space-y-8 text-sm">
                    
                    <!-- KELOMPOK 1: IDENTITAS & KEPEGAWAIAN UTAMA -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-user-tie mr-1"></i> Identitas & Status Utama</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                                <input type="text" id="p_nama" required class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">NIK (KTP) *</label>
                                <input type="text" id="p_nik" maxlength="16" required class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">NIP (Tanpa Spasi)</label>
                                <input type="text" id="p_nip" maxlength="18" class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Status Kepegawaian</label>
                                <select id="p_status" class="w-full rounded-lg border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="PNS">PNS</option>
                                    <option value="CPNS">CPNS</option>
                                    <option value="PPPK">PPPK</option>
                                    <option value="Honorer">Honorer</option>
                                    <option value="Kontrak">Kontrak</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Golongan / Ruang</label>
                                <input type="text" id="p_gol" placeholder="e.g. III/a, IV/b" class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jabatan Saat Ini</label>
                                <input type="text" id="p_jabatan" class="w-full rounded-lg border border-gray-300 p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                                <select id="p_jenis_kelamin" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Agama</label>
                                <input type="text" id="p_agama" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Ruangan / Unit Kerja</label>
                                <input type="text" id="p_ruangan" placeholder="e.g. Ruang ICU, Keuangan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
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
                                <label class="block text-xs font-semibold text-gray-700 mb-1">TMT CPNS</label>
                                <input type="date" id="p_tmt_cpns" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Tanggal Masuk RS</label>
                                <input type="date" id="p_masuk_rs" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Masa Kerja RS (Teks)</label>
                                <input type="text" id="p_masa_kerja_rs" placeholder="e.g. 4 Tahun 2 Bulan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
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
                                <select id="p_status_keluarga" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                                    <option value="Belum Kawin">Belum Kawin</option>
                                    <option value="Kawin">Kawin</option>
                                    <option value="Cerai Hidup">Cerai Hidup</option>
                                    <option value="Cerai Mati">Cerai Mati</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Pasangan (Suami/Istri)</label>
                                <input type="text" id="p_nama_pasangan" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jumlah Anak</label>
                                <input type="number" id="p_jumlah_anak" value="0" min="0" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div class="md:col-span-3">
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Alamat Rumah Lengkap</label>
                                <input type="text" id="p_alamat" placeholder="Nama Jalan, RT/RW, Kecamatan, Kota" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 4: RUMPUN PENDIDIKAN -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-graduation-cap mr-1"></i> Pendidikan Terakhir</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jenjang Pendidikan</label>
                                <input type="text" id="p_jenjang" placeholder="e.g. D3, S1, S2, Profesi" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Fakultas</label>
                                <input type="text" id="p_fakultas" placeholder="e.g. Fakultas Kedokteran" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Jurusan / Prodi</label>
                                <input type="text" id="p_jurusan" placeholder="e.g. Keperawatan, Akuntansi" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 5: REGISTRASI, JAMINAN, PAJAK & KELOMPOK JABATAN -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-file-invoice-dollar mr-1"></i> Jaminan, Pajak & Klasifikasi</h4>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Kelompok Pegawai</label>
                                <input type="text" id="p_kelompok" placeholder="e.g. Medis, Keperawatan, Non-Medis" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Kelompok Jabatan</label>
                                <input type="text" id="p_kelompok_jabatan" placeholder="e.g. Fungsional, Struktural" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- KELOMPOK 6: KONTAK INTEGRASI -->
                    <div>
                        <h4 class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4 border-b border-blue-100 pb-1"><i class="fa-solid fa-address-book mr-1"></i> Kontak Penghubung</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">Email Aktif (Gunakan untuk Login jika perlu) *</label>
                                <input type="email" id="p_email" required placeholder="name@example.com" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-gray-700 mb-1">No. Telp / WhatsApp *</label>
                                <input type="text" id="p_no_telp" required placeholder="08XXXXXXXXXX" class="w-full rounded-lg border border-gray-300 p-2 outline-none">
                            </div>
                        </div>
                    </div>

                    <!-- Area Tombol Aksi Form -->
                    <div class="border-t border-gray-200 pt-4 flex justify-end gap-3 bg-white sticky bottom-0 left-0 right-0">
                        <button type="button" onclick="closeTambahPegawaiModal()" class="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer">Batal</button>
                        <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-md transition cursor-pointer">Simpan ke Supabase</button>
                    </div>
                </form>
            </div>
        </div>
    `;
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
