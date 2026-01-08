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
// #region agent log
fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:20',message:'API client initialized',data:{baseURL:import.meta.env.VITE_API_URL,hasBaseURL:!!import.meta.env.VITE_API_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:33',message:'Request interceptor - before token check',data:{url:config.url,method:config.method,baseURL:config.baseURL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const token = localStorage.getItem('auth_token');
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:36',message:'Request interceptor - token check result',data:{hasToken:!!token,url:config.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:40',message:'Request interceptor - after token setup',data:{url:config.url,hasAuthHeader:!!config.headers.Authorization},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return config;
  },
  (error) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:45',message:'Request interceptor - error',data:{error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:49',message:'Response interceptor - success',data:{url:response.config.url,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return response;
  },
  (error: AxiosError) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:54',message:'Response interceptor - error entry',data:{url:error.config?.url,hasResponse:!!error.response,status:error.response?.status,code:error.code,message:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    // Handle network errors (server is down, no connection, timeout)
    if (!error.response) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:58',message:'Response interceptor - no response (network error)',data:{code:error.code,message:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:72',message:'Response interceptor - 401 detected',data:{url:error.config?.url,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Clear auth data and redirect to login
      const logout = useAuthStore.getState().logout;
      logout();

      window.location.href = '/login';
    }

    // Handle 500+ server errors
    if (error.response?.status >= 500) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:82',message:'Response interceptor - 500+ error',data:{status:error.response.status,url:error.config?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      dispatchServerError('Une erreur serveur est survenue. Veuillez réessayer plus tard.');
    }

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/e5db8a79-cefc-4fef-9e25-d5a65a71a32e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api/client.ts:87',message:'Response interceptor - error details',data:{status:error.response?.status,data:error.response?.data,url:error.config?.url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return Promise.reject(error);
  }
);

export default api;

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
