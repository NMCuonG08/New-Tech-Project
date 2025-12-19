import { useFavoritesStore } from '../store/favoritesStore';

export const useFavorites = () => {
  const store = useFavoritesStore();

  // Add favorite with validation
  const addFavorite = (city) => {
    if (!city.cityName || !city.latitude || !city.longitude) {
      store.setError('Invalid city data');
      return false;
    }

    const success = store.addFavorite(city);
    
    if (!success) {
      return false;
    }

    return true;
  };

  // Get favorites sorted by order
  const getSortedFavorites = () => {
    return [...store.favorites].sort((a, b) => {
      if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
        return a.orderIndex - b.orderIndex;
      }
      return 0;
    });
  };

  return {
    ...store,
    addFavorite,
    getSortedFavorites
  };
};
