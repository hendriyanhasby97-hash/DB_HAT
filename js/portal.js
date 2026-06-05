import { supabase } from './koneksi.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. CEK AUTENTIKASI
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

    // 3. LOGIKA KONDISIONAL MENU 
    const allowedPerizinan = ['Management', 'Tenaga Medis', 'Tenaga Penunjang Medis', 'Tenaga Kesehatan'];
    if (!allowedPerizinan.includes(pegawai.kelompok_jabatan)) {
        const menuPerizinan = document.getElementById('menu-perizinan');
        if(menuPerizinan) menuPerizinan.style.display = 'none';
    }

    if (pegawai.kelompok_pegawai !== 'ASN') {
        const menuSkp = document.getElementById('menu-skp');
        if(menuSkp) menuSkp.style.display = 'none';
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

    window.loadPage('profil');
});

// ==============================================================
// MODUL 1: RENDER PROFIL SAYA (Menampilkan Ringkasan & Form Edit Full)
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
            
            /* CSS Form & Modal */
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); align-items: flex-start; justify-content: center; z-index: 9999; padding: 20px; }
            .modal-content { background: white; padding: 32px; border-radius: 12px; width: 900px; max-width: 100%; max-height: 90vh; overflow-y: auto; margin-top: 2vh; border: 1px solid #e2e8f0;}
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px;}
            .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; transition: all 0.2s;}
            .form-group input:focus, .form-group select:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
            .form-group input[readonly] { background: #e2e8f0; cursor: not-allowed; color: #64748b; font-weight: 600;}
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
                <button class="btn btn-view" id="btnViewUser"><i class="fas fa-eye"></i> View Detail Lengkap</button>
                <button class="btn btn-edit" id="btnEditUser"><i class="fas fa-edit"></i> Lengkapi Profil</button>
            </div>
        </div>

        <div style="background: white; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 15px; color: #0f172a;"><i class="fas fa-bullhorn"></i> Pengumuman Portal</h4>
            <p style="color: #475569; font-size: 0.95rem; line-height: 1.6;">Selamat datang di Portal HRIS Mandiri. Silakan periksa kelengkapan data pribadi, berkas perizinan, dan sertifikat Anda. Jika terdapat kesalahan data atau berkas yang belum lengkap, mohon segera melengkapinya melalui menu <strong>Lengkapi Profil</strong>.</p>
        </div>

        <div class="modal" id="modalViewUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 style="margin:0; font-size: 1.25rem;"><i class="fas fa-id-card" style="color:#0ea5e9;"></i> Data Lengkap Kepegawaian Saya</h3>
                    <button class="btn" style="background:#ef4444; padding: 6px 12px;" onclick="document.getElementById('modalViewUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetailUser" class="grid-2" style="grid-template-columns: 1fr 1fr 1fr;"></div>
            </div>
        </div>

        <div class="modal" id="modalEditUser">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #e2e8f0; padding-bottom:15px; margin-bottom: 20px;">
                    <h3 style="margin:0; font-size: 1.25rem;"><i class="fas fa-user-edit" style="color:#f59e0b;"></i> Update Profil & Kepegawaian</h3>
                    <button class="btn" style="background:#ef4444; padding: 6px 12px;" onclick="document.getElementById('modalEditUser').style.display='none'"><i class="fas fa-times"></i></button>
                </div>
                
                <form id="formPegawaiUser">
                    <fieldset><legend>Data Pribadi & Kontak</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIK (Tidak dapat diubah)</label><input type="text" name="nik" id="form_nik" readonly></div>
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="form_nama" required></div>
                            <div class="form-group"><label>Tempat Lahir</label><input type="text" name="tempat_lahir" id="form_tempat_lahir"></div>
                            <div class="form-group"><label>Tanggal Lahir</label><input type="date" name="tanggal_lahir" id="form_tanggal_lahir"></div>
                            <div class="form-group"><label>Jenis Kelamin</label>
                                <select name="jenis_kelamin" id="form_jenis_kelamin">
                                    <option value="" hidden>Pilih...</option><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Agama</label>
                                <select name="agama" id="form_agama">
                                    <option value="" hidden>Pilih...</option><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Budha">Budha</option><option value="Hindu">Hindu</option><option value="Konghucu">Konghucu</option><option value="Kepercayaan Lainnya">Kepercayaan Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Status Keluarga</label>
                                <select name="status_keluarga" id="form_status_keluarga">
                                    <option value="" hidden>Pilih...</option><option value="Lajang">Lajang</option><option value="Menikah">Menikah</option><option value="Janda">Janda</option><option value="Duda">Duda</option>
                                </select>
                            </div>
                            <div class="form-group"><label>No Telp</label><input type="text" name="no_telp" id="form_no_telp"></div>
                            <div class="form-group"><label>Email</label><input type="email" name="email" id="form_email"></div>
                            <div class="form-group"><label>Password Portal (Ganti Jika Perlu)</label><input type="text" name="password" id="form_password"></div>
                            <div class="form-group" style="grid-column: span 2;"><label>Alamat Lengkap</label><input type="text" name="alamat" id="form_alamat"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Data Kepegawaian & Instansi</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIP</label><input type="text" name="nip" id="form_nip"></div>
                            <div class="form-group"><label>Status Pegawai</label>
                                <select name="status" id="form_status">
                                    <option value="" hidden>Pilih...</option><option value="Aktif">Aktif</option><option value="Mutasi">Mutasi</option><option value="Pensiun">Pensiun</option><option value="Resign">Resign</option><option value="Meninggal">Meninggal</option><option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Kelompok Pegawai</label>
                                <select name="kelompok_pegawai" id="form_kelompok_pegawai">
                                    <option value="" hidden>Pilih...</option><option value="ASN">ASN</option><option value="APBD">APBD</option><option value="BLUD">BLUD</option><option value="Konsultan">Konsultan</option><option value="Magang">Magang</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Kelompok Jabatan</label>
                                <select name="kelompok_jabatan" id="form_kelompok_jabatan">
                                    <option value="" hidden>Pilih...</option><option value="Management">Management</option><option value="Tenaga Medis">Tenaga Medis</option><option value="Tenaga Kesehatan">Tenaga Kesehatan</option><option value="Tenaga Penunjang Medis">Tenaga Penunjang Medis</option><option value="Tenaga Administrasi">Tenaga Administrasi</option><option value="Tenaga Non Administrasi">Tenaga Non Administrasi</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Golongan</label>
                                <select name="gol" id="form_gol"><option value="" hidden>Pilih Golongan...</option></select>
                            </div>
                            <div class="form-group">
                                <label>Jabatan</label>
                                <select name="jabatan" id="form_jabatan"><option value="" hidden>Pilih Jabatan...</option></select>
                            </div>
                            <div class="form-group">
                                <label>Ruangan</label>
                                <select name="ruangan" id="form_ruangan"><option value="" hidden>Pilih Ruangan...</option></select>
                            </div>
                            <div class="form-group"><label>TMT Pangkat</label><input type="date" name="tmt_pangkat" id="form_tmt_pangkat"></div>
                            <div class="form-group"><label>TMT Berikutnya</label><input type="date" name="tmt_berikutnya" id="form_tmt_berikutnya"></div>
                            <div class="form-group"><label>TMT CPNS</label><input type="date" name="tmt_cpns" id="form_tmt_cpns"></div>
                            <div class="form-group"><label>Tanggal Masuk RS</label><input type="date" name="masuk_rs" id="form_masuk_rs"></div>
                            <div class="form-group"><label>Masa Kerja RS (Otomatis)</label><input type="text" name="masa_kerja_rs" id="form_masa_kerja_rs" readonly placeholder="Otomatis dihitung..."></div>
                            <div class="form-group"><label>Rentang BUP</label><input type="text" name="rentang_bup" id="form_rentang_bup"></div>
                            <div class="form-group"><label>TMT Pensiun</label><input type="date" name="tmt_pensiun" id="form_tmt_pensiun"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Pendidikan & Identitas Negara</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>Jenjang Pendidikan</label>
                                <select name="jenjang" id="form_jenjang">
                                    <option value="" hidden>Pilih...</option>
                                    <option value="SD">SD</option><option value="SMP">SMP</option><option value="SMA">SMA</option>
                                    <option value="D1">D1</option><option value="D3">D3</option><option value="D4">D4</option>
                                    <option value="S1">S1</option><option value="Profesi">Profesi</option><option value="Spesialis">Spesialis</option>
                                    <option value="Magister">Magister</option><option value="Konsultan">Konsultan</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Fakultas</label><input type="text" name="fakultas" id="form_fakultas"></div>
                            <div class="form-group"><label>Jurusan</label><input type="text" name="jurusan" id="form_jurusan"></div>
                            <div class="form-group"><label>No BPJS Kesehatan</label><input type="text" name="no_bpjsn" id="form_no_bpjsn"></div>
                            <div class="form-group"><label>No BPJS TK/Taspen</label><input type="text" name="no_bpjsket_taspen" id="form_no_bpjsket_taspen"></div>
                            <div class="form-group"><label>NPWP</label><input type="text" name="npwp" id="form_npwp"></div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="submit" class="btn btn-simpan" id="btnSimpanProfil"><i class="fas fa-save"></i> Simpan Perubahan</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // 1. FUNGSI LOAD MASTER DROPDOWNS UNTUK EDIT PROFIL PEGAWAI
    async function loadMasterDropdownsUser() {
        try {
            const [resGol, resJab, resRua] = await Promise.all([
                supabase.from('master_golongan').select('nama_golongan').order('nama_golongan', { ascending: true }),
                supabase.from('master_jabatan').select('nama_jabatan').order('nama_jabatan', { ascending: true }),
                supabase.from('master_ruangan').select('nama_ruangan').order('nama_ruangan', { ascending: true })
            ]);

            if (resGol.data) document.getElementById('form_gol').innerHTML += resGol.data.map(d => `<option value="${d.nama_golongan}">${d.nama_golongan}</option>`).join('');
            if (resJab.data) document.getElementById('form_jabatan').innerHTML += resJab.data.map(d => `<option value="${d.nama_jabatan}">${d.nama_jabatan}</option>`).join('');
            if (resRua.data) document.getElementById('form_ruangan').innerHTML += resRua.data.map(d => `<option value="${d.nama_ruangan}">${d.nama_ruangan}</option>`).join('');
        } catch (error) { 
            console.error("Gagal menarik data master:", error); 
        }
    }
    loadMasterDropdownsUser(); // Jalankan

    // 2. LOGIKA AUTO HITUNG (Sama dengan fitur Admin)
    const inpKelompokPegawai = document.getElementById('form_kelompok_pegawai');
    const inptmtPangkat = document.getElementById('form_tmt_pangkat');
    const inptmtCpns = document.getElementById('form_tmt_cpns');
    const inptmtBerikutnya = document.getElementById('form_tmt_berikutnya');
    const inpNIP = document.getElementById('form_nip');
    const inpMasukRS = document.getElementById('form_masuk_rs');
    const inpMasaKerjaRS = document.getElementById('form_masa_kerja_rs');

    function cekStatusASN() {
        if (!inpKelompokPegawai) return;
        if (inpKelompokPegawai.value === 'ASN') {
            inptmtPangkat.readOnly = false;
            inptmtCpns.readOnly = false;
            inptmtBerikutnya.readOnly = false;
        } else {
            inptmtPangkat.readOnly = true;
            inptmtCpns.readOnly = true;
            inptmtBerikutnya.readOnly = true;
            inptmtPangkat.value = '';
            inptmtCpns.value = '';
            inptmtBerikutnya.value = '';
        }
    }
    if(inpKelompokPegawai) inpKelompokPegawai.addEventListener('change', cekStatusASN);

    if(inpNIP) {
        inpNIP.addEventListener('input', () => {
            let nip = inpNIP.value.replace(/[^0-9]/g, '');
            if (nip.length >= 13) {
                const year = nip.substring(5, 9);
                const month = nip.substring(9, 11);
                const day = nip.substring(11, 13);
                if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                    inptmtCpns.value = `${year}-${month}-${day}`;
                }
            }
        });
    }

    function hitungMasaKerja() {
        if (!inpMasukRS.value) { inpMasaKerjaRS.value = ''; return; }
        const start = new Date(inpMasukRS.value);
        const end = new Date();
        if (start > end) { inpMasaKerjaRS.value = '0 Tahun 0 Bulan 0 Hari'; return; }
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();
        if (days < 0) { months--; const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); days += prevMonth.getDate(); }
        if (months < 0) { years--; months += 12; }
        inpMasaKerjaRS.value = `${years} Tahun ${months} Bulan ${days} Hari`;
    }
    if(inpMasukRS) inpMasukRS.addEventListener('input', hitungMasaKerja);

    // 3. TAMPILKAN MASA KERJA DI HALAMAN RINGKASAN
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

    // 4. TOMBOL VIEW LENGKAP
    document.getElementById('btnViewUser').onclick = () => {
        const kontenDetail = document.getElementById('kontenDetailUser');
        kontenDetail.innerHTML = '';
        
        // 32 Data Lengkap
        const kolomTampil = [
            { key: 'nik', label: 'NIK' }, { key: 'nip', label: 'NIP' }, { key: 'nama', label: 'Nama Lengkap' },
            { key: 'tempat_lahir', label: 'Tempat Lahir' }, { key: 'tanggal_lahir', label: 'Tgl Lahir' },
            { key: 'jenis_kelamin', label: 'Jenis Kelamin' }, { key: 'agama', label: 'Agama' },
            { key: 'status_keluarga', label: 'Status Keluarga' }, { key: 'no_telp', label: 'No Telp' },
            { key: 'email', label: 'Email' }, { key: 'alamat', label: 'Alamat' },
            { key: 'status', label: 'Status Pegawai' }, { key: 'kelompok_pegawai', label: 'Kelp. Pegawai' },
            { key: 'kelompok_jabatan', label: 'Kelp. Jabatan' }, { key: 'gol', label: 'Golongan' },
            { key: 'jabatan', label: 'Jabatan' }, { key: 'ruangan', label: 'Ruangan' },
            { key: 'tmt_pangkat', label: 'TMT Pangkat' }, { key: 'tmt_berikutnya', label: 'TMT Berikutnya' },
            { key: 'tmt_cpns', label: 'TMT CPNS' }, { key: 'masuk_rs', label: 'Masuk RS' },
            { key: 'masa_kerja_rs', label: 'Masa Kerja RS' }, { key: 'rentang_bup', label: 'Rentang BUP' },
            { key: 'tmt_pensiun', label: 'TMT Pensiun' }, { key: 'jenjang', label: 'Jenjang Pddk' },
            { key: 'fakultas', label: 'Fakultas' }, { key: 'jurusan', label: 'Jurusan' },
            { key: 'no_bpjsn', label: 'No BPJS Kesh' }, { key: 'no_bpjsket_taspen', label: 'No BPJS TK' },
            { key: 'npwp', label: 'NPWP' }
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

    // 5. TOMBOL BUKA FORM EDIT (Auto-Fill 32 Kolom)
    document.getElementById('btnEditUser').onclick = () => {
        Object.keys(pegawai).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement) inputElement.value = pegawai[key] || '';
        });
        cekStatusASN(); // Atur Readonly TMT
        hitungMasaKerja(); // Hitung Masa Kerja
        document.getElementById('modalEditUser').style.display = 'flex';
    };

    // 6. SUBMIT DATA PERUBAHAN
    document.getElementById('formPegawaiUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btnSimpanProfil');
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Menyimpan...`;
        btn.disabled = true;
        
        const formData = new FormData(e.target);
        const dataObj = Object.fromEntries(formData.entries());
        
        // Bersihkan data kosong
        Object.keys(dataObj).forEach(key => { if (dataObj[key] === "") dataObj[key] = null; });

        // KEAMANAN EKSTRA: Hapus key NIK agar NIK tidak bisa dirubah sama sekali
        delete dataObj.nik;

        // Update ke database berdasarkan NIK user
        const { error } = await supabase.from('pegawai').update(dataObj).eq('nik', pegawai.nik);
        
        if (error) { 
            alert("Gagal menyimpan perubahan: " + error.message); 
            btn.innerHTML = `<i class="fas fa-save"></i> Simpan Perubahan`;
            btn.disabled = false;
        } else {
            alert("Profil berhasil diperbarui secara mandiri! Halaman akan dimuat ulang.");
            location.reload(); 
        }
    });
}

// ==============================================================
// MODUL 2: FUNGSI RENDER GENERIC UNTUK TABEL SIK, STR, DLL
// ==============================================================
async function renderModulSederhana(container, namaTabel, judulMenu, userNik) {
    container.innerHTML = `<h3 style="margin-bottom:15px; color:#0f172a;">Menarik Data ${judulMenu}... <i class="fas fa-spinner fa-spin"></i></h3>`;
    
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
