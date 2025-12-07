import axios from 'axios';
import authService from '../lib/auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface TimeSlot {
  value: string; // Ex: "10:00"
  label: string; // Ex: "10h-11h"
}

class AvailabilityService {
  /**
   * Récupérer les créneaux disponibles d'un médecin pour une date donnée
   */
  async getAvailableSlots(doctorId: number, date: string): Promise<TimeSlot[]> {
    try {
      const response = await api.get(`/doctors/${doctorId}/available-slots`, {
        params: { date }
      });
      return response.data.slots;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la récupération des créneaux'
      );
    }
  }
}

export default new AvailabilityService();