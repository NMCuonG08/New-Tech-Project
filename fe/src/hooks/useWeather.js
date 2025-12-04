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

export function useWeather() {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [city, setCityState] = useState(getCity());
    const [units, setUnitsState] = useState(getUnits());

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
                const [currentData, forecastData] = await Promise.all([
                    getCurrentWeather(cityName, unitsType),
                    getForecast(cityName, unitsType),
                ]);

                setWeather(currentData);
                setForecast(forecastData);

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
        [city, units]
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

