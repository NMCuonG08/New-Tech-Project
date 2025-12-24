// useLocations hook - Quản lý locations với API thực và pagination
import { useState, useEffect, useCallback } from 'react';
import * as locationAdminService from '../services/locationAdminService';

export function useLocations(initialLimit = 10) {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: initialLimit,
        total: 0,
        totalPages: 0,
    });

    // Fetch locations with pagination
    const fetchLocations = useCallback(async (page = 1, limit = initialLimit) => {
        setLoading(true);
        setError(null);
        try {
            const result = await locationAdminService.getAllLocations(page, limit);
            setLocations(result.data);
            if (result.pagination) {
                setPagination(result.pagination);
            } else {
                setPagination({
                    page: 1,
                    limit: result.data.length,
                    total: result.data.length,
                    totalPages: 1,
                });
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching locations:', err);
        } finally {
            setLoading(false);
        }
    }, [initialLimit]);

    // Change page
    const goToPage = useCallback((page) => {
        fetchLocations(page, pagination.limit);
    }, [fetchLocations, pagination.limit]);

    // Change limit
    const setLimit = useCallback((limit) => {
        fetchLocations(1, limit);
    }, [fetchLocations]);

    // Create location
    const createLocation = async (locationData) => {
        setLoading(true);
        setError(null);
        try {
            const newLocation = await locationAdminService.createLocation(locationData);
            // Refresh list to get updated pagination
            await fetchLocations(pagination.page, pagination.limit);
            return newLocation;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update location
    const updateLocation = async (id, locationData) => {
        setLoading(true);
        setError(null);
        try {
            const updatedLocation = await locationAdminService.updateLocation(id, locationData);
            setLocations(prev => prev.map(loc => loc.id === id ? updatedLocation : loc));
            return updatedLocation;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete location
    const deleteLocation = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await locationAdminService.deleteLocation(id);
            // Refresh list to get updated pagination
            await fetchLocations(pagination.page, pagination.limit);
            return true;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Search locations (API)
    const searchLocations = useCallback(async (query) => {
        if (!query || query.trim() === '') {
            // Restore paginated list
            fetchLocations(1, pagination.limit);
            return;
        }

        setLoading(true);
        try {
            const results = await locationAdminService.searchLocations(query);
            setLocations(results);

            // Mock pagination for search results
            setPagination({
                page: 1,
                limit: results.length,
                total: results.length,
                totalPages: 1,
            });
        } catch (err) {
            setError(err.message);
            console.error('Error searching locations:', err);
        } finally {
            setLoading(false);
        }
    }, [fetchLocations, pagination.limit]);

    // Get stats
    const getStats = () => {
        return {
            total: pagination.total,
            countries: [...new Set(locations.map(loc => loc.countryCode).filter(Boolean))].length
        };
    };

    // Load on mount
    useEffect(() => {
        fetchLocations(1, initialLimit);
    }, [fetchLocations, initialLimit]);

    return {
        locations,
        loading,
        error,
        pagination,
        fetchLocations,
        goToPage,
        setLimit,
        createLocation,
        updateLocation,
        deleteLocation,
        searchLocations,
        getStats,
    };
}
