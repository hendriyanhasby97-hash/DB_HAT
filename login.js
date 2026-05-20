/**
 * LOGIN.JS - Sistem Otentikasi Karyawan & Super Admin
 */

// Cek status login saat file pertama kali dimuat
function dapatkanSesiUser() {
    const sesi = localStorage.getItem('simpeg_session');
    return sesi ? JSON.parse(sesi) : null;
}

// Fungsi untuk memeriksa status login sebelum merender halaman utama
function cekOtentikasi() {
    const user = dapatkanSesiUser();
    if (!user) {
        renderHalamanLogin();
        return false;
    }
    return true;
}

// Menampilkan Form Login jika user belum terautentikasi
function renderHalamanLogin() {
    document.body.className = "bg-slate-900 flex items-center justify-center min-h-screen p-4 font-sans antialiased text-slate-800";
    document.body.innerHTML = `
        <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 flex flex-col gap-6">
            <!-- Header Logo -->
            <div class="flex flex-col items-center text-center gap-2">
                <div class="bg-blue-600 p-3 rounded-xl text-white shadow-md shadow-blue-500/20">
                    <i class="fa-solid fa-users-gear text-2xl"></i>
                </div>
                <h2 class="text-xl font-black text-gray-900 tracking-tight mt-2">SIMPEG DASHBOARD</h2>
                <p class="text-xs text-gray-400 font-medium">Masuk menggunakan Nomor Induk Karyawan / NIK</p>
            </div>

            <!-- Pesan Error -->
            <div id="login-error-msg" class="hidden p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                <i class="fa-solid fa-triangle-exclamation text-sm"></i>
                <span id="error-text">NIK atau Password salah.</span>
            </div>

            <!-- Form -->
            <form onsubmit="handleProsesLogin(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nomor Induk Karyawan (NIK)</label>
                    <div class="relative">
                        <i class="fa-solid fa-id-card absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input type="text" id="login-nik" required placeholder="Masukkan NIK atau admin" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-all">
                    </div>
                </div>

                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Kata Sandi</label>
                    <div class="relative">
                        <i class="fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input type="password" id="login-password" required placeholder="••••••••" class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1.5 font-medium">*Password default: <span class="font-mono bg-slate-100 px-1 py-0.5 rounded text-gray-600">Masuk123</span></p>
                </div>

                <button type="submit" id="btn-login" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all cursor-pointer active:scale-98">
                    Masuk Ke Sistem
                    <i class="fa-solid fa-arrow-right text-xs"></i>
                </button>
            </form>
        </div>
    `;
}

// Logika Validasi Login ke Supabase + Cek Akun Super Admin Bawaan
async function handleProsesLogin(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-login');
    const errorBox = document.getElementById('login-error-msg');
    
    const inputNik = document.getElementById('login-nik').value.trim();
    const inputPassword = document.getElementById('login-password').value;

    // Loading State
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin text-sm"></i> Memverifikasi...`;
    errorBox.classList.add('hidden');

    // 1. Cek kecocokan password default terlebih dahulu
    if (inputPassword !== "Masuk123") {
        tampilkanLoginError("Password salah. Gunakan password default 'Masuk123'.");
        kembalikanTombolLogin();
        return;
    }

    // ========================================================
    // LOGIKA SUPER ADMIN BYPASS (SAAT DATABASES MASIH KOSONG)
    // ========================================================
    if (inputNik.toLowerCase() === "admin" || inputNik === "12345") {
        localStorage.setItem('simpeg_session', JSON.stringify({
            id: "0000-SUPER-ADMIN",
            nama: "Super Admin SIMPEG",
            nip: "ADMINISTRATOR",
            jabatan: "Sistem Eksekutif"
        }));
        
        window.location.reload();
        return; // Hentikan eksekusi pencarian ke database
    }

    // 2. Jika bukan admin, cari data NIK/NIP asli di tabel 'pegawai' Supabase Anda
    try {
        const { data, error } = await supabase
            .from('pegawai')
            .select('*')
            .eq('nip', inputNik) 
            .maybeSingle();

        if (error) throw error;

        if (data) {
            localStorage.setItem('simpeg_session', JSON.stringify({
                id: data.id,
                nama: data.nama,
                nip: data.nip,
                jabatan: data.jabatan
            }));
            
            window.location.reload();
        } else {
            tampilkanLoginError("Akses ditolak. NIK tidak ditemukan & database kosong.");
            kembalikanTombolLogin();
        }
    } catch (err) {
        console.error(err);
        tampilkanLoginError("Masalah Koneksi Supabase: " + err.message);
        kembalikanTombolLogin();
    }
}

function tampilkanLoginError(pesan) {
    const errorBox = document.getElementById('login-error-msg');
    const errorText = document.getElementById('error-text');
    errorText.innerText = pesan;
    errorBox.classList.remove('hidden');
}

function kembalikanTombolLogin() {
    const btn = document.getElementById('btn-login');
    btn.disabled = false;
    btn.innerHTML = `Masuk Ke Sistem <i class="fa-solid fa-arrow-right text-xs"></i>`;
}

// Fungsi Trigger Keluar dari Aplikasi
function handleLogout() {
    const yakin = confirm("Apakah Anda yakin ingin keluar dari sistem SIMPEG?");
    if (yakin) {
        localStorage.removeItem('simpeg_session');
        window.location.reload();
    }
}
