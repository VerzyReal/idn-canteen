'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CartStore, ProductWithMeta } from '@/types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: ProductWithMeta, quantity = 1, itemNote?: string) => {
        set((state) => {
          const existing = state.items.find(i => i.productId === product.id);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, product.stock);
            return {
              items: state.items.map(i =>
                i.productId === product.id
                  ? { ...i, quantity: newQty, itemNote: itemNote !== undefined ? itemNote : i.itemNote }
                  : i
              ),
            };
          }
          const newItem: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: Math.min(quantity, product.stock),
            itemNote: itemNote || '',
            stock: product.stock,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(i => i.productId !== productId),
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter(i => i.productId !== productId) };
          }
          return {
            items: state.items.map(i =>
              i.productId === productId
                ? { ...i, quantity: Math.min(quantity, i.stock) }
                : i
            ),
          };
        });
      },

      updateNote: (productId: string, note: string) => {
        set((state) => ({
          items: state.items.map(i =>
            i.productId === productId ? { ...i, itemNote: note } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
    }),
    {
      name: 'idn-canteen-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

