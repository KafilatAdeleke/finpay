import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
});

// Add interceptor to include JWT in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});