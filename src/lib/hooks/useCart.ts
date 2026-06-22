import { create } from "zustand";
import type { CartItem } from "@/types";
import { calculateSubtotal } from "@/lib/utils/tax";

interface CartStore {
  items: CartItem[];
  customerId: string | null;
  discount: number;
  addItem: (item: Omit<CartItem, "quantity" | "discount" | "subtotal">) => void;
  removeItem: (product_id: string) => void;
  updateQuantity: (product_id: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setCustomer: (customerId: string | null) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  customerId: null,
  discount: 0,

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.product_id === item.product_id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + 1, subtotal: calculateSubtotal(i.price, i.quantity + 1) }
              : i,
          ),
        };
      }
      return {
        items: [...state.items, { ...item, quantity: 1, discount: 0, subtotal: calculateSubtotal(item.price, 1) }],
      };
    });
  },

  removeItem: (product_id) => {
    set((state) => ({ items: state.items.filter((i) => i.product_id !== product_id) }));
  },

  updateQuantity: (product_id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(product_id);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product_id === product_id ? { ...i, quantity, subtotal: calculateSubtotal(i.price, quantity) } : i,
      ),
    }));
  },

  setDiscount: (discount) => set({ discount }),
  setCustomer: (customerId) => set({ customerId }),
  clearCart: () => set({ items: [], customerId: null, discount: 0 }),

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.subtotal, 0);
  },
}));
