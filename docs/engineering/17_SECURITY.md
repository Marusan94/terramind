# 17 — Seguridad

- `.env*` en gitignore; `VITE_*` van al bundle del navegador → visibles
  para cualquiera con el link. Rotar keys expuestas (ya ocurrió 1 vez).
- Antes de producción: mover IA a `POST /api/v1/chat` con key en servidor.
- Sin secretos en código, docs ni historial (revisar con `git log -S`).
- Rate-limit y allowlist de orígenes en el futuro backend.
