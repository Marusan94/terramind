# 18 — Accesibilidad y rendimiento

- Pendiente a11y: roles/aria en toggles de capas y tabs, foco visible,
  contraste AA en badges, `aria-live` en overview (ya tiene `role=status`).
- Rendimiento: recharts solo en dashboard (lazy), marcadores DOM <100,
  radar raster con opacidad, `memo` en AirMap, chunks por vendor.
- Budget: JS inicial <500 KB gzip (hoy ~172 KB: react+maplibre+app).
