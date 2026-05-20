/**
 * RIWAYAT-PANGKAT.JS
 * Modul untuk manajemen Riwayat Kepangkatan Pegawai
 */

// 1. RENDER TABEL RIWAYAT DI DALAM MODAL DETAIL
async function renderRiwayatPangkat(idPegawai) {
    const container = document.getElementById('area-tabel-riwayat');
    if (!container) return;

    container.innerHTML = `<div class="p-4 text-center text-xs text-gray-400"><i class="fa-solid fa-spinner fa-spin"></i> Memuat riwayat...</div>`;

    const { data, error } = await window.supabase
        .from('riwayat_pangkat')
        .select('*')
        .eq('id_pegawai', idPegawai)
        .order('tmt_pangkat', { ascending: false });

    if (error) {
        container.innerHTML = `<p class="text-xs text-rose-500 p-4">Gagal memuat riwayat.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="mt-4 border-t pt-4">
            <div class="flex justify-between items-center mb-3">
                <h4 class="text-[10px] font-black text-slate-500 uppercase">Riwayat Kepangkatan</h4>
                <button onclick="bukaModalRiwayat('${idPegawai}')" class="text-[10px] bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    <i class="fa-solid fa-plus mr-1"></i>Tambah
                </button>
            </div>
            <div class="overflow-hidden border rounded-lg">
                <table class="w-full text-xs">
                    <thead class="bg-slate-50 border-b">
                        <tr>
                            <th class="p-2 text-left">Pangkat/Golongan</th>
                            <th class="p-2 text-left">TMT</th>
                            <th class="p-2 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${data.length > 0 ? data.map(item => `
                            <tr>
                                <td class="p-2 font-bold">${item.pangkat || '-'}</td>
                                <td class="p-2">${item.tmt_pangkat || '-'}</td>
                                <td class="p-2 text-center">
                                    <button onclick="hapusRiwayatPangkat('${item.id}', '${idPegawai}')" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-trash-can"></i></button>
                                </td>
                            </tr>
                        `).join('') : `<tr><td colspan="3" class="p-3 text-center text-gray-400 italic">Belum ada data riwayat</td></tr>`}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// 2. MODAL RIWAYAT
function bukaModalRiwayat(idPegawai) {
    document.getElementById('form-riwayat-id-pegawai').value = idPegawai;
    document.getElementById('modal-riwayat-pangkat').classList.remove('hidden');
}

// 3. SIMPAN RIWAYAT
async function simpanRiwayatPangkat(event) {
    event.preventDefault();
    const idPegawai = document.getElementById('form-riwayat-id-pegawai').value;
    
    const payload = {
        id_pegawai: idPegawai,
        pangkat: document.getElementById('form-riwayat-pangkat').value,
        tmt_pangkat: document.getElementById('form-riwayat-tmt').value
    };

    const { error } = await window.supabase.from('riwayat_pangkat').insert([payload]);
    
    if (error) {
        alert("Gagal simpan: " + error.message);
    } else {
        document.getElementById('modal-riwayat-pangkat').classList.add('hidden');
        renderRiwayatPangkat(idPegawai); // Refresh tabel
    }
}

// 4. HAPUS RIWAYAT
async function hapusRiwayatPangkat(idRiwayat, idPegawai) {
    if (!confirm("Hapus data riwayat pangkat ini?")) return;
    
    await window.supabase.from('riwayat_pangkat').delete().eq('id', idRiwayat);
    renderRiwayatPangkat(idPegawai);
}

// EKSPOR GLOBAL
window.renderRiwayatPangkat = renderRiwayatPangkat;
window.bukaModalRiwayat = bukaModalRiwayat;
window.simpanRiwayatPangkat = simpanRiwayatPangkat;
window.hapusRiwayatPangkat = hapusRiwayatPangkat;
