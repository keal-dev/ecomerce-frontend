import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchHistoryState {
  recentQueries: string[];
  addQuery: (query: string) => void;
  removeQuery: (query: string) => void;
  clearQueries: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      recentQueries: [],

      addQuery: (query: string) => {
        const clean = query.trim();
        if (!clean || clean.length < 2) return;

        const current = get().recentQueries;
        // Quitar si ya existía para colocarlo primero
        const filtered = current.filter(
          (item) => item.toLowerCase() !== clean.toLowerCase(),
        );
        // Guardar hasta 6 búsquedas recientes
        set({ recentQueries: [clean, ...filtered].slice(0, 6) });
      },

      removeQuery: (query: string) => {
        const clean = query.trim().toLowerCase();
        const current = get().recentQueries;
        set({
          recentQueries: current.filter((item) => item.toLowerCase() !== clean),
        });
      },

      clearQueries: () => set({ recentQueries: [] }),
    }),
    {
      name: 'ecommerce_recent_searches_storage',
    },
  ),
);
