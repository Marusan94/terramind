# 06 — Base de datos (PostGIS, futuro)

```sql
CREATE TABLE stations (
  code TEXT PRIMARY KEY, name TEXT, municipality TEXT,
  geom GEOMETRY(Point, 4326), elevation_m REAL, source TEXT
);
CREATE TABLE observations (
  station_code TEXT REFERENCES stations(code),
  parameter TEXT, ts TIMESTAMPTZ, value REAL,
  quality_flag TEXT, source TEXT,
  PRIMARY KEY (station_code, parameter, ts)
);
CREATE INDEX obs_ts_idx ON observations (ts DESC);
CREATE INDEX stations_geom_idx ON stations USING GIST (geom);
```
`pgvector` para embeddings RAG. Seeds: estaciones SIATA reales
(`services/siata.ts` ya extrae códigos + coordenadas).
