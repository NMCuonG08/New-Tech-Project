// IndexedDB Service - Offline storage cho weather data

const DB_NAME = 'WeatherPWA';
const DB_VERSION = 1;
const STORES = {
    WEATHER: 'weather',
    LOCATIONS: 'locations',
    SETTINGS: 'settings',
};

let db = null;

/**
 * Khởi tạo IndexedDB
 */
export function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error('Failed to open IndexedDB'));
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Weather store
            if (!database.objectStoreNames.contains(STORES.WEATHER)) {
                const weatherStore = database.createObjectStore(STORES.WEATHER, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                weatherStore.createIndex('city', 'city', { unique: false });
                weatherStore.createIndex('timestamp', 'timestamp', { unique: false });
            }

            // Locations store
            if (!database.objectStoreNames.contains(STORES.LOCATIONS)) {
                const locationsStore = database.createObjectStore(STORES.LOCATIONS, {
                    keyPath: 'id',
                    autoIncrement: true,
                });
                locationsStore.createIndex('name', 'name', { unique: true });
            }

            // Settings store
            if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
                database.createObjectStore(STORES.SETTINGS, {
                    keyPath: 'key',
                });
            }
        };
    });
}

/**
 * Lưu weather data
 */
export async function saveWeatherData(city, data) {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.WEATHER], 'readwrite');
        const store = transaction.objectStore(STORES.WEATHER);
        const index = store.index('city');

        const weatherData = {
            city,
            data,
            timestamp: Date.now(),
        };

        // Xóa data cũ của city này trước
        return new Promise((resolve, reject) => {
            const deleteRequest = index.openCursor(IDBKeyRange.only(city));

            deleteRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    // Đã xóa hết, thêm data mới
                    const addRequest = store.add(weatherData);
                    addRequest.onsuccess = () => resolve(weatherData);
                    addRequest.onerror = () => reject(new Error('Failed to save weather data'));
                }
            };

            deleteRequest.onerror = () => reject(new Error('Failed to delete old weather data'));
        });
    } catch (error) {
        console.error('Error saving weather data:', error);
        throw error;
    }
}

/**
 * Lấy weather data từ cache
 */
export async function getCachedWeatherData(city) {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.WEATHER], 'readonly');
        const store = transaction.objectStore(STORES.WEATHER);
        const index = store.index('city');

        return new Promise((resolve, reject) => {
            // Lấy tất cả records của city này, lấy record mới nhất
            const request = index.openCursor(IDBKeyRange.only(city));
            let latestRecord = null;
            let latestTimestamp = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const record = cursor.value;
                    if (record.timestamp > latestTimestamp) {
                        latestTimestamp = record.timestamp;
                        latestRecord = record;
                    }
                    cursor.continue();
                } else {
                    // Đã duyệt hết
                    if (latestRecord && Date.now() - latestRecord.timestamp < 10 * 60 * 1000) {
                        // Cache còn hiệu lực (< 10 phút)
                        resolve(latestRecord.data);
                    } else {
                        resolve(null);
                    }
                }
            };

            request.onerror = () => reject(new Error('Failed to get cached weather data'));
        });
    } catch (error) {
        console.error('Error getting cached weather data:', error);
        return null;
    }
}

/**
 * Lưu location
 */
export async function saveLocation(location) {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.LOCATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.LOCATIONS);

        return new Promise((resolve, reject) => {
            const request = store.put(location);
            request.onsuccess = () => resolve(location);
            request.onerror = () => reject(new Error('Failed to save location'));
        });
    } catch (error) {
        console.error('Error saving location:', error);
        throw error;
    }
}

/**
 * Lấy tất cả locations
 */
export async function getAllLocations() {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.LOCATIONS], 'readonly');
        const store = transaction.objectStore(STORES.LOCATIONS);

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to get locations'));
        });
    } catch (error) {
        console.error('Error getting locations:', error);
        return [];
    }
}

/**
 * Xóa location
 */
export async function deleteLocation(id) {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.LOCATIONS], 'readwrite');
        const store = transaction.objectStore(STORES.LOCATIONS);

        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to delete location'));
        });
    } catch (error) {
        console.error('Error deleting location:', error);
        throw error;
    }
}

/**
 * Lưu settings
 */
export async function saveSetting(key, value) {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.SETTINGS], 'readwrite');
        const store = transaction.objectStore(STORES.SETTINGS);

        return new Promise((resolve, reject) => {
            const request = store.put({ key, value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to save setting'));
        });
    } catch (error) {
        console.error('Error saving setting:', error);
        throw error;
    }
}

/**
 * Lấy setting
 */
export async function getSetting(key) {
    try {
        const database = await initDB();
        const transaction = database.transaction([STORES.SETTINGS], 'readonly');
        const store = transaction.objectStore(STORES.SETTINGS);

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.value : null);
            };
            request.onerror = () => reject(new Error('Failed to get setting'));
        });
    } catch (error) {
        console.error('Error getting setting:', error);
        return null;
    }
}

