// frontend/src/api/users.js
import axios from 'axios';

// ✅ Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// ----------------------------
// User Management APIs
// ----------------------------
export const getAllUsers = (params) => api.get('/api/users', { params });
export const getUserById = (id) => api.get(`/api/users/${id}`);
export const createUser = (userData) => api.post('/api/users', userData);
export const updateUser = (id, userData) => api.put(`/api/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// ✅ Admin reset password (backend route: POST /api/users/reset-password)
export const adminResetPassword = (data) =>
  api.post('/api/users/reset-password', data);

// ⚠️ Optional: if backend has /api/users/stats
export const getUserStats = () => api.get('/api/users/stats');

// ----------------------------
// Auth APIs
// ----------------------------
export const login = (credentials) => api.post('/api/auth/login', credentials);
export const logout = () => api.post('/api/auth/logout');
export const me = () => api.get('/api/auth/me');
export const forgotPassword = (data) =>
  api.post('/api/auth/forgot-password', data);

// ✅ For normal user reset (forgot password link flow)
export const resetPassword = (data) =>
  api.post('/api/auth/reset-password', data);

export default api;
