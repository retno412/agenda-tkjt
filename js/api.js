// js/api.js
import { CONFIG } from './config.js';

export const API = {
    async getTeachers() {
        try {
            const response = await fetch(`${CONFIG.GAS_URL}?action=getTeachers`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching teachers:", error);
            return { status: 'error', message: 'Gagal terhubung ke server.' };
        }
    },

    async getStudentsByClass(kelas, produktif = "", spesialisasi = "") {
        try {
            let url = `${CONFIG.GAS_URL}?action=getStudentsByClass&kelas=${encodeURIComponent(kelas)}`;
            if (produktif) url += `&produktif=${encodeURIComponent(produktif)}`;
            if (spesialisasi) url += `&spesialisasi=${encodeURIComponent(spesialisasi)}`;
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error fetching students:", error);
            return { status: 'error', message: 'Gagal mengambil data siswa.' };
        }
    },

    async getElemenCP() {
        try {
            const response = await fetch(`${CONFIG.GAS_URL}?action=getElemenCP`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching Elemen CP:", error);
            return { status: 'error', message: 'Gagal mengambil data Elemen CP.' };
        }
    },

    async getDashboardData(kelas = '', produktif = '', spesialisasi = '') {
        try {
            let url = `${CONFIG.GAS_URL}?action=getDashboardData`;
            if (kelas) url += `&kelas=${encodeURIComponent(kelas)}`;
            if (produktif) url += `&produktif=${encodeURIComponent(produktif)}`;
            if (spesialisasi) url += `&spesialisasi=${encodeURIComponent(spesialisasi)}`;
                
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            return { status: 'error', message: 'Gagal memuat data analitik dashboard.' };
        }
    },

    async saveAgenda(payload) {
        try {
            const response = await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveAgendaAndEvaluasi', payload: payload })
            });
            return await response.json();
        } catch (error) {
            console.error("Error saving data:", error);
            return { status: 'error', message: 'Gagal menyimpan data ke server.' };
        }
    },

    async getStudentHistory(idSiswa, kelas) {
        try {
            const url = `${CONFIG.GAS_URL}?action=getStudentHistory&id_siswa=${encodeURIComponent(idSiswa)}&kelas=${encodeURIComponent(kelas)}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error fetching student history:", error);
            return { status: 'error', message: 'Gagal mengambil riwayat siswa.' };
        }
    },

    async updateStudentEvaluasi(payload) {
        try {
            const response = await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'updateStudentEvaluasi', payload: payload })
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating evaluasi:", error);
            return { status: 'error', message: 'Gagal menyimpan pembaruan.' };
        }
    },

    async exportClassData(kelas, produktif = "", spesialisasi = "") {
        try {
            let url = `${CONFIG.GAS_URL}?action=exportClassData&kelas=${encodeURIComponent(kelas)}`;
            if (produktif) url += `&produktif=${encodeURIComponent(produktif)}`;
            if (spesialisasi) url += `&spesialisasi=${encodeURIComponent(spesialisasi)}`;

            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error exporting class data:", error);
            return { status: 'error', message: 'Gagal mengekspor data kelas.' };
        }
    }
};