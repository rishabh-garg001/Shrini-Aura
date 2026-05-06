import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Auto-refresh token on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    // Don't retry refresh/me endpoints to avoid infinite loops
    const isAuthEndpoint = original.url?.includes('/auth/');
    if (err.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        return api(original);
      } catch {
        // Silently fail — let the app handle unauthenticated state
      }
    }
    return Promise.reject(err);
  }
);

export default api;
