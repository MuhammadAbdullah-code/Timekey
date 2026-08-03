import axios from 'axios';

/**
 * Axios instance configured with base URL from environment variables
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - attach auth token if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handle common errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Extract a human-readable error message.
      // 422 Validation errors return detail as an array: [{ loc, msg, type }]
      // Other errors return detail as a plain string.
      let errorMessage = 'An error occurred';
      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          // Pick the first validation error and format it
          errorMessage = data.detail
            .map(e => `${e.loc?.slice(-1)[0] ?? 'field'}: ${e.msg}`)
            .join(', ');
        } else {
          errorMessage = data.detail;
        }
      } else if (data?.message) {
        errorMessage = data.message;
      }
      error.message = errorMessage;
    } else if (error.request) {
      // Request made but no response
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
