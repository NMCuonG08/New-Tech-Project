import { useState, useEffect, useCallback } from 'react';
import { getLocationByName } from '../services/locationService';
import {
    getCachedLocationImages,
    setCachedLocationImages,
    clearLocationImagesCache,
    clearExpiredLocationImagesCaches,
} from '../services/locationImagesCacheService';

/**
 * Custom hook to manage location images with localStorage caching
 * Prevents excessive API calls and provides cached data for reuse
 * 
 * @param {string} locationName - Name of the location to fetch images for
 * @returns {Object} - { images, loading, error, refetch, clearCache, clearOldCaches }
 */
export function useLocationImages(locationName) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch images from API or cache
     */
    const fetchImages = useCallback(async (forceRefresh = false) => {
        if (!locationName) {
            setImages([]);
            return;
        }

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cached = getCachedLocationImages(locationName);
            if (cached) {
                setImages(cached);
                setError(null);
                return;
            }
        }

        // Fetch from API
        setLoading(true);
        setError(null);

        try {
            const location = await getLocationByName(locationName);

            if (location && location.images && Array.isArray(location.images) && location.images.length > 0) {
                setImages(location.images);
                setCachedLocationImages(locationName, location.images);
            } else {
                setImages([]);
            }
        } catch (err) {
            console.error('Error fetching location images:', err);
            setError(err.message || 'Failed to fetch images');

            // Try to use cached data even if expired when API fails
            const cached = getCachedLocationImages(locationName);
            if (cached) {
                console.log('⚠️ API failed, using expired cache as fallback');
                setImages(cached);
            } else {
                setImages([]);
            }
        } finally {
            setLoading(false);
        }
    }, [locationName]);

    /**
     * Clear cache for current location
     */
    const clearCache = useCallback(() => {
        clearLocationImagesCache(locationName);
    }, [locationName]);

    /**
     * Clear old/expired caches
     */
    const clearOldCaches = useCallback(() => {
        return clearExpiredLocationImagesCaches();
    }, []);

    /**
     * Refetch images (bypassing cache)
     */
    const refetch = useCallback(() => {
        fetchImages(true);
    }, [fetchImages]);

    // Auto-fetch when location changes
    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    return {
        images,
        loading,
        error,
        refetch,
        clearCache,
        clearOldCaches,
    };
}
