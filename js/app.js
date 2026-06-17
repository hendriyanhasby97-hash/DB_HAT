import { supabase } from './koneksi.js';
import { renderDashboard } from './dashboard.js';
import { renderPegawai } from './pegawai.js';
import { renderPegawaiMasuk } from './pegawai-masuk.js';
import { renderPegawaiKeluar } from './pegawai-keluar.js';
import { renderSIK } from './sik.js';
import { renderSTR } from './str.js';
import { renderSertifikat } from './sertifikat.js';
import { renderSKP } from './skp.js';
import { renderPengaturan } from './pengaturan.js';

// === 1. MENAMBAHKAN IMPORT UNTUK MENU BARU ===
import { renderSPKRKK } from './spkrkk.js';
import { renderOPPE } from './oppe.js';

// Kredensial Hardcode (Bisa Anda sesuaikan)
const SUPERADMIN_USER = 'superadmin';
const SUPERADMIN_PASS = 'superadmin123';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

window.loadPage = (page, element = null) => {
    const container = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    
    // AMBIL ROLE DARI SESSION STORAGE
    const currentRole = sessionStorage.getItem('hris_role');
    
    if (element) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }

    switch (page) {
        case 'dashboard': 
            pageTitle.innerText = "DASHBOARD STATISTIK SDM"; 
            renderDashboard(container); 
            break;
        case 'pegawai': 
            pageTitle.innerText = "MASTER DATA PEGAWAI"; 
            renderPegawai(container, currentRole); 
            break;
        case 'pegawai-masuk': 
            pageTitle.innerText = "DATA PEGAWAI MASUK"; 
            renderPegawaiMasuk(container, currentRole); 
            break;
        case 'pegawai-keluar': 
            pageTitle.innerText = "DATA PEGAWAI KELUAR"; 
            renderPegawaiKeluar(container, currentRole); 
            break;
        case 'sik': 
            pageTitle.innerText = "DATA SIK / SIP"; 
            renderSIK(container, currentRole); 
            break;
        case 'str': 
            pageTitle.innerText = "DATA STR"; 
            renderSTR(container, currentRole); 
            break;
        case 'sertifikat': 
            pageTitle.innerText = "DATA SERTIFIKAT"; 
            renderSertifikat(container, currentRole); 
            break;
        case 'skp': 
            pageTitle.innerText = "DATA SKP"; 
            renderSKP(container, currentRole); 
            break;
        case 'pengaturan': 
            pageTitle.innerText = "PENGATURAN SISTEM"; 
            renderPengaturan(container, currentRole); 
            break;

        // === 2. MENAMBAHKAN LOGIKA ROUTING HALAMAN ===
        case 'spkrkk': 
            pageTitle.innerText = "SURAT PENUGASAN KLINIS & RKK"; 
            renderSPKRKK(container, currentRole); 
            break;
        case 'oppe': 
            pageTitle.innerText = "EVALUASI PRAKTIK KLINIS (OPPE)"; 
            renderOPPE(container, currentRole); 
            break;

        default:
            renderDashboard(container);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-admin-container');
    const mainApp = document.getElementById('main-app');
    const formLogin = document.getElementById('formLoginAdmin');
    const loginError = document.getElementById('loginError');

    function setupLayoutAkses() {
        if(loginContainer) loginContainer.style.display = 'none';
        if(mainApp) mainApp.style.display = 'flex';
        window.loadPage('dashboard');
    }

    const activeRole = sessionStorage.getItem('hris_role');
    if (activeRole === 'superadmin' || activeRole === 'admin') {
        setupLayoutAkses();
    }

    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userInput = document.getElementById('input_username').value.trim();
            const passInput = document.getElementById('input_password').value;
            const btnSubmit = document.getElementById('btnSubmitLogin');

            if(loginError) loginError.style.display = 'none';
            btnSubmit.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memvalidasi...`;

            if (userInput === SUPERADMIN_USER && passInput === SUPERADMIN_PASS) {
                sessionStorage.setItem('hris_role', 'superadmin');
                setupLayoutAkses();
            } 
            else if (userInput === ADMIN_USER && passInput === ADMIN_PASS) {
                sessionStorage.setItem('hris_role', 'admin');
                setupLayoutAkses();
            } 
            else {
                const { data, error } = await supabase
                    .from('pegawai')
                    .select('*')
                    .eq('nik', userInput)
                    .eq('password', passInput)
                    .maybeSingle();

                if (data) {
                    sessionStorage.setItem('hris_role', 'user');
                    sessionStorage.setItem('nik_user', data.nik); 
                    window.location.href = 'portal.html';
                } else {
                    if(loginError) loginError.style.display = 'block';
                    btnSubmit.innerHTML = `Masuk Sistem <i class="fas fa-sign-in-alt"></i>`;
                }
            }
        });
    }

    const btnLogout = document.getElementById('btnAdminLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (confirm("Keluar dari Dashboard HRIS?")) {
                sessionStorage.clear();
                location.reload(); 
            }
        });
    }
});
