import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '@/config';
import { logger } from '@/utils/logger';

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
    // Handle ERR_BLOCKED_BY_CLIENT (ad blocker) - silently ignore
    if (
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
      error.message?.includes('net::ERR_BLOCKED_BY_CLIENT') ||
      error.message?.includes('Failed to fetch') ||
      (error.request && !error.response) // Network error without response
    ) {
      // Silently ignore blocked requests - don't log to console
      // Return a resolved promise with empty data to prevent console errors
      return Promise.resolve({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: error.config,
      } as any);
    }
    
    // Only handle 401 errors, ignore others (we'll use mock data)
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    // Handle validation errors (400) with detailed messages
    if (error.response?.status === 400) {
      const errorData = error.response.data as { message?: string; errors?: Array<{ field: string; message: string }> };
      
      // Log full error response for debugging (only in development)
      logger.error('=== VALIDATION ERROR ===');
      logger.error('Full error response:', error.response.data);
      logger.error('Status:', error.response.status);
      logger.error('Headers:', error.response.headers);
      
      if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
        // Build detailed validation error message
        const validationMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('\n');
        logger.error('Validation errors array:', errorData.errors);
        logger.error('Validation error details:', validationMessages);
        alert(`VALIDATION HATALARI:\n\n${validationMessages}\n\nConsole'da detayları görebilirsiniz.`);
        return Promise.reject(new Error(`Validation error:\n${validationMessages}`));
      } else {
        logger.error('No errors array found in response');
        logger.error('Error data:', errorData);
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

