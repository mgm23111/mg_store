import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '../types';

interface CartState {
  sessionId: string;
  cart: Cart | null;
  isCartOpen: boolean;
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItemQuantity: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  openCart: () => void;
  openCartDrawer: () => void; // Alias for openCart
  closeCart: () => void;
  toggleCart: () => void;
}

// Generate session ID if not exists
const getOrCreateSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      sessionId: getOrCreateSessionId(),
      cart: null,
      isCartOpen: false,
      setCart: (cart) => set({ cart }),
      addItem: (item) =>
        set((state) => {
          if (!state.cart) return state;

          const existingItemIndex = state.cart.items.findIndex((i) => i.id === item.id);

          if (existingItemIndex !== -1) {
            // Update existing item
            const newItems = [...state.cart.items];
            newItems[existingItemIndex] = item;
            return {
              cart: {
                ...state.cart,
                items: newItems,
              },
            };
          } else {
            // Add new item
            return {
              cart: {
                ...state.cart,
                items: [...state.cart.items, item],
              },
            };
          }
        }),
      updateItemQuantity: (itemId, quantity) =>
        set((state) => {
          if (!state.cart) return state;

          const newItems = state.cart.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );

          return {
            cart: {
              ...state.cart,
              items: newItems,
            },
          };
        }),
      removeItem: (itemId) =>
        set((state) => {
          if (!state.cart) return state;

          return {
            cart: {
              ...state.cart,
              items: state.cart.items.filter((item) => item.id !== itemId),
            },
          };
        }),
      clearCart: () => set({ cart: null }),
      openCart: () => set({ isCartOpen: true }),
      openCartDrawer: () => set({ isCartOpen: true }), // Alias for openCart
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ sessionId: state.sessionId }),
    }
  )
);
