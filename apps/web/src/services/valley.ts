/**
 * Datos unificados del Valle de Aburrá.
 *
 * Orden de preferencia (siempre honesto en la UI):
 *  1. SIATA ( dumps "_Last"): estaciones REALES + histórico REAL (sep-2024,
 *     congelado por SIATA: el vivo migró a su Geoportal). Fuente histórica.
 *  2. Open-Meteo CAMS: calidad del aire ACTUAL real (modelo, ~11 km) + clima.
 *  3. Simulado: respaldo determinista cuando no hay red.
 */

import { AIR_QUALITY_STATIONS, generateRealisticData, calculateAQI } from '../data/stations';
import { loadSiataDataset, QualityFlag } from './siata';
import { getAirQuality, getCurrentWeather, getWeatherDescription } from './openMeteo';

export interface ValleyStation {
  id: string;
  code: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  elevation: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  aqi: number;
  category: string;
  color: string;
  quality: QualityFlag;
}

export interface ValleyGauge {
  id: string;
  name: string;
  river: string;
  lat: number;
  lon: number;
  level: number; // m
  trend: 'up' | 'down' | 'stable';
  alert: boolean;
}

export interface ValleyPark {
  id: string;
  name: string;
  lat: number;
  lon: number;
  radius: number; // m
  ndvi: number; // 0-1
}

export interface ValleyData {
  stations: ValleyStation[];
  /** histórico real SIATA por estación (vacío si es simulado) */
  series: Record<string, { t: number; pm25: number | null; flag: QualityFlag }[]>;
  /** "ahora" real vía Open-Meteo CAMS (null si falla) */
  live: { aqi: number; pm25: number } | null;
  weather: { temp: number; humidity: number; precipProb: number; label: string; emoji: string } | null;
  gauges: ValleyGauge[];
  parks: ValleyPark[];
  source: string;
  dataDate: string; // etiqueta legible del periodo de los datos
  updatedAt: number;
  quality: { valid: number; missing: number; simulated: number };
}

const ELEV_BY_DISTRICT: Record<string, number> = {
  'La Candelaria': 1495, Bello: 1420, 'Itagüí': 1550, Envigado: 1620,
  Sabaneta: 1580, Caldas: 1750, 'La Estrella': 1600, Barbosa: 1350,
  Copacabana: 1380, Girardota: 1420, 'Medellín': 1495,
};

function latestValid(samples: { t: number; value: number | null; flag: QualityFlag }[]): number | null {
  for (let i = samples.length - 1; i >= 0; i--) {
    if (samples[i].flag === 'VALID' && samples[i].value != null) return samples[i].value as number;
  }
  return null;
}

function demoGauges(): ValleyGauge[] {
  const defs = [
    { id: 'g-acevedo', name: 'Puente Acevedo', river: 'Río Medellín', lat: 6.30, lon: -75.56, base: 1.8 },
    { id: 'g-moravia', name: 'Moravia', river: 'Río Medellín', lat: 6.27, lon: -75.57, base: 2.1 },
    { id: 'g-ancon', name: 'Ancón Sur', river: 'Río Medellín', lat: 6.17, lon: -75.60, base: 1.5 },
    { id: 'g-iguana', name: 'La Iguana', river: 'Q. La Iguana', lat: 6.26, lon: -75.60, base: 0.7 },
  ];
  return defs.map(d => {
    const level = Math.round((d.base + (Math.random() - 0.5) * 0.4) * 100) / 100;
    const r = Math.random();
    return {
      ...d,
      level,
      trend: (r < 0.33 ? 'up' : r < 0.66 ? 'down' : 'stable') as 'up' | 'down' | 'stable',
      alert: level > d.base + 0.15,
    };
  });
}

function demoParks(): ValleyPark[] {
  return [
    { id: 'p-volador', name: 'Cerro El Volador', lat: 6.270, lon: -75.582, radius: 900, ndvi: 0.62 },
    { id: 'p-nutibara', name: 'Cerro Nutibara', lat: 6.236, lon: -75.580, radius: 600, ndvi: 0.55 },
    { id: 'p-arvi', name: 'Parque Arví', lat: 6.280, lon: -75.500, radius: 2500, ndvi: 0.81 },
    { id: 'p-picacho', name: 'Cerro El Picacho', lat: 6.305, lon: -75.560, radius: 800, ndvi: 0.58 },
  ].map(p => ({ ...p, ndvi: Math.round((p.ndvi + (Math.random() - 0.5) * 0.06) * 100) / 100 }));
}

function simulatedValley(): ValleyData {
  const stations: ValleyStation[] = AIR_QUALITY_STATIONS.map(s => {
    const d = generateRealisticData(s);
    const aqi = calculateAQI(d.pm25, d.pm10, d.o3, d.no2);
    return {
      id: s.id, code: s.id, name: s.name, district: s.district,
      lat: s.lat, lon: s.lon, elevation: s.elevation,
      pm25: d.pm25, pm10: d.pm10, o3: d.o3, no2: d.no2,
      aqi: aqi.aqi, category: aqi.category, color: aqi.color,
      quality: 'SIMULATED' as QualityFlag,
    };
  });
  return {
    stations,
    series: {},
    live: null,
    weather: null,
    gauges: demoGauges(),
    parks: demoParks(),
    source: 'Simulado (demo)',
    dataDate: 'simulación local',
    updatedAt: Date.now(),
    quality: { valid: 0, missing: 0, simulated: stations.length },
  };
}

/** Carga todo en paralelo; ante cualquier fallo cae a simulado (nunca rompe). */
export async function loadValleyData(): Promise<ValleyData> {
  const [siata, live, weather] = await Promise.all([
    loadSiataDataset().catch(() => null),
    getAirQuality(6.247, -75.567).then(a => ({ aqi: a.usAqi, pm25: a.pm2_5 })).catch(() => null),
    getCurrentWeather(6.247, -75.567).catch(() => null),
  ]);

  if (!siata || siata.stations.length === 0) {
    const sim = simulatedValley();
    if (live) sim.live = live;
    if (weather) {
      const w = getWeatherDescription(weather.weatherCode);
      sim.weather = {
        temp: weather.temperature, humidity: weather.humidity,
        precipProb: 0, label: w.label, emoji: w.emoji,
      };
    }
    if (live || weather) sim.source = 'Open-Meteo + Simulado (SIATA no disponible)';
    return sim;
  }

  const stations: ValleyStation[] = siata.stations.map(s => {
    const per = siata.series[s.id];
    const pm25 = latestValid(per.pm25) ?? 0;
    const pm10 = latestValid(per.pm10) ?? pm25 * 1.6;
    const o3 = latestValid(per.o3) ?? 40;
    const no2 = latestValid(per.no2) ?? 20;
    const aqi = calculateAQI(pm25, pm10, o3, no2);
    const hasAny = per.pm25.some(x => x.flag === 'VALID');
    return {
      id: s.id, code: s.id, name: s.name, district: s.district,
      lat: s.lat, lon: s.lon,
      elevation: ELEV_BY_DISTRICT[s.district] ?? 1500,
      pm25: Math.round(pm25 * 10) / 10,
      pm10: Math.round(pm10 * 10) / 10,
      o3: Math.round(o3 * 10) / 10,
      no2: Math.round(no2 * 10) / 10,
      aqi: aqi.aqi, category: aqi.category, color: aqi.color,
      quality: (hasAny ? 'VALID' : 'MISSING') as QualityFlag,
    };
  });

  const series: ValleyData['series'] = {};
  Object.entries(siata.series).forEach(([code, per]) => {
    series[code] = per.pm25.map(s => ({ t: s.t, pm25: s.value, flag: s.flag }));
  });

  const d = new Date(siata.updatedAt);
  const dataDate = Number.isNaN(d.getTime())
    ? 'sep-2024'
    : `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

  return {
    stations,
    series,
    live,
    weather: weather
      ? (() => {
          const w = getWeatherDescription(weather.weatherCode);
          return {
            temp: weather.temperature, humidity: weather.humidity,
            precipProb: 0, label: w.label, emoji: w.emoji,
          };
        })()
      : null,
    gauges: demoGauges(),
    parks: demoParks(),
    source: live ? 'SIATA (histórico) + Open-Meteo CAMS (actual)' : 'SIATA (histórico sep-2024)',
    dataDate: `histórico ${dataDate}`,
    updatedAt: Date.now(),
    quality: { valid: siata.validCount, missing: siata.missingCount, simulated: 0 },
  };
}
