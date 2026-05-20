// --- STATE MANAGEMENT (MOCK DATA) ---
const state = {
    user: null,
    currentMenu: 'dashboard'
};

// --- DOM ELEMENTS ---
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const contentArea = document.getElementById('content-area');
const currentMenuTitle = document.getElementById('current-menu-title');
const userDisplay = document.getElementById('user-display');
const dateNow = document.getElementById('date-now');

// Menampilkan tanggal hari ini di topbar
if(dateNow) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateNow.innerText = new Date().toLocaleDateString('id-ID', options);
}

// --- CORE FUNCTIONS (LOGIN & LOGOUT) ---
function checkAuth() {
    if (state.user) {
        loginScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        userDisplay.innerText = state.user.email;
        renderContent();
    } else {
        loginScreen.classList.remove('hidden');
        mainScreen.classList.add('hidden');
    }
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    state.user = { email: email };
    checkAuth();
});

logoutBtn.addEventListener('click', () => {
    state.user = null;
    checkAuth();
});

// --- SIDEBAR DROPDOWN FUNCTION ---
function toggleDropdown(id, buttonEl) {
    const container = document.getElementById(id);
    const chevron = buttonEl.querySelector('.chevron-icon');
    
    // Deteksi status buka saat ini
    const isOpen = container.classList.contains('open');
    
    // TUTUP SEMUA DROPDOWN LAIN (Efek Accordion)
    document.querySelectorAll('.dropdown-container').forEach(el => {
        el.classList.remove('open');
    });
    document.querySelectorAll('.chevron-icon').forEach(el => {
        el.classList.remove('rotate-chevron');
    });

    // Jika dropdown yang diklik sebelumnya tidak terbuka, maka sekarang buka
    if (!isOpen) {
        container.classList.add('open');
        chevron.classList.add('rotate-chevron');
    }
}

// --- ROUTING / SWITCH MENU ---
function switchMenu(menuKey, element) {
    state.currentMenu = menuKey;
    
    // Update judul di header topbar
    const formattedTitle = menuKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    currentMenuTitle.innerText = formattedTitle === 'Str' ? 'STR (Surat Tanda Registrasi)' : formattedTitle === 'Sik' ? 'SIK (Surat Izin Kerja)' : formattedTitle;

    // Bersihkan status aktif dari semua tombol menu reguler dan sub-menu
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('bg-slate-800', 'text-white', 'font-semibold', 'text-blue-400');
        btn.classList.add('text-slate-400');
    });
    
    // Tambahkan style aktif pada elemen menu yang sedang dipilih
    if (element) {
        element.classList.remove('text-slate-400');
        element.classList.add('bg-slate-800', 'text-white', 'font-semibold');
        
        // Beri warna biru penanda khusus jika itu adalah tombol utama Dashboard
        if(menuKey === 'dashboard') {
            element.querySelector('i').classList.add('text-blue-400');
        }
    }

    renderContent();
}

// --- RENDERING VIEWS BASED ON MENU ---
function renderContent() {
    let html = '';

    switch (state.currentMenu) {
        case 'dashboard':
            html = `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div><p class="text-sm font-medium text-gray-500">Total Pegawai</p><h3 class="text-3xl font-bold mt-1 text-slate-900">142</h3></div>
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-lg"><i class="fa-solid fa-users text-2xl"></i></div>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div><p class="text-sm font-medium text-gray-500">Hadir Hari Ini</p><h3 class="text-3xl font-bold mt-1 text-emerald-600">135</h3></div>
                        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><i class="fa-solid fa-user-check text-2xl"></i></div>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div><p class="text-sm font-medium text-gray-500">Izin / Cuti</p><h3 class="text-3xl font-bold mt-1 text-amber-600">7</h3></div>
                        <div class="p-3 bg-amber-50 text-amber-600 rounded-lg"><i class="fa-solid fa-calendar-day text-2xl"></i></div>
                    </div>
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div><p class="text-sm font-medium text-gray-500">Pending Berkas</p><h3 class="text-3xl font-bold mt-1 text-rose-600">12</h3></div>
                        <div class="p-3 bg-rose-50 text-rose-600 rounded-lg"><i class="fa-solid fa-file-circle-exclamation text-2xl"></i></div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-900 mb-4">Aktivitas Kepegawaian Terbaru</h3>
                    <p class="text-sm text-gray-500">Silakan klik menu sebelah kiri untuk melihat fungsionalitas dropdown yang sudah aktif.</p>
                </div>
            `;
            break;

        case 'daftar-pegawai':
            // Memanggil fungsi dari file daftar-pegawai.js secara dinamis
            html = renderDaftarPegawaiComponent();
            break;

        default:
            // Template default untuk semua halaman riwayat, izin, dan administrasi
            html = `
                <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center py-20">
                    <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fa-solid fa-folder-open text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900">Modul / Menu Aktif</h3>
                    <p class="text-gray-500 text-sm mt-1 max-w-md mx-auto">Komponen UI sidebar dropdown sukses mendeteksi perpindahan ke halaman ini.</p>
                </div>
            `;
            break;
    }

    contentArea.innerHTML = html;
}

// Inisialisasi awal aplikasi
checkAuth();
