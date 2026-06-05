import { supabase } from './koneksi.js';

export function renderSertifikat(container, userRole = 'superadmin') {
    container.innerHTML = `
        <style>
            .btn { padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer; color: white; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f59e0b; padding: 6px 10px; font-size: 0.85rem;}
            .btn-hapus { background: #ef4444; padding: 6px 10px; font-size: 0.85rem;}
            .btn-detail { background: #0ea5e9; padding: 6px 10px; font-size: 0.85rem; margin-right: 5px;}
            .btn-tambah { background: #10b981; }
            .btn-link { background: #64748b; padding: 6px 10px; font-size: 0.85rem;}
            
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; font-size: 0.9rem;}
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; }
            
            .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .filter-group { display: flex; gap: 10px; flex: 1; }
            .filter-group input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; width: 300px; }
            
            /* MODAL CSS */
            .modal { 
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                background: rgba(0,0,0,0.6); 
                align-items: flex-start; 
                justify-content: center; 
                z-index: 9999; 
                padding: 20px; 
            }
            .modal-content { 
                background: white; padding: 30px; border-radius: 8px; 
                width: 800px; 
                max-width: 100%; 
                max-height: 90vh; 
                overflow-y: auto; 
                margin-top: 2vh; 
            }
            
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;}
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 4px;}
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none;}
            .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; }
            
            fieldset { border: 1px solid #e2e8f0; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #fafafa;}
            legend { font-weight: bold; background: #3b82f6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.9rem;}

            .detail-item { border-bottom: 1px dashed #e2e8f0; padding: 8px 0; display: flex; flex-direction: column;}
            .detail-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase;}
            .detail-value { font-size: 0.95rem; color: #1e293b; font-weight: 500; margin-top: 3px; word-wrap: break-word; white-space: normal; }
        </style>

        <div class="toolbar">
            <div class="filter-group">
                <input type="text" id="inputCariSertif" placeholder="🔍 Cari NIK, Nama, atau Judul Kegiatan...">
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-tambah" id="btnTambahSertif"><i class="fas fa-plus"></i> Tambah Sertifikat</button>
            </div>
        </div>

        <div style="background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <table>
                <thead>
                    <tr>
                        <th>Pegawai</th>
                        <th>No. Sertifikat</th>
                        <th>Judul Kegiatan</th>
                        <th>Jenis</th>
                        <th>JPL/SKP</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody id="tabelSertifikat"><tr><td colspan="6" style="text-align:center;">Memuat data...</td></tr></tbody>
            </table>
        </div>

        <div class="modal" id="modalFormSertifikat">
            <div class="modal-content">
                <h3 id="modalTitleSertif" style="margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom:10px;">Form Sertifikat Pegawai</h3>
                <form id="formSertifikat">
                    <input type="hidden" name="id" id="form_id">
                    
                    <fieldset><legend>Data Pegawai</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>NIK</label><input type="text" name="nik" id="form_nik" required></div>
                            <div class="form-group"><label>Nama Lengkap</label><input type="text" name="nama" id="form_nama" required></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Detail Sertifikat & Kegiatan</legend>
                        <div class="form-group" style="margin-bottom:15px;">
                            <label>Judul Kegiatan</label>
                            <textarea name="judul_kegiatan" id="form_judul_kegiatan" rows="2" required></textarea>
                        </div>
                        <div class="grid-2">
                            <div class="form-group"><label>No. Sertifikat</label><input type="text" name="no_sertifikat" id="form_no_sertifikat" required></div>
                            <div class="form-group">
                                <label>Jenis Sertifikat</label>
                                <select name="jenis_sertifikat" id="form_jenis_sertifikat" required>
                                    <option value="" hidden>Pilih Jenis...</option>
                                    <option value="Pelatihan">Pelatihan</option>
                                    <option value="Seminar">Seminar</option>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Bimtek">Bimtek</option>
                                    <option value="Simposium">Simposium</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div class="form-group"><label>Tanggal Pelaksanaan</label><input type="date" name="tanggal_pelaksanaan" id="form_tanggal_pelaksanaan"></div>
                            <div class="form-group"><label>Tanggal Mulai</label><input type="date" name="mulai" id="form_mulai"></div>
                            <div class="form-group"><label>Tanggal Selesai</label><input type="date" name="selesai" id="form_selesai"></div>
                        </div>
                    </fieldset>

                    <fieldset><legend>Penilaian & Dokumen</legend>
                        <div class="grid-2">
                            <div class="form-group"><label>JPL (Jam Pelajaran)</label><input type="number" name="jpl" id="form_jpl" min="0" placeholder="Misal: 20"></div>
                            <div class="form-group"><label>Nilai SKP</label><input type="number" step="0.01" name="skp" id="form_skp" min="0" placeholder="Misal: 2.5"></div>
                            <div class="form-group" style="grid-column: span 2;">
                                <label>Link File Sertifikat (Google Drive/Dropbox)</label>
                                <input type="url" name="file_sertifikat" id="form_file_sertifikat" placeholder="https://...">
                            </div>
                        </div>
                    </fieldset>

                    <div style="text-align: right; margin-top: 15px;">
                        <button type="button" class="btn" style="background:#94a3b8;" id="btnTutupFormSertif">Batal</button>
                        <button type="submit" class="btn" style="background:#3b82f6;" id="btnSimpanSertif"><i class="fas fa-save"></i> Simpan Sertifikat</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="modal" id="modalDetailSertifikat">
            <div class="modal-content">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #ccc; padding-bottom:10px; margin-bottom: 20px;">
                    <h3 style="margin:0;"><i class="fas fa-certificate" style="color:#0ea5e9;"></i> Detail Sertifikat</h3>
                    <button class="btn" style="background:#ef4444; padding: 5px 10px;" id="btnTutupDetailSertif"><i class="fas fa-times"></i></button>
                </div>
                <div id="kontenDetailSertif" class="grid-2"></div>
            </div>
        </div>
    `;

    initLogikaSertifikat();
}

function initLogikaSertifikat() {
    const tbody = document.getElementById('tabelSertifikat');
    const modalForm = document.getElementById('modalFormSertifikat');
    const modalDetail = document.getElementById('modalDetailSertifikat');
    const form = document.getElementById('formSertifikat');
    const modalTitle = document.getElementById('modalTitleSertif');
    const kontenDetail = document.getElementById('kontenDetailSertif');
    const inputCari = document.getElementById('inputCariSertif');

    let currentData = [];

    // ==========================================
    // 1. LOAD DATA DARI DATABASE
    // ==========================================
    async function loadData() {
        try {
            const { data, error } = await supabase.from('sertifikat_pegawai').select('*').order('created_at', { ascending: false });
            
            if (error) {
                tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;"><b>Error Supabase:</b> ${error.message}</td></tr>`;
                return;
            }
            
            currentData = data || []; 
            renderTabel(currentData); 
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;"><b>Error Sistem:</b> ${err.message}</td></tr>`;
        }
    }

    // ==========================================
    // 2. RENDER TABEL & PENCARIAN
    // ==========================================
    function renderTabel(data) {
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 20px;">Belum ada data sertifikat pegawai.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(row => `
            <tr>
                <td><strong>${row.nama || '-'}</strong><br><span style="color:#64748b; font-size:0.8rem;">NIK: ${row.nik || '-'}</span></td>
                <td>${row.no_sertifikat || '-'}</td>
                <td>${row.judul_kegiatan || '-'}</td>
                <td>${row.jenis_sertifikat || '-'}</td>
                <td>JPL: ${row.jpl || '0'} | SKP: ${row.skp || '0'}</td>
                <td>
                    <button class="btn btn-detail" onclick="bukaDetailSertif('${row.id}')" title="Lihat Detail"><i class="fas fa-eye"></i></button>
                    ${row.file_sertifikat ? `<a href="${row.file_sertifikat}" target="_blank" class="btn btn-link" title="Buka File"><i class="fas fa-external-link-alt"></i></a>` : ''}
                    <button class="btn btn-edit" onclick="bukaFormSertif('${row.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-hapus" onclick="hapusSertif('${row.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }

    if(inputCari) {
        inputCari.addEventListener('input', () => {
            const keyword = inputCari.value.toLowerCase();
            const dataTersaring = currentData.filter(item => {
                return (item.nama && item.nama.toLowerCase().includes(keyword)) || 
                       (item.nik && item.nik.toLowerCase().includes(keyword)) ||
                       (item.judul_kegiatan && item.judul_kegiatan.toLowerCase().includes(keyword));
            });
            renderTabel(dataTersaring);
        });
    }

    // ==========================================
    // 3. FITUR DETAIL SERTIFIKAT
    // ==========================================
    window.bukaDetailSertif = (id) => {
        const item = currentData.find(p => p.id === id);
        if(!item) return;
        
        kontenDetail.innerHTML = '';
        const kolomTampil = [
            { key: 'nik', label: 'NIK Pegawai' }, { key: 'nama', label: 'Nama Pegawai' },
            { key: 'no_sertifikat', label: 'No. Sertifikat' }, { key: 'jenis_sertifikat', label: 'Jenis Sertifikat' },
            { key: 'tanggal_pelaksanaan', label: 'Tanggal Pelaksanaan' }, { key: 'judul_kegiatan', label: 'Judul Kegiatan' },
            { key: 'mulai', label: 'Mulai Kegiatan' }, { key: 'selesai', label: 'Selesai Kegiatan' },
            { key: 'jpl', label: 'Total JPL' }, { key: 'skp', label: 'Nilai SKP' },
            { key: 'file_sertifikat', label: 'Link File' }
        ];

        kolomTampil.forEach(col => {
            const div = document.createElement('div');
            div.className = 'detail-item';
            let nilai = item[col.key] || "-";
            
            // Format khusus jika link
            if(col.key === 'file_sertifikat' && item[col.key]) {
                nilai = `<a href="${item[col.key]}" target="_blank" style="color:#0ea5e9;">Buka Dokumen</a>`;
            }

            div.innerHTML = `<span class="detail-label">${col.label}</span><span class="detail-value">${nilai}</span>`;
            if(col.key === 'judul_kegiatan' || col.key === 'file_sertifikat') div.style.gridColumn = 'span 2';
            kontenDetail.appendChild(div);
        });
        modalDetail.style.display = 'flex';
    };

    if(document.getElementById('btnTutupDetailSertif')) {
        document.getElementById('btnTutupDetailSertif').onclick = () => modalDetail.style.display = 'none';
    }

    // ==========================================
    // 4. FORM TAMBAH / EDIT
    // ==========================================
    if(document.getElementById('btnTambahSertif')) {
        document.getElementById('btnTambahSertif').onclick = () => {
            form.reset(); 
            document.getElementById('form_id').value = ''; 
            modalTitle.innerText = "Tambah Sertifikat Baru";
            modalForm.style.display = 'flex';
        };
    }

    window.bukaFormSertif = (id) => {
        form.reset(); 
        modalTitle.innerText = "Edit Data Sertifikat";
        const item = currentData.find(p => p.id === id);
        if(!item) return;

        Object.keys(item).forEach(key => {
            const inputElement = document.getElementById(`form_${key}`);
            if(inputElement) inputElement.value = item[key] || '';
        });
        modalForm.style.display = 'flex';
    };

    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btnSimpan = document.getElementById('btnSimpanSertif');
            btnSimpan.innerText = "Menyimpan...";
            
            const formData = new FormData(form);
            const dataObj = Object.fromEntries(formData.entries());
            const idData = dataObj.id;
            delete dataObj.id;

            // Bersihkan data kosong
            Object.keys(dataObj).forEach(key => { 
                if (dataObj[key] === "") dataObj[key] = null; 
            });

            if (idData) {
                await supabase.from('sertifikat_pegawai').update(dataObj).eq('id', idData);
            } else {
                await supabase.from('sertifikat_pegawai').insert([dataObj]);
            }
            
            btnSimpan.innerHTML = `<i class="fas fa-save"></i> Simpan Sertifikat`;
            modalForm.style.display = 'none';
            loadData();
        });
    }

    // ==========================================
    // 5. FITUR HAPUS
    // ==========================================
    window.hapusSertif = async (id) => {
        if(confirm('Yakin ingin menghapus sertifikat ini? Data tidak bisa dikembalikan.')) {
            await supabase.from('sertifikat_pegawai').delete().eq('id', id);
            loadData(); 
        }
    };

    if(document.getElementById('btnTutupFormSertif')) {
        document.getElementById('btnTutupFormSertif').onclick = () => modalForm.style.display = 'none';
    }

    // Load data awal
    loadData();
}
