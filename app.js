/**
 * APP.JS - Controller Utama & Gerbang Otentikasi Aplikasi
 */

function router() {
    // 1. Jalankan pengecekan otentikasi dari login.js
    if (typeof cekOtentikasi === 'function') {
        const isUserLoggedIn = cekOtentikasi();
        
        // Jika belum login, baris eksekusi berhenti di sini (Form Login akan dirender oleh login.js)
        if (!isUserLoggedIn) return; 
    }

    // 2. Jika lolos otentikasi, tampilkan layout dashboard utama
    const mainLayout = document.getElementById('main-layout');
    if (mainLayout) {
        mainLayout.classList.remove('hidden');
        // Reset class background body dari setelan halaman login
        document.body.className = "bg-slate-100 font-sans text-slate-800 antialiased";
    }

    // 3. Pasang info profil pengguna terdaftar di bagian footer sidebar
    const user = dapatkanSesiUser();
    if (user) {
        if(document.getElementById('user-display-name')) document.getElementById('user-display-name').innerText = user.nama || "User SIMPEG";
        if(document.getElementById('user-display-role')) document.getElementById('user-display-role').innerText = user.jabatan || "Karyawan";
        if(document.getElementById('user-avatar-initial')) document.getElementById('user-avatar-initial').innerText = (user.nama || "A").charAt(0).toUpperCase();
    }

    // 4. Masukkan Komponen Tabel CRUD Pegawai ke area tengah
    const rootElement = document.getElementById('app-root');
    if (rootElement) {
        if (typeof renderDaftarPegawaiComponent === 'function') {
            rootElement.innerHTML = renderDaftarPegawaiComponent();
        } else {
            rootElement.innerHTML = `
                <div class="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
                    <b>Error:</b> Fungsi <code>renderDaftarPegawaiComponent()</code> di file daftar-pegawai.js belum termuat.
                </div>
            `;
        }
    }
}

// Jalankan inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', () => {
    router();
});
