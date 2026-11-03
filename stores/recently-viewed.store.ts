import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
  viewedIds: string[];
  addViewedId: (id: string) => void;
  removeViewedId: (id: string) => void;
  clearHistory: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      viewedIds: [],

      addViewedId: (id: string) => {
        if (!id) return;
        const current = get().viewedIds;
        // Si ya estaba, removerlo para colocarlo al inicio (el más reciente primero)
        const filtered = current.filter((item) => item !== id);
        // Guardar hasta máximo 50 productos recientes en el historial
        const updated = [id, ...filtered].slice(0, 50);
        set({ viewedIds: updated });
      },

      removeViewedId: (id: string) => {
        if (!id) return;
        const current = get().viewedIds;
        set({ viewedIds: current.filter((item) => item !== id) });
      },

      clearHistory: () => set({ viewedIds: [] }),
    }),
    {
      name: 'recently_viewed_products_storage',
    }
  )
);
