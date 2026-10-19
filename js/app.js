// js/app.js
import { API } from './api.js';
import { CONFIG } from './config.js';

// ==========================================
// STATE MANAGEMENT & DOM ELEMENTS
// ==========================================
const state = {
    currentDate: new Date(),
    selectedGuru: "",
    selectedGuruId: "", 
    allCPs: [],         
    studentsLoaded: false,
    activeDashboardClass: "",
    chartNilaiInstance: null,
    chartKehadiranInstance: null
};

const DOM = {
    navForm: document.getElementById('navForm'),
    navDashboard: document.getElementById('navDashboard'),
    viewForm: document.getElementById('viewForm'),
    viewDashboard: document.getElementById('viewDashboard'),
    btnToggleTheme: document.getElementById('btnToggleTheme'),
    
    toastNotification: document.getElementById('toastNotification'),
    toastMessage: document.getElementById('toastMessage'),
    toastIcon: document.getElementById('toastIcon'),

    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    
    guruGrid: document.getElementById('guruGrid'),
    loadingGuru: document.getElementById('loadingGuru'),
    
    namaGuruDisplay: document.getElementById('namaGuruDisplay'),
    btnGantiGuru: document.getElementById('btnGantiGuru'),
    btnPrevDay: document.getElementById('btnPrevDay'),
    btnNextDay: document.getElementById('btnNextDay'),
    btnOpenCalendar: document.getElementById('btnOpenCalendar'),
    inputDate: document.getElementById('inputDate'),
    currentDateDisplay: document.getElementById('currentDateDisplay'),
    
    kelasSelect: document.getElementById('kelasSelect'),
    semesterSelect: document.getElementById('semesterSelect'),
    produktifSelect: document.getElementById('produktifSelect'), 
    spesialisasiSelect: document.getElementById('spesialisasiSelect'), 
    judulMateri: document.getElementById('judulMateri'),
    elemenCPSelect: document.getElementById('elemenCPSelect'),
    tujuanPembelajaran: document.getElementById('tujuanPembelajaran'),
    radiosJenisSesi: document.getElementsByName('jenisSesi'),
    linkModulWrapper: document.getElementById('linkModulWrapper'),
    linkModul: document.getElementById('linkModul'),
    deskripsiMateri: document.getElementById('deskripsiMateri'),
    btnLanjutEvaluasi: document.getElementById('btnLanjutEvaluasi'),
    
    labelKelasAktif: document.getElementById('labelKelasAktif'),
    loadingSiswa: document.getElementById('loadingSiswa'),
    evaluasiContainer: document.getElementById('evaluasiContainer'),
    tbodySiswa: document.getElementById('tbodySiswa'),
    btnKembaliStep2: document.getElementById('btnKembaliStep2'),
    btnSimpanPermanen: document.getElementById('btnSimpanPermanen'),

    dashboardClassButtons: document.getElementById('dashboardClassButtons'),
    dashboardClassSelectMobile: document.getElementById('dashboardClassSelectMobile'),
    dashboardContent: document.getElementById('dashboardContent'),
    dashboardLoading: document.getElementById('dashboardLoading'),
    metricPertemuan: document.getElementById('metricPertemuan'),
    metricKehadiran: document.getElementById('metricKehadiran'),
    metricNilai: document.getElementById('metricNilai'),
    
    filterDashboardKelas: document.getElementById('filterDashboardKelas'),
    filterDashboardProduktif: document.getElementById('filterDashboardProduktif'),
    filterDashboardSpesialisasi: document.getElementById('filterDashboardSpesialisasi'),
    btnApplyDashboardFilter: document.getElementById('btnApplyDashboardFilter'),
};

// ==========================================
// INISIALISASI
// ==========================================
async function init() {
    setupThemeToggle();
    updateDateDisplay();
    setupEventListeners();
    
    switchMainView('dashboard'); 
    
    await loadTeachers();
    await fetchDashboardClassesOnly(); 
    
    // Dipanggil secara asinkron (tidak memblokir aplikasi)
    loadElemenCPOptions(); 
}

function switchMainView(viewName) {
    DOM.viewForm.classList.add('hidden');
    DOM.viewDashboard.classList.add('hidden');
    DOM.navForm.classList.remove('bg-blue-800');
    DOM.navDashboard.classList.remove('bg-blue-800');

    if (viewName === 'dashboard') {
        DOM.viewDashboard.classList.remove('hidden');
        DOM.navDashboard.classList.add('bg-blue-800');
    } else if (viewName === 'form') {
        DOM.viewForm.classList.remove('hidden');
        DOM.navForm.classList.add('bg-blue-800');
    }
}

function setupThemeToggle() {
    const currentTheme = localStorage.getItem('tkjt_theme');
    if (currentTheme === 'dark') document.body.classList.add('dark-theme');
    DOM.btnToggleTheme.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('tkjt_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
}

function showToast(message, type = 'error') {
    DOM.toastMessage.textContent = message;
    if (type === 'error') {
        DOM.toastNotification.classList.replace('bg-green-600', 'bg-red-600');
        DOM.toastIcon.className = 'fa-solid fa-circle-exclamation mr-3 text-xl';
    } else {
        DOM.toastNotification.classList.replace('bg-red-600', 'bg-green-600');
        DOM.toastIcon.className = 'fa-solid fa-circle-check mr-3 text-xl';
    }
    DOM.toastNotification.classList.remove('translate-y-32', 'opacity-0');
    setTimeout(() => DOM.toastNotification.classList.add('translate-y-32', 'opacity-0'), 3500);
}

function formatDateForDisplay(date) { return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
function formatDateForSystem(date) { return date.toISOString().split('T')[0]; }
function getDraftKey() { return `${CONFIG.STORAGE_PREFIX}${formatDateForSystem(state.currentDate)}_${state.selectedGuru.replace(/\s+/g, '')}`; }

function goToStep(stepNumber) {
    DOM.step1.classList.add('hidden');
    DOM.step2.classList.add('hidden');
    DOM.step3.classList.add('hidden');
    
    if (stepNumber === 1) {
        DOM.step1.classList.remove('hidden');
        state.selectedGuru = ""; 
        state.selectedGuruId = "";
    } else if (stepNumber === 2) {
        DOM.step2.classList.remove('hidden');
        window.scrollTo(0, 0);
    } else if (stepNumber === 3) {
        DOM.step3.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
}

async function loadTeachers() {
    const response = await API.getTeachers();
    DOM.loadingGuru.classList.add('hidden');
    DOM.guruGrid.classList.remove('hidden');

    if (response.status === 'success') {
        let html = '';
        response.data.forEach(guru => {
            html += `
                <button type="button" data-id="${guru.id_guru}" data-nama="${guru.nama_guru}" class="btn-pilih-guru bg-white border border-slate-200 p-5 rounded-xl text-center shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col items-center justify-center space-y-3">
                    <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <i class="fa-solid fa-chalkboard-user"></i>
                    </div>
                    <span class="font-bold text-slate-700 text-sm md:text-base">${guru.nama_guru}</span>
                </button>
            `;
        });
        DOM.guruGrid.innerHTML = html;

        document.querySelectorAll('.btn-pilih-guru').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const el = e.currentTarget;
                selectGuru(el.getAttribute('data-id'), el.getAttribute('data-nama'));
            });
        });
    }
}

// DIPERBARUI: Menggunakan CACHE agar pemuatan instan, lalu perbarui di latar belakang
async function loadElemenCPOptions() {
    // 1. Coba ambil dari Cache LocalStorage
    const cachedCP = localStorage.getItem('tkjt_cp_cache');
    if (cachedCP) {
        try {
            state.allCPs = JSON.parse(cachedCP);
            if (state.selectedGuru) renderCPDropdown(); // Jika user sedang di Form Step 2
        } catch (e) { console.error("Cache CP Error", e); }
    } else {
        DOM.elemenCPSelect.innerHTML = '<option value="">Memuat Elemen CP dari server...</option>';
    }

    // 2. Tarik update terbaru di background tanpa memblokir aplikasi
    try {
        const response = await API.getElemenCP();
        if (response.status === 'success' && response.data) {
            state.allCPs = response.data; 
            localStorage.setItem('tkjt_cp_cache', JSON.stringify(response.data));
            
            // Perbarui UI jika form sedang terbuka agar selalu up-to-date
            if (state.selectedGuru) {
                renderCPDropdown();
                restoreDraft(); // pastikan CP yang terpilih sebelumnya tidak hilang
            }
        }
    } catch(e) {
        console.error("Gagal sinkronisasi CP di latar belakang:", e);
    }
}

function renderCPDropdown() {
    let prefix = "";
    const idGuru = String(state.selectedGuruId);
    
    if (idGuru === "24050667") prefix = "NE";       
    else if (idGuru === "25090887") prefix = "SE";  
    else if (idGuru === "26062994") prefix = "DKV"; 

    let filteredCPs = state.allCPs;
    if (prefix) {
        filteredCPs = state.allCPs.filter(cp => String(cp.id_cp).startsWith(prefix));
    }

    let html = '<option value="">-- Pilih Elemen CP --</option>';
    filteredCPs.forEach(cp => {
        html += `<option value="${cp.elemen_cp}">[${cp.id_cp}] ${cp.elemen_cp}</option>`;
    });
    
    DOM.elemenCPSelect.innerHTML = html;
}

function selectGuru(id, nama) {
    state.selectedGuruId = id;
    state.selectedGuru = nama;
    DOM.namaGuruDisplay.textContent = nama;
    
    renderCPDropdown(); 
    restoreDraft(); 
    goToStep(2);
}

function updateDateDisplay() {
    DOM.currentDateDisplay.textContent = formatDateForDisplay(state.currentDate);
    DOM.inputDate.value = formatDateForSystem(state.currentDate);
    if (state.selectedGuru) restoreDraft(); 
}

async function proceedToStep3() {
    if (!DOM.kelasSelect.value) return showToast("Pilih Kelas terlebih dahulu!");
    if (!DOM.judulMateri.value) return showToast("Judul Materi tidak boleh kosong!");
    if (!DOM.elemenCPSelect.value) return showToast("Elemen Capaian Pembelajaran wajib dipilih!");
    if (!DOM.tujuanPembelajaran.value) return showToast("Tujuan Pembelajaran wajib diisi!");

    const kelas = DOM.kelasSelect.value;
    const prod = DOM.produktifSelect.value;
    const spec = DOM.spesialisasiSelect.value;
    
    let labelText = kelas;
    if(prod) labelText += ` | Grup ${prod}`;
    if(spec) labelText += ` | Spesialisasi ${spec}`;
    
    DOM.labelKelasAktif.textContent = labelText;
    goToStep(3); 

    DOM.tbodySiswa.innerHTML = '';
    DOM.loadingSiswa.classList.remove('hidden');
    DOM.evaluasiContainer.classList.add('hidden');

    const response = await API.getStudentsByClass(kelas, prod, spec);
    DOM.loadingSiswa.classList.add('hidden');
    DOM.evaluasiContainer.classList.remove('hidden');

    if (response.status === 'success') {
        renderStudentTable(response.data);
        restoreEvaluasiDraft(); 
    }
}

function renderStudentTable(students) {
    let html = '';
    students.forEach((siswa, index) => {
        html += `
            <tr class="block md:table-row bg-white md:bg-transparent border border-slate-200 md:border-none rounded-xl mb-4 md:mb-0 p-4 md:p-0 shadow-sm md:shadow-none hover:bg-slate-50 transition" data-idsiswa="${siswa.id_siswa}">
                <td class="block md:table-cell p-0 md:p-4 mb-3 md:mb-0 font-bold md:font-medium text-slate-800 text-base md:text-sm border-b border-slate-100 md:border-none pb-2 md:pb-0 align-middle">
                    ${index + 1}. ${siswa.nama_siswa}
                </td>
                <td class="block md:table-cell p-0 md:p-4 mb-4 md:mb-0 align-middle">
                    <span class="block text-xs font-semibold text-slate-500 mb-2 md:hidden">Status Kehadiran</span>
                    <div class="flex flex-wrap gap-2 md:justify-center">
                        ${['H', 'S', 'I', 'A', 'PKL'].map(status => `
                            <label>
                                <input type="radio" name="hadir_${siswa.id_siswa}" value="${status}" class="radio-kehadiran input-draft" ${status==='H'?'checked':''}>
                                <span class="label-kehadiran text-[0.7rem] flex items-center justify-center">${status}</span>
                            </label>
                        `).join('')}
                    </div>
                </td>
                <td class="block md:table-cell p-0 md:p-4 mb-3 md:mb-0 align-middle">
                    <span class="block text-xs font-semibold text-slate-500 mb-1 md:hidden">Nilai (Opsional)</span>
                    <input type="number" name="nilai_${siswa.id_siswa}" class="input-draft w-full border border-slate-300 bg-transparent rounded-lg p-2.5 md:p-2 text-left md:text-center focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="-">
                </td>
                <td class="block md:table-cell p-0 md:p-4 align-middle">
                    <span class="block text-xs font-semibold text-slate-500 mb-1 md:hidden">Catatan Khusus</span>
                    <input type="text" name="catatan_${siswa.id_siswa}" class="input-draft w-full border border-slate-300 bg-transparent rounded-lg p-2.5 md:p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" placeholder="Catatan insiden/prestasi...">
                </td>
            </tr>
        `;
    });
    DOM.tbodySiswa.innerHTML = html;
    state.studentsLoaded = true;

    document.querySelectorAll('.input-draft').forEach(input => {
        input.addEventListener('change', saveDraft);
        if(input.type === 'text' || input.type === 'number') input.addEventListener('input', saveDraft);
    });
}

function saveDraft() {
    if (!state.selectedGuru) return;
    const draft = {
        kelas: DOM.kelasSelect.value,
        semester: DOM.semesterSelect.value,
        produktif: DOM.produktifSelect.value, 
        spesialisasi: DOM.spesialisasiSelect.value, 
        judul: DOM.judulMateri.value,
        cp: DOM.elemenCPSelect.value,
        tp: DOM.tujuanPembelajaran.value,
        jenis_sesi: Array.from(DOM.radiosJenisSesi).find(r => r.checked).value,
        link_modul: DOM.linkModul.value,
        deskripsi: DOM.deskripsiMateri.value,
        evaluasi: state.studentsLoaded ? gatherEvaluasiData() : []
    };
    localStorage.setItem(getDraftKey(), JSON.stringify(draft));
}

function restoreDraft() {
    const draftStr = localStorage.getItem(getDraftKey());
    if (draftStr) {
        const draft = JSON.parse(draftStr);
        DOM.kelasSelect.value = draft.kelas || "";
        DOM.semesterSelect.value = draft.semester || "1";
        DOM.produktifSelect.value = draft.produktif || ""; 
        DOM.spesialisasiSelect.value = draft.spesialisasi || ""; 
        DOM.judulMateri.value = draft.judul || "";
        DOM.elemenCPSelect.value = draft.cp || ""; 
        DOM.tujuanPembelajaran.value = draft.tp || "";
        DOM.deskripsiMateri.value = draft.deskripsi || "";
        DOM.linkModul.value = draft.link_modul || "";
        if(draft.jenis_sesi) {
            const radioSesi = document.querySelector(`input[name="jenisSesi"][value="${draft.jenis_sesi}"]`);
            if (radioSesi) radioSesi.checked = true;
        }
    }
}

function restoreEvaluasiDraft() {
    const draftStr = localStorage.getItem(getDraftKey());
    if (!draftStr) return;
    const draft = JSON.parse(draftStr);
    if (draft.evaluasi && draft.evaluasi.length > 0) {
        draft.evaluasi.forEach(ev => {
            const radio = document.querySelector(`input[name="hadir_${ev.id_siswa}"][value="${ev.kehadiran}"]`);
            if (radio) radio.checked = true;
            const inputNilai = document.querySelector(`input[name="nilai_${ev.id_siswa}"]`);
            if (inputNilai) inputNilai.value = ev.nilai;
            const inputCatatan = document.querySelector(`input[name="catatan_${ev.id_siswa}"]`);
            if (inputCatatan) inputCatatan.value = ev.catatan_khusus;
        });
    }
}

function gatherEvaluasiData() {
    const evaluasi = [];
    DOM.tbodySiswa.querySelectorAll('tr[data-idsiswa]').forEach(row => {
        const idSiswa = row.dataset.idsiswa;
        evaluasi.push({
            id_siswa: idSiswa,
            kehadiran: row.querySelector(`input[name="hadir_${idSiswa}"]:checked`).value,
            nilai: row.querySelector(`input[name="nilai_${idSiswa}"]`).value,
            catatan_khusus: row.querySelector(`input[name="catatan_${idSiswa}"]`).value
        });
    });
    return evaluasi;
}

async function submitData() {
    const evaluasi = gatherEvaluasiData();
    if (evaluasi.length === 0) return showToast("Data evaluasi siswa kosong!");

    const payload = {
        tanggal: formatDateForSystem(state.currentDate),
        nama_guru: state.selectedGuru,
        id_guru: state.selectedGuruId,
        kelas: DOM.kelasSelect.value, 
        judul_materi: DOM.judulMateri.value,
        deskripsi_materi: DOM.deskripsiMateri.value,
        semester: DOM.semesterSelect.value,
        id_cp: DOM.elemenCPSelect.options[DOM.elemenCPSelect.selectedIndex].text.match(/\[(.*?)\]/)?.[1] || "",
        elemen_cp: DOM.elemenCPSelect.value,
        tujuan_pembelajaran: DOM.tujuanPembelajaran.value,
        jenis_sesi: Array.from(DOM.radiosJenisSesi).find(r => r.checked).value,
        link_modul: DOM.linkModul.value,
        evaluasi: evaluasi
    };

    const originalBtnText = DOM.btnSimpanPermanen.innerHTML;
    DOM.btnSimpanPermanen.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Mengirim Data...';
    DOM.btnSimpanPermanen.disabled = true;

    const response = await API.saveAgenda(payload);

    DOM.btnSimpanPermanen.innerHTML = originalBtnText;
    DOM.btnSimpanPermanen.disabled = false;

    if (response.status === 'success') {
        showToast("Data Agenda & Evaluasi berhasil disimpan!", "success");
        localStorage.removeItem(getDraftKey()); 
        setTimeout(() => window.location.reload(), 2000); 
    } else {
        showToast("GAGAL: " + response.message, "error");
    }
}

// ==========================================
// DASHBOARD & EXPORT DENGAN FILTER 3 TINGKAT
// ==========================================

const dashboardCache = {};

async function fetchDashboardClassesOnly() {
    const response = await API.getDashboardData(); 
    if (response.status === 'success' && response.data.classes) {
        const classes = response.data.classes;
        let htmlOptions = `<option value="">-- Pilih Kelas Terlebih Dahulu --</option>`;
        classes.forEach(cls => {
            htmlOptions += `<option value="${cls}">${cls}</option>`;
        });
        DOM.filterDashboardKelas.innerHTML = htmlOptions;
    }
}

window.applyDashboardFilter = async function() {
    const kelas = DOM.filterDashboardKelas.value;
    const prod = DOM.filterDashboardProduktif.value;
    const spec = DOM.filterDashboardSpesialisasi.value;

    if (!kelas) {
        showToast("Filter Kelas wajib dipilih!", "error");
        return;
    }

    const cacheKey = `${kelas}_${prod}_${spec}`;

    if (dashboardCache[cacheKey]) {
        updateDashboardUI(dashboardCache[cacheKey]);
        loadDashboardStudentList(kelas, prod, spec); 
        return;
    }

    DOM.dashboardContent.classList.add('hidden');
    DOM.dashboardLoading.classList.remove('hidden');

    const response = await API.getDashboardData(kelas, prod, spec);
    
    DOM.dashboardLoading.classList.add('hidden');

    if (response.status === 'success') {
        dashboardCache[cacheKey] = response.data;
        updateDashboardUI(response.data);
        loadDashboardStudentList(kelas, prod, spec); 
    } else {
        showToast("Gagal memuat analitik kelas.", "error");
    }
}

function updateDashboardUI(data) {
    const { metrics, timeline, chart_nilai, chart_kehadiran } = data;
    DOM.metricPertemuan.textContent = metrics.total_pertemuan;
    DOM.metricKehadiran.textContent = `${metrics.rata_kehadiran}%`;
    DOM.metricNilai.textContent = metrics.rata_nilai;
    renderDashboardCharts(timeline, chart_nilai, chart_kehadiran);
    DOM.dashboardContent.classList.remove('hidden');
}

function renderDashboardCharts(timeline, nilaiData, kehadiranData) {
    if (state.chartNilaiInstance) state.chartNilaiInstance.destroy();
    if (state.chartKehadiranInstance) state.chartKehadiranInstance.destroy();

    const ctxNilai = document.getElementById('chartNilai').getContext('2d');
    state.chartNilaiInstance = new Chart(ctxNilai, {
        type: 'line',
        data: {
            labels: timeline.length > 0 ? timeline : ['Belum ada data'],
            datasets: [{
                label: 'Rata-rata Nilai',
                data: nilaiData.length > 0 ? nilaiData : [0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    const ctxKehadiran = document.getElementById('chartKehadiran').getContext('2d');
    state.chartKehadiranInstance = new Chart(ctxKehadiran, {
        type: 'doughnut',
        data: {
            labels: ['Hadir (H)', 'Sakit (S)', 'Izin (I)', 'Alpha (A)', 'PKL'],
            datasets: [{
                data: [
                    kehadiranData.H || 0,
                    kehadiranData.S || 0,
                    kehadiranData.I || 0,
                    kehadiranData.A || 0,
                    kehadiranData.PKL || 0
                ],
                backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#9333ea']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
}

function setupEventListeners() {
    DOM.navForm.addEventListener('click', () => {
        switchMainView('form');
        if (!state.selectedGuru) goToStep(1);
    });

    DOM.navDashboard.addEventListener('click', () => {
        switchMainView('dashboard');
    });

    DOM.btnApplyDashboardFilter.addEventListener('click', window.applyDashboardFilter);

    DOM.btnGantiGuru.addEventListener('click', () => goToStep(1));
    DOM.btnLanjutEvaluasi.addEventListener('click', proceedToStep3);
    DOM.btnKembaliStep2.addEventListener('click', () => goToStep(2));
    DOM.btnSimpanPermanen.addEventListener('click', submitData);

    DOM.btnPrevDay.addEventListener('click', () => { state.currentDate.setDate(state.currentDate.getDate() - 1); updateDateDisplay(); });
    DOM.btnNextDay.addEventListener('click', () => { state.currentDate.setDate(state.currentDate.getDate() + 1); updateDateDisplay(); });
    DOM.btnOpenCalendar.addEventListener('click', () => DOM.inputDate.showPicker());
    DOM.inputDate.addEventListener('change', (e) => { state.currentDate = new Date(e.target.value); updateDateDisplay(); });
    
    const inputsToSave = [
        DOM.kelasSelect, DOM.semesterSelect, DOM.produktifSelect, DOM.spesialisasiSelect,
        DOM.judulMateri, DOM.elemenCPSelect, DOM.tujuanPembelajaran, 
        DOM.deskripsiMateri, DOM.linkModul
    ];
    
    inputsToSave.forEach(input => {
        input.addEventListener('change', saveDraft);
        if(input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
            input.addEventListener('input', saveDraft);
        }
    });
}

async function loadDashboardStudentList(kelas, prod, spec) {
    const section = document.getElementById('studentListSection');
    const tbody = document.getElementById('tbodyDashboardSiswa');
    const btnExport = document.getElementById('btnExportExcel');
    
    let labelText = kelas;
    if(prod) labelText += ` | Grup ${prod}`;
    if(spec) labelText += ` | Spesialisasi ${spec}`;
    document.getElementById('lblDetailKelas').textContent = labelText;
    
    tbody.innerHTML = `<tr><td colspan="3" class="text-center py-6 text-slate-500"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat daftar siswa...</td></tr>`;
    if(section) section.classList.remove('hidden');
    if(btnExport) btnExport.classList.add('hidden');

    const response = await API.getStudentsByClass(kelas, prod, spec);
    if (response.status === 'success') {
        let html = '';
        response.data.forEach((siswa, index) => {
            const safeName = siswa.nama_siswa.replace(/'/g, "\\'");
            html += `
                <tr class="hover:bg-blue-50 transition">
                    <td class="p-4 text-center font-medium text-slate-700">${index + 1}</td>
                    <td class="p-4 font-semibold text-slate-800">${siswa.nama_siswa}</td>
                    <td class="p-4 text-center">
                        <button onclick="window.openStudentHistory('${siswa.id_siswa}', '${safeName}', '${kelas}', '${prod}', '${spec}')" class="px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition">
                            Lihat Detail
                        </button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html || `<tr><td colspan="3" class="text-center py-4 text-slate-500">Tidak ada data siswa untuk filter ini.</td></tr>`;
        
        if (response.data.length > 0 && btnExport) {
            btnExport.classList.remove('hidden');
            btnExport.setAttribute('data-kelas', kelas);
            btnExport.setAttribute('data-prod', prod);
            btnExport.setAttribute('data-spec', spec);
        }
    } else {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-red-500">Gagal memuat daftar siswa.</td></tr>`;
    }
}

window.openStudentHistory = async function(idSiswa, namaSiswa, kelas, prod, spec) {
    document.getElementById('modalStudentName').textContent = namaSiswa;
    document.getElementById('historyContent').innerHTML = '';
    document.getElementById('loadingHistory').classList.remove('hidden');
    document.getElementById('modalHistory').classList.remove('hidden');

    const response = await API.getStudentHistory(idSiswa, kelas);
    document.getElementById('loadingHistory').classList.add('hidden');

    if (response.status === 'success') {
        if (response.data.length === 0) {
            document.getElementById('historyContent').innerHTML = `<div class="text-center py-8 text-slate-500 italic">Belum ada riwayat pertemuan untuk kelas ini.</div>`;
            return;
        }

        let html = '';
        response.data.forEach(item => {
            let formattedDate = item.tanggal;
            try {
                const d = new Date(item.tanggal);
                if(!isNaN(d.getTime())) {
                    formattedDate = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
                }
            } catch(e) {}
            
            let badgeWarna = "bg-green-100 text-green-700 border-green-200";
            if (item.kehadiran === 'S') badgeWarna = "bg-blue-100 text-blue-700 border-blue-200";
            if (item.kehadiran === 'I') badgeWarna = "bg-yellow-100 text-yellow-700 border-yellow-200";
            if (item.kehadiran === 'A') badgeWarna = "bg-red-100 text-red-700 border-red-200";
            if (item.kehadiran === 'PKL') badgeWarna = "bg-purple-100 text-purple-700 border-purple-200";

            const statusOptions = ['H', 'S', 'I', 'A', 'PKL'].map(opt => 
                `<option value="${opt}" ${item.kehadiran === opt ? 'selected' : ''}>${opt}</option>`
            ).join('');

            html += `
                <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                    <div class="flex-1">
                        <div class="text-xs text-slate-500 font-semibold mb-1"><i class="fa-regular fa-calendar mr-1"></i> ${formattedDate}</div>
                        <div class="font-bold text-slate-800 text-sm mb-2">${item.judul_materi}</div>
                        <div class="flex flex-wrap gap-2 text-xs mb-2">
                            <span class="px-2 py-1 rounded-md font-bold border ${badgeWarna}">Tersimpan: ${item.kehadiran}</span>
                            ${item.nilai ? `<span class="px-2 py-1 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200"><i class="fa-solid fa-star text-yellow-500 mr-1"></i> Nilai: ${item.nilai}</span>` : ''}
                        </div>
                        ${item.catatan ? `<div class="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 break-words"><i class="fa-solid fa-note-sticky mr-1 text-slate-400"></i> ${item.catatan}</div>` : ''}
                    </div>
                    
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-100 flex flex-col shrink-0 w-full md:w-64">
                        <span class="text-[11px] font-bold text-blue-700 mb-2 flex items-center"><i class="fa-solid fa-pen-to-square mr-1"></i> Edit Evaluasi & Nilai</span>
                        <div class="flex flex-col gap-2">
                            <select id="status_${item.id_agenda}" class="w-full text-sm border-slate-300 rounded-md shadow-sm p-1.5 focus:ring-blue-500 outline-none border bg-white font-medium text-slate-700">
                                ${statusOptions}
                            </select>
                            <div class="flex gap-2">
                                <input type="number" id="susulan_${item.id_agenda}" placeholder="Nilai (0-100)" value="${item.nilai || ''}" class="w-full text-sm border-slate-300 rounded-md shadow-sm p-1.5 focus:ring-blue-500 outline-none border">
                                <button onclick="window.saveEvaluasiDetail(event, '${item.id_agenda}', '${idSiswa}', '${item.tanggal}', '${namaSiswa.replace(/'/g, "\\'")}', '${kelas}', '${prod}', '${spec}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition shadow-sm">
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        document.getElementById('historyContent').innerHTML = html;
    } else {
        document.getElementById('historyContent').innerHTML = `<div class="text-center py-8 text-red-500">Gagal memuat riwayat.</div>`;
    }
};

window.saveEvaluasiDetail = async function(event, idAgenda, idSiswa, tanggal, namaSiswa, kelas, prod, spec) {
    const inputVal = document.getElementById(`susulan_${idAgenda}`).value;
    const statusVal = document.getElementById(`status_${idAgenda}`).value;

    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
    btn.disabled = true;

    const response = await API.updateStudentEvaluasi({
        id_agenda: idAgenda,
        id_siswa: idSiswa,
        kehadiran: statusVal,
        nilai: inputVal,
        tanggal_agenda: tanggal
    });
    
    if (response.status === 'success') {
        showToast("Pembaruan berhasil disimpan!", "success");
        
        const cacheKey = `${kelas}_${prod}_${spec}`;
        delete dashboardCache[cacheKey];
        
        window.openStudentHistory(idSiswa, namaSiswa, kelas, prod, spec); 
        window.applyDashboardFilter(); 
    } else {
        showToast("Gagal menyimpan: " + response.message, "error");
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

window.exportClassData = async function() {
    const btn = document.getElementById('btnExportExcel');
    const kelas = btn.getAttribute('data-kelas');
    const prod = btn.getAttribute('data-prod') || "";
    const spec = btn.getAttribute('data-spec') || "";
    
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i> Menyiapkan...`;
    btn.disabled = true;

    const response = await API.exportClassData(kelas, prod, spec);
    
    if(response.status === 'success') {
        const data = response.data;
        if(data.length === 0) {
            showToast("Belum ada data evaluasi untuk diexport", "error");
        } else {
            const headers = ["ID_Siswa", "Nama_Siswa", "Tanggal", "Judul_Materi", "Kehadiran", "Nilai", "Catatan_Khusus"];
            const csvRows = [];
            csvRows.push(headers.join(","));

            data.forEach(row => {
                const values = [
                    `"${row.id_siswa}"`,
                    `"${row.nama_siswa}"`,
                    `"${row.tanggal}"`,
                    `"${row.judul_materi}"`,
                    `"${row.kehadiran}"`,
                    `"${row.nilai || ''}"`,
                    `"${(row.catatan || '').replace(/"/g, '""')}"` 
                ];
                csvRows.push(values.join(","));
            });

            const csvString = csvRows.join("\n");
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Rekap_Evaluasi_${kelas.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } else {
        showToast("Gagal menarik data export", "error");
    }

    btn.innerHTML = originalHTML;
    btn.disabled = false;
};

document.addEventListener('DOMContentLoaded', init);