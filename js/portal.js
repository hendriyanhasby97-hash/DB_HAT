import { supabase } from './koneksi.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. CEK AUTENTIKASI
    const userRole = sessionStorage.getItem('hris_role');
    const userNik = sessionStorage.getItem('nik_user');

    if (userRole !== 'user' || !userNik) {
        window.location.href = 'index.html';
        return;
    }

    // 2. AMBIL DATA PEGAWAI
    const { data: pegawai, error } = await supabase.from('pegawai').select('*').eq('nik', userNik).single();
    if (error) return;

    document.getElementById('badge-nama').innerHTML = `<i class="fas fa-user-check"></i> ${pegawai.nama}`;

    // 3. ROUTING DINAMIS
    window.loadPage = async (page, element = null) => {
        const container = document.getElementById('app-content');
        const pageTitle = document.getElementById('page-title');
        
        if (element) {
            document.querySelectorAll('.nav-item, .submenu-item').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        }

        container.innerHTML = `<div style="text-align:center; padding:50px;">Memuat modul...</div>`;

        try {
            switch (page) {
                case 'profil':
                    pageTitle.innerText = "PROFIL SAYA";
                    const { renderProfil } = await import('./profil.js');
                    renderProfil(container, pegawai);
                    break;
                case 'sik':
                    pageTitle.innerText = "DOKUMEN SIK / SIP";
                    const { renderSIK } = await import('./sik.js');
                    renderSIK(container, pegawai);
                    break;
                case 'str':
                    pageTitle.innerText = "DOKUMEN STR";
                    const { renderSTR } = await import('./str.js');
                    renderSTR(container, pegawai);
                    break;
                case 'sertifikat':
                    pageTitle.innerText = "SERTIFIKAT";
                    const { renderSertifikat } = await import('./sertifikat.js');
                    renderSertifikat(container, pegawai);
                    break;
            }
        } catch (err) {
            console.error("Error loading module:", err);
            container.innerHTML = `<p style="color:red;">Gagal memuat modul. Pastikan file ${page}.js tersedia.</p>`;
        }
    };

    window.loadPage('profil');
});
