import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      // Add favorite
      addFavorite: (city) => {
        const { favorites } = get();
        
        // Check duplicate
        const exists = favorites.find(
          f => f.cityName.toLowerCase() === city.cityName.toLowerCase()
        );
        
        if (exists) {
          set({ error: 'City already in favorites' });
          return false;
        }

        set({
          favorites: [...favorites, { ...city, id: Date.now() }],
          error: null
        });
        return true;
      },

      // Remove favorite
      removeFavorite: (id) => set((state) => ({
        favorites: state.favorites.filter(f => f.id !== id)
      })),

      // Update favorite
      updateFavorite: (id, updates) => set((state) => ({
        favorites: state.favorites.map(f => 
          f.id === id ? { ...f, ...updates } : f
        )
      })),

      // Reorder favorites
      reorderFavorites: (newOrder) => set({ favorites: newOrder }),

      // Set loading state
      setLoading: (isLoading) => set({ isLoading }),

      // Set error
      setError: (error) => set({ error }),

      // Clear error
      clearError: () => set({ error: null }),

      // Clear all favorites
      clearFavorites: () => set({ favorites: [] })
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ favorites: state.favorites })
    }
  )
);
