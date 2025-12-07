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

// Types TypeScript
export interface ConsultationType {
  id: number;
  name: string;
  description: string | null;
}

export interface AppointmentData {
  doctor_id: number;
  appointment_date: string; // Format: YYYY-MM-DD
  appointment_time: string; // Format: HH:mm
  consultation_type_id: number;
  notes?: string;
}

export interface Appointment {
  id: number;
  patient: {
    id: number;
    name: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  appointment_date: string;
  appointment_time: string;
  consultation_type: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
}

class AppointmentService {
  /**
   * Récupérer tous les types de consultation
   */
  async getConsultationTypes(): Promise<ConsultationType[]> {
    try {
      const response = await api.get('/consultation-types');
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la récupération des types de consultation'
      );
    }
  }

  /**
   * Créer un nouveau rendez-vous
   */
  async createAppointment(appointmentData: AppointmentData): Promise<Appointment> {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data.data;
    } catch (error: any) {
      // Gérer les différents types d'erreurs
      if (error.response?.status === 422) {
        // Erreur de validation
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        throw new Error(Array.isArray(firstError) ? firstError[0] : error.response.data.message);
      }
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la création du rendez-vous'
      );
    }
  }

  /**
   * Récupérer tous les rendez-vous du patient connecté
   */
  async getPatientAppointments(): Promise<Appointment[]> {
    try {
      const response = await api.get('/patients/appointments');
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la récupération des rendez-vous'
      );
    }
  }

  /**
   * Annuler un rendez-vous
   */
  async cancelAppointment(appointmentId: number): Promise<void> {
    try {
      await api.put(`/appointments/${appointmentId}/cancel`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de l\'annulation du rendez-vous'
      );
    }
  }
}

export default new AppointmentService();