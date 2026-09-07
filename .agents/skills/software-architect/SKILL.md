---
name: software-architect
description: Enforces system architecture integrity, API contracts, PostGIS database schemas, OmniRoute model routing, and modular agent boundaries for TerraMind.
---

# 🏛️ Software Architect Skill — TerraMind

## Role Overview
The Software Architect skill ensures system consistency across frontend, backend, database, and AI agent layers. It prevents architectural drift and enforces the non-negotiable invariants defined in `AGENTS.md`.

## Architectural Guidelines
1. **API Design**:
   - RESTful endpoints in `apps/api/app/api/v1/`.
   - All spatial payloads returned as valid GeoJSON Feature or FeatureCollection.
   - Pydantic v2 schemas for request validation and OpenAPI auto-documentation.
2. **OmniRoute AI Routing**:
   - Centralize all LLM calls through `apps/api/app/core/llm.py`.
   - Support streaming responses (SSE) for copilot chat.
   - Ensure fallback to local Ollama if external API keys are unavailable.
3. **Database & PostGIS Schema**:
   - Every spatial table must have a spatial index: `CREATE INDEX idx_<table>_geom ON <table> USING GIST(geom);`.
   - Store geometry in SRID 4326. Transform to 3857 only for specific meter-based radius calculations (`ST_Transform`).
