// Location Admin Service - CRUD operations for Location management
import { apiClient } from '../configs/apiClient';

/**
 * Get all locations with optional pagination
 */
export async function getAllLocations(page = null, limit = null) {
    const params = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;

    const response = await apiClient.get('/locations', { params });
    if (response.data.success) {
        return {
            data: response.data.data,
            pagination: response.data.pagination || null,
        };
    }
    throw new Error(response.data.error || 'Failed to fetch locations');
}

/**
 * Get location by ID
 */
export async function getLocationById(id) {
    const response = await apiClient.get(`/locations/${id}`);
    if (response.data.success && response.data.data) {
        return response.data.data;
    }
    throw new Error(response.data.error || 'Location not found');
}

/**
 * Create new location
 */
export async function createLocation(locationData) {
    const response = await apiClient.post('/locations', locationData);
    if (response.data.success && response.data.data) {
        return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to create location');
}

/**
 * Update location
 */
export async function updateLocation(id, locationData) {
    const response = await apiClient.put(`/locations/${id}`, locationData);
    if (response.data.success && response.data.data) {
        return response.data.data;
    }
    throw new Error(response.data.error || 'Failed to update location');
}

/**
 * Delete location
 */
export async function deleteLocation(id) {
    const response = await apiClient.delete(`/locations/${id}`);
    if (response.data.success) {
        return true;
    }
    throw new Error(response.data.error || 'Failed to delete location');
}

/**
 * Search locations
 */
export async function searchLocations(query) {
    const response = await apiClient.get('/locations/search', {
        params: { q: query }
    });
    if (response.data.success && response.data.data) {
        return response.data.data;
    }
    return [];
}
