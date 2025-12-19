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
}

export const weatherService = new WeatherService();

