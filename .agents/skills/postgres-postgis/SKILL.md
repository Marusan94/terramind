# Skill: postgres-postgis

Guías el futuro backend espacial (ver `docs/engineering/06`).

Reglas:
- Coordenadas en `GEOMETRY(Point, 4326)`, índice GIST.
- Clave compuesta (estación, parámetro, ts); índice en ts DESC.
- Consultas con `ST_DWithin`/`ST_Intersects` y parámetros ligados.
- Seeds desde `services/siata.ts` (códigos + coordenadas reales).
