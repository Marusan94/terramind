# 09 — Mapa 3D

- Base OSM raster + terreno Terrarium AWS (exageración 1.2) + edificios
  extruidos OpenFreeMap (sin key).
- Marcadores DOM por grupo (aire/agua/vegetación) con refs; hover escala
  el DOT INTERNO (escalar `el` borra el transform de MapLibre y salta a la
  esquina — bug documentado y corregido).
- Radar RainViewer como capa raster (add/remove al togglear, con fallback
  a chip de clima si falla).
- Regla: ningún fetch de tiles bloquea el mapa; todo con try/catch.
