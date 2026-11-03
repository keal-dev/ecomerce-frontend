import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      addFavorite: (id: string) => {
        if (!id) return;
        const current = get().favoriteIds;
        if (!current.includes(id)) {
          set({ favoriteIds: [id, ...current] });
        }
      },

      removeFavorite: (id: string) => {
        if (!id) return;
        set({
          favoriteIds: get().favoriteIds.filter((item) => item !== id),
        });
      },

      toggleFavorite: (id: string) => {
        if (!id) return;
        const current = get().favoriteIds;
        if (current.includes(id)) {
          set({ favoriteIds: current.filter((item) => item !== id) });
        } else {
          set({ favoriteIds: [id, ...current] });
        }
      },

      isFavorite: (id: string) => {
        if (!id) return false;
        return get().favoriteIds.includes(id);
      },

      clearFavorites: () => set({ favoriteIds: [] }),
    }),
    {
      name: 'ecommerce_favorites_storage',
    },
  ),
);
