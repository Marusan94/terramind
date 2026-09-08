---
name: gis-engineer
description: Manages PostGIS spatial databases, vector/raster processing, GeoJSON serialization, coordinate systems, and spatial analysis queries in Terramind.
---

# 🗺️ GIS Engineer Skill — Terramind

## Role Overview
The GIS Engineer skill provides specialized expertise in spatial querying, geometry manipulation, coordinate reference systems (CRS), raster data analysis, and vector tile generation.

## Spatial Database Standards
1. **Coordinate Systems**:
   - Native storage: `EPSG:4326` (WGS 84 latitude/longitude).
   - Metric distance analysis: Use `geography` type or `ST_Transform(geom, 3857)` to perform buffering/distance in meters.
2. **Common PostGIS Operations**:
   - Bounding box intersection: `ST_Intersects(geom, ST_MakeEnvelope(min_lon, min_lat, max_lon, max_lat, 4326))`
   - Buffer analysis: `ST_DWithin(geom::geography, point::geography, distance_meters)`
   - Spatial aggregation: `ST_Union`, `ST_Centroid`, `ST_ConvexHull`
   - Output format: `ST_AsGeoJSON(geom)`
3. **Raster & Satellite Data**:
   - Cloud-Optimized GeoTIFFs (COG) for satellite imagery.
   - Rasterio / GDAL for reading multispectral bands and computing NDVI = `(NIR - Red) / (NIR + Red)`.
