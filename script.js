// 1. Inisialisasi Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// 2. Fungsi Log Out
async function logOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert("Error saat logout: " + error.message);
    } else {
        window.location.href = 'login.html'; // Arahkan ke halaman login
    }
}
async function changePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        alert("Gagal ganti password: " + error.message);
    } else {
        alert("Password berhasil diubah!");
    }
}
// 3. Contoh Mengambil Data Pegawai (Read)
async function fetchPegawai() {
    const { data, error } = await supabase
        .from('pegawai') // Pastikan nama tabel di Supabase adalah 'pegawai'
        .select('*');

    if (error) {
        console.error("Gagal mengambil data:", error);
    } else {
        console.log("Data Pegawai:", data);
        // Di sini kamu bisa manipulasi DOM untuk menampilkan data ke tabel HTML
    }
}

// Sidebar Toggle (Tetap seperti sebelumnya)
document.getElementById('toggleBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Dropdown Toggle (Tetap seperti sebelumnya)
function toggleDropdown() {
    document.getElementById("dropdownMenu").classList.toggle("show");
}

// Pasang event listener ke tombol logout di HTML (pastikan ID-nya sama)
document.querySelector('.logout-btn').addEventListener('click', logOut);
