# 16 — Observabilidad (roadmap)

- Logs estructurados JSON (ingesta, API, chat: proveedor/modelo/latencia,
  nunca el contenido de keys).
- `/health` por servicio + panel Data Health (ya existe en UI, hoy con
  datos del loader).
- Métricas: Prometheus + Grafana (latencia p95, tasa error, frescura).
- Errores al usuario siempre genéricos; detalle solo en consola/logs.
