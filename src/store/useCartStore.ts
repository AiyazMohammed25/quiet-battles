import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

// Check saved cart data before using it after a browser reload.
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  if (
    !("id" in value) ||
    !("name" in value) ||
    !("price" in value) ||
    !("size" in value) ||
    !("quantity" in value)
  ) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.price === "number" &&
    Number.isSafeInteger(value.price) &&
    value.price >= 0 &&
    typeof value.size === "string" &&
    CART_SIZES.some((size) => size === value.size) &&
    typeof value.quantity === "number" &&
    Number.isSafeInteger(value.quantity) &&
    value.quantity >= 1 &&
    value.quantity <= 99
  );
}

// Keep cart items in shared client state; each product and size is a separate line.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      // Add a new cart line or increase the matching product and size.
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

          // Product and size together form one cart line.
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id && item.size === newItem.size
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + newItem.quantity,
                        99,
                      ),
                    }
                  : item,
              ),
              isOpen: true,
            };
          }

          return {
            items: [
              ...state.items,
              { ...newItem, quantity: Math.min(newItem.quantity, 99) },
            ],
            isOpen: true,
          };
        }),
      // Remove only the line matching both the product ID and size.
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.id === id && item.size === size),
          ),
        })),
      // Change a quantity or remove the line when its quantity reaches zero.
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
      // Open or close the cart drawer.
      toggleCart: (open) =>
        set((state) => ({
          isOpen: open === undefined ? !state.isOpen : open,
        })),
    }),
    {
      name: "quiet-battles-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        if (
          typeof persistedState !== "object" ||
          persistedState === null ||
          !("items" in persistedState) ||
          !Array.isArray(persistedState.items)
        ) {
          return currentState;
        }

        return {
          ...currentState,
          items: persistedState.items.filter(isCartItem),
        };
      },
    },
  ),
);