/**
 * Air Quality Dashboard Component
 * Shows AQI history, current levels, and health recommendations
 */

import { useState, useEffect } from 'react';

interface AirQualityData {
  currentAqi: number;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  category: string;
  color: string;
  level: number;
  advice: string;
}

interface HourlyData {
  time: string;
  aqi: number;
  pm25: number;
}

const getAqiInfo = (aqi: number): { category: string; color: string; level: number; advice: string } => {
  if (aqi <= 50) return {
    category: 'Bueno',
    color: '#22c55e',
    level: 1,
    advice: '✅ Aire limpio. Puedes realizar actividades al aire libre sin restricciones.'
  };
  if (aqi <= 100) return {
    category: 'Moderado',
    color: '#eab308',
    level: 2,
    advice: '⚠️ Calidad aceptable. Personas sensibles (asmáticos, niños, adultos mayores) pueden sentir molestias leves.'
  };
  if (aqi <= 150) return {
    category: 'Insalubre para sensibles',
    color: '#f97316',
    level: 3,
    advice: '🔴 Grupos sensibles deben limitar actividades prolongadas al aire libre. Otros pueden continuar normalmente.'
  };
  if (aqi <= 200) return {
    category: 'Insalubre',
    color: '#ef4444',
    level: 4,
    advice: '🚫 Todos deben reducir actividades al aire libre. Mantén ventanas cerradas y usa purificador si disponible.'
  };
  if (aqi <= 300) return {
    category: 'Muy insalubre',
    color: '#a855f7',
    level: 5,
    advice: '☠️ Efectos graves en la salud. Evita salir. Si debes hacerlo, usa máscara N95. Mantén ambientes cerrados.'
  };
  return {
    category: 'Peligroso',
    color: '#7f1d1d',
    level: 6,
    advice: '☠️ Emergencia. Permanece en interiores. Busca atención médica si presentas síntomas respiratorios.'
  };
};

const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', desc: 'Partículas finas', unit: 'µg/m³', warn: 35, crit: 75 },
  { key: 'pm10', label: 'PM10', desc: 'Partículas gruesas', unit: 'µg/m³', warn: 50, crit: 150 },
  { key: 'ozone', label: 'O₃', desc: 'Ozono troposférico', unit: 'µg/m³', warn: 120, crit: 180 },
  { key: 'no2', label: 'NO₂', desc: 'Dióxido de nitrógeno', unit: 'µg/m³', warn: 100, crit: 200 },
];

interface AirQualityDashboardProps {
  lat?: number;
  lon?: number;
  onClose: () => void;
}

export default function AirQualityDashboard({ lat = 6.247, lon = -75.567, onClose }: AirQualityDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AirQualityData | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Current air quality
        const aqResponse = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=America/Bogota`
        );
        const aqJson = await aqResponse.json();
        const current = aqJson.current;
        
        const aqi = current.us_aqi || 0;
        const info = getAqiInfo(aqi);
        
        setData({
          currentAqi: aqi,
          pm25: current.pm2_5 || 0,
          pm10: current.pm10 || 0,
          ozone: current.ozone || 0,
          no2: current.nitrogen_dioxide || 0,
          ...info,
        });

        // Hourly forecast (next 24h)
        const forecastResponse = await fetch(
          `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=us_aqi,pm2_5&forecast_days=1&timezone=America/Bogota`
        );
        const forecastJson = await forecastResponse.json();
        
        const now = new Date();
        const next24h = forecastJson.hourly.time
          .map((t: string, i: number) => ({
            time: t,
            aqi: forecastJson.hourly.us_aqi[i],
            pm25: forecastJson.hourly.pm2_5[i],
          }))
          .filter((h: HourlyData) => new Date(h.time) >= now)
          .slice(0, 24);
        
        setHourly(next24h);
      } catch (err) {
        console.error('Failed to fetch air quality:', err);
        setError('Error cargando datos');
      }
      setLoading(false);
    };

    fetchData();
  }, [lat, lon]);

  // Simple bar chart for hourly
  const maxAqi = Math.max(...hourly.map(h => h.aqi), 100);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: '85vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <div className="modal-title">🌫 Calidad del Aire</div>
            <div className="modal-subtitle">Valle de Aburrá • Actualizado ahora</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        {loading ? (
          <div className="loading" style={{ justifyContent: 'center', padding: 32 }}>
            <span className="loading-dot" />
            <span className="loading-dot" style={{ animationDelay: '0.2s' }} />
            <span className="loading-dot" style={{ animationDelay: '0.4s' }} />
            <span>Cargando...</span>
          </div>
        ) : error ? (
          <div style={{ color: 'var(--red)', textAlign: 'center', padding: 16 }}>{error}</div>
        ) : (
          <>
            {/* Main AQI display */}
            <div style={{
              background: `${data?.color}15`,
              border: `1px solid ${data?.color}`,
              borderRadius: 'var(--radius)',
              padding: 16,
              marginBottom: 16,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Índice de Calidad del Aire (EE.UU.)</div>
              <div style={{ fontSize: 48, fontWeight: 700, color: data?.color, lineHeight: 1 }}>
                {data?.currentAqi}
              </div>
              <div style={{ fontSize: 14, color: data?.color, marginTop: 4, fontWeight: 600 }}>
                {data?.category}
              </div>
            </div>

            {/* Health advice */}
            <div style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 12,
              marginBottom: 16,
              fontSize: 11,
              lineHeight: 1.6,
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Recomendación de Salud</div>
              <div style={{ color: 'var(--text)' }}>{data?.advice}</div>
            </div>

            {/* Pollutants */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Contaminantes</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {POLLUTANTS.map(p => {
                  const value = data?.[p.key as keyof AirQualityData] as number || 0;
                  const isWarn = value >= p.warn;
                  const isCrit = value >= p.crit;
                  const color = isCrit ? 'var(--red)' : isWarn ? 'var(--yellow)' : 'var(--green)';
                  return (
                    <div key={p.key} style={{
                      background: 'var(--bg-2)',
                      border: `1px solid ${color}`,
                      borderRadius: 'var(--radius)',
                      padding: 10,
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.label} ({p.desc})</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color }}>{value.toFixed(1)}</div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{p.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hourly chart */}
            {hourly.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Pronóstico Próximas 24h</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 2,
                  height: 60,
                  background: 'var(--bg-2)',
                  borderRadius: 'var(--radius)',
                  padding: 8,
                  overflow: 'hidden',
                }}>
                  {hourly.map((h, i) => {
                    const info = getAqiInfo(h.aqi);
                    const height = Math.max((h.aqi / maxAqi) * 100, 5);
                    const hour = new Date(h.time).getHours();
                    return (
                      <div key={i} style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        <div style={{
                          width: '100%',
                          height: `${height}%`,
                          background: info.color,
                          borderRadius: 2,
                          transition: 'height 0.3s',
                        }} />
                        {i % 4 === 0 && (
                          <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{hour}h</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: 'var(--text-muted)' }}>
                  <span>Ahora</span>
                  <span>+24h</span>
                </div>
              </div>
            )}

            {/* AQI Scale reference */}
            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-2)', borderRadius: 'var(--radius)', fontSize: 10 }}>
              <div style={{ marginBottom: 6, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Escala AQI</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[
                  { range: '0-50', label: 'Bueno', color: '#22c55e' },
                  { range: '51-100', label: 'Moderado', color: '#eab308' },
                  { range: '101-150', label: 'Sensible', color: '#f97316' },
                  { range: '151+', label: 'Insalubre', color: '#ef4444' },
                ].map(s => (
                  <div key={s.range} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 8, background: s.color, borderRadius: 2, marginBottom: 2 }} />
                    <div style={{ color: 'var(--text-muted)' }}>{s.range}</div>
                    <div style={{ color: s.color, fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
