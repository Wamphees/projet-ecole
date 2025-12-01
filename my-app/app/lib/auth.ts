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

  constructor() {
    // Ne charger depuis localStorage que côté client
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('auth');
    if (stored) {
      const { token, user } = JSON.parse(stored);
      this.token = token;
      this.user = user;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    if (this.token && this.user) {
      localStorage.setItem('auth', JSON.stringify({ token: this.token, user: this.user }));
    }
  }

  private clearStorage() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth');
  }

  async register(name: string, email: string, password: string, passwordConfirmation: string, role: 'patient' | 'medecin' | 'admin'): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    const data: AuthResponse = await response.json();
    this.token = data.token;
    this.user = data.user;
    this.saveToStorage();
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    const data: AuthResponse = await response.json();
    this.token = data.token;
    this.user = data.user;
    this.saveToStorage();
    return data;
  }

  async logout(): Promise<void> {
    if (!this.token) return;

    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    });

    this.token = null;
    this.user = null;
    this.clearStorage();
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  getUserRole(): 'patient' | 'medecin' | 'admin' | null {
    return this.user?.role ?? null;
  }

  private getAuthHeader() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async fetchProtected(url: string, options: RequestInit = {}) {
    return fetch(url, {
      ...options,
      headers: { ...this.getAuthHeader(), ...options.headers },
    });
  }
}

export default new AuthService();
