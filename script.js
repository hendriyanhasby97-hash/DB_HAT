/**
 * APP INSTAN HRIS - SCRIPT UTAMA
 * Pastikan library Supabase sudah dimuat di index.html
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

// 1. KONFIGURASI SUPABASE (Ganti dengan data dari proyek Supabase Anda)
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    
    // --- SIDEBAR TOGGLE ---
    const toggleBtn = document.getElementById('toggleBtn');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });
    }

    // --- DROPDOWN MENU ---
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    // Fungsi untuk toggle menu (dipanggil via onclick di HTML)
    window.toggleDropdown = function() {
        dropdownMenu.classList.toggle('show');
    };

    // Tutup dropdown saat klik di luar area
    window.addEventListener('click', (event) => {
        if (!event.target.closest('.user-profile')) {
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
            }
        }
    });

    // --- FITUR LOGOUT ---
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                alert("Gagal logout: " + error.message);
            } else {
                // Arahkan kembali ke halaman login atau refresh
                window.location.href = 'login.html'; 
            }
        });
    }

    // --- FITUR GANTI PASSWORD (Placeholder) ---
    // Anda bisa memanggil fungsi ini saat tombol Ganti Password diklik
    window.handleChangePassword = async function(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Password berhasil diperbarui!");
        }
    };
});
