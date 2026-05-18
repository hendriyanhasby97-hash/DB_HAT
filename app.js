// Master Array Field Komplit (29 Parameter)
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
const formContainer = document.getElementById('form-container');
const btnToggleForm = document.getElementById('btn-toggle-form');
const btnBatal = document.getElementById('btn-batal');
const txtMode = document.getElementById('txt-mode');
const inputCari = document.getElementById('cari-pegawai');
const detailModal = document.getElementById('detail-modal');
const detailContent = document.getElementById('detail-modal-content');

document.addEventListener('DOMContentLoaded', () => {
    tampilkanData(daftarPegawai);
    setupTabs();
    document.getElementById('masuk_rs').addEventListener('change', hitungMasaKerja);
});

// Toggle Tampilkan/Sembunyikan Form Utama
btnToggleForm.addEventListener('click', () => {
    resetForm();
    formContainer.classList.toggle('hidden');
    if(!formContainer.classList.contains('hidden')) {
        window.scrollTo({ top: formContainer.offsetTop - 20, behavior: 'smooth' });
    }
});

btnBatal.addEventListener('click', () => {
    formContainer.classList.add('hidden');
    resetForm();
});

// Manajemen Tab Sistem
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });
}

function resetTabToFirst() {
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        if(i === 0) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach((content, i) => {
        if(i === 0) content.classList.add('active');
        else content.classList.remove('active');
    });
}

// Proses CRUD: Create & Update
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const dataPegawai = {};
    fields.forEach(field => {
        dataPegawai[field] = document.getElementById(field).value;
    });

    if (isEditMode) {
        const idx = daftarPegawai.findIndex(p => p.id_pegawai === dataPegawai.id_pegawai);
        if (idx !== -1) {
            daftarPegawai[idx] = dataPegawai;
            alert('Data pegawai berhasil diperbarui!');
        }
    } else {
        dataPegawai.id_pegawai = 'PEG-' + Date.now();
        daftarPegawai.push(dataPegawai);
        alert('Data pegawai baru berhasil disimpan!');
    }

    simpanKeLocalStorage();
    formContainer.classList.add('hidden');
    resetForm();
    tampilkanData(daftarPegawai);
});

// Proses CRUD: Read (Menampilkan Tabel Ringkas)
function tampilkanData(data) {
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center p-6 text-gray-400 bg-gray-50">Belum ada rekaman data pegawai.</td></tr>`;
        return;
    }

    data.forEach(pegawai => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-all";

        // Penggabungan Jenjang dan Jurusan Pendidikan
        const gabungPendidikan = `${pegawai.jenjang || ''} - ${pegawai.jurusan || ''}`;

        tr.innerHTML = `
            <td class="p-3 border-b font-medium text-slate-900">${pegawai.nik || '-'}</td>
            <td class="p-3 border-b font-semibold text-blue-900">${pegawai.nama || '-'}</td>
            <td class="p-3 border-b"><span class="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100">${pegawai.status || '-'}</span></td>
            <td class="p-3 border-b">${pegawai.jabatan || '-'}</td>
            <td class="p-3 border-b text-xs">${pegawai.masuk_rs || '-'}</td>
            <td class="p-3 border-b text-xs">${gabungPendidikan === ' - ' ? '-' : gabungPendidikan}</td>
            <td class="p-3 border-b">${pegawai.ruangan || '-'}</td>
            <td class="p-3 border-b text-center whitespace-nowrap">
                <button onclick="bukaDetail('${pegawai.id_pegawai}')" class="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded text-xs font-semibold mr-1 cursor-pointer">👁️ Detail</button>
                <button onclick="editPegawai('${pegawai.id_pegawai}')" class="bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1 rounded text-xs font-semibold mr-1 cursor-pointer">✏️ Edit</button>
                <button onclick="hapusPegawai('${pegawai.id_pegawai}')" class="bg-red-500 hover:bg-red-600 text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer">🗑️ Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Proses CRUD: Detail View Modal
function bukaDetail(id) {
    const p = daftarPegawai.find(peg => peg.id_pegawai === id);
    if (!p) return;

    detailContent.innerHTML = '';
    
    // Looping cetak rapi semua data di modal view
    fields.forEach(field => {
        const labelText = field.replace(/_/g, ' ').toUpperCase();
        const valueText = p[field] || '<span class="text-gray-300">Kosong</span>';
        
        const div = document.createElement('div');
        div.className = "py-2 border-b border-gray-100 grid grid-cols-3";
        div.innerHTML = `
            <span class="font-semibold text-gray-500 text-xs col-span-1">${labelText}</span>
            <span class="text-slate-800 font-medium col-span-2">: ${valueText}</span>
        `;
        detailContent.appendChild(div);
    });

    detailModal.classList.remove('hidden');
}

function tutupModal() {
    detailModal.classList.add('hidden');
}

// Proses CRUD: Ambil Data untuk Diedit
function editPegawai(id) {
    const pegawai = daftarPegawai.find(p => p.id_pegawai === id);
    if (!pegawai) return;

    fields.forEach(field => {
        document.getElementById(field).value = pegawai[field] || '';
    });

    isEditMode = true;
    txtMode.textContent = "Mode: Mengedit Data";
    txtMode.className = "text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-normal";
    
    formContainer.classList.remove('hidden');
    resetTabToFirst();
    window.scrollTo({ top: formContainer.offsetTop - 20, behavior: 'smooth' });
}

// Proses CRUD: Delete
function hapusPegawai(id) {
    if (confirm('Apakah Anda yakin mau menghapus permanen data pegawai ini?')) {
        daftarPegawai = daftarPegawai.filter(p => p.id_pegawai !== id);
        simpanKeLocalStorage();
        tampilkanData(daftarPegawai);
    }
}

// Fitur Pencarian Real-Time
inputCari.addEventListener('input', (e) => {
    const kw = e.target.value.toLowerCase();
    const filtered = daftarPegawai.filter(p => 
        p.nama.toLowerCase().includes(kw) || 
        p.nik.includes(kw)
    );
    tampilkanData(filtered);
});

// Otomatis Hitung Masa Kerja
function hitungMasaKerja() {
    const tglStr = document.getElementById('masuk_rs').value;
    if (!tglStr) return;
    const masuk = new Date(tglStr);
    const kini = new Date();
    let thn = kini.getFullYear() - masuk.getFullYear();
    let bln = kini.getMonth() - masuk.getMonth();
    if (bln < 0) { thn--; bln += 12; }
    document.getElementById('masa_kerja_rs').value = `${thn} Tahun ${bln} Bulan`;
}

function resetForm() {
    form.reset();
    document.getElementById('id_pegawai').value = '';
    isEditMode = false;
    txtMode.textContent = "Mode: Tambah Baru";
    txtMode.className = "text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-normal";
    resetTabToFirst();
}

function simpanKeLocalStorage() {
    localStorage.setItem('daftarPegawai', JSON.stringify(daftarPegawai));
}

// ==========================================
// FEATURE: EKSPOR DATA (EXCEL & PDF)
// ==========================================

function eksporExcel() {
    if(daftarPegawai.length === 0) return alert('Tidak ada data yang bisa diekspor');
    
    // Pemetaan data agar format header Excel rapi dan berbahasa Indonesia
    const dataFormatted = daftarPegawai.map((p, index) => ({
        "No": index + 1,
        "ID Pegawai": p.id_pegawai,
        "NIK": p.nik,
        "Nama": p.nama,
        "NIP": p.nip,
        "Status": p.status,
        "Golongan": p.gol,
        "TMT Pangkat": p.tmt_pangkat,
        "TMT Berikutnya": p.tmt_berikutnya,
        "Jabatan": p.jabatan,
        "Jenis Kelamin": p.jenis_kelamin,
        "Agama": p.agama,
        "Rentang BUP": p.rentang_bup,
        "TMT Pensiun": p.tmt_pensiun,
        "TMT CPNS": p.tmt_cpns,
        "Masuk RS": p.masuk_rs,
        "Masa Kerja RS": p.masa_kerja_rs,
        "Tempat Lahir": p.tempat_lahir,
        "Tanggal Lahir": p.tanggal_lahir,
        "Status Keluarga": p.status_keluarga,
        "Alamat": p.alamat,
        "Jenjang": p.jenjang,
        "Fakultas": p.fakultas,
        "Jurusan": p.jurusan,
        "Ruangan": p.ruangan,
        "No BPJS Kes": p.no_bpjsn,
        "No BPJS Ket/Taspen": p.no_bpjsket_taspen,
        "NPWP": p.npwp,
        "Email": p.email,
        "No Telp": p.no_telp
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataFormatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pegawai");
    XLSX.writeFile(workbook, "Laporan_Data_Pegawai_Lengkap.xlsx");
}

function eksporPDF() {
    if(daftarPegawai.length === 0) return alert('Tidak ada data yang bisa diekspor');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'pt', 'a4');
    
    doc.text("LAPORAN DATA PEGAWAI INSTANSI", 40, 40);
    
    // Header Kolom PDF Ringkas
    const headers = [["NIK", "Nama", "Status", "Jabatan", "Masuk RS", "Pendidikan", "Ruangan"]];
    
    const rows = daftarPegawai.map(p => [
        p.nik || '-',
        p.nama || '-',
        p.status || '-',
        p.jabatan || '-',
        p.masuk_rs || '-',
        `${p.jenjang || ''} - ${p.jurusan || ''}`,
        p.ruangan || '-'
    ]);

    doc.autoTable({
        head: headers,
        body: rows,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] }, // Slate-800 warna header
        styles: { fontSize: 9 }
    });

    doc.save("Laporan_Ringkas_Pegawai.pdf");
}
