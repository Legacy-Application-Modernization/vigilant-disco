import axios from 'axios';

// Main API (Node.js backend)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Backend API (Python/FastAPI) for analysis and conversion
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8000';

// Main API instance (Node.js backend)
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Backend API instance (Python/FastAPI)
export const backendApi = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor for main API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for backend API
backendApi.interceptors.request.use(
  (config) => {
    // Add any backend-specific headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken } = response.data;
        
        localStorage.setItem('access_token', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Response interceptor for backend API with comprehensive error handling
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle backend-specific errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error('Backend API Error:', {
        status,
        url: error.config?.url,
        data,
      });

      // Create user-friendly error message
      let errorMessage = 'An unexpected error occurred';
      
      switch (status) {
        case 400:
          errorMessage = data?.detail || data?.message || 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication required. Please log in.';
          break;
        case 403:
          errorMessage = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = data?.detail || 'The requested resource was not found.';
          break;
        case 422:
          errorMessage = data?.detail || 'Validation error. Please check your input.';
          break;
        case 500:
          errorMessage = data?.detail || 'Server error. Please try again later or contact support.';
          break;
        case 502:
          errorMessage = 'Service temporarily unavailable. Please try again.';
          break;
        case 503:
          errorMessage = 'Service maintenance in progress. Please try again later.';
          break;
        default:
          errorMessage = data?.detail || data?.message || `Error ${status}: ${error.message}`;
      }

      // Attach user-friendly message to error object
      error.userMessage = errorMessage;
    } else if (error.request) {
      // Request made but no response received
      console.error('Backend API No Response:', error.request);
      error.userMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Something else happened
      console.error('Backend API Error:', error.message);
      error.userMessage = error.message || 'An unexpected error occurred';
    }
    
    return Promise.reject(error);
  }
);

export default api;