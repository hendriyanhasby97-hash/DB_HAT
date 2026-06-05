import { supabase } from './koneksi.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. CEK AUTENTIKASI: Pastikan user login via index.html
    const userRole = sessionStorage.getItem('hris_role');
    const userNik = sessionStorage.getItem('nik_user');

    if (userRole !== 'user' || !userNik) {
        alert("Sesi tidak valid. Silakan login kembali.");
        window.location.href = 'index.html';
        return;
    }

    // 2. AMBIL DATA PEGAWAI DARI SUPABASE
    const { data: pegawai, error } = await supabase
        .from('pegawai')
        .select('*')
        .eq('nik', userNik)
        .single();

    if (error || !pegawai) {
        alert("Data Pegawai tidak ditemukan di server.");
        return;
    }

    // Tampilkan Nama di Topbar
    document.getElementById('badge-nama').innerHTML = `<i class="fas fa-user-check" style="color:#10b981;"></i> ${pegawai.nama}`;

    // 3. LOGIKA KONDISIONAL MENU (Berdasarkan Jabatan & ASN)
    const allowedPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];
    if (!allowedPerizinan.includes(pegawai.kelompok_jabatan)) {
        document.getElementById('menu-perizinan').style.display = 'none';
    }

    if (pegawai.kelompok_pegawai !== 'ASN') {
        document.getElementById('menu-skp').style.display = 'none';
    }

    // 4. SISTEM ROUTING HALAMAN PORTAL
    window.loadPage = (page, element = null) => {
        const container = document.getElementById('app-content');
        const pageTitle = document.getElementById('page-title');
        
        if (element) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        }

        switch (page) {
            case 'profil': 
                pageTitle.innerText = "PROFIL SAYA"; 
                renderProfilSaya(container, pegawai); 
                break;
            case 'sik': 
                pageTitle.innerText = "DOKUMEN SIK / SIP SAYA"; 
                renderModulSederhana(container, 'sik_pegawai', 'SIK/SIP', userNik);
                break;
            case 'str': 
                pageTitle.innerText = "DOKUMEN STR SAYA"; 
                renderModulSederhana(container, 'str_pegawai', 'STR', userNik);
                break;
            case 'sertifikat': 
                pageTitle.innerText = "SERTIFIKAT SAYA"; 
                renderModulSederhana(container, 'sertifikat_pegawai', 'Sertifikat', userNik);
                break;
            case 'skp': 
                pageTitle.innerText = "SASARAN KINERJA (SKP) SAYA"; 
                renderModulSederhana(container, 'skp_pegawai', 'SKP', userNik);
                break;
        }
    };

    // 5. FUNGSI LOGOUT
    document.getElementById('btnUserLogout').addEventListener('click', () => {
        if(confirm("Apakah Anda yakin ingin keluar dari Portal?")) {
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });

    // Load Halaman Pertama
    window.loadPage('profil');
});


// ==============================================================
// MODUL 1: RENDER PROFIL SAYA (Menampilkan Ringkasan & Form Edit)
// ==============================================================
function renderProfilSaya(container, pegawai) {
    container.innerHTML = `
        <style>
            .summary-card { background: white; border-radius: 12px; padding: 25px; display: flex; align-items: center; gap: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 25px;}
            .summary-icon { width: 80px; height: 80px; background: #e0f2fe; color: #0ea5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
            .summary-info h3 { font-size: 1.5rem; color: #0f172a; margin-bottom: 5px; font-weight: 700;}
            .summary-info p { color: #64748b; font-size: 0.95rem; margin-bottom: 3px; font-weight: 500;}
            
            .btn { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: 600; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05);}
            .btn:hover { transform: translateY(-1px); }
            .btn-view { background: #0ea5e9; }
            .btn-edit { background: #f59e0b; }
            .btn-simpan { background: #10b981; }
            
            /* CSS Form & Modal (Sama seperti Admin) */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 32px; border-radius: 12px; width: 900px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; border: 1px solid #e2e8f0;}
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px;}
            .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; transition: all 0.2s;}
            .form-group input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; color: #64748b; }
            fieldset { border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 24px;}
            legend { font-weight: 600; background: #f1f5f9; color: #334155; padding: 6px 14px; border-radius: 6px; font-size: 0.85rem; border: 1px solid #e2e8f0;}
            .detail-item { border-bottom: 1px solid #f1f5f9; padding: 12px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;}
            .detail-value { font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-top: 6px; word-wrap: break-word; white-space: normal; }
        </style>

        <div class="summary-card">
            <div class="summary-icon"><i class="fas fa-user-tie"></i></div>
            <div class="summary-info" style="flex:1;">
                <h3>${pegawai.nama}</h3>
                <p><i class="fas fa-id-card"></i> NIK: ${pegawai.nik} &nbsp;|&nbsp; <i class="fas fa-briefcase"></i> Jabatan: ${pegawai.jabatan || '-'}</p>
                <p><i class="fas fa-check-circle" style="color:#10b981;"></i> Status: ${pegawai.status || '-'} &nbsp;|&nbsp; <i class="fas fa-clock"></i> Masa Kerja RS: <span id="txt-masa-kerja">Menghitung...</span></p>
            </div>
            <div style="display:flex; gap:10px; flex-direction:column;">
                <button class="btn btn-view" id="btnViewUser"><i class="fas fa-eye"></i> View Detail</button>
                <button class="btn btn-edit" id="btnEditUser"><i class="fas fa-edit"></i> Edit Profil</button>
            </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 15px; color: #0f172a;"><i class="fas fa-bullhorn"></i> Pengumuman Portal</h4>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">Selamat datang di Portal HRIS Mandiri. Silakan periksa kelengkapan data pribadi, berkas perizinan, dan sertifikat Anda. Jika terdapat kesalahan data atau berkas yang sudah kadaluarsa, mohon segera memperbarui data melalui menu yang tersedia atau lapor ke Admin HR.</p>
        </div>

        <div class="modal" id="modalViewUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 style="margin:0; font-size: 1.25rem;"><i class="fas fa-id-card" style="color:#0ea5e9;"></i> Data Lengkap Saya</h3>
                    <button class="btn" style="background:#ef4444; padding: 6px 12px;" onclick="document.getElementById('modalViewUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetailUser" class="grid-2" style="grid-template-columns: 1fr 1fr 1fr;"></div>
            </div>
        </div>

        <div class="modal" id="modalEditUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 style="margin:0; font-size: 1.25rem;"><i class="fas fa-user-edit" style="color:#f59e0b;"></i> Update Profil Pribadi</h3>
                    <button class="btn" style="background:#ef4444; padding: 6px 12px;" onclick="document.getElementById('modalEditUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <form id="formPegawaiUser">
                    <fieldset><legend>Data Pribadi & Kontak</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="form_nama" required></div>
                            <div class="form-group"><label>Tempat Lahir</label><input type="text" name="tempat_lahir" id="form_tempat_lahir"></div>
                            <div class="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" id="form_tanggal_lahir"></div>
                            <div class="form-group"><label>Jenis Kelamin</label>
                                <select name="jenis_kelamin" id="form_jenis_kelamin">
                                    <option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Agama</label>
                                <select name="agama" id="form_agama">
                                    <option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Budha">Budha</option><option value="Hindu">Hindu</option><option value="Konghucu">Konghucu</option><option value="Kepercayaan Lainnya">Kepercayaan Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Status Keluarga</label>
                                <select name="status_keluarga" id="form_status_keluarga">
                                    <option value="Lajang">Lajang</option><option value="Menikah">Menikah</option><option value="Janda">Janda</option><option value="Duda">Duda</option>
                                </select>
                            </div>
                            <div class="form-group"><label>No Telp</label><input type="text" name="no_telp" id="form_no_telp"></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" id="form_email"></div>
                            <div class="form-group"><label>Password Portal (Ganti Jika Perlu)</label><input type="text" name="password" id="form_password"></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Alamat Lengkap</label><input type="text" name="alamat" id="form_alamat"></div>
                        </div>
                    </fieldset>
                    <div style="text-align: right; margin-top: 15px;">
                        <button type="submit" class="btn btn-simpan" id="btnSimpanProfil"><i class="fas fa-save"></i> Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // 1. Hitung Masa Kerja
    if (pegawai.masuk_rs) {
        const start = new Date(pegawai.masuk_rs);
        const end = new Date();
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        if (months < 0) { years--; months += 12; }
        document.getElementById('txt-masa-kerja').innerText = `${years} Tahun ${months} Bulan`;
    } else {
        document.getElementById('txt-masa-kerja').innerText = "-";
    }

    // 2. Logic Tombol View
    document.getElementById('btnViewUser').onclick = () => {
        const kontenDetail = document.getElementById('kontenDetailUser');
        kontenDetail.innerHTML = '';
        const kolomTampil = [
            { key: 'nik', label: 'NIK' }, { key: 'nip', label: 'NIP' }, { key: 'nama', label: 'Nama Lengkap' },
            { key: 'tempat_lahir', label: 'Tempat Lahir' }, { key: 'tanggal_lahir', label: 'Tgl Lahir' },
            { key: 'jenis_kelamin', label: 'Jenis Kelamin' }, { key: 'agama', label: 'Agama' },
            { key: 'status_keluarga', label: 'Status Keluarga' }, { key: 'no_telp', label: 'No Telp' },
            { key: 'email', label: 'Email' }, { key: 'alamat', label: 'Alamat' },
            { key: 'status', label: 'Status Pegawai' }, { key: 'kelompok_pegawai', label: 'Kelp. Pegawai' },
            { key: 'kelompok_jabatan', label: 'Kelp. Jabatan' }, { key: 'gol', label: 'Golongan' },
            { key: 'jabatan', label: 'Jabatan' }, { key: 'ruangan', label: 'Ruangan' },
            { key: 'jenjang', label: 'Jenjang Pddk' }, { key: 'fakultas', label: 'Fakultas' }, { key: 'jurusan', label: 'Jurusan' }
        ];

        kolomTampil.forEach(item => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            div.innerHTML = `<span class="detail-label">${item.label}</span><span class="detail-value">${pegawai[item.key] || "-"}</span>`;
            if(item.key === 'alamat') div.style.gridColumn = 'span 3';
            kontenDetail.appendChild(div);
        });
        document.getElementById('modalViewUser').style.display = 'flex';
    };

    // 3. Logic Tombol Edit & Submit
    document.getElementById('btnEditUser').onclick = () => {
        const fields = ['nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 'status_keluarga', 'no_telp', 'email', 'password', 'alamat'];
        fields.forEach(key => {
            if(document.getElementById(`form_${key}`)) document.getElementById(`form_${key}`).value = pegawai[key] || '';
        });
        document.getElementById('modalEditUser').style.display = 'flex';
    };

    document.getElementById('formPegawaiUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanProfil');
        btn.innerText = "Menyimpan...";
        
        const formData = new FormData(e.target);
        const dataObj = Object.fromEntries(formData.entries());
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        // Update ke database berdasarkan NIK user
        const { error } = await supabase.from('pegawai').update(dataObj).eq('nik', pegawai.nik);
        
        if (error) { alert("Gagal menyimpan: " + error.message); btn.innerHTML = `<i class="fas fa-save"></i> Simpan Perubahan`;}
        else {
            alert("Profil berhasil diupdate! Halaman akan direfresh.");
            location.reload(); 
        }
    });
}

// ==============================================================
// MODUL 2: FUNGSI RENDER GENERIC UNTUK TABEL SIK, STR, SERTIFIKAT, SKP
// ==============================================================
async function renderModulSederhana(container, namaTabel, judulMenu, userNik) {
    container.innerHTML = `<h3 style="margin-bottom:15px; color:#0f172a;">Menarik Data ${judulMenu}... <i class="fas fa-spinner fa-spin"></i></h3>`;
    
    // Hanya tarik data yang NIK-nya milik user yang sedang login
    const { data, error } = await supabase.from(namaTabel).select('*').eq('nik', userNik);
    
    if (error) {
        container.innerHTML = `<p style="color:red;">Error mengambil data: ${error.message}</p>`;
        return;
    }

    let tableHtml = `
        <style>
            table { width: 100%; border-collapse: collapse; font-size: 0.875rem; background: white; border-radius:10px; overflow:hidden;}
            th, td { padding: 14px 20px; text-align: left; }
            th { background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; border-bottom: 1px solid #e2e8f0; }
            td { color: #334155; border-bottom: 1px solid #f1f5f9; }
            .btn-lihat { background:#0ea5e9; color:white; padding:6px 12px; border:none; border-radius:4px; text-decoration:none; display:inline-block; font-size:0.8rem;}
        </style>
        <div style="background: white; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
        <table>
    `;

    if (data.length === 0) {
        tableHtml += `<tr><td colspan="5" style="text-align:center; padding:20px;">Belum ada arsip ${judulMenu} yang terdaftar untuk akun Anda.</td></tr>`;
    } else {
        // Tampilan khusus per tabel
        if (namaTabel === 'sertifikat_pegawai') {
            tableHtml += `<thead><tr><th>No. Sertifikat</th><th>Judul Kegiatan</th><th>Jenis</th><th>Tanggal</th><th>Lampiran</th></tr></thead><tbody>`;
            data.forEach(item => {
                tableHtml += `<tr>
                    <td>${item.no_sertifikat || '-'}</td><td>${item.judul_kegiatan || '-'}</td><td>${item.jenis_sertifikat || '-'}</td><td>${item.tanggal_pelaksanaan || '-'}</td>
                    <td>${item.file_sertifikat ? `<a href="${item.file_sertifikat}" target="_blank" class="btn-lihat">Unduh File</a>` : 'Tidak ada'}</td>
                </tr>`;
            });
        } else if (namaTabel === 'skp_pegawai') {
            tableHtml += `<thead><tr><th>Tahun</th><th>Jabatan SKP</th><th>Pejabat Penilai</th><th>Lampiran</th></tr></thead><tbody>`;
            data.forEach(item => {
                tableHtml += `<tr>
                    <td><span style="font-weight:bold; color:#0369a1;">${item.tahun_skp || '-'}</span></td><td>${item.jabatan || '-'}</td><td>${item.pejabat_penilai || '-'}</td>
                    <td>${item.lampiran_skp ? `<a href="${item.lampiran_skp}" target="_blank" class="btn-lihat">Unduh File</a>` : 'Tidak ada'}</td>
                </tr>`;
            });
        } else {
            // Default View (untuk SIK & STR jika sudah dibuat)
            tableHtml += `<thead><tr><th>Nomor Dokumen</th><th>Tanggal Terbit</th><th>Tanggal Berlaku</th><th>File</th></tr></thead><tbody>`;
            data.forEach(item => {
                let link = item.file_sik || item.file_str || item.lampiran || '';
                tableHtml += `<tr>
                    <td>${item.no_surat || item.nomor || '-'}</td><td>${item.tgl_terbit || '-'}</td><td>${item.tgl_berlaku || '-'}</td>
                    <td>${link ? `<a href="${link}" target="_blank" class="btn-lihat">Lihat Berkas</a>` : 'Tidak ada'}</td>
                </tr>`;
            });
        }
    }
    
    tableHtml += `</tbody></table></div>`;
    container.innerHTML = `<h3 style="margin-bottom:15px; color:#0f172a;"><i class="fas fa-folder-open"></i> Arsip ${judulMenu} Saya</h3>` + tableHtml;
}
