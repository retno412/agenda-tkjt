// js/app.js
import { API } from './api.js';
import { CONFIG } from './config.js';

// ==========================================
// STATE MANAGEMENT & DOM ELEMENTS
// ==========================================
const state = {
    currentDate: new Date(),
    selectedGuru: "",
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
    metricNilai: document.getElementById('metricNilai')
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
    await loadDashboardClasses();
    await loadElemenCPOptions();
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
                <button type="button" data-nama="${guru.nama_guru}" class="btn-pilih-guru bg-white border border-slate-200 p-5 rounded-xl text-center shadow-sm hover:border-blue-500 hover:shadow-md transition flex flex-col items-center justify-center space-y-3">
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
                selectGuru(e.currentTarget.getAttribute('data-nama'));
            });
        });
    }
}

async function loadElemenCPOptions() {
    const response = await API.getElemenCP();
    if (response.status === 'success' && response.data) {
        let html = '<option value="">-- Pilih Elemen CP --</option>';
        response.data.forEach(cp => {
            html += `<option value="${cp}">${cp}</option>`;
        });
        DOM.elemenCPSelect.innerHTML = html;
        restoreDraft(); 
    } else {
        DOM.elemenCPSelect.innerHTML = '<option value="">Gagal memuat Elemen CP</option>';
    }
}

function selectGuru(nama) {
    state.selectedGuru = nama;
    DOM.namaGuruDisplay.textContent = nama;
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
    DOM.labelKelasAktif.textContent = kelas;
    goToStep(3); 

    DOM.tbodySiswa.innerHTML = '';
    DOM.loadingSiswa.classList.remove('hidden');
    DOM.evaluasiContainer.classList.add('hidden');

    const response = await API.getStudentsByClass(kelas);
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
        kelas: DOM.kelasSelect.value,
        judul_materi: DOM.judulMateri.value,
        deskripsi_materi: DOM.deskripsiMateri.value,
        semester: DOM.semesterSelect.value,
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

async function loadDashboardClasses() {
    const response = await API.getDashboardData(); 
    if (response.status === 'success' && response.data.classes) {
        const classes = response.data.classes;
        
        if (classes.length === 0) {
            DOM.dashboardClassButtons.innerHTML = `<p class="text-sm text-slate-400 italic">Belum ada data kelas yang tercatat.</p>`;
            DOM.dashboardClassSelectMobile.innerHTML = `<option value="">Belum ada kelas</option>`;
            return;
        }

        let htmlButtons = '';
        classes.forEach(cls => {
            htmlButtons += `
                <button type="button" data-kelas="${cls}" class="btn-dashboard-kelas px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm shadow-sm hover:border-blue-500 hover:text-blue-600 transition">
                    ${cls}
                </button>
            `;
        });
        DOM.dashboardClassButtons.innerHTML = htmlButtons;

        let htmlOptions = `<option value="">-- Pilih Kelas --</option>`;
        classes.forEach(cls => {
            htmlOptions += `<option value="${cls}">${cls}</option>`;
        });
        DOM.dashboardClassSelectMobile.innerHTML = htmlOptions;

        document.querySelectorAll('.btn-dashboard-kelas').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetKelas = e.currentTarget.getAttribute('data-kelas');
                DOM.dashboardClassSelectMobile.value = targetKelas;

                document.querySelectorAll('.btn-dashboard-kelas').forEach(b => {
                    b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                    b.classList.add('bg-white', 'text-slate-700');
                });
                e.currentTarget.classList.remove('bg-white', 'text-slate-700');
                e.currentTarget.classList.add('bg-blue-600', 'text-white', 'border-blue-600');

                fetchAndRenderDashboardMetrics(targetKelas);
            });
        });

        DOM.dashboardClassSelectMobile.addEventListener('change', (e) => {
            const targetKelas = e.target.value;
            if (!targetKelas) return;

            document.querySelectorAll('.btn-dashboard-kelas').forEach(b => {
                if (b.getAttribute('data-kelas') === targetKelas) {
                    b.classList.remove('bg-white', 'text-slate-700');
                    b.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
                } else {
                    b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
                    b.classList.add('bg-white', 'text-slate-700');
                }
            });

            fetchAndRenderDashboardMetrics(targetKelas);
        });

        if (classes.length > 0) {
            document.querySelector('.btn-dashboard-kelas').click();
        }
    }
}

const dashboardCache = {};

async function fetchAndRenderDashboardMetrics(className) {
    state.activeDashboardClass = className;
    if (dashboardCache[className]) {
        updateDashboardUI(dashboardCache[className]);
        return;
    }

    DOM.dashboardContent.classList.add('hidden');
    DOM.dashboardLoading.classList.remove('hidden');

    const response = await API.getDashboardData(className);
    DOM.dashboardLoading.classList.add('hidden');

    if (response.status === 'success') {
        dashboardCache[className] = response.data;
        updateDashboardUI(response.data);
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

    DOM.btnGantiGuru.addEventListener('click', () => goToStep(1));
    DOM.btnLanjutEvaluasi.addEventListener('click', proceedToStep3);
    DOM.btnKembaliStep2.addEventListener('click', () => goToStep(2));
    DOM.btnSimpanPermanen.addEventListener('click', submitData);

    DOM.btnPrevDay.addEventListener('click', () => { state.currentDate.setDate(state.currentDate.getDate() - 1); updateDateDisplay(); });
    DOM.btnNextDay.addEventListener('click', () => { state.currentDate.setDate(state.currentDate.getDate() + 1); updateDateDisplay(); });
    DOM.btnOpenCalendar.addEventListener('click', () => DOM.inputDate.showPicker());
    DOM.inputDate.addEventListener('change', (e) => { state.currentDate = new Date(e.target.value); updateDateDisplay(); });
    
    const inputsToSave = [
        DOM.kelasSelect, DOM.semesterSelect, DOM.judulMateri, 
        DOM.elemenCPSelect, DOM.tujuanPembelajaran, 
        DOM.deskripsiMateri, DOM.linkModul
    ];
    
    inputsToSave.forEach(input => {
        input.addEventListener('change', saveDraft);
        if(input.tagName === 'INPUT' || input.tagName === 'TEXTAREA' || input.tagName === 'SELECT') {
            input.addEventListener('input', saveDraft);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);