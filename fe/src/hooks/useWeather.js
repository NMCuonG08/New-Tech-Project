// useWeather hook - Quản lý weather data

import { useState, useEffect, useCallback } from 'react';
import {
    getCurrentWeather,
    getForecast,
    getWeatherByCoords,
} from '../services/weatherService';
import {
    saveWeatherData,
    getCachedWeatherData,
} from '../services/dbService';
import { getCity, getUnits, saveUnits } from '../utils/storage';
import { useAlertsStore } from '../store/alertsStore';

export function useWeather() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [city, setCityState] = useState(() => {
        const savedCity = getCity();
        console.log('[useWeather] Initializing city from localStorage:', savedCity);
        return savedCity;
    });
    const [units, setUnitsState] = useState(getUnits());
    
    // Get alert checking function
    const checkAndNotify = useAlertsStore(state => state.checkAndNotify);

    // Load weather data
    const loadWeather = useCallback(
        async (cityName = city, unitsType = units, useCache = true) => {
            setLoading(true);
            setError(null);

            try {
                // Thử lấy từ cache trước
                if (useCache) {
                    const cached = await getCachedWeatherData(cityName);
                    if (cached) {
                        setWeather(cached.current);
                        setForecast(cached.forecast);
                        setLoading(false);
                    }
                }

                // Fetch từ API
                console.log('[useWeather] Calling API with city:', cityName, 'units:', unitsType);
                const [currentData, forecastData] = await Promise.all([
                    getCurrentWeather(cityName, unitsType),
                    getForecast(cityName, unitsType),
                ]);

                setWeather(currentData);
                setForecast(forecastData);

                // Check alerts with the weather data
                // Note: We need locationId - get it from the location search
                try {
                    // Get location data to find locationId
                    const locationResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/locations/search?q=${encodeURIComponent(cityName)}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    if (locationResponse.ok) {
                        const result = await locationResponse.json();
                        if (result.success && result.data && result.data.length > 0) {
                            // Check alerts for this location
                            await checkAndNotify(result.data[0].id, currentData);
                        }
                    }
                } catch (alertError) {
                    console.error('Error checking alerts:', alertError);
                    // Don't fail the weather load if alert check fails
                }

                // Lưu vào cache
                try {
                    await saveWeatherData(cityName, {
                        current: currentData,
                        forecast: forecastData,
                    });
                } catch (dbError) {
                    console.error('Error saving to cache:', dbError);
                }
            } catch (err) {
                console.error('Error loading weather:', err);
                setError(err.message || 'Failed to load weather data');

                // Thử lấy từ cache nếu API fail
                if (useCache) {
                    const cached = await getCachedWeatherData(cityName);
                    if (cached) {
                        setWeather(cached.current);
                        setForecast(cached.forecast);
                        setError(null);
                    }
                }
            } finally {
                setLoading(false);
            }
        },
        [city, units, checkAndNotify]
    );

    // Load weather by coordinates
    const loadWeatherByCoords = useCallback(
        async (lat, lon, unitsType = units) => {
            setLoading(true);
            setError(null);

            try {
                const data = await getWeatherByCoords(lat, lon, unitsType);
                setWeather(data);
                setCityState(data.name);

                // Lấy forecast cho city này
                await loadWeather(data.name, unitsType, false);
            } catch (err) {
                console.error('Error loading weather by coords:', err);
                setError(err.message || 'Failed to load weather data');
            } finally {
                setLoading(false);
            }
        },
        [units, loadWeather]
    );

    // Change city
    const changeCity = useCallback(
        (newCity) => {
            setCityState(newCity);
            // Save to localStorage using JSON.stringify (to match getStorage)
            localStorage.setItem('weather-city', JSON.stringify(newCity));
            loadWeather(newCity, units, true);
        },
        [units, loadWeather]
    );

    // Change units
    const changeUnits = useCallback(
        (newUnits) => {
            setUnitsState(newUnits);
            saveUnits(newUnits);
            loadWeather(city, newUnits, false);
        },
        [city, loadWeather]
    );

    // Refresh weather
    const refresh = useCallback(() => {
        loadWeather(city, units, false);
    }, [city, units, loadWeather]);

    // Load initial data
    useEffect(() => {
        loadWeather(city, units, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        weather,
        forecast,
        loading,
        error,
        city,
        units,
        changeCity,
        changeUnits,
        refresh,
        loadWeatherByCoords,
    };
}

