// src/services/weatherService.ts

import axios from "axios";

interface CityCoordinates {
  lat: number;
  lon: number;
  name: string;
}

class WeatherService {
  private baseURL: string;
  private archiveURL: string;
  private cityCoordinates: Record<string, CityCoordinates>;

  constructor() {
    this.baseURL =
      process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1";
    this.archiveURL =
      process.env.OPEN_METEO_ARCHIVE_URL ||
      "https://archive-api.open-meteo.com/v1";

    // City coordinates database (expand this!)
    this.cityCoordinates = {
      hanoi: { lat: 21.0285, lon: 105.8542, name: "Hà Nội" },
      "ha noi": { lat: 21.0285, lon: 105.8542, name: "Hà Nội" },
      saigon: { lat: 10.8231, lon: 106.6297, name: "TP. Hồ Chí Minh" },
      "ho chi minh": { lat: 10.8231, lon: 106.6297, name: "TP. Hồ Chí Minh" },
      "sai gon": { lat: 10.8231, lon: 106.6297, name: "TP. Hồ Chí Minh" },
      "da nang": { lat: 16.0544, lon: 108.2022, name: "Đà Nẵng" },
      danang: { lat: 16.0544, lon: 108.2022, name: "Đà Nẵng" },
      hue: { lat: 16.4637, lon: 107.5909, name: "Huế" },
      "nha trang": { lat: 12.2388, lon: 109.1967, name: "Nha Trang" },
      "da lat": { lat: 11.9404, lon: 108.4583, name: "Đà Lạt" },
      dalat: { lat: 11.9404, lon: 108.4583, name: "Đà Lạt" },
      "can tho": { lat: 10.0452, lon: 105.7469, name: "Cần Thơ" },
      "hai phong": { lat: 20.8449, lon: 106.6881, name: "Hải Phòng" },
    };
  }

  // Get coordinates for a city
  getCoordinates(cityName: string): CityCoordinates | null {
    const normalized = cityName.toLowerCase().trim();
    return this.cityCoordinates[normalized] || null;
  }

  // Current weather
  async getCurrentWeather(city: string) {
    const coords = this.getCoordinates(city);
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
    const coords = this.getCoordinates(city);
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to fetch forecast: ${errorMessage}`);
    }
  }

  // Historical weather
  async getHistoricalWeather(city: string, startDate: string, endDate: string) {
    const coords = this.getCoordinates(city);
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
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

