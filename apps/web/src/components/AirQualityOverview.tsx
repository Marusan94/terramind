/**
 * Air Quality Overview — tarjeta flotante sobre el mapa.
 * Responde de inmediato: "¿Cómo está el aire HOY?"
 * Muestra AQI, contaminantes, hora/fuente de actualización y estado de validación.
 */

import { useState, useEffect } from 'react';

interface Props {
  aqi: number;
  pm25: number;
  pm10: number;
  category: string;
  color: string;
  updatedAt: number; // epoch ms de la última actualización de datos
  source?: string;
  dataDate?: string; // etiqueta del periodo que cubren los datos
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatFull(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()} — ${hh}:${mm}`;
}

function formatAgo(ts: number, now: number): string {
  const mins = Math.floor((now - ts) / 60000);
  if (mins < 1) return 'ahora mismo';
  if (mins === 1) return 'hace 1 min';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return 'hace 1 h';
  return `hace ${hours} h`;
}

export default function AirQualityOverview({
  aqi,
  pm25,
  pm10,
  category,
  color,
  updatedAt,
  source = 'SIATA (AMVA)',
  dataDate = '',
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Recalcula el "hace X min" cada 30 s sin pedir datos nuevos
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const stale = now - updatedAt > 60 * 60000;

  return (
    <div className={`aqi-overview ${collapsed ? 'collapsed' : ''}`} role="status" aria-live="polite">
      <div className="aqi-overview-main">
        <div className="aqi-overview-num" style={{ color, borderColor: color }}>
          {aqi}
        </div>
        {!collapsed && (
          <div className="aqi-overview-body">
            <div className="aqi-overview-cat">{category}</div>
            <div className="aqi-overview-sub">
              PM2.5 {pm25} · PM10 {pm10} µg/m³
            </div>
          </div>
        )}
        <button
          className="aqi-overview-toggle"
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Expandir resumen' : 'Minimizar resumen'}
          aria-expanded={!collapsed}
        >
          {collapsed ? '＋' : '–'}
        </button>
      </div>

      {!collapsed && (
        <div className="aqi-overview-meta">
          <span className={stale ? 'stale' : ''}>
            {stale ? '⚠ ' : '🕒 '}Actualizado {formatAgo(updatedAt, now)} · {formatFull(updatedAt)}
          </span>
          <span>Fuente: {source}{dataDate ? ` · ${dataDate}` : ''}</span>
        </div>
      )}
    </div>
  );
}
