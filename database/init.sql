-- =============================================================================
-- TerraMind PostGIS and Spatial Database Initialization
-- =============================================================================

-- Enable PostGIS spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Enable pgvector extension for semantic literature search (RAG)
-- (If supported by image, otherwise fallback to standard text search)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'pgvector extension not installed in image, continuing with spatial extensions only.';
END $$;

-- Sample Schema: Environmental Layers
CREATE TABLE IF NOT EXISTS environmental_layers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'water', 'air', 'vegetation', 'urban'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sample Schema: Sensor Stations
CREATE TABLE IF NOT EXISTS sensor_stations (
    id SERIAL PRIMARY KEY,
    station_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL, -- 'air_quality', 'water_quality', 'meteorological'
    location GEOMETRY(Point, 4326) NOT NULL,
    elevation_m NUMERIC,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index on station locations
CREATE INDEX IF NOT EXISTS idx_sensor_stations_location 
ON sensor_stations USING GIST(location);

-- Sample Schema: Water Quality Measurements
CREATE TABLE IF NOT EXISTS water_measurements (
    id BIGSERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES sensor_stations(id),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ph NUMERIC(4, 2),
    turbidity_ntu NUMERIC(6, 2),
    dissolved_oxygen_mg_l NUMERIC(5, 2),
    temperature_c NUMERIC(4, 2),
    contaminant_index NUMERIC(5, 2)
);

CREATE INDEX IF NOT EXISTS idx_water_measurements_station_time 
ON water_measurements(station_id, recorded_at DESC);
