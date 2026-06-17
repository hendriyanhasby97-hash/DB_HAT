import { supabase } from './koneksi.js';

export async function renderSPKRKK(container, userRole = 'user', userNik = '') {
    const isAdmin = (userRole === 'superadmin' || userRole === 'admin');
    
    container.innerHTML = `
        <style>
            .btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; color: white; font-weight: 500; font-size: 0.875rem; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
            .btn:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
            .btn-tambah { background: #0f172a; margin-bottom: 20px; }
            .btn-simpan { background: #10b981; }
            .btn-batal { background: #94a3b8; }
            .btn-view { background: #0ea5e9; padding: 6px 12px; font-size: 0.8rem; }
            .btn-hapus { background: #ef4444; padding: 6px 12px; font-size: 0.8rem; }
            
            .table-container { background: white; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
            table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
            th, td { padding: 14px 20px; text-align: left; border-bottom: 1px solid #f1f5f9; }
            th { background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
            tr:hover { background-color: #f8fafc; }
            
            .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); align-items: center; justify-content: center; z-index: 9999; }
            .modal-content { background: white; padding: 30px; border-radius: 12px; width: 500px; max-width: 90%; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
            .form-group { margin-bottom: 15px; }
            .form-group label { display: block; font-weight: 600; font-size: 0.85rem; color: #475569; margin-bottom: 6px; }
            .form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #f8fafc; font-size: 0.9rem; }
            .form-group input:focus { border-color: #3b82f6; background: white; }
        </style>

        <div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <p style="color: #64748b; margin-top:0;">Manajemen berkas Surat Penugasan Klinis & Rincian Kewenangan Klinis Pegawai.</p>
                <button class="btn btn-tambah" id="btnTambahSPK"><i class="fas fa-plus"></i> Unggah Dokumen Baru</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${isAdmin ? '<th>Pegawai</th>' : ''}
                            <th>No. SPK</th>
                            <th>Tanggal Terbit</th>
                            <th>Tanggal Berakhir</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabelSPK">
                        <tr><td colspan="${isAdmin ? '6' : '5'}" style="text-align:center;">Memuat data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="modal" id="modalSPK">
            <div class="modal-content">
                <h3 style="margin-top:0; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;"><i class="fas fa-file-medical"></i> Form Dokumen SPK & RKK</h3>
                <form id="formSPK">
                    <div class="form-group" id="groupNik" style="display: ${isAdmin ? 'block' : 'none'};">
                        <label>Pilih Pegawai (NIK)</label>
                        <select name="nik" id="spk_nik" ${isAdmin ? 'required' : ''}>
                            <option value="">Pilih Pegawai...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Nomor SPK</label>
                        <input type="text" name="no_spk" required placeholder="Contoh: 123/SPK/RS/2026">
                    </div>
                    <div class="form-group">
                        <label>Tanggal Terbit</label>
                        <input type="date" name="tanggal_terbit" required>
                    </div>
                    <div class="form-group">
                        <label>Tanggal Berakhir</label>
                        <input type="date" name="tanggal_berakhir" required>
                    </div>
                    <div class="form-group">
                        <label>File Dokumen (PDF/Gambar URL)</label>
                        <input type="text" name="file_url" placeholder="http://link-dokumen.com/file.pdf">
                        <p style="font-size:0.75rem; color:#64748b; margin:4px 0 0 0;">*Masukkan tautan berkas digital dokumen Anda.</p>
                    </div>

                    <div style="text-align: right; margin-top: 25px; gap: 10px; display: flex; justify-content: flex-end;">
                        <button type="button" class="btn btn-batal" id="btnBatalSPK">Batal</button>
                        <button type="submit" class="btn btn-simpan" id="btnSimpanSPK"><i class="fas fa-save"></i> Simpan Berkas</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tabel = document.getElementById('tabelSPK');
    const modal = document.getElementById('modalSPK');
    const form = document.getElementById('formSPK');

    if (isAdmin) {
        const { data: listPegawai } = await supabase.from('pegawai').select('nik, nama').order('nama');
        if (listPegawai) {
            document.getElementById('spk_nik').innerHTML = '<option value="">Pilih Pegawai...</option>' +
                listPegawai.map(p => `<option value="${p.nik}">${p.nama} (${p.nik})</option>`).join('');
        }
    }

    async function loadDataSPK() {
        let query = supabase.from('berkas_spkrkk').select('*');
        if (!isAdmin) query = query.eq('nik', userNik);

        const { data, error } = await query.order('id', { ascending: false });
        
        if (error || !data || data.length === 0) {
            tabel.innerHTML = `<tr><td colspan="${isAdmin ? '6' : '5'}" style="text-align:center; color:#64748b;">Belum ada dokumen SPK & RKK terunggah.</td></tr>`;
            return;
        }

        let mapPegawai = {};
        if (isAdmin) {
            const { data: peg } = await supabase.from('pegawai').select('nik, nama');
            if (peg) peg.forEach(p => mapPegawai[p.nik] = p.nama);
        }

        const hariIni = new Date();

        tabel.innerHTML = data.map(row => {
            const tglAkhir = new Date(row.tanggal_berakhir);
            const statusBadge = tglAkhir < hariIni 
                ? '<span style="background:#fee2e2; color:#ef4444; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.75rem;">Expired</span>'
                : '<span style="background:#dcfce7; color:#16a34a; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.75rem;">Aktif</span>';

            return `
                <tr>
                    ${isAdmin ? `<td><b>${mapPegawai[row.nik] || 'Tidak Diketahui'}</b><br><span style="font-size:0.8rem; color:#64748b;">NIK: ${row.nik}</span></td>` : ''}
                    <td><i class="far fa-file-alt" style="color:#64748b;"></i> ${row.no_spk}</td>
                    <td>${row.tanggal_terbit}</td>
                    <td>${row.tanggal_berakhir}</td>
                    <td>${statusBadge}</td>
                    <td>
                        ${row.file_url ? `<a href="${row.file_url}" target="_blank" class="btn btn-view" title="Lihat Berkas"><i class="fas fa-external-link-alt"></i></a>` : '-'}
                        <button class="btn btn-hapus" onclick="hapusSPK(${row.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    document.getElementById('btnTambahSPK').onclick = () => { form.reset(); modal.style.display = 'flex'; };
    document.getElementById('btnBatalSPK').onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const fData = new FormData(form);
        const dataObj = Object.fromEntries(fData.entries());
        
        if (!isAdmin) dataObj.nik = userNik;
        if (!dataObj.nik) return alert("Pilih pegawai terlebih dahulu!");

        const { error } = await supabase.from('berkas_spkrkk').insert([dataObj]);
        if (error) {
            alert("Gagal menyimpan berkas: " + error.message);
        } else {
            alert("Berkas SPK & RKK Berhasil disimpan!");
            modal.style.display = 'none';
            loadDataSPK();
        }
    };

    window.hapusSPK = async (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus arsip dokumen SPK & RKK ini?")) {
            await supabase.from('berkas_spkrkk').delete().eq('id', id);
            loadDataSPK();
        }
    };

    loadDataSPK();
}
