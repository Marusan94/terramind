/**
 * Estaciones reales de calidad del aire del Valle de Aburrá
 * Datos basados en estudios reales de SIATA y vigilancia ambiental
 */

export interface Station {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  type: 'manual' | 'automatic';
  sensors: string[];
  elevation: number; // metros sobre nivel del mar
}

// Estaciones reales de SIATA y vigilancia ambiental
export const AIR_QUALITY_STATIONS: Station[] = [
  {
    id: 'siata-med-centro',
    name: 'SIATA Medellín Centro',
    district: 'La Candelaria',
    lat: 6.2472,
    lon: -75.5675,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2', 'CO', 'SO2'],
    elevation: 1495,
  },
  {
    id: 'siata-bello',
    name: 'SIATA Bello',
    district: 'Bello',
    lat: 6.3373,
    lon: -75.5577,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2'],
    elevation: 1420,
  },
  {
    id: 'siata-itagui',
    name: 'SIATA Itagüí',
    district: 'Itagüí',
    lat: 6.1847,
    lon: -75.5994,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2', 'CO'],
    elevation: 1550,
  },
  {
    id: 'siata-envigado',
    name: 'SIATA Envigado',
    district: 'Envigado',
    lat: 6.1628,
    lon: -75.5857,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2'],
    elevation: 1620,
  },
  {
    id: 'siata-sabaneta',
    name: 'SIATA Sabaneta',
    district: 'Sabaneta',
    lat: 6.1502,
    lon: -75.6165,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3'],
    elevation: 1580,
  },
  {
    id: 'siata-caldas',
    name: 'SIATA Caldas',
    district: 'Caldas',
    lat: 6.0913,
    lon: -75.6337,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2'],
    elevation: 1750,
  },
  {
    id: 'siata-la-estrella',
    name: 'SIATA La Estrella',
    district: 'La Estrella',
    lat: 6.1518,
    lon: -75.6389,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3'],
    elevation: 1600,
  },
  {
    id: 'siata-barbosa',
    name: 'SIATA Barbosa',
    district: 'Barbosa',
    lat: 6.4387,
    lon: -75.5325,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2'],
    elevation: 1350,
  },
  {
    id: 'siata-copacabana',
    name: 'SIATA Copacabana',
    district: 'Copacabana',
    lat: 6.3469,
    lon: -75.5130,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3'],
    elevation: 1380,
  },
  {
    id: 'siata-girardota',
    name: 'SIATA Girardota',
    district: 'Girardota',
    lat: 6.3773,
    lon: -75.4777,
    type: 'automatic',
    sensors: ['PM2.5', 'PM10', 'O3', 'NO2'],
    elevation: 1420,
  },
];

// Función para calcular AQI de EE.UU. desde contaminantes
export function calculateAQI(
  pm25: number,
  _pm10: number,
  _o3: number,
  _no2: number
): { aqi: number; category: string; color: string; level: number } {
  // breakpoints para PM2.5 (µg/m³)
  const pm25Breakpoints = [
    { low: 0, high: 12, aqiLow: 0, aqiHigh: 50 },
    { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
    { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
    { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
    { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
    { low: 250.5, high: 500.4, aqiLow: 301, aqiHigh: 500 },
  ];

  // Calcular AQI basado en PM2.5 (contaminante principal)
  let aqi = 0;
  for (const bp of pm25Breakpoints) {
    if (pm25 >= bp.low && pm25 <= bp.high) {
      aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (pm25 - bp.low) + bp.aqiLow;
      break;
    }
  }
  if (pm25 > 500.4) aqi = 500;

  // Categorías OMS/WHO
  if (aqi <= 50) return { aqi: Math.round(aqi), category: 'Bueno', color: '#22c55e', level: 1 };
  if (aqi <= 100) return { aqi: Math.round(aqi), category: 'Moderado', color: '#eab308', level: 2 };
  if (aqi <= 150) return { aqi: Math.round(aqi), category: 'Insalubre para sensibles', color: '#f97316', level: 3 };
  if (aqi <= 200) return { aqi: Math.round(aqi), category: 'Insalubre', color: '#ef4444', level: 4 };
  if (aqi <= 300) return { aqi: Math.round(aqi), category: 'Muy insalubre', color: '#a855f7', level: 5 };
  return { aqi: Math.round(aqi), category: 'Peligroso', color: '#7f1d1d', level: 6 };
}

// Generar datos simulados realistas basados en hora del día y ubicación
export function generateRealisticData(station: Station): {
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  co: number;
  so2: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  timestamp: number;
} {
  const now = new Date();
  const hour = now.getHours();
  
  // Patrones diarios realistas (basados en estudios de tráfico y clima)
  // Pico: 7-9 AM y 5-8 PM (hora pico vehicular)
  // Mínimo: 3-5 AM
  const rushHourFactor = hour >= 7 && hour <= 9 ? 1.4 :
                         hour >= 17 && hour <= 20 ? 1.5 :
                         hour >= 10 && hour <= 16 ? 1.1 :
                         hour >= 0 && hour <= 5 ? 0.6 : 1.0;
  
  // Factor de ubicación (áreas industriales vs residenciales)
  const locationFactor = station.district === 'Itagüí' ? 1.2 : // Industrial
                         station.district === 'Bello' ? 1.1 :   // Industrial
                         station.district === 'La Candelaria' ? 1.0 : // Centro comercial
                         station.district === 'Envigado' ? 0.9 :  // Residencial
                         station.district === 'Sabaneta' ? 0.85 : // Residencial
                         1.0;
  
  // Elevación afecta dispersión (mayor elevación = mejor dispersión)
  const elevationFactor = 1 - (station.elevation - 1400) * 0.0002;
  
  const basePM25 = 25;
  const pm25 = Math.max(5, basePM25 * rushHourFactor * locationFactor * elevationFactor + (Math.random() - 0.5) * 10);
  
  const pm10 = pm25 * (1.5 + Math.random() * 0.5);
  const o3 = 35 + (hour >= 10 && hour <= 18 ? 25 : 0) * (1 / elevationFactor) + (Math.random() - 0.5) * 10;
  const no2 = 20 * rushHourFactor * locationFactor + (Math.random() - 0.5) * 8;
  const co = 0.5 * rushHourFactor + (Math.random() - 0.5) * 0.2;
  const so2 = 5 + Math.random() * 3;
  
  // Clima
  const baseTemp = 22;
  const temperature = baseTemp + Math.sin((hour - 6) * Math.PI / 12) * 5 + (Math.random() - 0.5) * 2;
  const humidity = 65 - (hour >= 10 && hour <= 16 ? 15 : 0) + (Math.random() - 0.5) * 10;
  const windSpeed = 8 + Math.random() * 6;

  return {
    pm25: Math.round(pm25 * 10) / 10,
    pm10: Math.round(pm10 * 10) / 10,
    o3: Math.round(o3 * 10) / 10,
    no2: Math.round(no2 * 10) / 10,
    co: Math.round(co * 100) / 100,
    so2: Math.round(so2 * 10) / 10,
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity),
    windSpeed: Math.round(windSpeed * 10) / 10,
    timestamp: now.getTime(),
  };
}
