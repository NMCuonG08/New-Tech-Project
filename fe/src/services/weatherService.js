// Weather Service - Open-Meteo integration với mock fallback

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const OPEN_METEO_REVERSE_GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/reverse';

const DEFAULT_CITY = 'Hanoi';
const DEFAULT_VISIBILITY = 10000;
const FORECAST_HOURS = 48;

const CURRENT_FIELDS = [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'surface_pressure',
    'pressure_msl',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'is_day',
    'weather_code',
];

const HOURLY_FIELDS = [
    'temperature_2m',
    'apparent_temperature',
    'relative_humidity_2m',
    'surface_pressure',
    'pressure_msl',
    'wind_speed_10m',
    'wind_direction_10m',
    'wind_gusts_10m',
    'precipitation_probability',
    'weather_code',
    'is_day',
];

const DAILY_FIELDS = ['sunrise', 'sunset'];

const FALLBACK_LOCATIONS = {
    hanoi: { name: 'Hanoi', country: 'VN', lat: 21.0285, lon: 105.8542, timezone: 'Asia/Bangkok' },
    'ho chi minh city': { name: 'Ho Chi Minh City', country: 'VN', lat: 10.8231, lon: 106.6297, timezone: 'Asia/Ho_Chi_Minh' },
    danang: { name: 'Da Nang', country: 'VN', lat: 16.0471, lon: 108.2068, timezone: 'Asia/Ho_Chi_Minh' },
    'da nang': { name: 'Da Nang', country: 'VN', lat: 16.0471, lon: 108.2068, timezone: 'Asia/Ho_Chi_Minh' },
    'hai phong': { name: 'Hai Phong', country: 'VN', lat: 20.8449, lon: 106.6881, timezone: 'Asia/Ho_Chi_Minh' },
    'can tho': { name: 'Can Tho', country: 'VN', lat: 10.0452, lon: 105.7469, timezone: 'Asia/Ho_Chi_Minh' },
};

const WEATHER_CODE_MAP = {
    0: { main: 'Clear', description: 'Trời quang', iconDay: '01d', iconNight: '01n' },
    1: { main: 'Mostly Clear', description: 'Trời ít mây', iconDay: '02d', iconNight: '02n' },
    2: { main: 'Partly Cloudy', description: 'Có mây', iconDay: '03d', iconNight: '03n' },
    3: { main: 'Overcast', description: 'Âm u', iconDay: '04d', iconNight: '04n' },
    45: { main: 'Fog', description: 'Sương mù', iconDay: '50d', iconNight: '50n' },
    48: { main: 'Depositing Rime Fog', description: 'Sương giá', iconDay: '50d', iconNight: '50n' },
    51: { main: 'Drizzle', description: 'Mưa phùn nhẹ', iconDay: '09d', iconNight: '09n' },
    53: { main: 'Drizzle', description: 'Mưa phùn vừa', iconDay: '09d', iconNight: '09n' },
    55: { main: 'Drizzle', description: 'Mưa phùn nặng hạt', iconDay: '09d', iconNight: '09n' },
    56: { main: 'Freezing Drizzle', description: 'Mưa phùn băng', iconDay: '13d', iconNight: '13n' },
    57: { main: 'Freezing Drizzle', description: 'Mưa phùn băng', iconDay: '13d', iconNight: '13n' },
    61: { main: 'Rain', description: 'Mưa nhẹ', iconDay: '10d', iconNight: '10n' },
    63: { main: 'Rain', description: 'Mưa vừa', iconDay: '10d', iconNight: '10n' },
    65: { main: 'Rain', description: 'Mưa to', iconDay: '10d', iconNight: '10n' },
    66: { main: 'Freezing Rain', description: 'Mưa băng nhẹ', iconDay: '13d', iconNight: '13n' },
    67: { main: 'Freezing Rain', description: 'Mưa băng nặng hạt', iconDay: '13d', iconNight: '13n' },
    71: { main: 'Snow', description: 'Tuyết nhẹ', iconDay: '13d', iconNight: '13n' },
    73: { main: 'Snow', description: 'Tuyết vừa', iconDay: '13d', iconNight: '13n' },
    75: { main: 'Snow', description: 'Tuyết nặng hạt', iconDay: '13d', iconNight: '13n' },
    77: { main: 'Snow Grains', description: 'Mưa tuyết', iconDay: '13d', iconNight: '13n' },
    80: { main: 'Rain Showers', description: 'Mưa rào nhẹ', iconDay: '09d', iconNight: '09n' },
    81: { main: 'Rain Showers', description: 'Mưa rào vừa', iconDay: '09d', iconNight: '09n' },
    82: { main: 'Rain Showers', description: 'Mưa rào mạnh', iconDay: '09d', iconNight: '09n' },
    85: { main: 'Snow Showers', description: 'Mưa tuyết nhẹ', iconDay: '13d', iconNight: '13n' },
    86: { main: 'Snow Showers', description: 'Mưa tuyết mạnh', iconDay: '13d', iconNight: '13n' },
    95: { main: 'Thunderstorm', description: 'Dông', iconDay: '11d', iconNight: '11n' },
    96: { main: 'Thunderstorm', description: 'Dông có mưa đá nhẹ', iconDay: '11d', iconNight: '11n' },
    99: { main: 'Thunderstorm', description: 'Dông có mưa đá mạnh', iconDay: '11d', iconNight: '11n' },
    default: { main: 'Clouds', description: 'Có mây', iconDay: '03d', iconNight: '03n' },
};

const locationCache = new Map();
const reverseLocationCache = new Map();

// Mock data cho offline/testing
const mockWeatherData = {
    current: {
        coord: { lon: 105.85, lat: 21.03 },
        weather: [
            {
                id: 800,
                main: 'Clear',
                description: 'trời quang',
                icon: '01d',
            },
        ],
        base: 'stations',
        main: {
            temp: 28,
            feels_like: 30,
            temp_min: 26,
            temp_max: 30,
            pressure: 1013,
            humidity: 65,
        },
        visibility: 10000,
        wind: {
            speed: 3.5,
            deg: 180,
        },
        clouds: {
            all: 0,
        },
        dt: Math.floor(Date.now() / 1000),
        sys: {
            type: 1,
            id: 9308,
            country: 'VN',
            sunrise: Math.floor(Date.now() / 1000) - 36000,
            sunset: Math.floor(Date.now() / 1000) + 18000,
        },
        timezone: 25200,
        id: 1581130,
        name: 'Hanoi',
        cod: 200,
    },
    forecast: {
        cod: '200',
        message: 0,
        cnt: 40,
        list: Array.from({ length: 8 }, (_, i) => ({
            dt: Math.floor(Date.now() / 1000) + i * 21600,
            main: {
                temp: 25 + Math.random() * 5,
                feels_like: 27 + Math.random() * 5,
                temp_min: 23 + Math.random() * 3,
                temp_max: 28 + Math.random() * 5,
                pressure: 1013,
                sea_level: 1013,
                grnd_level: 1010,
                humidity: 60 + Math.random() * 20,
                temp_kf: 0,
            },
            weather: [
                {
                    id: 800,
                    main: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                    description: ['trời quang', 'có mây', 'có mưa'][Math.floor(Math.random() * 3)],
                    icon: ['01d', '02d', '10d'][Math.floor(Math.random() * 3)],
                },
            ],
            clouds: {
                all: Math.floor(Math.random() * 100),
            },
            wind: {
                speed: 2 + Math.random() * 5,
                deg: Math.floor(Math.random() * 360),
            },
            visibility: 10000,
            pop: Math.random(),
            sys: {
                pod: 'd',
            },
            dt_txt: new Date(Date.now() + i * 21600 * 1000).toISOString(),
        })),
        city: {
            id: 1581130,
            name: 'Hanoi',
            coord: {
                lat: 21.03,
                lon: 105.85,
            },
            country: 'VN',
            population: 0,
            timezone: 25200,
            sunrise: Math.floor(Date.now() / 1000) - 36000,
            sunset: Math.floor(Date.now() / 1000) + 18000,
        },
    },
};

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeUnits = (units = 'metric') => {
    if (units === 'imperial') return 'imperial';
    if (units === 'kelvin') return 'kelvin';
    return 'metric';
};

const getUnitsConfig = (units = 'metric') => {
    const normalized = normalizeUnits(units);
    if (normalized === 'imperial') {
        return { temperatureUnit: 'fahrenheit', windSpeedUnit: 'mph' };
    }
    return { temperatureUnit: 'celsius', windSpeedUnit: 'ms' };
};

const convertTemperature = (value, units) => {
    if (typeof value !== 'number') return value ?? null;
    if (normalizeUnits(units) === 'kelvin') {
        return value + 273.15;
    }
    return value;
};

const isoToEpochSeconds = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return Math.floor(date.getTime() / 1000);
};

const mapWeatherCodeToCondition = (code, isDay = 1) => {
    const mapping = WEATHER_CODE_MAP[code] || WEATHER_CODE_MAP.default;
    const icon = (isDay ? mapping.iconDay : mapping.iconNight) || mapping.iconDay;
    return {
        id: typeof code === 'number' ? code : 0,
        main: mapping.main,
        description: mapping.description,
        icon,
    };
};

const buildForecastList = (data, location, units) => {
    const hourly = data.hourly || {};
    const times = hourly.time || [];
    const list = times.slice(0, FORECAST_HOURS).map((time, index) => {
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
            visibility: DEFAULT_VISIBILITY,
            pop: typeof precipitationProb === 'number' ? precipitationProb / 100 : 0,
            sys: {
                pod: isDay ? 'd' : 'n',
            },
        };
    });

    return {
        cod: '200',
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
            country: location.country ?? 'VN',
            timezone: data.utc_offset_seconds ?? 0,
            sunrise: isoToEpochSeconds(data.daily?.sunrise?.[0]),
            sunset: isoToEpochSeconds(data.daily?.sunset?.[0]),
        },
    };
};

const normalizeCurrentWeather = (data, location, units) => {
    const current = data.current || {};
    const weather = mapWeatherCodeToCondition(current.weather_code, current.is_day);
    const pressure = current.surface_pressure ?? current.pressure_msl ?? 1013;
    const sunrise = isoToEpochSeconds(data.daily?.sunrise?.[0]);
    const sunset = isoToEpochSeconds(data.daily?.sunset?.[0]);

    return {
        coord: { lon: location.lon, lat: location.lat },
        weather: [weather],
        base: 'stations',
        main: {
            temp: convertTemperature(current.temperature_2m, units) ?? mockWeatherData.current.main.temp,
            feels_like: convertTemperature(current.apparent_temperature, units) ?? convertTemperature(current.temperature_2m, units),
            temp_min: convertTemperature(current.temperature_2m, units),
            temp_max: convertTemperature(current.temperature_2m, units),
            pressure: Math.round(pressure),
            humidity: current.relative_humidity_2m ?? mockWeatherData.current.main.humidity,
        },
        visibility: DEFAULT_VISIBILITY,
        wind: {
            speed: current.wind_speed_10m ?? mockWeatherData.current.wind.speed,
            deg: current.wind_direction_10m ?? mockWeatherData.current.wind.deg,
            gust: current.wind_gusts_10m ?? null,
        },
        clouds: {
            all: weather.id === 0 ? 0 : 60,
        },
        dt: isoToEpochSeconds(current.time) ?? Math.floor(Date.now() / 1000),
        sys: {
            country: location.country ?? 'VN',
            sunrise: sunrise ?? mockWeatherData.current.sys.sunrise,
            sunset: sunset ?? mockWeatherData.current.sys.sunset,
        },
        timezone: data.utc_offset_seconds ?? 0,
        id: `${location.lat},${location.lon}`,
        name: location.name,
        cod: 200,
    };
};

const buildForecastResponse = (data, location, units) =>
    buildForecastList(data, location, units);

const fetchOpenMeteoData = async ({ lat, lon, units = 'metric' }) => {
    const { temperatureUnit, windSpeedUnit } = getUnitsConfig(units);
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: CURRENT_FIELDS.join(','),
        hourly: HOURLY_FIELDS.join(','),
        daily: DAILY_FIELDS.join(','),
        timezone: 'auto',
        forecast_days: '5',
        temperature_unit: temperatureUnit,
        wind_speed_unit: windSpeedUnit,
    });

    const response = await fetch(`${OPEN_METEO_API}?${params.toString()}`);
    if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    return response.json();
};

const geocodeCity = async (cityName = DEFAULT_CITY) => {
    const normalizedName = cityName?.trim() || DEFAULT_CITY;
    const cacheKey = normalizedName.toLowerCase();
    if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey);
    }

    const params = new URLSearchParams({
        name: normalizedName,
        count: '1',
        language: 'vi',
        format: 'json',
    });

    try {
        const response = await fetch(`${OPEN_METEO_GEOCODING_API}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();
        const [result] = data.results || [];
        if (result) {
            const location = {
                name: result.name,
                country: result.country_code,
                lat: result.latitude,
                lon: result.longitude,
                timezone: result.timezone,
            };
            locationCache.set(cacheKey, location);
            return location;
        }
    } catch (error) {
        console.warn('Geocoding failed, fallback to predefined list:', error);
    }

    const fallback = FALLBACK_LOCATIONS[cacheKey];
    if (fallback) {
        locationCache.set(cacheKey, fallback);
        return fallback;
    }

    throw new Error(`Không tìm được tọa độ cho thành phố: ${cityName}`);
};

const reverseGeocode = async (lat, lon) => {
    const cacheKey = `${lat},${lon}`;
    if (reverseLocationCache.has(cacheKey)) {
        return reverseLocationCache.get(cacheKey);
    }

    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        count: '1',
        language: 'vi',
        format: 'json',
    });

    try {
        const response = await fetch(`${OPEN_METEO_REVERSE_GEOCODING_API}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Reverse geocoding API error: ${response.status}`);
        }

        const data = await response.json();
        const [result] = data.results || [];
        if (result) {
            const location = {
                name: result.name,
                country: result.country_code,
                lat: result.latitude,
                lon: result.longitude,
                timezone: result.timezone,
            };
            reverseLocationCache.set(cacheKey, location);
            return location;
        }
    } catch (error) {
        console.warn('Reverse geocoding failed:', error);
    }

    return null;
};

/**
 * Lấy thời tiết hiện tại
 */
export async function getCurrentWeather(city = 'Hanoi', units = 'metric') {
    try {
        const location = await geocodeCity(city);
        const data = await fetchOpenMeteoData({
            lat: location.lat,
            lon: location.lon,
            units,
        });
        return normalizeCurrentWeather(data, location, units);
    } catch (error) {
        console.error('Error fetching current weather:', error);
        // Fallback to mock data
        await delay();
        return {
            ...mockWeatherData.current,
            name: city,
            _isMock: true,
        };
    }
}

/**
 * Lấy dự báo thời tiết 5 ngày
 */
export async function getForecast(city = 'Hanoi', units = 'metric') {
    try {
        const location = await geocodeCity(city);
        const data = await fetchOpenMeteoData({
            lat: location.lat,
            lon: location.lon,
            units,
        });
        return buildForecastResponse(data, location, units);
    } catch (error) {
        console.error('Error fetching forecast:', error);
        // Fallback to mock data
        await delay();
        return {
            ...mockWeatherData.forecast,
            city: { ...mockWeatherData.forecast.city, name: city },
            _isMock: true,
        };
    }
}

/**
 * Lấy thời tiết theo tọa độ
 */
export async function getWeatherByCoords(lat, lon, units = 'metric') {
    try {
        const location =
            (await reverseGeocode(lat, lon)) || { name: 'Vị trí của bạn', country: 'VN', lat, lon };
        const data = await fetchOpenMeteoData({ lat, lon, units });
        return normalizeCurrentWeather(data, location, units);
    } catch (error) {
        console.error('Error fetching weather by coords:', error);
        await delay();
        return {
            ...mockWeatherData.current,
            coord: { lat, lon },
            _isMock: true,
        };
    }
}

/**
 * Lấy icon URL (dùng bộ icon của OpenWeatherMap)
 */
export function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Format nhiệt độ
 */
export function formatTemperature(temp, units = 'metric') {
    const symbol = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K';
    return `${Math.round(temp)}${symbol}`;
}

/**
 * Format tốc độ gió
 */
export function formatWindSpeed(speed, units = 'metric') {
    if (units === 'metric') {
        return `${speed.toFixed(1)} m/s`;
    }
    return `${speed.toFixed(1)} mph`;
}

/**
 * Format hướng gió
 */
export function formatWindDirection(deg) {
    const directions = ['Bắc', 'ĐB', 'Đông', 'ĐN', 'Nam', 'TN', 'Tây', 'TB'];
    return directions[Math.round(deg / 45) % 8];
}

