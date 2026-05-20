/**
 * DAFTAR-PEGAWAI.JS - Manajemen SIMPEG Akurat (Modal Jumbo Grid & Auto-Calculations)
 * Nama Tabel Database Supabase: daftar_pegawai
 */

let pegawaiTerpilihId = null;

// Fungsi untuk melihat detail pegawai
function tampilkanDetailPegawai(pegawai) {
    const modalContent = document.getElementById('modal-detail-content');
    modalContent.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-4 border-b pb-4">
                <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    ${pegawai.nama.charAt(0)}
                </div>
                <div>
                    <h3 class="text-lg font-black text-slate-900">${pegawai.nama}</h3>
                    <p class="text-xs text-blue-600 font-bold">${pegawai.jabatan || 'Belum ada jabatan'}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="p-2 bg-slate-50 rounded border"><p class="text-[9px] text-slate-400 uppercase font-bold">NIP/NIK</p><p class="font-mono font-bold">${pegawai.nip || pegawai.nik || '-'}</p></div>
                <div class="p-2 bg-slate-50 rounded border"><p class="text-[9px] text-slate-400 uppercase font-bold">Status</p><p class="font-bold text-emerald-600">${pegawai.status}</p></div>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p class="text-[10px] text-blue-500 uppercase font-bold mb-1">Data Tambahan</p>
                <p class="text-xs text-slate-700"><b>Ruangan:</b> ${pegawai.ruangan || '-'}</p>
                <p class="text-xs text-slate-700"><b>Pendidikan:</b> ${pegawai.jenjang || '-'} ${pegawai.jurusan || ''}</p>
            </div>
        </div>
    `;
    document.getElementById('modal-detail-pegawai').classList.remove('hidden');
}

function renderDaftarPegawaiComponent() {
    setTimeout(() => querySemuaPegawai(), 100);
    return `
        <div class="bg-white p-4 rounded-xl shadow-sm border mb-4">
            <button onclick="bukaModalPegawai()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700"><i class="fa-solid fa-plus mr-1"></i>Tambah Pegawai</button>
        </div>
        <div class="bg-white p-4 rounded-xl shadow-sm border overflow-x-auto">
            <table class="w-full text-xs">
                <thead><tr class="text-slate-400 uppercase border-b"><th class="py-2 text-left">Nama</th><th class="py-2 text-left">Status</th><th class="py-2">Aksi</th></tr></thead>
                <tbody id="tabel-body-pegawai"></tbody>
            </table>
        </div>

        <div id="modal-detail-pegawai" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div class="bg-white rounded-2xl w-full max-w-sm p-6 relative">
                <button onclick="document.getElementById('modal-detail-pegawai').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400"><i class="fa-solid fa-xmark"></i></button>
                <div id="modal-detail-content"></div>
            </div>
        </div>
    `;
}

async function querySemuaPegawai() {
    const tbody = document.getElementById('tabel-body-pegawai');
    const { data, error } = await window.supabase.from('daftar_pegawai').select('*');
    if (error) return;
    tbody.innerHTML = data.map(item => `
        <tr class="border-b">
            <td class="py-3 font-bold">${item.nama}</td>
            <td class="py-3"><span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px]">${item.status}</span></td>
            <td class="py-3 text-center">
                <button onclick='tampilkanDetailPegawai(${JSON.stringify(item)})' class="text-emerald-600 p-2"><i class="fa-solid fa-eye"></i></button>
                <button onclick="ambilPegawaiSatuData('${item.id_pegawai || item.id}')" class="text-blue-600 p-2"><i class="fa-solid fa-pen-to-square"></i></button>
            </td>
        </tr>
    `).join('');
}

// Pastikan fungsi-fungsi ini di-export ke window agar bisa diakses tombol HTML
window.renderDaftarPegawaiComponent = renderDaftarPegawaiComponent;
window.tampilkanDetailPegawai = tampilkanDetailPegawai;
window.querySemuaPegawai = querySemuaPegawai;
// =======================================================
// AUTOMATION & LOGIC SYSTEM
// =======================================================

// 1. Ekstraksi Otomatis TMT CPNS (NIP Opsional)
function autoHitungTmtCpns() {
    const nipInput = document.getElementById('form-nip');
    const tmtCpnsInput = document.getElementById('form-tmt-cpns');
    
    if (!nipInput || !tmtCpnsInput) return;
    const nip = nipInput.value.trim();
    
    if (!nip || nip.length < 14) {
        tmtCpnsInput.value = "";
        return;
    }
    
    const thn = nip.substring(8, 12);
    const bln = nip.substring(12, 14);
    const tgl = "01"; 

    if (!isNaN(thn) && !isNaN(bln)) {
        tmtCpnsInput.value = `${thn}-${bln}-${tgl}`;
    } else {
        tmtCpnsInput.value = "";
    }
}

// 2. Hitung Otomatis TMT Pensiun (Tgl Lahir + BUP, Jatuh Pada Tgl 1 Bulan Berikutnya)
function autoHitungTmtPensiun() {
    const tanggalLahirStr = document.getElementById('form-tanggal-lahir').value;
    const bupInput = document.getElementById('form-rentang-bup').value;
    const tmtPensiunInput = document.getElementById('form-tmt-pensiun');

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
    let tahunPensiun = lahir.getFullYear() + bupTahun;
    let bulanPensiun = lahir.getMonth() + 1; 

    if (bulanPensiun > 11) {
        bulanPensiun = 0;
        tahunPensiun += 1;
    }

    const mm = String(bulanPensiun + 1).padStart(2, '0');
    tmtPensiunInput.value = `${tahunPensiun}-${mm}-01`;
}

// 3. Hitung Otomatis Masa Kerja Rumah Sakit Realtime
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
        const bulanLalu = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0).getDate();
        hariDiff += bulanLalu;
    }

    if (bulanDiff < 0) {
        tahunDiff--;
        bulanDiff += 12;
    }

    infoMasaKerja.value = `${tahunDiff} TAHUN ${bulanDiff} BULAN ${hariDiff} HARI`;
}

// 4. Ambil Seluruh Data dari Tabel Supabase: daftar_pegawai
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
    document.getElementById('form-kelompok').value = "BLUD";
    document.getElementById('form-kelompok-jabatan').value = "TENAGA KESEHATAN";
    document.getElementById('form-gol').value = "Penata Muda / III/a";
    document.getElementById('form-status-keluarga').value = "BELUM KAWIN";

    document.getElementById('modal-pegawai').classList.remove('hidden');
}

async function ambilPegawaiSatuData(id) {
    try {
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
        document.getElementById('form-kelompok').value = data.kelompok || "BLUD";
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

        autoHitungTmtPensiun();
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
    autoHitungTmtPensiun();
    autoKalkulasiMasaKerja();

    const payload = {
        nip: document.getElementById('form-nip').value.trim() || null,
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
            const { error } = await supabase.from('daftar_pegawai').insert([payload]);
            if (error) throw error;
        } else {
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

// =======================================================
// EXPORT UNTUK WINDOW GLOBAL SCOPE (Mencegah Error Router)
// =======================================================
window.renderDaftarPegawaiComponent = renderDaftarPegawaiComponent;
window.autoHitungTmtCpns = autoHitungTmtCpns;
window.autoHitungTmtPensiun = autoHitungTmtPensiun;
window.autoKalkulasiMasaKerja = autoKalkulasiMasaKerja;
window.bukaModalPegawai = bukaModalPegawai;
window.tutupModalPegawai = tutupModalPegawai;
window.ambilPegawaiSatuData = ambilPegawaiSatuData;
window.handleSimpanPegawai = handleSimpanPegawai;
window.hapusPegawai = hapusPegawai;
window.querySemuaPegawai = querySemuaPegawai;
