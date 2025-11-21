import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '@/config';

// Use /api proxy in development, relative /api in production
const apiBaseUrl = import.meta.env.DEV 
  ? '/api' 
  : (config.apiBaseUrl.startsWith('http') ? config.apiBaseUrl : '/api');

const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData - browser will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (error) {
        // Invalid token format
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Only handle 401 errors, ignore others (we'll use mock data)
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    // For other errors (500, etc.), silently fail so we can use mock data
    // Don't log to console to avoid noise
    const message = 
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      'Bir hata oluştu';
    
    return Promise.reject(new Error(message));
  }
);

export default api;

