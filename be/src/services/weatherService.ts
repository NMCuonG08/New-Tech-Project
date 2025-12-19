import axios from "axios";

const OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";
const OPEN_METEO_GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "surface_pressure",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "is_day",
  "weather_code",
];

const HOURLY_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "surface_pressure",
  "pressure_msl",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "precipitation_probability",
  "weather_code",
  "is_day",
];

const DAILY_FIELDS = ["sunrise", "sunset"];

const DEFAULT_WEATHER_MAPPING = { main: "Clear", description: "Trời quang", iconDay: "01d", iconNight: "01n" };

const WEATHER_CODE_MAP: Record<number, { main: string; description: string; iconDay: string; iconNight: string }> = {
  0: DEFAULT_WEATHER_MAPPING,
  1: { main: "Mostly Clear", description: "Trời ít mây", iconDay: "02d", iconNight: "02n" },
  2: { main: "Partly Cloudy", description: "Có mây", iconDay: "03d", iconNight: "03n" },
  3: { main: "Overcast", description: "Âm u", iconDay: "04d", iconNight: "04n" },
  45: { main: "Fog", description: "Sương mù", iconDay: "50d", iconNight: "50n" },
  48: { main: "Depositing Rime Fog", description: "Sương giá", iconDay: "50d", iconNight: "50n" },
  51: { main: "Drizzle", description: "Mưa phùn nhẹ", iconDay: "09d", iconNight: "09n" },
  53: { main: "Drizzle", description: "Mưa phùn vừa", iconDay: "09d", iconNight: "09n" },
  55: { main: "Drizzle", description: "Mưa phùn nặng hạt", iconDay: "09d", iconNight: "09n" },
  56: { main: "Freezing Drizzle", description: "Mưa phùn băng", iconDay: "13d", iconNight: "13n" },
  57: { main: "Freezing Drizzle", description: "Mưa phùn băng", iconDay: "13d", iconNight: "13n" },
  61: { main: "Rain", description: "Mưa nhẹ", iconDay: "10d", iconNight: "10n" },
  63: { main: "Rain", description: "Mưa vừa", iconDay: "10d", iconNight: "10n" },
  65: { main: "Rain", description: "Mưa to", iconDay: "10d", iconNight: "10n" },
  66: { main: "Freezing Rain", description: "Mưa băng nhẹ", iconDay: "13d", iconNight: "13n" },
  67: { main: "Freezing Rain", description: "Mưa băng nặng hạt", iconDay: "13d", iconNight: "13n" },
  71: { main: "Snow", description: "Tuyết nhẹ", iconDay: "13d", iconNight: "13n" },
  73: { main: "Snow", description: "Tuyết vừa", iconDay: "13d", iconNight: "13n" },
  75: { main: "Snow", description: "Tuyết nặng hạt", iconDay: "13d", iconNight: "13n" },
  77: { main: "Snow Grains", description: "Mưa tuyết", iconDay: "13d", iconNight: "13n" },
  80: { main: "Rain Showers", description: "Mưa rào nhẹ", iconDay: "09d", iconNight: "09n" },
  81: { main: "Rain Showers", description: "Mưa rào vừa", iconDay: "09d", iconNight: "09n" },
  82: { main: "Rain Showers", description: "Mưa rào mạnh", iconDay: "09d", iconNight: "09n" },
  85: { main: "Snow Showers", description: "Mưa tuyết nhẹ", iconDay: "13d", iconNight: "13n" },
  86: { main: "Snow Showers", description: "Mưa tuyết mạnh", iconDay: "13d", iconNight: "13n" },
  95: { main: "Thunderstorm", description: "Dông", iconDay: "11d", iconNight: "11n" },
  96: { main: "Thunderstorm", description: "Dông có mưa đá nhẹ", iconDay: "11d", iconNight: "11n" },
  99: { main: "Thunderstorm", description: "Dông có mưa đá mạnh", iconDay: "11d", iconNight: "11n" },
};

function getUnitsConfig(units: string = "metric") {
  if (units === "imperial") {
    return { temperatureUnit: "fahrenheit", windSpeedUnit: "mph" };
  }
  return { temperatureUnit: "celsius", windSpeedUnit: "ms" };
}

function convertTemperature(value: number | null | undefined, units: string): number | null {
  if (typeof value !== "number") return value ?? null;
  if (units === "kelvin") {
    return value + 273.15;
  }
  return value;
}

function isoToEpochSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.floor(date.getTime() / 1000);
}

function mapWeatherCodeToCondition(code: number, isDay: number = 1) {
  const mapping = WEATHER_CODE_MAP[code] ?? DEFAULT_WEATHER_MAPPING;
  const icon = (isDay ? mapping.iconDay : mapping.iconNight) || mapping.iconDay;
  return {
    id: typeof code === "number" ? code : 0,
    main: mapping.main,
    description: mapping.description,
    icon,
  };
}

async function geocodeCity(cityName: string) {
  const params = new URLSearchParams({
    name: cityName,
    count: "1",
    language: "vi",
    format: "json",
  });

  try {
    const response = await axios.get(`${OPEN_METEO_GEOCODING_API}?${params.toString()}`);
    const data = response.data;
    const [result] = data.results || [];
    if (result) {
      return {
        name: result.name,
        country: result.country_code,
        lat: result.latitude,
        lon: result.longitude,
        timezone: result.timezone,
      };
    }
  } catch (error) {
    console.warn("Geocoding failed:", error);
  }

  throw new Error(`Không tìm được tọa độ cho thành phố: ${cityName}`);
}

async function fetchOpenMeteoData(lat: number, lon: number, units: string = "metric") {
  const { temperatureUnit, windSpeedUnit } = getUnitsConfig(units);
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: CURRENT_FIELDS.join(","),
    hourly: HOURLY_FIELDS.join(","),
    daily: DAILY_FIELDS.join(","),
    timezone: "auto",
    forecast_days: "5",
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
  });

  const response = await axios.get(`${OPEN_METEO_API}?${params.toString()}`);
  return response.data;
}

function normalizeCurrentWeather(data: any, location: any, units: string) {
  const current = data.current || {};
  const weather = mapWeatherCodeToCondition(current.weather_code, current.is_day);
  const pressure = current.surface_pressure ?? current.pressure_msl ?? 1013;
  const sunrise = isoToEpochSeconds(data.daily?.sunrise?.[0]);
  const sunset = isoToEpochSeconds(data.daily?.sunset?.[0]);

  return {
    coord: { lon: location.lon, lat: location.lat },
    weather: [weather],
    base: "stations",
    main: {
      temp: convertTemperature(current.temperature_2m, units) ?? 25,
      feels_like: convertTemperature(current.apparent_temperature, units) ?? convertTemperature(current.temperature_2m, units),
      temp_min: convertTemperature(current.temperature_2m, units),
      temp_max: convertTemperature(current.temperature_2m, units),
      pressure: Math.round(pressure),
      humidity: current.relative_humidity_2m ?? 65,
    },
    visibility: 10000,
    wind: {
      speed: current.wind_speed_10m ?? 3.5,
      deg: current.wind_direction_10m ?? 180,
      gust: current.wind_gusts_10m ?? null,
    },
    clouds: {
      all: weather.id === 0 ? 0 : 60,
    },
    dt: isoToEpochSeconds(current.time) ?? Math.floor(Date.now() / 1000),
    sys: {
      country: location.country ?? "VN",
      sunrise: sunrise ?? Math.floor(Date.now() / 1000) - 36000,
      sunset: sunset ?? Math.floor(Date.now() / 1000) + 18000,
    },
    timezone: data.utc_offset_seconds ?? 0,
    id: `${location.lat},${location.lon}`,
    name: location.name,
    cod: 200,
  };
}

function buildForecastList(data: any, location: any, units: string) {
  const hourly = data.hourly || {};
  const times = hourly.time || [];
  const FORECAST_HOURS = 48;
  const list = times.slice(0, FORECAST_HOURS).map((time: string, index: number) => {
    const temp = convertTemperature(hourly.temperature_2m?.[index], units);
    const feelsLike = convertTemperature(hourly.apparent_temperature?.[index], units);
    const humidity = hourly.relative_humidity_2m?.[index];
    const pressureValue =
      hourly.surface_pressure?.[index] ??
      hourly.pressure_msl?.[index] ??
      data.current?.surface_pressure ??
      data.current?.pressure_msl ??
      1013;
    const windSpeed = hourly.wind_speed_10m?.[index] ?? data.current?.wind_speed_10m ?? 0;
    const windDeg = hourly.wind_direction_10m?.[index] ?? data.current?.wind_direction_10m ?? 0;
    const windGust = hourly.wind_gusts_10m?.[index] ?? data.current?.wind_gusts_10m ?? null;
    const precipitationProb = hourly.precipitation_probability?.[index];
    const isDay = hourly.is_day?.[index] ?? 1;
    const weather = mapWeatherCodeToCondition(hourly.weather_code?.[index], isDay);
    const dt = isoToEpochSeconds(time) ?? Math.floor(Date.now() / 1000);

    return {
      dt,
      dt_txt: time,
      main: {
        temp,
        feels_like: feelsLike ?? temp,
        temp_min: temp,
        temp_max: temp,
        pressure: Math.round(pressureValue),
        humidity: humidity ?? data.current?.relative_humidity_2m ?? 0,
      },
      weather: [weather],
      clouds: {
        all: weather.id === 0 ? 0 : 60,
      },
      wind: {
        speed: windSpeed,
        deg: windDeg,
        gust: windGust,
      },
      visibility: 10000,
      pop: typeof precipitationProb === "number" ? precipitationProb / 100 : 0,
      sys: {
        pod: isDay ? "d" : "n",
      },
    };
  });

  return {
    cod: "200",
    message: 0,
    cnt: list.length,
    list,
    city: {
      id: `${location.lat},${location.lon}`,
      name: location.name,
      coord: {
        lat: location.lat,
        lon: location.lon,
      },
      country: location.country ?? "VN",
      timezone: data.utc_offset_seconds ?? 0,
      sunrise: isoToEpochSeconds(data.daily?.sunrise?.[0]),
      sunset: isoToEpochSeconds(data.daily?.sunset?.[0]),
    },
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export class WeatherService {
  async getCurrentWeather(city: string, units: string = "metric") {
    const location = await geocodeCity(city);
    const data = await fetchOpenMeteoData(location.lat, location.lon, units);
    return normalizeCurrentWeather(data, location, units);
  }

  async getForecast(city: string, units: string = "metric") {
    const location = await geocodeCity(city);
    const data = await fetchOpenMeteoData(location.lat, location.lon, units);
    return buildForecastList(data, location, units);
  }

  async getWeatherByCoords(lat: number, lon: number, units: string = "metric") {
    const data = await fetchOpenMeteoData(lat, lon, units);
    const location = {
      name: "Vị trí của bạn",
      country: "VN",
      lat,
      lon,
    };
    return normalizeCurrentWeather(data, location, units);
  }

  /**
   * Get hourly forecast with pagination and sorting
   */
  async getHourlyForecast(city: string, units: string = "metric", options: PaginationOptions = {}) {
    const { page = 1, limit = 24, sortOrder = 'asc' } = options;
    
    const location = await geocodeCity(city);
    const data = await fetchOpenMeteoData(location.lat, location.lon, units);
    
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    
    // Build all hourly items
    let allItems = times.map((time: string, index: number) => {
      const temp = convertTemperature(hourly.temperature_2m?.[index], units);
      const feelsLike = convertTemperature(hourly.apparent_temperature?.[index], units);
      const humidity = hourly.relative_humidity_2m?.[index];
      const pressureValue = hourly.surface_pressure?.[index] ?? hourly.pressure_msl?.[index] ?? 1013;
      const windSpeed = hourly.wind_speed_10m?.[index] ?? 0;
      const windDeg = hourly.wind_direction_10m?.[index] ?? 0;
      const windGust = hourly.wind_gusts_10m?.[index] ?? null;
      const precipitationProb = hourly.precipitation_probability?.[index];
      const isDay = hourly.is_day?.[index] ?? 1;
      const weather = mapWeatherCodeToCondition(hourly.weather_code?.[index], isDay);
      const dt = isoToEpochSeconds(time) ?? Math.floor(Date.now() / 1000);

      return {
        dt,
        dt_txt: time,
        main: {
          temp,
          feels_like: feelsLike ?? temp,
          temp_min: temp,
          temp_max: temp,
          pressure: Math.round(pressureValue),
          humidity: humidity ?? 0,
        },
        weather: [weather],
        clouds: { all: weather.id === 0 ? 0 : 60 },
        wind: { speed: windSpeed, deg: windDeg, gust: windGust },
        visibility: 10000,
        pop: typeof precipitationProb === "number" ? precipitationProb / 100 : 0,
        sys: { pod: isDay ? "d" : "n" },
      };
    });

    // Sort by time
    if (sortOrder === 'desc') {
      allItems = allItems.sort((a: any, b: any) => b.dt - a.dt);
    } else {
      allItems = allItems.sort((a: any, b: any) => a.dt - b.dt);
    }

    // Pagination
    const total = allItems.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = allItems.slice(startIndex, startIndex + limit);

    return {
      cod: "200",
      list: paginatedItems,
      city: {
        id: `${location.lat},${location.lon}`,
        name: location.name,
        coord: { lat: location.lat, lon: location.lon },
        country: location.country ?? "VN",
        timezone: data.utc_offset_seconds ?? 0,
        sunrise: isoToEpochSeconds(data.daily?.sunrise?.[0]),
        sunset: isoToEpochSeconds(data.daily?.sunset?.[0]),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Get daily forecast with pagination and sorting
   * Aggregates hourly data into daily summaries
   */
  async getDailyForecast(city: string, units: string = "metric", options: PaginationOptions = {}) {
    const { page = 1, limit = 7, sortOrder = 'asc' } = options;
    
    const location = await geocodeCity(city);
    const data = await fetchOpenMeteoData(location.lat, location.lon, units);
    
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    
    // Group hourly data by date
    const dailyMap: Record<string, any[]> = {};
    
    times.forEach((time: string, index: number) => {
      const dateKey = time.split('T')[0] || ''; // Get YYYY-MM-DD
      if (!dateKey) return; // Skip if no valid date
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = [];
      }
      
      dailyMap[dateKey].push({
        time,
        temp: hourly.temperature_2m?.[index],
        feelsLike: hourly.apparent_temperature?.[index],
        humidity: hourly.relative_humidity_2m?.[index],
        pressure: hourly.surface_pressure?.[index] ?? hourly.pressure_msl?.[index],
        windSpeed: hourly.wind_speed_10m?.[index],
        windDeg: hourly.wind_direction_10m?.[index],
        pop: hourly.precipitation_probability?.[index],
        weatherCode: hourly.weather_code?.[index],
        isDay: hourly.is_day?.[index],
      });
    });

    // Aggregate into daily summaries
    let dailyItems = Object.entries(dailyMap).map(([dateKey, hourlyItems]) => {
      const temps = hourlyItems.map(h => h.temp).filter((t): t is number => typeof t === 'number');
      const humidities = hourlyItems.map(h => h.humidity).filter((h): h is number => typeof h === 'number');
      const pops = hourlyItems.map(h => h.pop).filter((p): p is number => typeof p === 'number');
      const windSpeeds = hourlyItems.map(h => h.windSpeed).filter((w): w is number => typeof w === 'number');
      
      // Get most common weather code (mode)
      const weatherCodes = hourlyItems.map(h => h.weatherCode).filter((c): c is number => typeof c === 'number');
      const weatherCode: number = (weatherCodes.length > 0 ? weatherCodes[Math.floor(weatherCodes.length / 2)] : 0) ?? 0;
      const weather = mapWeatherCodeToCondition(weatherCode, 1);
      
      const dt = isoToEpochSeconds(`${dateKey}T12:00:00`) ?? Math.floor(Date.now() / 1000);
      
      return {
        dt,
        dt_txt: dateKey,
        main: {
          temp: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 25,
          temp_min: temps.length > 0 ? Math.min(...temps) : 20,
          temp_max: temps.length > 0 ? Math.max(...temps) : 30,
          feels_like: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 25,
          humidity: humidities.length > 0 ? Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length) : 65,
          pressure: hourlyItems[0]?.pressure ?? 1013,
        },
        weather: [weather],
        clouds: { all: weather.id === 0 ? 0 : 60 },
        wind: {
          speed: windSpeeds.length > 0 ? windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length : 3,
          deg: hourlyItems[0]?.windDeg ?? 180,
        },
        pop: pops.length > 0 ? Math.max(...pops) / 100 : 0,
        rain: pops.length > 0 && Math.max(...pops) > 50 ? Math.max(...pops) / 10 : 0,
      };
    });

    // Sort by date
    if (sortOrder === 'desc') {
      dailyItems = dailyItems.sort((a, b) => b.dt - a.dt);
    } else {
      dailyItems = dailyItems.sort((a, b) => a.dt - b.dt);
    }

    // Pagination
    const total = dailyItems.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedItems = dailyItems.slice(startIndex, startIndex + limit);

    return {
      cod: "200",
      list: paginatedItems,
      city: {
        id: `${location.lat},${location.lon}`,
        name: location.name,
        coord: { lat: location.lat, lon: location.lon },
        country: location.country ?? "VN",
        timezone: data.utc_offset_seconds ?? 0,
        sunrise: isoToEpochSeconds(data.daily?.sunrise?.[0]),
        sunset: isoToEpochSeconds(data.daily?.sunset?.[0]),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

export const weatherService = new WeatherService();

