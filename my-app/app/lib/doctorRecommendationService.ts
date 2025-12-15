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

export interface Doctor {
  id: number;
  name: string;
  email: string;
  telephone: string;
  specialite: string;
  etablissement: string;
  diplome: string;
  has_availabilities: boolean;
}

export interface AIRecommendation {
  specialty: string;
  urgency: string;
  reason: string;
}

export interface RecommendationResult {
  ai_recommendation: AIRecommendation;
  doctors: Doctor[];
  total_found: number;
}

class DoctorRecommendationService {
  async recommendDoctor(symptoms: string): Promise<RecommendationResult> {
    try {
      const response = await api.post('/doctors/recommend', {
        symptoms,
        preference: 'specialite',
      });

      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Erreur lors de la recommandation'
      );
    }
  }

  async getSpecialties(): Promise<string[]> {
    try {
      const response = await api.get('/doctors/specialties');
      return response.data.data;
    } catch (error: any) {
      throw new Error('Erreur lors de la récupération des spécialités');
    }
  }

  async smartSearch(query: string): Promise<any> {
    try {
      const response = await api.post('/doctors/smart-search', { query });
      return response.data.data;
    } catch (error: any) {
      throw new Error('Erreur lors de la recherche');
    }
  }
}

export default new DoctorRecommendationService();