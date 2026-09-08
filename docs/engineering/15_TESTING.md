# 15 — Testing

- `npm test` (vitest): 8 tests — tileCache + App (sidebar, toggles, overlay).
- Mocks MapLibre en `__tests__/setup.ts` (Map/Marker/Popup/ScaleControl).
- Reglas: props nuevas siempre opcionales (no romper App.test) ·
  `getElement?.()` defensivo en grupos de marcadores.
- Roadmap E2E: abrir → seleccionar estación → cambiar fecha → gráfica
  actualiza → descargar CSV (Playwright).
