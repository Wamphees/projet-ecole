import axios from 'axios';
import authService from '../lib/auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter automatiquement le token à chaque requête
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

export interface Appointment {
  id: number;

  patient: {
    id: number;
    name: string;
    telephone: string | null;
  };

  appointment_date: string;   // "17/12/2025"
  appointment_time: string;   // "11:00"
  consultation_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | string;
  notes: string | null;
}


class PatientList {
    
    async getPatientAppointments(): Promise<Appointment[]> {
        try {
          const response = await api.get('/doctors/appointments');
          return response.data.data;
        } catch (error: any) {
          throw new Error(
            error.response?.data?.message || 'Erreur lors de la récupération des rendez-vous'
          );
        }
      }
}
export default new PatientList();