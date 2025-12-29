import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Custom event for server errors
export const SERVER_ERROR_EVENT = 'server-connection-error';

// Dispatch server error event
const dispatchServerError = (message: string) => {
  window.dispatchEvent(new CustomEvent(SERVER_ERROR_EVENT, { detail: { message } }));
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Public API client (no authentication required)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors (server is down, no connection, timeout)
    if (!error.response) {
      if (
        error.code === 'ECONNABORTED' ||
        error.code === 'ERR_NETWORK' ||
        error.message?.includes('timeout')
      ) {
        dispatchServerError(
          'Le serveur ne répond pas. Vérifiez votre connexion ou réessayez plus tard.'
        );
      } else {
        dispatchServerError('Une erreur de connexion est survenue. Veuillez réessayer.');
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      const logout = useAuthStore.getState().logout;
      logout();

      window.location.href = '/login';
    }

    // Handle 500+ server errors
    if (error.response?.status >= 500) {
      dispatchServerError('Une erreur serveur est survenue. Veuillez réessayer plus tard.');
    }

    return Promise.reject(error);
  }
);

export default api;

// Get the base URL for storage/media files
export const getStorageUrl = (path: string | null | undefined): string | undefined => {
  if (!path) return undefined;

  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Get base URL without /api suffix
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');

  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

// Type for API error response
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Helper to extract error message from API response
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || error.message || 'Une erreur est survenue';
  }
  return 'Une erreur est survenue';
};

// Helper to extract validation errors
export const getValidationErrors = (error: unknown): Record<string, string[]> | null => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.errors || null;
  }
  return null;
};
