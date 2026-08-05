import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MenuItem } from '@/components/MenuItemCard';

interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantity: (itemId: string) => number;
}

function calcTotals(items: CartItem[]) {
  return {
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.item.price * i.quantity, 0),
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.item.id === item.id);
        const updated = existing
          ? items.map((i) =>
              i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            )
          : [...items, { item, quantity: 1 }];
        set({ items: updated, ...calcTotals(updated) });
      },

      removeItem: (itemId) => {
        const items = get().items;
        const existing = items.find((i) => i.item.id === itemId);
        if (!existing) return;
        const updated =
          existing.quantity <= 1
            ? items.filter((i) => i.item.id !== itemId)
            : items.map((i) =>
                i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
              );
        set({ items: updated, ...calcTotals(updated) });
      },

      updateQuantity: (itemId, quantity) => {
        const items = get().items;
        const updated =
          quantity <= 0
            ? items.filter((i) => i.item.id !== itemId)
            : items.map((i) =>
                i.item.id === itemId ? { ...i, quantity } : i
              );
        set({ items: updated, ...calcTotals(updated) });
      },

      clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),

      getQuantity: (itemId) =>
        get().items.find((i) => i.item.id === itemId)?.quantity ?? 0,
    }),
    {
      name: 'cafe-cart',
    }
  )
);
