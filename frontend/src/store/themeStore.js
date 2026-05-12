import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const dark = !get().dark;
        set({ dark });
        document.documentElement.classList.toggle('dark', dark);
      },
      init: () => {
        const dark = get().dark;
        document.documentElement.classList.toggle('dark', dark);
      },
    }),
    { name: 'theme' }
  )
);
