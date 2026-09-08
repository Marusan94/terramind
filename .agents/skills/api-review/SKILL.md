# Skill: api-review

Revisas el futuro `POST /api/v1/chat` y endpoints del doc 07.

Reglas:
- Keys de IA SOLO en servidor; el browser nunca ve secretos.
- Esquemas Pydantic v2 estrictos; GeoJSON validado.
- `/export` con `format=csv|parquet`; Parquet solo aquí, no en browser.
- Errores 5xx genéricos al cliente, detalle en logs.
- Rate-limit + CORS allowlist antes de exponer el túnel/dominio.
