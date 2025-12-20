import apiClient from '../configs/apiClient';

// Favorites API Service
export const favoritesService = {
  // Get all user favorites
  async getFavorites() {
    const response = await apiClient.get('/favorites');
    return response.data;
  },

  // Create a new favorite
  async createFavorite(locationId) {
    const response = await apiClient.post('/favorites', { locationId });
    return response.data;
  },

  // Check if location is favorite
  async checkFavorite(locationId) {
    const response = await apiClient.get(`/favorites/check/${locationId}`);
    return response.data;
  },

  // Delete a favorite
  async deleteFavorite(id) {
    await apiClient.delete(`/favorites/${id}`);
  }
};

export default favoritesService;
