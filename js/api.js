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

    async getStudentsByClass(kelas) {
        try {
            const url = `${CONFIG.GAS_URL}?action=getStudentsByClass&kelas=${encodeURIComponent(kelas)}`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error("Error fetching students:", error);
            return { status: 'error', message: 'Gagal mengambil data siswa.' };
        }
    },

    // Fungsi untuk menarik data Elemen CP dari Sheet Master_CP
    async getElemenCP() {
        try {
            const response = await fetch(`${CONFIG.GAS_URL}?action=getElemenCP`);
            return await response.json();
        } catch (error) {
            console.error("Error fetching Elemen CP:", error);
            return { status: 'error', message: 'Gagal mengambil data Elemen CP.' };
        }
    },

    async getDashboardData(kelas = '') {
        try {
            const url = kelas 
                ? `${CONFIG.GAS_URL}?action=getDashboardData&kelas=${encodeURIComponent(kelas)}`
                : `${CONFIG.GAS_URL}?action=getDashboardData`;
                
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
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                    action: 'saveAgendaAndEvaluasi',
                    payload: payload
                })
            });
            return await response.json();
        } catch (error) {
            console.error("Error saving data:", error);
            return { status: 'error', message: 'Gagal menyimpan data ke server.' };
        }
    },

    // ENDPOINT BARU: Menarik riwayat spesifik siswa
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

    // ENDPOINT BARU: Menyimpan nilai susulan
    async updateLateGrade(payload) {
        try {
            const response = await fetch(CONFIG.GAS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'updateLateGrade', payload: payload })
            });
            return await response.json();
        } catch (error) {
            console.error("Error updating late grade:", error);
            return { status: 'error', message: 'Gagal menyimpan nilai susulan.' };
        }
    }
};