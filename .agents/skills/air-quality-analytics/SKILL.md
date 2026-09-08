# Skill: air-quality-analytics

Dueño de los análisis del dashboard (Territorio, Δ24h, scatters).

Reglas:
- AQI solo vía `calculateAQI` (EPA, PM2.5) — no reinventar.
- Comparaciones con deltas reales de series; si no hay serie, "s/d".
- Scatter PM2.5↔humedad: etiquetar lo estimado como estimado.
- Vulnerabilidad 55/25/20 documentada en Método.
- Tablas con unidades y banderas, nunca números sueltos.
