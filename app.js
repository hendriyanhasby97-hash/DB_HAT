// Array Key Field sesuai request user
const fields = [
    'id_pegawai', 'nik', 'nama', 'nip', 'status', 'gol', 'tmt_pangkat', 'tmt_berikutnya',
    'jabatan', 'jenis_kelamin', 'agama', 'rentang_bup', 'tmt_pensiun', 'tmt_cpns',
    'masuk_rs', 'masa_kerja_rs', 'tempat_lahir', 'tanggal_lahir', 'status_keluarga',
    'alamat', 'jenjang', 'fakultas', 'jurusan', 'ruangan', 'no_bpjsn',
    'no_bpjsket_taspen', 'npwp', 'email', 'no_telp'
];

let daftarPegawai = JSON.parse(localStorage.getItem('daftarPegawai')) || [];
let isEditMode = false;

// DOM Elements
const form = document.getElementById('pegawai-form');
const tbody = document.getElementById('tabel-pegawai-body');
const formTitle = document.getElementById('form-title');
const btnBatal = document.getElementById('btn-batal');
const inputCari = document.getElementById('cari-pegawai');

// Inisialisasi Aplikasi
document.addEventListener('DOMContentLoaded', () => {
    tampilkanData(daftarPegawai);
    
    // Otomatisasi hitung masa kerja saat tanggal masuk RS diubah
    document.getElementById('masuk_rs').addEventListener('change', hitungMasaKerja);
});

// Fungsi simpan atau update data
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dataPegawai = {};
    fields.forEach(field => {
        dataPegawai[field] = document.getElementById(field).value;
    });

    if (isEditMode) {
        // Mode Update
        const idx = daftarPegawai.findIndex(p => p.id_pegawai === dataPegawai.id_pegawai);
        if (idx !== -1) {
            daftarPegawai[idx] = dataPegawai;
            alert('Data pegawai berhasil diperbarui!');
        }
    } else {
        // Mode Create (Tambah Baru)
        dataPegawai.id_pegawai = 'PEG-' + Date.now(); // Generate ID Unik otomatis
        daftarPegawai.push(dataPegawai);
        alert('Data pegawai berhasil ditambahkan!');
    }

    simpanKeLocalStorage();
    resetForm();
    tampilkanData(daftarPegawai);
});

// Fungsi menampilkan data ke tabel
function tampilkanData(data) {
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${fields.length + 1}" class="text-center p-4 text-gray-500">Tidak ada data pegawai.</td></tr>`;
        return;
    }

    data.forEach(pegawai => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 border-b";

        // Kolom Aksi (Edit & Hapus)
        let aksiTd = `
            <td class="p-2 border text-center whitespace-nowrap">
                <button onclick="editPegawai('${pegawai.id_pegawai}')" class="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-[10px] mr-1 cursor-pointer">Edit</button>
                <button onclick="hapusPegawai('${pegawai.id_pegawai}')" class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] cursor-pointer">Hapus</button>
            </td>
        `;
        tr.innerHTML = aksiTd;

        // Kolom Data Dinamis sesuai urutan fields
        fields.forEach(field => {
            const td = document.createElement('td');
            td.className = "p-2 border truncate max-w-xs";
            td.textContent = pegawai[field] || '-';
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// Fungsi Edit Pegawai
function editPegawai(id) {
    const pegawai = daftarPegawai.find(p => p.id_pegawai === id);
    if (!pegawai) return;

    fields.forEach(field => {
        document.getElementById(field).value = pegawai[field] || '';
    });

    isEditMode = true;
    formTitle.textContent = "Edit Data Pegawai: " + pegawai.nama;
    btnBatal.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fungsi Hapus Pegawai
function hapusPegawai(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data pegawai ini?')) {
        daftarPegawai = daftarPegawai.filter(p => p.id_pegawai !== id);
        simpanKeLocalStorage();
        tampilkanData(daftarPegawai);
        if (isEditMode) resetForm();
    }
}

// Fungsi Pencarian Data
inputCari.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const hasilFilter = daftarPegawai.filter(p => 
        p.nama.toLowerCase().includes(keyword) || 
        p.nik.includes(keyword) || 
        (p.nip && p.nip.includes(keyword)) ||
        p.jabatan.toLowerCase().includes(keyword)
    );
    tampilkanData(hasilFilter);
});

// Fungsi Reset Form & Kembali ke Mode Tambah
btnBatal.addEventListener('click', resetForm);

function resetForm() {
    form.reset();
    document.getElementById('id_pegawai').value = '';
    isEditMode = false;
    formTitle.textContent = "Tambah Pegawai Baru";
    btnBatal.classList.add('hidden');
}

// Fungsi Utility: Menyimpan ke LocalStorage
function simpanKeLocalStorage() {
    localStorage.setItem('daftarPegawai', JSON.stringify(daftarPegawai));
}

// Fungsi Otomatisasi menghitung Masa Kerja RS secara sederhana (Tahun & Bulan)
function hitungMasaKerja() {
    const tglMasukStr = document.getElementById('masuk_rs').value;
    if (!tglMasukStr) return;

    const tglMasuk = new Date(tglMasukStr);
    const sekarang = new Date();

    let tahun = sekarang.getFullYear() - tglMasuk.getFullYear();
    let bulan = sekarang.getMonth() - tglMasuk.getMonth();

    if (bulan < 0) {
        tahun--;
        bulan += 12;
    }

    document.getElementById('masa_kerja_rs').value = `${tahun} Tahun ${bulan} Bulan`;
}