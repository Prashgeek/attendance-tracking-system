import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // This sends cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

export const login = (credentials) => api.post('/api/auth/login', credentials);
export const register = (payload) => api.post('/api/auth/register', payload);
export const logout = () => api.post('/api/auth/logout');
export const me = () => api.get('/api/me');
