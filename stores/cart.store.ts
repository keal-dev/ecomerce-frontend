import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  slug?: string | null;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  imageUrl: string;
  stock: number;
  quantity: number;
  freeShipping?: boolean;
  full?: boolean;
}

export interface AddCartProductInput {
  id: string;
  title: string;
  slug?: string | null;
  price: number;
  originalPrice?: number | null;
  discount?: number | null;
  imageUrl?: string | null;
  stock?: number;
  freeShipping?: boolean;
  full?: boolean;
}

interface CartState {
  items: CartItem[];
  addItem: (product: AddCartProductInput, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: AddCartProductInput, quantity = 1) => {
        if (!product || !product.id || quantity <= 0) return;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === product.id);

        const availableStock = product.stock !== undefined ? product.stock : 999;

        if (existingIndex > -1) {
          // Si ya existe, incrementar la cantidad respetando el stock disponible
          const updated = [...currentItems];
          const currentQty = updated[existingIndex].quantity;
          const newQty = Math.min(currentQty + quantity, availableStock);

          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
          };

          set({ items: updated });
        } else {
          // Agregar nuevo producto
          const newItem: CartItem = {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: Number(product.price) || 0,
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            discount: product.discount ? Number(product.discount) : null,
            imageUrl: product.imageUrl || '/placeholder.png',
            stock: availableStock,
            quantity: Math.min(quantity, availableStock),
            freeShipping: product.freeShipping ?? false,
            full: product.full ?? false,
          };

          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (id: string) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const currentItems = get().items;
        const updated = currentItems.map((item) => {
          if (item.id === id) {
            const safeQty = Math.min(quantity, item.stock || 999);
            return { ...item, quantity: safeQty };
          }
          return item;
        });

        set({ items: updated });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce_shopping_cart_storage',
    },
  ),
);
