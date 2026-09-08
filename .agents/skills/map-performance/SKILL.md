# Skill: map-performance

Cuidador de `AirMap.tsx`.

Reglas de oro:
- Hover escala el DOT INTERNO, nunca `el` (MapLibre lo posiciona con
  transform; tocarlo manda el marcador a la esquina).
- Grupos por capa en refs + `setGroupVisible`; re-render al llegar datos.
- Capas raster (radar) con add/remove defensivo (`?.`) y try/catch.
- `memo`, efectos con deps mínimas, nada de fetch bloqueante en `load`.
