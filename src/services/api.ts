import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '@/config';

// Always use relative /api path (works in both dev and production)
// In dev: Vite proxy handles /api -> localhost:3000
// In production: Nginx proxy handles /api -> localhost:3000
const apiBaseUrl = '/api';

const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (HttpOnly cookies) with requests
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData - browser will set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // HttpOnly cookies are automatically sent by the browser, no need to set Authorization header
    // But we keep backward compatibility: if token exists in localStorage, use it
    // (for migration period, can be removed later)
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
    // Note: HttpOnly cookies are sent automatically by browser when withCredentials: true
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
    
    // Handle validation errors (400) with detailed messages
    if (error.response?.status === 400) {
      const errorData = error.response.data as { message?: string; errors?: Array<{ field: string; message: string }> };
      
      // Log full error response for debugging
      console.error('=== VALIDATION ERROR ===');
      console.error('Full error response:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // Build detailed validation error message
        const validationMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        console.error('Validation errors array:', errorData.errors);
        console.error('Validation error details:', validationMessages);
        alert(`VALIDATION HATALARI:\n\n${validationMessages}\n\nConsole'da detayları görebilirsiniz.`);
        return Promise.reject(new Error(`Validation error:\n${validationMessages}`));
      } else {
        console.error('No errors array found in response');
        console.error('Error data:', errorData);
      }
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

