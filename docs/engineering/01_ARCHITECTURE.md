# 01 — Arquitectura

```
                TERRAMIND
                     │
      ┌──────────────┴──────────────┐
      │                             │
  DATA PLANE                  PRODUCT PLANE
      │                             │
  SIATA dumps ──┐                   Frontend (Vite+React)
  Open-Meteo ───┼── valley.ts       API (futuro FastAPI)
  RainViewer ───┘   (unifica)       Auth / UX / IA / Mapas
      │
  Raw → Validated → Curated (PostgreSQL/PostGIS, futuro)
      │
  Feature Eng. → ML/Forecasting → Monitoring
```

**Gobernanza:** linaje visible en UI (pestaña Método) · secretos solo en
`.env.local` (gitignore) · metodología versionada en docs.

**Estado actual:** frontend-only con `services/valley.ts` como anti-corruption
layer: SIATA histórico + Open-Meteo actual + simulador de respaldo.
