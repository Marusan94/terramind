# 🌎 TerraMind

<p align="center">
  <strong>AI-powered environmental intelligence platform for understanding, monitoring, and predicting changes across the planet.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React-18%2F19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/PostGIS-Spatial%20DB-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostGIS" />
  <img src="https://img.shields.io/badge/MapLibre-3D%20GIS-black?style=flat-square" alt="MapLibre" />
  <img src="https://img.shields.io/badge/AI-Multi--Agent-purple?style=flat-square" alt="AI" />
  <img src="https://img.shields.io/badge/Stars-Welcome-yellow?style=flat-square" alt="Stars" />
</p>

---

## 🌍 What is TerraMind?

**TerraMind** is an open-source environmental intelligence platform that unifies:

- 🛰️ **Satellite imagery & Earth observation**
- 🗺️ **3D geospatial interactive visualization**
- 🤖 **Specialized multi-agent AI system**
- 🧠 **RAG over scientific literature and environmental reports**
- 📊 **Real-time environmental sensor networks**
- 🌳 **Computer vision for land-use & deforestation detection**
- 💧 **Water-quality monitoring and trend analysis**
- 🌫️ **Air-quality (PM2.5, NO₂, O₃) prediction models**
- ☀️ **Renewable-energy forecasting (Solar & Wind)**
- 📈 **Predictive machine-learning territorial models**

> **Ask questions about the planet.**
> **TerraMind finds the data, analyzes it, and shows you where it happens.**

---

## ✨ Features

### 🗺️ 3D Environmental Map
Explore territorial dynamics through high-performance 3D spatial rendering powered by **MapLibre GL** and **deck.gl**.

### 🤖 AI Environmental Copilot
Ask real questions in natural language:
- *"What environmental risks exist in this watershed?"*
- *"Analyze the vegetation loss in this region over the past 3 years."*
- *"Which zones exceed WHO thresholds for PM2.5?"*

### 🧠 Specialized Multi-Agent Swarm
| Agent | Core Responsibility |
| :--- | :--- |
| **Research Agent** | Scientific literature search |
| **GIS Agent** | Spatial queries (PostGIS, GeoJSON) |
| **Data Agent** | Dataset analytics |
| **Climate Agent** | Weather & climate patterns |
| **Water Agent** | Water quality monitoring |
| **Vision Agent** | Satellite change detection |
| **ML Agent** | Predictive models |
| **Report Agent** | Compliance summaries |

---

## 🧠 Architecture

\\\
                         USER
                           │
                           ▼
               ┌────────────────────────┐
               │    WEB APPLICATION     │
               │   React + TypeScript   │
               │  (MapLibre + deck.gl) │
               └───────────┬────────────┘
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
       🗺️ 3D MAP VIEWPORT           🤖 AI COPILOT
             │                           │
             └─────────────┬─────────────┘
                           ▼
                    FASTAPI BACKEND
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
     PostGIS          Vector RAG           AGENTS
       │                  │                   │
       └──────────┬───────┘                   │
                  │                           │
                  ▼                           │
         DATA INGESTION & ETL                 │
        (APIs, Sensors, Satellite)            │
                  │                           │
                  ▼                           │
          ML INFERENCE LAYER                  │
\\\

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, MapLibre GL, deck.gl |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy, Redis |
| **Geospatial** | PostgreSQL 16+, PostGIS 3.4+, pgvector |
| **AI** | OmniRoute (OpenRouter, Ollama, Claude, Gemini) |
| **Machine Learning** | PyTorch, YOLO, XGBoost, Scikit-learn |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions |

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: 20.x or higher
- **Python**: 3.11 or higher
- **Docker & Docker Compose**
- **Git**

### 1. Clone & Setup
\\\ash
git clone https://github.com/TU_USUARIO_GITHUB/terramind.git
cd terramind
\\\

### 2. Launch Infrastructure
\\\ash
docker compose up -d
\\\

### 3. Setup Backend
\\\ash
cd apps/api
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .\.venv\Scripts\Activate.ps1  # Windows

pip install -r requirements.txt
cp ../../.env.example .env
uvicorn app.main:app --reload --port 8000
\\\

### 4. Setup Frontend
\\\ash
cd apps/web
npm install
npm run dev
\\\

Open your browser at **http://localhost:3000**

---

## 🔮 Roadmap

- [x] **Phase 1 — Core Platform**: 3D Map, PostGIS, AI Copilot
- [x] **Phase 2 — Multi-Agent Intelligence**: GIS Agent, Vision detection
- [ ] **Phase 3 — Real-Time ETL**: Live IoT sensors, automated alerts
- [ ] **Phase 4 — Digital Twin**: Scenario simulation, climate stress-testing

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md).

\\\ash
git checkout -b feat/your-feature
git commit -m "feat: add your feature"
git push origin feat/your-feature
\\\

---

## 📜 License

Apache 2.0 License - See [LICENSE](./LICENSE)

---

<p align="center">
  <strong>🌎 Understand the planet. • 🤖 Ask the data. • 🔬 Discover what comes next.</strong>
</p>
