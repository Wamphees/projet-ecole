import axios from 'axios';
import authService from '../lib/auth';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Créer une instance axios
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

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

class ChatbotService {
  /**
   * Envoyer un message au chatbot
   */
  async sendMessage(message: string, context: any[] = []): Promise<string> {
    try {
      const response = await api.post<ChatResponse>('/chatbot/message', {
        message,
        context,
      });

      if (response.data.success) {
        return response.data.response;
      }

      throw new Error('Erreur lors de la réponse du chatbot');
    } catch (error: any) {
      console.error('Chatbot error:', error);
      throw new Error(
        error.response?.data?.message || 'Erreur de communication avec le chatbot'
      );
    }
  }

  /**
   * Récupérer les questions fréquentes
   */
  async getFAQ(): Promise<FAQ[]> {
    try {
      const response = await api.get('/chatbot/faq');
      return response.data.data;
    } catch (error: any) {
      console.error('FAQ error:', error);
      throw new Error('Erreur lors de la récupération des FAQ');
    }
  }
}

export default new ChatbotService();