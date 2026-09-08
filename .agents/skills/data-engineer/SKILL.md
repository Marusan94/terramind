---
name: data-engineer
description: Builds ETL pipelines, real-time sensor streams, data normalization, Pathway/Pandas ingestion, and database migrations for Terramind.
---

# ⚙️ Data Engineer Skill — Terramind

## Role Overview
The Data Engineer skill specializes in moving, cleaning, transforming, and loading environmental datasets from varied external sources (IoT sensors, satellite providers, government APIs) into Terramind's storage engines.

## Key Pipelines
1. **Sensor Ingestion**:
   - Ingestion jobs in `pipelines/` handling Air Quality (OpenAQ / purpleair) and Water Quality (USGS / national hydrological services).
   - Time-series timestamp normalization to UTC ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`).
2. **Batch Processing**:
   - Bulk loading GeoJSON, Shapefiles, and Parquet files into PostgreSQL/PostGIS.
   - Idempotent upsert logic (`ON CONFLICT DO UPDATE`) to prevent duplicate sensor observations.
3. **Data Quality Checks**:
   - Detect sensor drift, impossible readings (e.g. negative precipitation, pH < 0 or > 14).
   - Flag anomalies before records enter the analytics tables.
