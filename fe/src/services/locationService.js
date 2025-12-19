// Location Service - API calls for location search

import { apiClient } from '../configs/apiClient';

/**
 * Search locations by query string
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of locations
 */
export async function searchLocations(query) {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await apiClient.get('/locations/search', {
      params: { q: query.trim() }
    });

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
}

/**
 * Get all locations
 * @returns {Promise<Array>} - Array of all locations
 */
export async function getAllLocations() {
  try {
    const response = await apiClient.get('/locations');

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error getting all locations:', error);
    return [];
  }
}
