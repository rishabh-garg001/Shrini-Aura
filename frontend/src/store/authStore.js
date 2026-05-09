import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      login: async (credentials) => {
        const { data } = await api.post('/auth/login', credentials);
        set({ user: data.user });
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      },
      register: async (credentials) => {
        const { data } = await api.post('/auth/register', credentials);
        // Register now returns email for OTP verification, not tokens
        return data;
      },
      verifyEmail: async ({ email, otp }) => {
        const { data } = await api.post('/auth/verify-email', { email, otp });
        set({ user: data.user });
        if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        return data;
      },
      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        set({ user: null });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      },
      fetchMe: async () => {
        if (!get().user) return;
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch { set({ user: null }); }
      },
    }),
    { name: 'auth', partialize: (s) => ({ user: s.user }) }
  )
);
