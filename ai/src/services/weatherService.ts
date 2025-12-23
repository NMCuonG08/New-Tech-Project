// src/services/weatherService.ts

import axios from "axios";

import { ENV } from "../config/env";

interface CityCoordinates {
  lat: number;
  lon: number;
  name: string;
}

class WeatherService {
  private baseURL: string;
  private archiveURL: string;
  private cityCoordinates: Record<string, CityCoordinates>;
  private geocodingAPI: string;

  constructor() {
    this.baseURL =
      process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1";
    this.archiveURL =
      process.env.OPEN_METEO_ARCHIVE_URL ||
      "https://archive-api.open-meteo.com/v1";
    this.geocodingAPI = "https://geocoding-api.open-meteo.com/v1/search";

    // Initial explicit cache is empty, we rely on DB/API
    this.cityCoordinates = {};
  }

  // Get coordinates for a city (async)
  async getCoordinates(cityName: string): Promise<CityCoordinates | null> {
    const normalized = cityName.toLowerCase().trim();
    
    // 1. Check local cache first
    if (this.cityCoordinates[normalized]) {
      return this.cityCoordinates[normalized];
    }

    // 2. Try fetching from Backend Database (Priority)
    try {
      console.log(`🔌 Fetching location from Backend DB: ${cityName}`);
      const response = await axios.get(`${ENV.BACKEND_URL}/api/locations/search`, {
        params: { q: cityName },
      });

      if (response.data.success && response.data.data.length > 0) {
        // Find best match (prefer exact match if possible, but search usually returns relevant first)
        const bestMatch = response.data.data[0];
      
        
        if (bestMatch.lat && bestMatch.lon) {
           const coords: CityCoordinates = {
            lat: Number(bestMatch.lat),
            lon: Number(bestMatch.lon),
            name: bestMatch.name,
          };
          this.cityCoordinates[normalized] = coords;
          console.log(`✅ Found in DB: ${bestMatch.name}`);
          return coords;
        }
      }
    } catch (error) {
       console.warn(`⚠️ Failed to fetch from Backend DB: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // 3. Fallback to OpenMeteo Geocoding API (for International or missing locations)
    try {
      console.log(`🌍 Geocoding fallback: ${cityName}`);
      const response = await axios.get(this.geocodingAPI, {
        params: {
          name: cityName,
          count: 1,
          language: "vi",
          format: "json",
        },
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        const coords: CityCoordinates = {
          lat: result.latitude,
          lon: result.longitude,
          name: result.name,
        };
        
        // Cache the result
        this.cityCoordinates[normalized] = coords;
        return coords;
      }
    } catch (error) {
      console.error(`Geocoding failed for ${cityName}:`, error);
    }

    return null;
  }

  // Current weather
  async getCurrentWeather(city: string) {
    const coords = await this.getCoordinates(city);
    if (!coords) {
      throw new Error(`City "${city}" not found`);
    }

    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "weather_code",
            "cloud_cover",
            "wind_speed_10m",
            "wind_direction_10m",
          ].join(","),
          timezone: "Asia/Bangkok",
        },
      });

      return {
        city: coords.name,
        current: response.data.current,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to fetch current weather: ${errorMessage}`);
    }
  }

  // Forecast (up to 16 days)
  async getForecast(city: string, days: number = 7) {
    const coords = await this.getCoordinates(city);
    if (!coords) {
      throw new Error(`City "${city}" not found`);
    }

    try {
      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "precipitation_sum",
            "rain_sum",
            "precipitation_probability_max",
            "wind_speed_10m_max",
            "uv_index_max",
          ].join(","),
          timezone: "Asia/Bangkok",
          forecast_days: days,
        },
      });

      return {
        city: coords.name,
        daily: response.data.daily,
        timezone: response.data.timezone,
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.reason ||
        error.message ||
        "Unknown error";
      console.error("Open-Meteo Forecast Error:", error.response?.data);
      throw new Error(`Failed to fetch forecast: ${errorMessage}`);
    }
  }

  // Historical weather
  async getHistoricalWeather(city: string, startDate: string, endDate: string) {
    const coords = await this.getCoordinates(city);
    if (!coords) {
      throw new Error(`City "${city}" not found`);
    }

    try {
      const response = await axios.get(`${this.archiveURL}/archive`, {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          start_date: startDate, // Format: YYYY-MM-DD
          end_date: endDate,
          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "temperature_2m_mean",
            "precipitation_sum",
            "rain_sum",
            "wind_speed_10m_max",
          ].join(","),
          timezone: "Asia/Bangkok",
        },
      });

      return {
        city: coords.name,
        daily: response.data.daily,
        period: { start: startDate, end: endDate },
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.reason ||
        error.message ||
        "Unknown error";
       console.error("Open-Meteo API Error:", error.response?.data);
      throw new Error(`Failed to fetch historical weather: ${errorMessage}`);
    }
  }

  // Weather code to condition text
  getWeatherCondition(code: number): string {
    const conditions: Record<number, string> = {
      0: "Trời quang đãng",
      1: "Ít mây",
      2: "Nhiều mây",
      3: "U ám",
      45: "Có sương mù",
      48: "Sương mù dày",
      51: "Mưa phùn nhẹ",
      53: "Mưa phùn vừa",
      55: "Mưa phùn dày đặc",
      61: "Mưa nhỏ",
      63: "Mưa vừa",
      65: "Mưa to",
      71: "Tuyết rơi nhẹ",
      73: "Tuyết rơi vừa",
      75: "Tuyết rơi dày",
      80: "Mưa rào nhẹ",
      81: "Mưa rào vừa",
      82: "Mưa rào to",
      95: "Dông",
      96: "Dông có mưa đá nhỏ",
      99: "Dông có mưa đá to",
    };

    return conditions[code] || "Không xác định";
  }
}

export default WeatherService;

