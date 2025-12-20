import { useFavoritesStore } from '../store/favoritesStore';
import { useEffect } from 'react';

export const useFavorites = () => {
  const store = useFavoritesStore();

  // Fetch favorites on mount
  useEffect(() => {
    store.fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add favorite with validation
  const addFavorite = async (locationId) => {
    if (!locationId) {
      store.setError('Invalid location ID');
      return false;
    }

    const success = await store.addFavorite(locationId);
    return success;
  };

  // Remove favorite
  const removeFavorite = async (id) => {
    await store.removeFavorite(id);
  };

  // Check if location is favorite
  const isFavorite = async (locationId) => {
    return await store.checkFavorite(locationId);
  };

  // Get favorites sorted by creation date
  const getSortedFavorites = () => {
    return [...store.favorites].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  return {
    ...store,
    addFavorite,
    removeFavorite,
    isFavorite,
    getSortedFavorites
  };
};
