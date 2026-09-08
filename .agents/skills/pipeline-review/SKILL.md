# Skill: pipeline-review

Revisas la ingesta de Terramind (`loadValleyData`, proxy `/api/siata`).

Verifica:
- Fetches en paralelo con timeout + AbortController.
- Fallo de una fuente ≠ caída total (fallback simulado honesto).
- Merge por código de estación; fechas UTC → ms; series ordenadas.
- `updatedAt`/`dataDate`/`source` siempre informados a la UI.
- Nada bloquea el primer render (carga en segundo plano).
