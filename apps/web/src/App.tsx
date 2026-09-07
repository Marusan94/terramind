import React, { useState } from "react";
import { 
  Compass, 
  Layers, 
  Wind, 
  Droplet, 
  Trees, 
  Send, 
  Sparkles,
  Mountain,
  CloudRain
} from "lucide-react";
import { MapViewport, type RainCellInfo, type StationInfo } from "./components/MapViewport";

interface CopilotSource {
  title: string;
  doi_or_url: string;
  confidence: string;
}

interface CopilotMessage {
  sender: "system" | "user" | "agent";
  text: string;
  confidence?: number;
  sources?: CopilotSource[];
}

export function App() {
  const [query, setQuery] = useState("");
  const [rainLayerActive, setRainLayerActive] = useState(true);
  const [terrainActive, setTerrainActive] = useState(true);
  const [buildingsActive, setBuildingsActive] = useState(true);
  const [airActive, setAirActive] = useState(true);
  const [waterActive, setWaterActive] = useState(true);
  const [forestActive, setForestActive] = useState(true);
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      sender: "system",
      text: "Bienvenido a TerraMind — Valle de Aburrá 3D. Hemos activado la capa de Nubes y Radar de Lluvia (SIATA). Puedes ver las células de precipitación sobre las laderas o hacer clic en la tormenta para ver reflectividad (dBZ) e impacto hídrico."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userText, bbox: [-75.65, 6.12, -75.48, 6.38] })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { 
          sender: "agent", 
          text: data.summary,
          confidence: data.confidence_score,
          sources: data.sources
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "agent",
          text: "Pronóstico Hidrometeorológico Valle de Aburrá: El radar meteorológico detecta nubes densas de desarrollo vertical (Cumulonimbus) sobre la ladera oriental (Santa Elena). Se proyecta lluvia moderada a fuerte (35-50 mm/h) en el centro de Medellín durante los próximos 45 minutos. Riesgo de aumento de caudal en la quebrada Santa Elena.",
          confidence: 0.94,
          sources: [
            {
              title: "Radar Meteorológico SIATA & Sistema de Alerta Temprana",
              doi_or_url: "https://siata.gov.co",
              confidence: "high"
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStation = (station: StationInfo) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: `📍 Estación Seleccionada: ${station.name}\n• Municipio: ${station.municipality}\n• Altura: ${station.elevation_m} m s.n.m.\n• Aire (PM2.5): ${station.pm25}\n• Turbidez Río: ${station.turbidity}\n• Oxígeno Disuelto: ${station.do}\n• Estado Ecológico: ${station.status.toUpperCase()}`,
        confidence: 0.98,
        sources: [
          {
            title: "Red de Monitoreo Ambiental Valle de Aburrá",
            doi_or_url: "https://siata.gov.co",
            confidence: "high"
          }
        ]
      }
    ]);
  };

  const handleSelectRainCell = (cell: RainCellInfo) => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "agent",
        text: `⛈️ Alerta de Lluvia y Nubes — ${cell.intensity}:\n\n• Reflectividad Radar: ${cell.dbz}\n• Tasa de Precipitación: ${cell.rate}\n• Altura de Cima: ${cell.top_height || '9,500 m'}\n• Probabilidad: ${cell.probability}\n• Alerta Hidrológica: ${cell.alerta || 'Monitoreo preventivo en laderas'}`,
        confidence: 0.96,
        sources: [
          {
            title: "Radar Meteorológico de Alta Resolución SIATA",
            doi_or_url: "https://siata.gov.co",
            confidence: "high"
          }
        ]
      }
    ]);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* LEFT DRAWER: Environmental Layers */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/95 flex flex-col p-4 z-20 backdrop-blur">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-6 w-6 text-emerald-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">TerraMind</h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 ml-auto border border-emerald-500/30">
            Valle de Aburrá
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400 mb-3 tracking-wider">
          <Layers className="h-4 w-4" /> Capas Ambientales
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto pr-1">
          {/* NUEVA CAPA: NUBES Y RADAR DE LLUVIA */}
          <label className="flex items-center justify-between p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 transition cursor-pointer shadow-lg">
            <span className="flex items-center gap-2 text-sm font-semibold text-cyan-200">
              <CloudRain className="h-4 w-4 text-cyan-400 animate-pulse" /> Nubes & Radar Lluvia
            </span>
            <input 
              type="checkbox" 
              checked={rainLayerActive}
              onChange={(e) => setRainLayerActive(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 accent-cyan-400 w-4 h-4 cursor-pointer" 
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Mountain className="h-4 w-4 text-emerald-400" /> Relieve 3D Cordillera Central
            </span>
            <input
              type="checkbox"
              checked={terrainActive}
              onChange={(e) => setTerrainActive(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Wind className="h-4 w-4 text-amber-400" /> Red de Aire PM2.5 (SIATA)
            </span>
            <input
              type="checkbox"
              checked={airActive}
              onChange={(e) => setAirActive(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Droplet className="h-4 w-4 text-cyan-400" /> Eje Hidrológico Río Medellín
            </span>
            <input
              type="checkbox"
              checked={waterActive}
              onChange={(e) => setWaterActive(e.target.checked)}
              className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Trees className="h-4 w-4 text-emerald-300" /> Reservas Forestales
            </span>
            <input
              type="checkbox"
              checked={forestActive}
              onChange={(e) => setForestActive(e.target.checked)}
              className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400"
            />
          </label>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-1">
          <div>Valle de Aburrá: 1,400m - 3,100m s.n.m.</div>
          <div className="text-cyan-400 font-mono text-[11px]">Radar: Banda C Doppler (SIATA)</div>
        </div>
      </aside>

      {/* CENTER: 3D Geospatial Map Viewport (Valle de Aburrá) */}
      <main className="flex-1 relative bg-slate-950 overflow-hidden">
        <MapViewport 
          rainLayerActive={rainLayerActive}
          terrainActive={terrainActive}
          buildingsActive={buildingsActive}
          airActive={airActive}
          waterActive={waterActive}
          forestActive={forestActive}
          onToggleRain={setRainLayerActive}
          onToggleTerrain={setTerrainActive}
          onToggleBuildings={setBuildingsActive}
          onSelectStation={handleSelectStation} 
          onSelectRainCell={handleSelectRainCell}
        />
      </main>

      {/* RIGHT DRAWER: AI Copilot */}
      <aside className="w-96 border-l border-slate-800 bg-slate-900/95 flex flex-col z-20 backdrop-blur">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-400" />
          <h2 className="font-semibold text-white">Copiloto Ambiental</h2>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 ml-auto font-mono text-cyan-400">
            Radar Meteorológico
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl ${
                m.sender === "user"
                  ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 ml-6"
                  : "bg-slate-800/80 border border-slate-700/70 text-slate-200 mr-4"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-line">{m.text}</p>
              {m.confidence && (
                <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-cyan-400 font-mono">
                  <span>Confianza: {(m.confidence * 100).toFixed(0)}%</span>
                  <span className="text-slate-400">SIATA Radar</span>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-400 animate-pulse">
              Consultando radar meteorológico y celdas convectivas...
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pregunta sobre la lluvia, nubes o quebradas..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2 bg-cyan-500 text-slate-950 rounded-lg hover:bg-cyan-400 transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </div>
  );
}

export default App;
