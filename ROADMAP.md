# 🔮 Terramind Project Roadmap

This document outlines the phased development trajectory of **Terramind**, from core foundational infrastructure to a fully autonomous environmental digital twin.

---

## 📌 Phased Implementation

### Phase 1 — Core Platform Foundation
- [x] **Repository Scaffold & Agent Contract**: Project structure, `AGENTS.md`, and multi-agent skills architecture.
- [x] **Spatial Database Setup**: PostgreSQL 16 + PostGIS 3.4 containerization with spatial indexing.
- [x] **Interactive 3D Geospatial Engine**: MapLibre GL JS integration with terrain elevation (DEM) and layer toggling.
- [x] **AI Copilot Drawer**: Bidirectional interface between natural language queries and map viewport.
- [x] **Base Vector RAG**: PostgreSQL `pgvector` store for environmental reports and paper abstracts.

---

### Phase 2 — Multi-Agent Intelligence & Spatial Reasoning
- [x] **GIS Agent**: Natural language to PostGIS spatial SQL generation (`ST_Contains`, `ST_Intersects`, `ST_DWithin`).
- [x] **Research Agent**: Semantic literature retrieval with DOI extraction and citation tracking.
- [x] **Vision Agent**: Optical change detection pipeline for satellite imagery (NDVI calculation & differencing).
- [x] **Data Analytics Agent**: Statistical anomaly detection on tabular environmental time-series.
- [x] **Local Predictive ML**: Baseline models for water quality (turbidity, pH) and air quality (PM2.5).

---

### Phase 3 — Real-Time IoT & Streaming ETL
- [ ] **Sensor Ingestion Connectors**: MQTT, REST, and Webhook ingestion pipelines for real-time IoT air/water stations.
- [ ] **Stream Processing Layer**: Pathway / Kafka real-time sliding window calculations for environmental alerts.
- [ ] **Automated Anomaly Alerting**: Email and webhook notifications when sensor measurements breach safety thresholds.
- [ ] **Temporal Playback Controls**: Time-slider in UI to scrub through historical satellite scenes and sensor states.

---

### Phase 4 — Territorial Environmental Digital Twin
- [ ] **High-Resolution 3D Meshes**: Integration of 3D urban building footprints and tree canopy meshes with deck.gl.
- [ ] **Hydrological & Flood Simulation**: Runoff models simulating flood inundation under variable precipitation scenarios.
- [ ] **Microclimate & Urban Heat Island Simulation**: Surface temperature prediction based on urban density and green cover.
- [ ] **Multi-Scenario Modeling**: Interactive "What-If" simulation workbench for city planners and conservationists.

---

## 🚀 Future Horizons & Community Goals

- [ ] **Multi-City & Regional Federation**: Dynamic switching across municipal watersheds globally.
- [ ] **Autonomous Satellite Harvester**: Automated scheduling of Sentinel-2 / Landsat optical and SAR imagery downloads.
- [ ] **Decentralized Sensor Verification**: Cryptographic signing of environmental sensor streams for regulatory compliance.
- [ ] **Mobile Field Inspection App**: Offline-first mobile app for park rangers and field researchers with GPS sync.
- [ ] **Terramind Plugin Marketplace**: Community-developed agents, ML models, and custom layer visualizers.
