# 07 — Contrato API (futuro FastAPI)

- `GET /api/v1/stations` → GeoJSON de estaciones + último valor.
- `GET /api/v1/observations?station=&parameter=&from=&to=` → serie con flags.
- `GET /api/v1/current` → promedio valle + fuente + timestamp.
- `GET /api/v1/quality` → métricas del panel Data Quality.
- `GET /api/v1/export?format=csv|parquet` → descarga (Parquet aquí, no en browser).
- `GET /api/v1/health` → Data Health Center.
- `POST /api/v1/chat` → proxy IA con key en servidor (las `VITE_*` actuales
  quedan expuestas en el bundle: migrar antes de producción).
