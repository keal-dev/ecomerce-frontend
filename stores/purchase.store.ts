import { create } from 'zustand';
import { Purchase, CreatePurchaseDto } from '@/types/purchase.types';
import {
  getPurchases,
  createPurchase,
  deletePurchase,
} from '@/services/purchase.service';
import { useProductStore } from './product.store';

interface PurchaseState {
  purchases: Purchase[];
  isLoading: boolean;
  error: string | null;

  fetchPurchases: (search?: string) => Promise<void>;
  addPurchase: (dto: CreatePurchaseDto) => Promise<Purchase>;
  removePurchase: (id: string) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchases: [],
  isLoading: false,
  error: null,

  fetchPurchases: async (search?: string) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getPurchases(search);
      set({ purchases: data, isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar historial de compras';
      set({ error: message, isLoading: false });
    }
  },

  addPurchase: async (dto: CreatePurchaseDto) => {
    set({ isLoading: true, error: null });
    try {
      const newPurchase = await createPurchase(dto);
      set((state) => ({
        purchases: [newPurchase, ...state.purchases],
        isLoading: false,
      }));

      // Refrescar automáticamente la tienda de productos para reflejar el nuevo stock
      useProductStore.getState().fetchProducts(true);

      return newPurchase;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al registrar la compra';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  removePurchase: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deletePurchase(id);
      set((state) => ({
        purchases: state.purchases.filter((p) => p.id !== id),
        isLoading: false,
      }));

      // Refrescar productos porque se revirtió el stock
      useProductStore.getState().fetchProducts(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar la compra';
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
