/**
 * APP.JS - Controller & Router Utama Aplikasi
 * Tugas: Menjembatani komponen halaman agar tampil di index.html
 */

// Fungsi untuk mengatur halaman mana yang ingin ditampilkan
function router() {
    const rootElement = document.getElementById('app-root');
    if (!rootElement) return;

    // Periksa apakah fungsi render dari daftar-pegawai.js sudah siap di memori browser
    if (typeof renderDaftarPegawaiComponent === 'function') {
        
        // 1. Suntikkan HTML template dari daftar-pegawai.js ke dalam index.html
        rootElement.innerHTML = renderDaftarPegawaiComponent();
        
    } else {
        // Antisipasi jika file daftar-pegawai.js gagal dimuat atau urutannya salah
        rootElement.innerHTML = `
            <div class="max-w-xl mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-xl text-red-800 shadow-xs">
                <div class="flex items-start gap-3">
                    <i class="fa-solid fa-triangle-exclamation text-xl mt-0.5"></i>
                    <div>
                        <h3 class="font-bold text-base mb-1">Gagal Memuat Komponen</h3>
                        <p class="text-sm text-red-700">Fungsi <code>renderDaftarPegawaiComponent()</code> tidak ditemukan.</p>
                        <p class="text-xs text-red-500 mt-2">Solusi: Pastikan file <b>daftar-pegawai.js</b> sudah tersimpan di folder yang sama dan dipanggil sebelum file <b>app.js</b> di dalam file index.html.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Jalankan fungsi router secara otomatis begitu browser selesai memuat struktur HTML (DOM)
document.addEventListener('DOMContentLoaded', () => {
    router();
});
