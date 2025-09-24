import axios from 'axios';

// In Vite development we sometimes see the dev server return 404 before
// the backend is available through the proxy. Use the backend origin when
// running in development so requests go directly to Laravel. In production
// keep the relative `/api` path which is mounted by the server.
const baseURL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
  ? 'http://localhost:8000'
  : '';

const instance = axios.create({
  baseURL,
  withCredentials: true, // Required for Sanctum cookie-based auth
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Ensure all requests have /api prefix and proper headers
instance.interceptors.request.use(
  (config) => {
    // Don't modify URLs that are already absolute
    if (!config.url.startsWith('http://') && !config.url.startsWith('https://')) {
      // Add /api prefix if not already present
      if (!config.url.startsWith('/api/')) {
        config.url = '/api' + (config.url.startsWith('/') ? config.url : '/' + config.url);
      }
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    // Handle FormData uploads - let axios set the Content-Type automatically
    if (config.data instanceof FormData) {
      // Remove the default Content-Type header to let axios set multipart/form-data with boundary
      delete config.headers['Content-Type'];
    }

    // Log request for debugging
    console.debug('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      isFormData: config.data instanceof FormData
    });

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response interceptors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Log errors for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });

    return Promise.reject(error);
  }
);

export default instance;