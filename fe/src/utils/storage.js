// Storage utilities - LocalStorage helpers

/**
 * Lưu vào localStorage
 */
export function setStorage(key, value) {
    try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Lấy từ localStorage
 */
export function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Xóa từ localStorage
 */
export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage:', error);
    }
}

/**
 * Clear tất cả localStorage
 */
export function clearStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}

/**
 * Lưu city preference
 */
export function saveCity(city) {
    setStorage('weather-city', city);
}

/**
 * Lấy city preference
 */
export function getCity() {
    return getStorage('weather-city', 'Hanoi');
}

/**
 * Lưu units preference
 */
export function saveUnits(units) {
    setStorage('weather-units', units);
}

/**
 * Lấy units preference
 */
export function getUnits() {
    return getStorage('weather-units', 'metric');
}

/**
 * Lưu notification settings
 */
export function saveNotificationSettings(settings) {
    setStorage('notification-settings', settings);
}

/**
 * Lấy notification settings
 */
export function getNotificationSettings() {
    return getStorage('notification-settings', {
        enabled: false,
        alerts: false,
        daily: false,
    });
}

