import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../lib/api';

// Debounce helper to avoid too many API calls
let syncTimer = null;

const debouncedSync = (items) => {
  clearTimeout(syncTimer);

  syncTimer = setTimeout(async () => {
    try {
      await api.put('/users/cart', { items });
    } catch (error) {
      // silently fail if not logged in
      console.log('Cart sync failed:', error?.message);
    }
  }, 800);
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart
      addItem: (product, quantity = 1) => {
        const items = get().items;

        const existing = items.find(
          (i) => i._id === product._id
        );

        let newItems;

        if (existing) {
          newItems = items.map((i) =>
            i._id === product._id
              ? {
                  ...i,
                  quantity: i.quantity + quantity,
                }
              : i
          );
        } else {
          newItems = [
            ...items,
            {
              ...product,
              quantity,
            },
          ];
        }

        set({ items: newItems });

        debouncedSync(newItems);
      },

      // Remove item from cart
      removeItem: (id) => {
        const newItems = get().items.filter(
          (i) => i._id !== id
        );

        set({ items: newItems });

        debouncedSync(newItems);
      },

      // Update quantity
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;

        const newItems = get().items.map((i) =>
          i._id === id
            ? {
                ...i,
                quantity,
              }
            : i
        );

        set({ items: newItems });

        debouncedSync(newItems);
      },

      // Clear cart
      clearCart: () => {
        set({ items: [] });

        api
          .put('/users/cart', { items: [] })
          .catch(() => {});
      },

      // Restore cart after login
      restoreCart: async () => {
        try {
          const { data } = await api.get('/users/cart');

          set({
            items: Array.isArray(data) ? data : [],
          });
        } catch (error) {
          console.log(
            'Restore cart failed:',
            error?.message
          );
        }
      },

      // Total price
      total: () => {
        return get().items.reduce((sum, item) => {
          const price =
            item.discountPrice > 0
              ? item.discountPrice
              : item.price;

          return sum + price * item.quantity;
        }, 0);
      },

      // Total item count
      count: () => {
        return get().items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);