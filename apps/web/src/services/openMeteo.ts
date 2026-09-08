/**
 * Open-Meteo API Service
 * Free weather API - no API key required
 * https://open-meteo.com/
 */

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  cloudCover: number;
  uvIndex: number;
  isDay: boolean;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  precipitation: number[];
  precipitationProbability: number[];
  humidity: number[];
  weatherCode: number[];
  windSpeed: number[];
  windDirection: number[];
  cloudCover: number[];
}

export interface AirQuality {
  pm10: number;
  pm2_5: number;
  carbonMonoxide: number;
  nitrogenDioxide: number;
  ozone: number;
  sulphurDioxide: number;
  uvIndex: number;
  europeanAqi: number;
  usAqi: number;
}

const BASE_URL = 'https://api.open-meteo.com/v1';
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1';

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<CurrentWeather> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'pressure_msl',
      'cloud_cover',
      'uv_index',
      'is_day',
    ].join(','),
    timezone: 'America/Bogota',
  });

  const response = await fetch(`${BASE_URL}/forecast?${params}`);
  if (!response.ok) throw new Error('Failed to fetch weather');
  
  const data = await response.json();
  const c = data.current;
  
  return {
    temperature: c.temperature_2m,
    feelsLike: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    precipitation: c.precipitation,
    rain: c.rain,
    showers: c.showers,
    snowfall: c.snowfall,
    weatherCode: c.weather_code,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    pressure: c.pressure_msl,
    cloudCover: c.cloud_cover,
    uvIndex: c.uv_index,
    isDay: c.is_day === 1,
  };
}

export async function getHourlyForecast(
  lat: number,
  lon: number,
  hours: number = 24
): Promise<HourlyForecast> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m',
      'precipitation',
      'precipitation_probability',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'cloud_cover',
    ].join(','),
    forecast_hours: hours.toString(),
    timezone: 'America/Bogota',
  });

  const response = await fetch(`${BASE_URL}/forecast?${params}`);
  if (!response.ok) throw new Error('Failed to fetch forecast');
  
  const data = await response.json();
  const h = data.hourly;
  
  return {
    time: h.time,
    temperature: h.temperature_2m,
    precipitation: h.precipitation,
    precipitationProbability: h.precipitation_probability,
    humidity: h.relative_humidity_2m,
    weatherCode: h.weather_code,
    windSpeed: h.wind_speed_10m,
    windDirection: h.wind_direction_10m,
    cloudCover: h.cloud_cover,
  };
}

export async function getAirQuality(
  lat: number,
  lon: number
): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'european_aqi',
      'us_aqi',
      'pm10',
      'pm2_5',
      'carbon_monoxide',
      'nitrogen_dioxide',
      'ozone',
      'sulphur_dioxide',
      'uv_index',
    ].join(','),
    timezone: 'America/Bogota',
  });

  const response = await fetch(`${AIR_QUALITY_URL}/air-quality?${params}`);
  if (!response.ok) throw new Error('Failed to fetch air quality');
  
  const data = await response.json();
  const c = data.current;
  
  return {
    pm10: c.pm10,
    pm2_5: c.pm2_5,
    carbonMonoxide: c.carbon_monoxide,
    nitrogenDioxide: c.nitrogen_dioxide,
    ozone: c.ozone,
    sulphurDioxide: c.sulphur_dioxide,
    uvIndex: c.uv_index,
    europeanAqi: c.european_aqi,
    usAqi: c.us_aqi,
  };
}

/**
 * WMO Weather Code interpretation
 * https://open-meteo.com/en/docs
 */
export function getWeatherDescription(code: number): { label: string; emoji: string } {
  const codes: Record<number, { label: string; emoji: string }> = {
    0: { label: 'Despejado', emoji: '☀️' },
    1: { label: 'Mayormente despejado', emoji: '🌤️' },
    2: { label: 'Parcialmente nublado', emoji: '⛅' },
    3: { label: 'Nublado', emoji: '☁️' },
    45: { label: 'Niebla', emoji: '🌫️' },
    48: { label: 'Niebla con escarcha', emoji: '🌫️' },
    51: { label: 'Llovizna ligera', emoji: '🌦️' },
    53: { label: 'Llovizna moderada', emoji: '🌦️' },
    55: { label: 'Llovizna densa', emoji: '🌧️' },
    61: { label: 'Lluvia ligera', emoji: '🌦️' },
    63: { label: 'Lluvia moderada', emoji: '🌧️' },
    65: { label: 'Lluvia fuerte', emoji: '⛈️' },
    71: { label: 'Nieve ligera', emoji: '🌨️' },
    73: { label: 'Nieve moderada', emoji: '❄️' },
    75: { label: 'Nieve fuerte', emoji: '❄️' },
    77: { label: 'Granizo', emoji: '🌨️' },
    80: { label: 'Chubascos ligeros', emoji: '🌦️' },
    81: { label: 'Chubascos moderados', emoji: '🌧️' },
    82: { label: 'Chubascos violentos', emoji: '⛈️' },
    85: { label: 'Chubascos de nieve', emoji: '🌨️' },
    86: { label: 'Chubascos de nieve fuertes', emoji: '❄️' },
    95: { label: 'Tormenta eléctrica', emoji: '⛈️' },
    96: { label: 'Tormenta con granizo ligero', emoji: '⛈️' },
    99: { label: 'Tormenta con granizo fuerte', emoji: '⛈️' },
  };
  return codes[code] || { label: 'Desconocido', emoji: '❓' };
}

/**
 * Get AQI category from US AQI value
 */
export function getAqiCategory(aqi: number): { label: string; color: string; level: number } {
  if (aqi <= 50) return { label: 'Bueno', color: '#10b981', level: 1 };
  if (aqi <= 100) return { label: 'Moderado', color: '#f59e0b', level: 2 };
  if (aqi <= 150) return { label: 'Insalubre para sensibles', color: '#f97316', level: 3 };
  if (aqi <= 200) return { label: 'Insalubre', color: '#ef4444', level: 4 };
  if (aqi <= 300) return { label: 'Muy insalubre', color: '#a855f7', level: 5 };
  return { label: 'Peligroso', color: '#7f1d1d', level: 6 };
}
