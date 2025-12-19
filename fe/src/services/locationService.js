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

/**
 * Get location by name (search and return first match)
 * @param {string} name - Location name
 * @returns {Promise<Object|null>} - Location object with images or null
 */
export async function getLocationByName(name) {
  try {
    if (!name || name.trim().length === 0) {
      return null;
    }

    const response = await apiClient.get('/locations/search', {
      params: { q: name.trim() }
    });

    if (response.data.success && response.data.data && response.data.data.length > 0) {
      // Return exact match or first result
      const exactMatch = response.data.data.find(
        loc => loc.name.toLowerCase() === name.toLowerCase()
      );
      return exactMatch || response.data.data[0];
    }

    return null;
  } catch (error) {
    console.error('Error getting location by name:', error);
    return null;
  }
}
