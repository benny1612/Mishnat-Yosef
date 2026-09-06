import axios from 'axios';

const BASE_URL = 'https://v2.mishnatyosef.org/api';
const TOKEN_KEY = 'misnet_auth_token';

// Create axios instance
const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://mishnatyosef.org',
    'Referer': 'https://mishnatyosef.org/',
  },
  timeout: 15000,
});

// ─── Request Interceptor ────────────────────────────────────────────────────
// Attaches Authorization: Bearer <token> to every request automatically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ───────────────────────────────────────────────────
// Catches 401 Unauthorized → clears token → redirects to login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all auth data from localStorage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('misnet_user');
      // Trigger a custom event so the app can react (navigate to login)
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'unauthorized' } }));
    }
    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default axiosClient;
