/**
 * Location Images Cache Service
 * Provides utilities to manage location images cache in localStorage
 * Can be used outside of React components
 */

const CACHE_KEY_PREFIX = 'location_images_';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached images for a location
 * @param {string} locationName - Name of the location
 * @returns {Array|null} - Array of image URLs or null if not found/expired
 */
export function getCachedLocationImages(locationName) {
    if (!locationName) return null;

    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${locationName.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);

        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - timestamp < CACHE_EXPIRY_MS) {
            console.log(`✅ Using cached images for "${locationName}"`);
            return data;
        } else {
            console.log(`⏰ Cache expired for "${locationName}"`);
            localStorage.removeItem(cacheKey);
            return null;
        }
    } catch (err) {
        console.error('Error reading from cache:', err);
        return null;
    }
}

/**
 * Save images to cache for a location
 * @param {string} locationName - Name of the location
 * @param {Array} images - Array of image URLs
 */
export function setCachedLocationImages(locationName, images) {
    if (!locationName || !images) return;

    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${locationName.toLowerCase()}`;
        const cacheData = {
            data: images,
            timestamp: Date.now(),
        };

        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log(`💾 Cached ${images.length} images for "${locationName}"`);
    } catch (err) {
        console.error('Error saving to cache:', err);

        // If localStorage is full, try to clear old caches
        if (err.name === 'QuotaExceededError') {
            const cleared = clearExpiredLocationImagesCaches();
            console.log(`🗑️ Cleared ${cleared} expired caches due to quota exceeded`);

            // Try again after clearing
            try {
                const cacheKey = `${CACHE_KEY_PREFIX}${locationName.toLowerCase()}`;
                const cacheData = {
                    data: images,
                    timestamp: Date.now(),
                };
                localStorage.setItem(cacheKey, JSON.stringify(cacheData));
                console.log(`💾 Cached ${images.length} images for "${locationName}" after clearing`);
            } catch (retryErr) {
                console.error('Failed to cache even after clearing:', retryErr);
            }
        }
    }
}

/**
 * Clear cache for a specific location
 * @param {string} locationName - Name of the location
 */
export function clearLocationImagesCache(locationName) {
    if (!locationName) return;

    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${locationName.toLowerCase()}`;
        localStorage.removeItem(cacheKey);
        console.log(`🗑️ Cleared cache for "${locationName}"`);
    } catch (err) {
        console.error('Error clearing cache:', err);
    }
}

/**
 * Clear all expired location images caches
 * @returns {number} - Number of caches cleared
 */
export function clearExpiredLocationImagesCaches() {
    try {
        const now = Date.now();
        const keysToRemove = [];

        // Find all location image cache keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                try {
                    const cached = localStorage.getItem(key);
                    const { timestamp } = JSON.parse(cached);

                    if (now - timestamp >= CACHE_EXPIRY_MS) {
                        keysToRemove.push(key);
                    }
                } catch (err) {
                    // Invalid cache entry, mark for removal
                    keysToRemove.push(key);
                }
            }
        }

        // Remove expired caches
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🗑️ Removed expired cache: ${key}`);
        });

        return keysToRemove.length;
    } catch (err) {
        console.error('Error clearing old caches:', err);
        return 0;
    }
}

/**
 * Clear all location images caches
 * @returns {number} - Number of caches cleared
 */
export function clearAllLocationImagesCaches() {
    try {
        const keysToRemove = [];

        // Find all location image cache keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        // Remove all caches
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(`🗑️ Cleared all ${keysToRemove.length} location image caches`);
        return keysToRemove.length;
    } catch (err) {
        console.error('Error clearing all caches:', err);
        return 0;
    }
}

/**
 * Get cache info for a location
 * @param {string} locationName - Name of the location
 * @returns {Object|null} - Cache info { exists, expired, imageCount, age } or null
 */
export function getLocationImagesCacheInfo(locationName) {
    if (!locationName) return null;

    try {
        const cacheKey = `${CACHE_KEY_PREFIX}${locationName.toLowerCase()}`;
        const cached = localStorage.getItem(cacheKey);

        if (!cached) {
            return { exists: false, expired: false, imageCount: 0, age: 0 };
        }

        const { data, timestamp } = JSON.parse(cached);
        const now = Date.now();
        const age = now - timestamp;
        const expired = age >= CACHE_EXPIRY_MS;

        return {
            exists: true,
            expired,
            imageCount: data?.length || 0,
            age,
            ageHours: Math.floor(age / (60 * 60 * 1000)),
        };
    } catch (err) {
        console.error('Error getting cache info:', err);
        return null;
    }
}

/**
 * Get all cached locations info
 * @returns {Array} - Array of cache info objects
 */
export function getAllLocationImagesCaches() {
    try {
        const caches = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(CACHE_KEY_PREFIX)) {
                const locationName = key.replace(CACHE_KEY_PREFIX, '');
                const info = getLocationImagesCacheInfo(locationName);
                if (info && info.exists) {
                    caches.push({
                        location: locationName,
                        ...info,
                    });
                }
            }
        }

        return caches;
    } catch (err) {
        console.error('Error getting all caches:', err);
        return [];
    }
}
