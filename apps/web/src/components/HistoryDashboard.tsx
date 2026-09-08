import { useState, useEffect, useMemo } from 'react';

interface HistoricalRecord {
  timestamp: number;
  temperature: number;
  rain: number;
  airQuality: number;
  humidity: number;
  windSpeed: number;
}

const STORAGE_KEY = 'terramind-history';
const MAX_RECORDS = 100;

interface HistoryDashboardProps {
  currentData: {
    temperature: number | null;
    rain: number | null;
    airQuality: number | null;
    humidity: number | null;
    windSpeed: number | null;
  };
  onClose: () => void;
}

export default function HistoryDashboard({ currentData, onClose }: HistoryDashboardProps) {
  const [history, setHistory] = useState<HistoricalRecord[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  });

  // Record current data
  useEffect(() => {
    if (currentData.temperature === null) return;
    const record: HistoricalRecord = {
      timestamp: Date.now(),
      temperature: currentData.temperature!,
      rain: currentData.rain || 0,
      airQuality: currentData.airQuality || 0,
      humidity: currentData.humidity || 0,
      windSpeed: currentData.windSpeed || 0,
    };
    
    setHistory(prev => {
      const next = [...prev, record].slice(-MAX_RECORDS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [currentData.temperature, currentData.rain, currentData.airQuality, currentData.humidity, currentData.windSpeed]);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    return {
      avgTemp: history.reduce((s, r) => s + r.temperature, 0) / history.length,
      maxTemp: Math.max(...history.map(r => r.temperature)),
      minTemp: Math.min(...history.map(r => r.temperature)),
      totalRain: history.reduce((s, r) => s + r.rain, 0),
      avgAQI: history.reduce((s, r) => s + r.airQuality, 0) / history.length,
      maxAQI: Math.max(...history.map(r => r.airQuality)),
      recordCount: history.length,
      timeSpan: history.length > 0 ? Date.now() - history[0].timestamp : 0,
    };
  }, [history]);

  // Chart rendering (simple SVG)
  const renderChart = (data: number[], color: string, label: string) => {
    if (data.length < 2) return null;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 100;
    const h = 30;
    
    const points = data.map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>{label}</span>
          <span style={{ color, fontFamily: 'var(--font-mono)' }}>
            {data[data.length - 1]?.toFixed(1)}
          </span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60, background: 'var(--bg-tertiary)', borderRadius: 6 }}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            points={points}
          />
        </svg>
      </div>
    );
  };

  const formatTimeSpan = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560, maxHeight: '80vh', overflow: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div className="modal-title">📊 Histórico</div>
          <button className="btn icon" onClick={onClose} style={{ background: 'none', border: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-subtitle">
          {stats ? `${stats.recordCount} registros en ${formatTimeSpan(stats.timeSpan)}` : 'Esperando datos...'}
        </div>

        {stats ? (
          <>
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <div className="prediction-card" style={{ cursor: 'default' }}>
                <div className="prediction-label">Temp. Promedio</div>
                <div className="prediction-value">
                  {stats.avgTemp.toFixed(1)}<span className="prediction-unit">°C</span>
                </div>
                <div className="prediction-meta">
                  Max {stats.maxTemp.toFixed(1)}° / Min {stats.minTemp.toFixed(1)}°
                </div>
              </div>
              <div className="prediction-card" style={{ cursor: 'default' }}>
                <div className="prediction-label">AQI Promedio</div>
                <div className="prediction-value">
                  {stats.avgAQI.toFixed(0)}
                </div>
                <div className="prediction-meta">
                  Pico {stats.maxAQI.toFixed(0)}
                </div>
              </div>
              <div className="prediction-card" style={{ cursor: 'default' }}>
                <div className="prediction-label">Lluvia Total</div>
                <div className="prediction-value">
                  {stats.totalRain.toFixed(1)}<span className="prediction-unit">mm</span>
                </div>
                <div className="prediction-meta">acumulado</div>
              </div>
              <div className="prediction-card" style={{ cursor: 'default' }}>
                <div className="prediction-label">Registros</div>
                <div className="prediction-value">
                  {stats.recordCount}
                </div>
                <div className="prediction-meta">datos guardados</div>
              </div>
            </div>

            {/* Charts */}
            {renderChart(history.map(r => r.temperature), '#8b5cf6', 'Temperatura (°C)')}
            {renderChart(history.map(r => r.airQuality), '#f59e0b', 'Calidad del Aire (AQI)')}
            {renderChart(history.map(r => r.humidity), '#06b6d4', 'Humedad (%)')}
            {renderChart(history.map(r => r.windSpeed), '#10b981', 'Viento (km/h)')}
            {renderChart(history.map(r => r.rain), '#3b82f6', 'Lluvia (mm)')}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
            <div>Esperando primeros datos...</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>Los datos se registran automáticamente</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn"
            onClick={() => {
              if (confirm('¿Borrar todo el histórico?')) {
                localStorage.removeItem(STORAGE_KEY);
                setHistory([]);
              }
            }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Limpiar histórico
          </button>
          <button
            className="btn"
            onClick={() => {
              const csv = 'timestamp,temperature,rain,airQuality,humidity,windSpeed\n' +
                history.map(r => `${new Date(r.timestamp).toISOString()},${r.temperature},${r.rain},${r.airQuality},${r.humidity},${r.windSpeed}`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `terramind-history-${new Date().toISOString()}.csv`;
              a.click();
            }}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
}
