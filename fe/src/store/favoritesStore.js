import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import favoritesService from '../services/favoritesService';

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      // Fetch all favorites from backend
      fetchFavorites: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await favoritesService.getFavorites();
          set({ favorites: data, isLoading: false });
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch favorites',
            isLoading: false 
          });
        }
      },

      // Add favorite
      addFavorite: async (locationId) => {
        set({ isLoading: true, error: null });
        try {
          const newFavorite = await favoritesService.createFavorite(locationId);
          set((state) => ({
            favorites: [...state.favorites, newFavorite],
            isLoading: false,
            error: null
          }));
          return newFavorite; // Return the favorite object with location
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to add favorite',
            isLoading: false 
          });
          return null;
        }
      },

      // Remove favorite
      removeFavorite: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await favoritesService.deleteFavorite(id);
          set((state) => ({
            favorites: state.favorites.filter(f => f.id !== id),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error.response?.data?.message || 'Failed to remove favorite',
            isLoading: false 
          });
        }
      },

      // Check if location is favorite
      checkFavorite: async (locationId) => {
        try {
          const result = await favoritesService.checkFavorite(locationId);
          return result.isFavorite;
        } catch (error) {
          console.error('Failed to check favorite:', error);
          return false;
        }
      },

      // Update favorite (local only for UI purposes like reordering)
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
