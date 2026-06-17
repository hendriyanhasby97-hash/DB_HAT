import { supabase } from './koneksi.js';

export async function renderOPPE(container, userRole = 'user', userNik = '') {
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
        </style>

        <div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <p style="color: #64748b; margin-top:0;">Evaluasi Praktik Profesional Berkelanjutan (Ongoing Professional Practice Evaluation) Tenaga Medis.</p>
                <button class="btn btn-tambah" id="btnTambahOPPE"><i class="fas fa-plus"></i> Input Hasil OPPE</button>
            </div>

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            ${isAdmin ? '<th>Pegawai</th>' : ''}
                            <th>Tahun</th>
                            <th>Nilai ABC</th>
                            <th>Nilai Rata-rata</th>
                            <th>Kesimpulan Akhir</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabelOPPE">
                        <tr><td colspan="${isAdmin ? '6' : '5'}" style="text-align:center;">Memuat data...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="modal" id="modalOPPE">
            <div class="modal-content">
                <h3 style="margin-top:0; margin-bottom:20px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;"><i class="fas fa-poll"></i> Form Hasil Evaluasi OPPE</h3>
                <form id="formOPPE">
                    <div class="form-group" id="oppeGroupNik" style="display: ${isAdmin ? 'block' : 'none'};">
                        <label>Pilih Karyawan (NIK)</label>
                        <select name="nik" id="oppe_nik" ${isAdmin ? 'required' : ''}>
                            <option value="">Pilih Pegawai...</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Tahun Penilaian</label>
                        <input type="number" name="tahun" required placeholder="Contoh: 2026" value="${new Date().getFullYear()}">
                    </div>
                    <div class="form-group">
                        <label>Nilai ABC</label>
                        <select name="nilai_abc" required>
                            <option value="" hidden>Pilih Nilai...</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Nilai Rata-rata</label>
                        <input type="text" name="nilai_ratarata" required placeholder="Contoh: 85.5">
                    </div>
                    <div class="form-group">
                        <label>Rekomendasi / Kesimpulan</label>
                        <select name="kesimpulan" required>
                            <option value="" hidden>Pilih Kesimpulan...</option>
                            <option value="Direkomendasikan">Direkomendasikan Penuh</option>
                            <option value="Direkomendasikan dengan Pembinaan">Direkomendasikan dengan Pembinaan</option>
                            <option value="Tidak Direkomendasikan">Tidak Direkomendasikan</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tautan Link Dokumen PDF Evaluasi (Opsional)</label>
                        <input type="text" name="file_url" placeholder="http://link-dokumen.com/oppe.pdf">
                    </div>

                    <div style="text-align: right; margin-top: 25px; gap: 10px; display: flex; justify-content: flex-end;">
                        <button type="button" class="btn btn-batal" id="btnBatalOPPE">Batal</button>
                        <button type="submit" class="btn btn-simpan" id="btnSimpanOPPE"><i class="fas fa-save"></i> Simpan Penilaian</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tabel = document.getElementById('tabelOPPE');
    const modal = document.getElementById('modalOPPE');
    const form = document.getElementById('formOPPE');

    if (isAdmin) {
        const { data: listPegawai } = await supabase.from('pegawai').select('nik, nama').order('nama');
        if (listPegawai) {
            document.getElementById('oppe_nik').innerHTML = '<option value="">Pilih Karyawan...</option>' +
                listPegawai.map(p => `<option value="${p.nik}">${p.nama} (${p.nik})</option>`).join('');
        }
    }

    async function loadDataOPPE() {
        let query = supabase.from('berkas_oppe').select('*');
        if (!isAdmin) query = query.eq('nik', userNik);

        const { data, error } = await query.order('tahun', { ascending: false });
        
        if (error || !data || data.length === 0) {
            tabel.innerHTML = `<tr><td colspan="${isAdmin ? '6' : '5'}" style="text-align:center; color:#64748b;">Belum ada riwayat penilaian OPPE.</td></tr>`;
            return;
        }

        let mapPegawai = {};
        if (isAdmin) {
            const { data: peg } = await supabase.from('pegawai').select('nik, nama');
            if (peg) peg.forEach(p => mapPegawai[p.nik] = p.nama);
        }

        tabel.innerHTML = data.map(row => {
            let colorKomp = row.kesimpulan === 'Direkomendasikan' ? '#16a34a' : (row.kesimpulan.includes('Pembinaan') ? '#f59e0b' : '#ef4444');
            
            return `
                <tr>
                    ${isAdmin ? `<td><b>${mapPegawai[row.nik] || 'Tidak Diketahui'}</b><br><span style="font-size:0.8rem; color:#64748b;">NIK: ${row.nik}</span></td>` : ''}
                    <td><strong>${row.tahun}</strong></td>
                    <td><span class="fas fa-font" style="color:#64748b;"></span> ${row.nilai_abc || '-'}</td>
                    <td><span class="fas fa-calculator" style="color:#64748b;"></span> ${row.nilai_ratarata || '-'}</td>
                    <td style="color:${colorKomp}; font-weight:700;"><i class="fas fa-info-circle"></i> ${row.kesimpulan || '-'}</td>
                    <td>
                        ${row.file_url ? `<a href="${row.file_url}" target="_blank" class="btn btn-view" title="Unduh Berkas"><i class="fas fa-download"></i></a>` : '-'}
                        <button class="btn btn-hapus" onclick="hapusOPPE(${row.id})" title="Hapus"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    document.getElementById('btnTambahOPPE').onclick = () => { form.reset(); modal.style.display = 'flex'; };
    document.getElementById('btnBatalOPPE').onclick = () => modal.style.display = 'none';

    form.onsubmit = async (e) => {
        e.preventDefault();
        const fData = new FormData(form);
        const dataObj = Object.fromEntries(fData.entries());
        
        if (!isAdmin) dataObj.nik = userNik;
        if (!dataObj.nik) return alert("Pilih pegawai terlebih dahulu!");

        const { error } = await supabase.from('berkas_oppe').insert([dataObj]);
        if (error) {
            alert("Gagal menyimpan OPPE: " + error.message);
        } else {
            alert("Hasil Evaluasi OPPE berhasil diarsipkan!");
            modal.style.display = 'none';
            loadDataOPPE();
        }
    };

    window.hapusOPPE = async (id) => {
        if (confirm("Hapus berkas evaluasi OPPE ini?")) {
            await supabase.from('berkas_oppe').delete().eq('id', id);
            loadDataOPPE();
        }
    };

    loadDataOPPE();
}
