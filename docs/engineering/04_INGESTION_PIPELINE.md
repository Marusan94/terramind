# 04 — Pipeline de ingesta

**Hoy (frontend):** `loadValleyData()` — fetch paralelo SIATA×4 + CAMS +
clima, merge por estación, fallback simulado. Proxy Vite `/api/siata`
evita CORS en dev/túnel.

**Futuro (backend):**
```
run_id | source | started_at | finished_at | records | status | error
```
- Job horario APScheduler/Celery → Raw (JSON crudo) → Validated (flags) →
  Curated (PostGIS `observations`).
- Reintentos con backoff; cada run registrado en `ingestion_runs`.
- Backfill desde dumps de 6 meses para huecos de red.
