import { create } from "zustand";

export const CART_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type CartSize = (typeof CART_SIZES)[number];

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: CartSize;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: CartSize) => void;
  setQuantity: (id: string, size: CartSize, quantity: number) => void;
  toggleCart: (open?: boolean) => void;
}

// Cart lines are identified by product and size so separate variants keep their own quantities.
export const useCartStore = create<CartState>((set) => ({
  items: [],
  isOpen: false,
  addItem: (newItem) =>
    set((state) => {
      if (
        !newItem.id.trim() ||
        !newItem.name.trim() ||
        !Number.isSafeInteger(newItem.price) ||
        newItem.price < 0 ||
        !Number.isSafeInteger(newItem.quantity) ||
        newItem.quantity < 1
      ) {
        return state;
      }

      const existingItem = state.items.find(
        (item) => item.id === newItem.id && item.size === newItem.size,
      );

      // Product and size together form a cart line; immutable updates keep React subscribers in sync.
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === newItem.id && item.size === newItem.size
              ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, 99) }
              : item,
          ),
          isOpen: true,
        };
      }

      return {
        items: [...state.items, { ...newItem, quantity: Math.min(newItem.quantity, 99) }],
        isOpen: true,
      };
    }),
  removeItem: (id, size) =>
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.id === id && item.size === size),
      ),
    })),
  setQuantity: (id, size, quantity) =>
    set((state) => {
      if (!Number.isSafeInteger(quantity)) return state;

      return {
        items:
          quantity < 1
            ? state.items.filter(
                (item) => !(item.id === id && item.size === size),
              )
            : state.items.map((item) =>
                item.id === id && item.size === size
                  ? { ...item, quantity: Math.min(quantity, 99) }
                  : item,
              ),
      };
    }),
  toggleCart: (open) =>
    set((state) => ({
      isOpen: open === undefined ? !state.isOpen : open,
    })),
}));