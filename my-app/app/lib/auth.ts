import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'patient' | 'medecin' | 'admin';
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  });

  constructor() {
    if (typeof window !== 'undefined') this.loadFromStorage();

    // Ajouter le token à toutes les requêtes Axios
    this.api.interceptors.request.use(config => {
      if (this.token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  private loadFromStorage() {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token, user } = JSON.parse(stored);
      this.token = token;
      this.user = user;
    }
  }

  private saveToStorage() {
    if (this.token && this.user) {
      localStorage.setItem('auth', JSON.stringify({ token: this.token, user: this.user }));
    }
  }

  private clearStorage() {
    localStorage.removeItem('auth');
  }

  async register(
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    role: 'patient' | 'medecin' | 'admin'
  ): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      role,
    });

    this.token = data.token;
    this.user = data.user;
    this.saveToStorage();
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>('/auth/login', { email, password });
    this.token = data.token;
    this.user = data.user;
    this.saveToStorage();
    return data;
  }

  async logout(): Promise<void> {
    if (!this.token) return;

    await this.api.post('/auth/logout');
    this.token = null;
    this.user = null;
    this.clearStorage();
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getUser(): User | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  getUserRole(): 'patient' | 'medecin' | 'admin' | null {
    return this.user?.role ?? null;
  }

  // Méthode pour requêtes sécurisées autres que login/register/logout
  async fetchProtected<T>(url: string, options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; data?: any } = {}): Promise<T> {
    const response = await this.api.request<T>({
      url,
      method: options.method || 'GET',
      data: options.data,
    });
    return response.data;
  }
}

export default new AuthService();
