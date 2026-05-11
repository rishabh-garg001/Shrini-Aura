import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

// Debounce helper to avoid too many API calls
let syncTimer = null;
const debouncedSync = (items) => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await api.put('/users/cart', { items });
    } catch { /* silently fail if not logged in */ }
  }, 800);
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find(i => i._id === product._id);
        let newItems;
        if (existing) {
          newItems = items.map(i => i._id === product._id ? { ...i, quantity: i.quantity + quantity } : i);
        } else {
          newItems = [...items, { ...product, quantity }];
        }
        set({ items: newItems });
        debouncedSync(newItems);
      },

      removeItem: (id) => {
        const newItems = get().items.filter(i => i._id !== id);
        set({ items: newItems });
        debouncedSync(newItems);
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        const newItems = get().items.map(i => i._id === id ? { ...i, quantity } : i);
        set({ items: newItems });
        debouncedSync(newItems);
      },

      clearCart: () => {
        set({ items: [] });
        // Clear from DB too
        api.put('/users/cart', { items: [] }).catch(() => {});
      },

      // Called after login to restore cart from DB
      restoreCart: async () => {
        try {
          const { data } = await api.get('/users/cart');
          // Always set from DB — overrides any stale localStorage cart
          set({ items: Array.isArray(data) ? data : [] });
        } catch { /* silently fail */ }
      },

      get total() {
        return get().items.reduce((sum, i) => sum + ((i.discountPrice > 0 ? i.discountPrice : i.price)) * i.quantity, 0);
      },
      get count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    { name: 'cart' }
  )
);
