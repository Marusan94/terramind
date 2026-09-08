# 🤖 AGENTS.md — Terramind Multi-Agent Architecture & Engineering Contract

> **This document is the authoritative engineering contract for autonomous AI agents, coding assistants (Antigravity, OpenCode, Claude Code), and human developers working on Terramind.**
>
> All agents operating in this repository MUST read and adhere to the architectural invariants, conventions, and procedures described herein before introducing or modifying code.

---

## 1. Project Mission & Identity

**Terramind** is an open-source environmental intelligence platform that unifies 3D geospatial visualization, multi-agent AI reasoning, real-time sensor networks, and predictive machine learning into a single analytical cockpit.

### Core Objectives
1. **Explainable Environmental Insights**: Never produce hallucinations or ungrounded statistics. Every output must be traceable to a sensor observation, spatial feature, satellite scene, or peer-reviewed publication.
2. **Provider-Agnostic AI**: Maintain complete independence from single proprietary LLM providers through the **OmniRoute** abstraction layer.
3. **Open Geospatial Standards**: Base all spatial data storage and exchange on open standards (PostGIS, GeoJSON, OGC API, COG/GeoTIFF).

---

## 2. Non-Negotiable Architectural Invariants

Agents must NOT deviate from these technical choices without an explicit Architecture Decision Record (ADR) approved by the project maintainer:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ARCHITECTURAL INVARIANTS                        │
├──────────────────────┬─────────────────────────────────────────────────┤
│ Frontend Framework   │ React 18/19, TypeScript, Next.js / Vite         │
│ Styling System       │ Tailwind CSS, shadcn/ui                         │
│ 3D Spatial Engine    │ MapLibre GL JS + deck.gl (3D terrain & layers)  │
│ Backend API          │ Python 3.11+, FastAPI, Pydantic v2              │
│ Spatial Database     │ PostgreSQL 16+ with PostGIS 3.4+ & pgvector     │
│ Default Coordinate   │ Storage: EPSG:4326 (WGS 84)                     │
│ Reference System     │ Web Rendering / Tiles: EPSG:3857 (Web Mercator) │
│ LLM Routing          │ OmniRoute abstraction (OpenRouter, Ollama, APIs)│
│ Document Processing  │ PyPDF, PaddleOCR, Semantic Chunking + pgvector  │
│ Containerization     │ Docker, Docker Compose (PostGIS + Redis + App)  │
└──────────────────────┴─────────────────────────────────────────────────┘
```

### Strict Restrictions:
- ❌ **DO NOT** replace MapLibre GL with Leaflet or proprietary mapping SDKs unless specified in a task.
- ❌ **DO NOT** hardcode proprietary LLM clients (e.g. `import openai`) directly into feature controllers; always interact through `apps/api/app/core/llm.py` or the OmniRoute client.
- ❌ **DO NOT** store geometries as arbitrary strings or unindexed JSON; always use PostGIS spatial column types (`geometry(Geometry, 4326)`).

---

## 3. The Multi-Agent Agency (`.agents/skills/`)

Terramind operates with a federated swarm of specialized skills located in `.agents/skills/`:

| Skill / Role | Directory | Key Responsibilities |
| :--- | :--- | :--- |
| **Product Manager** | `.agents/skills/product-manager/` | Feature specifications, user stories, domain prioritization. |
| **Software Architect**| `.agents/skills/software-architect/`| System integrity, API schemas, micro-service contracts. |
| **UI/UX Engineer** | `.agents/skills/ui-ux/` | MapLibre/deck.gl views, copilot drawers, accessible UI. |
| **GIS Engineer** | `.agents/skills/gis-engineer/` | PostGIS queries (`ST_DWithin`, `ST_Intersects`), GeoJSON serialization. |
| **Data Engineer** | `.agents/skills/data-engineer/` | Sensor ETL pipelines, Pathway streams, data normalization. |
| **ML Engineer** | `.agents/skills/ml-engineer/` | Time-series forecasting, air/water quality models, YOLO detection. |
| **Environmental Scientist**| `.agents/skills/environmental-scientist/`| Domain indicators (NDVI, PM2.5, turbidity), scientific grounding. |
| **Research Agent** | `.agents/skills/research-agent/` | Literature search, semantic PDF chunking, RAG citation tracking. |
| **Security Engineer**| `.agents/skills/security/` | Secret management, sanitization, spatial data compliance. |
| **QA Engineer** | `.agents/skills/qa/` | Pytest fixtures, spatial test cases, end-to-end user journeys. |

When tackling a specific task, agents should activate the corresponding domain skill to load specialized protocols and checklists.

---

## 4. Repository Code Layout

```text
terramind/
├── apps/
│   ├── web/                     # React/TypeScript Frontend
│   │   ├── src/components/map/  # MapLibre & deck.gl viewports
│   │   ├── src/components/ai/   # Copilot chat and reasoning traces
│   │   └── src/lib/api/         # Typed API clients
│   └── api/                     # FastAPI Backend
│       ├── app/api/v1/          # Modular API routers
│       ├── app/core/            # Config, security, and LLM OmniRoute
│       ├── app/models/          # SQLAlchemy & GeoAlchemy2 models
│       └── app/services/        # Business logic & agent coordinators
├── agents/                      # Domain agent worker nodes
├── ml/                          # Training, inference, and weights registry
├── data/                        # Datasets (raw, processed, samples)
├── pipelines/                   # ETL and ingestion jobs
├── database/                    # Migrations and seed scripts
└── .agents/skills/              # Specialized agent skill definitions
```

---

## 5. Coding Standards & Conventions

### Python (Backend & ML)
- **Formatting**: Black / Ruff (line-length: 100).
- **Typing**: Strict type hints with Pydantic v2 models for all request/response schemas.
- **Async First**: Use `async`/`await` for I/O operations (database, Redis, external APIs).
- **Spatial Queries**: Use parameter binding and spatial indexing (`CREATE INDEX ... USING GIST(geom)`).

### TypeScript (Frontend)
- **Strict Mode**: `strict: true` in `tsconfig.json`. No usage of `any`.
- **State Management**: Zustand or React Context for global app state (selected bounding box, active layers).
- **GeoJSON Handling**: Treat GeoJSON data as immutable. Avoid mutating coordinate arrays in-place.

---

## 6. Scientific Grounding & Hallucination Prevention

When implementing agent responses, the output payload MUST strictly adhere to this structure:

```json
{
  "summary": "Natural language summary of findings...",
  "confidence_score": 0.89,
  "spatial_features": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "metrics": {
    "indicator": "PM2.5",
    "value": 34.2,
    "unit": "µg/m³",
    "threshold_status": "exceeds_who_standard"
  },
  "sources": [
    {
      "title": "Air Quality Assessment in Metropolitan Valley 2024",
      "doi_or_url": "https://doi.org/10.1016/j.envpol...",
      "confidence": "high"
    }
  ]
}
```

---

## 7. Git & Commit Guidelines

Agents committing changes must use Conventional Commits:
- `feat(map): add 3D terrain elevation layer with MapLibre`
- `feat(agent): implement GIS agent PostGIS query generation`
- `fix(etl): correct timestamp parsing for water sensor streams`
- `docs(readme): update system architecture diagrams`

---

## 8. Definition of Done (DoD)

Before any task or pull request is marked as complete:
1. Relevant automated tests pass (`pytest` and `npm test`).
2. New spatial endpoints provide proper error handling and GeoJSON validation.
3. No secrets (`.env`, private keys) are exposed or committed.
4. Documentation and API schemas (`/docs`) reflect the latest changes.
