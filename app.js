// Global State Pengelolaan Data & Paginasi
let currentData = [];
let currentPage = 1;
const rowsPerPage = 15;

// 1. Fungsi Utama Ambil Data (Universal)
async function fetchData(tableName, renderCallback) {
    // Menggunakan instance 'supabase' yang sudah dideklarasikan di auth.js
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
        console.error("Gagal ambil data:", error);
        alert("Gagal koneksi ke Cloud. Cek Policy RLS di Supabase!");
        return [];
    }
    
    currentData = data || [];
    
    // Jika menyertakan callback render fungsi saat memanggil data
    if (typeof renderCallback === 'function') {
        renderCallback(currentData);
    }
    return currentData;
}

// 2. Menampilkan Data ke Tabel HTML + Paginasi
function renderTable(data, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginated = data.slice(start, end);
    
    tbody.innerHTML = paginated.map(p => `
        <tr>
            <td>${p.nik || '-'}</td>
            <td>${p.nama || '-'}</td>
            <td>${p.status || '-'}</td>
            <td>
                <button onclick="viewDRH('${p.id_pegawai}')">View DRH</button>
            </td>
        </tr>
    `).join('');

    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.innerText = `Halaman ${currentPage} dari ${Math.ceil(data.length / rowsPerPage) || 1}`;
    }
}

// 3. Menampilkan Daftar Riwayat Hidup (DRH) di dalam Modal Element
async function viewDRH(id) {
    const modal = document.getElementById('modal-drh');
    if (modal) modal.style.display = 'block';
    
    try {
        // Ambil data riwayat secara paralel menggunakan client global
        const [p, edu, jab, pkt] = await Promise.all([
            supabase.from('pegawai').select('*').eq('id_pegawai', id).single(),
            supabase.from('riwayat_pendidikan').select('*').eq('id_pegawai', id),
            supabase.from('riwayat_jabatan').select('*').eq('id_pegawai', id),
            supabase.from('riwayat_pangkat').select('*').eq('id_pegawai', id)
        ]);
        
        if (p.error) throw p.error;
        
        // Pengisian Data ke Komponen Modal DOM (Aman dari property undefined)
        const elementNama = document.getElementById('drh-nama');
        if (elementNama) elementNama.innerText = p.data ? p.data.nama : '-';
        
        const elementEdu = document.getElementById('drh-pendidikan');
        if (elementEdu && edu.data) {
            elementEdu.innerHTML = edu.data.length > 0 
                ? edu.data.map(e => `<li>${e.jenjang_pendidikan || '-'} - ${e.nama_institusi || '-'}</li>`).join('')
                : '<li>Tidak ada data riwayat pendidikan.</li>';
        }
        
        const elementJab = document.getElementById('drh-jabatan');
        if (elementJab && jab.data) {
            elementJab.innerHTML = jab.data.length > 0
                ? jab.data.map(j => `<li>${j.nama_jabatan || '-'}</li>`).join('')
                : '<li>Tidak ada data riwayat jabatan.</li>';
        }
        
    } catch (err) {
        console.error("Gagal mendapatkan rekaman DRH:", err);
        alert("Terjadi kegagalan saat mengunduh berkas data riwayat.");
    }
}
