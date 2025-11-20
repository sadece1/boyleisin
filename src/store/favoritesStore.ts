import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Gear } from '@/types';

interface FavoritesState {
  favorites: string[]; // Array of gear IDs
  addFavorite: (gearId: string) => void;
  removeFavorite: (gearId: string) => void;
  isFavorite: (gearId: string) => boolean;
  toggleFavorite: (gearId: string) => void;
  clearFavorites: () => void;
}

const FAVORITES_STORAGE_KEY = 'camp_favorites';

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (gearId: string) => {
        set((state) => {
          if (!state.favorites.includes(gearId)) {
            return { favorites: [...state.favorites, gearId] };
          }
          return state;
        });
      },

      removeFavorite: (gearId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== gearId),
        }));
      },

      isFavorite: (gearId: string) => {
        return get().favorites.includes(gearId);
      },

      toggleFavorite: (gearId: string) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(gearId)) {
          removeFavorite(gearId);
        } else {
          addFavorite(gearId);
        }
      },

      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: FAVORITES_STORAGE_KEY,
    }
  )
);


