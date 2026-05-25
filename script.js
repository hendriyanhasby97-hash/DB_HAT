// 1. INISIALISASI SUPABASE (Gunakan nama variabel yang berbeda)
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Kita gunakan 'supabaseClient' agar tidak konflik dengan library bawaan
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. FUNGSI GLOBAL (Diletakkan di luar agar bisa diakses oleh onclick di HTML)
function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    dropdown.classList.toggle("show");
}

function handleChangePassword() {
    alert("Fitur Ganti Password akan segera hadir!");
    // Logika ganti password nanti di sini
}

// 3. LOGIKA YANG MENUNGGU DOM LOAD (Diletakkan di dalam event listener)
document.addEventListener('DOMContentLoaded', () => {
    
    // Sidebar Toggle
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Tutup dropdown saat klik di luar area
    window.addEventListener('click', (event) => {
        const dropdownMenu = document.getElementById("dropdownMenu");
        if (!event.target.closest('.user-profile')) {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        }
    });

    // Fitur Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabaseClient.auth.signOut();
            
            if (error) {
                alert("Gagal logout: " + error.message);
            } else {
                window.location.href = 'index.html'; 
            }
        });
    }
});
