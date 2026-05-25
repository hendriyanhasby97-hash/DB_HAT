// Sidebar Toggle
document.getElementById('toggleBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

// Dropdown Toggle
function toggleDropdown() {
    document.getElementById("dropdownMenu").classList.toggle("show");
}

// Tutup Dropdown saat klik di luar
window.onclick = function(event) {
    if (!event.target.closest('.user-profile')) {
        let dropdown = document.getElementById("dropdownMenu");
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
}
