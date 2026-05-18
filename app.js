```javascript
const fields = [
    'id_pegawai', 'nik', 'nama', 'nip', 'status', 'gol', 'tmt_pangkat', 'tmt_berikutnya',
    'jabatan', 'jenis_kelamin', 'agama', 'rentang_bup', 'tmt_pensiun', 'tmt_cpns',
    'masuk_rs', 'masa_kerja_rs', 'tempat_lahir', 'tanggal_lahir', 'status_keluarga',
    'alamat', 'jenjang', 'fakultas', 'jurusan', 'ruangan', 'no_bpjsn',
    'no_bpjsket_taspen', 'npwp', 'email', 'no_telp'
];

let daftarPegawai = JSON.parse(localStorage.getItem('daftarPegawai')) || [];
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    tampilkanData(daftarPegawai);
    setupTabs();
    document.getElementById('masuk_rs').addEventListener('change', hitungMasaKerja);
});

// Setup Sistem Tab
function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset buttons
            buttons.forEach(b => b.classList.remove('active'));
            // Reset contents
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

// Toggle Form
const formContainer = document.getElementById('form-container');
document.getElementById('btn-toggle-form').addEventListener('click', () => {
    resetForm();
    formContainer.classList.toggle('hidden');
});

document.getElementById('btn-batal').addEventListener('click', () => {
    formContainer.classList.add('hidden');
});

// CRUD Logic
document.getElementById('pegawai-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    fields.forEach(f => data[f] = document.getElementById(f).value);

    if (isEditMode) {
        const idx = daftarPegawai.findIndex(p => p.id_pegawai === data.id_pegawai);
        daftarPegawai[idx] = data;
        alert('Data diperbarui!');
    } else {
        data.id_pegawai = 'PEG-' + Date.now();
        daftarPegawai.push(data);
        alert('Data disimpan!');
    }

    localStorage.setItem('daftarPegawai', JSON.stringify(daftarPegawai));
    tampilkanData(daftarPegawai);
    formContainer.classList.add('hidden');
});

function tampilkanData(data) {
    const tbody = document.getElementById('tabel-pegawai-body');
    tbody.innerHTML = '';
    
    data.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-all";
        tr.innerHTML = `
            <td class="p-4 border-b">${p.nik}</td>
            <td class="p-4 border-b font-semibold">${p.nama}</td>
            <td class="p-4 border-b">${p.jabatan}</td>
            <td class="p-4 border-b">${p.masuk_rs}</td>
            <td class="p-4 border-b">${p.ruangan}</td>
            <td class="p-4 border-b text-center whitespace-nowrap">
                <button onclick="bukaDetail('${p.id_pegawai}')" class="bg-blue-500 text-white px-3 py-1 rounded-md mr-1 text-xs">Lihat</button>
                <button onclick="editPegawai('${p.id_pegawai}')" class="bg-amber-500 text-white px-3 py-1 rounded-md mr-1 text-xs">Edit</button>
                <button onclick="hapusPegawai('${p.id_pegawai}')" class="bg-red-500 text-white px-3 py-1 rounded-md text-xs">Hapus</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function bukaDetail(id) {
    const p = daftarPegawai.find(x => x.id_pegawai === id);
    const content = document.getElementById('detail-content');
    content.innerHTML = '';
    fields.forEach(f => {
        const div = document.createElement('div');
        div.className = "border-b pb-2";
        div.innerHTML = `<span class="text-xs font-bold text-slate-400 uppercase">${f.replace(/_/g,' ')}</span><p class="font-medium">${p[f] || '-'}</p>`;
        content.appendChild(div);
    });
    document.getElementById('detail-modal').classList.remove('hidden');
}

function tutupModal() { document.getElementById('detail-modal').classList.add('hidden'); }

function editPegawai(id) {
    const p = daftarPegawai.find(x => x.id_pegawai === id);
    fields.forEach(f => document.getElementById(f).value = p[f]);
    isEditMode = true;
    formContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hapusPegawai(id) {
    if(confirm('Hapus data?')) {
        daftarPegawai = daftarPegawai.filter(x => x.id_pegawai !== id);
        localStorage.setItem('daftarPegawai', JSON.stringify(daftarPegawai));
        tampilkanData(daftarPegawai);
    }
}

function hitungMasaKerja() {
    const tgl = new Date(this.value);
    const skrg = new Date();
    let thn = skrg.getFullYear() - tgl.getFullYear();
    let bln = skrg.getMonth() - tgl.getMonth();
    if(bln < 0) { thn--; bln += 12; }
    document.getElementById('masa_kerja_rs').value = `${thn} Thn ${bln} Bln`;
}

function resetForm() {
    document.getElementById('pegawai-form').reset();
    isEditMode = false;
}

// Ekspor
function eksporExcel() {
    const ws = XLSX.utils.json_to_sheet(daftarPegawai);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pegawai");
    XLSX.writeFile(wb, "DataPegawai.xlsx");
}

function eksporPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l');
    doc.text("Laporan Pegawai", 14, 15);
    const rows = daftarPegawai.map(p => [p.nik, p.nama, p.jabatan, p.masuk_rs, p.ruangan]);
    doc.autoTable({ head: [['NIK','Nama','Jabatan','Masuk','Ruangan']], body: rows, startY: 20 });
    doc.save("DataPegawai.pdf");
}
