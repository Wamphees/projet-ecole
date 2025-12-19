import axios from 'axios';
import authService from './auth';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

// 🔥 INTERCEPTOR TOKEN
api.interceptors.request.use(config => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
