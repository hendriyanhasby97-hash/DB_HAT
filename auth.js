// ============================================================
// 1. KONFIGURASI UTAMA SUPABASE (Single Source of Truth)
// ============================================================
const SUPABASE_URL = "https://trxakqvaxleslwmngsvr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fKDMGUajM2z2CbLVk2DuGg_8mSdHQoC";

// Inisialisasi client global (bisa dipakai oleh login.html dan app.js)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 2. SISTEM OTENTIKASI & MANAJEMEN AKSES (RBAC)
// ============================================================

/**
 * Validasi hak akses user berdasarkan role-nya.
 * @param {Array} allowedRoles - Daftar role yang boleh masuk (Contoh: ['superadmin', 'admin'])
 */
function checkAuth(allowedRoles = []) {
    const role = sessionStorage.getItem('role');
    const userKey = sessionStorage.getItem('user_key');

    // Jika belum melakukan login, tendang balik ke gerbang login
    if (!role || !userKey) {
        window.location.href = 'login.html';
        return;
    }

    // Jika halaman membatasi role tertentu dan role user saat ini tidak terdaftar
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
        alert("⚠️ Anda tidak memiliki otoritas akses untuk halaman ini!");
        
        // Alihkan ke dashboard masing-masing secara otomatis
        if (role === 'pegawai') {
            window.location.href = 'index-pegawai.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}

/**
 * Fungsi keluar dari sistem (Clear Session)
 */
function logoutUser() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}
