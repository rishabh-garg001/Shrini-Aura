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
        return data;
      },
      register: async (credentials) => {
        const { data } = await api.post('/auth/register', credentials);
        set({ user: data.user });
        return data;
      },
      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* ignore */ }
        set({ user: null });
      },
      fetchMe: async () => {
        // Only fetch if we have a persisted user (cookies might still be valid)
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
