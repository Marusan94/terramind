import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CloudRain, CloudLightning, Building2, Mountain } from "lucide-react";

export interface StationInfo {
  name: string;
  municipality: string;
  elevation_m: number;
  pm25: string;
  turbidity: string;
  do: string;
  status: string;
  color?: string;
}

export interface RainCellInfo {
  intensity: string;
  dbz: string;
  rate: string;
  top_height?: string;
  probability: string;
  alerta?: string;
}

interface MapViewportProps {
  rainLayerActive?: boolean;
  terrainActive?: boolean;
  buildingsActive?: boolean;
  airActive?: boolean;
  waterActive?: boolean;
  forestActive?: boolean;
  onToggleRain?: (active: boolean) => void;
  onToggleTerrain?: (active: boolean) => void;
  onToggleBuildings?: (active: boolean) => void;
  onSelectStation?: (station: StationInfo) => void;
  onSelectRainCell?: (cell: RainCellInfo) => void;
}

const terramindBasemap: maplibregl.StyleSpecification = {
  version: 8,
  name: "TerraMind Dark",
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: ["/carto-tiles/dark_all/{z}/{x}/{y}@2x.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
      maxzoom: 19
    }
  },
  layers: [
    {
      id: "carto-dark",
      type: "raster",
      source: "carto-dark"
    }
  ]
};

// Environmental monitoring stations across Valle de Aburrá
const aburraStations = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "VA-01",
        name: "Estación Sabaneta - Cuenca Alta",
        river: "Río Aburrá (Sur) - Sabaneta",
        municipality: "Sabaneta",
        elevation_m: 1560,
        ph: 7.2,
        turbidity: "11.4 NTU",
        pm25: "16 µg/m³ (Bueno)",
        do: "6.8 mg/L",
        status: "Óptimo",
        color: "#10b981"
      },
      geometry: { type: "Point", coordinates: [-75.618, 6.151] }
    },
    {
      type: "Feature",
      properties: {
        id: "VA-02",
        name: "Estación El Poblado - Q. La Presidenta",
        river: "Q. La Presidenta / Milla de Oro",
        municipality: "Medellín Sur",
        elevation_m: 1540,
        ph: 7.0,
        turbidity: "14.2 NTU",
        pm25: "22 µg/m³ (Moderado)",
        do: "5.4 mg/L",
        status: "Normal",
        color: "#10b981"
      },
      geometry: { type: "Point", coordinates: [-75.572, 6.208] }
    },
    {
      type: "Feature",
      properties: {
        id: "VA-03",
        name: "Estación Tráfico Centro - La Alpujarra",
        river: "Eje Urbano Medellín",
        municipality: "Medellín Centro",
        elevation_m: 1495,
        ph: 6.7,
        turbidity: "26.8 NTU",
        pm25: "38 µg/m³ (Alerta Naranja)",
        do: "3.9 mg/L",
        status: "Precaución",
        color: "#f59e0b"
      },
      geometry: { type: "Point", coordinates: [-75.574, 6.244] }
    },
    {
      type: "Feature",
      properties: {
        id: "VA-04",
        name: "Estación Ladera Oriental - Pan de Azúcar",
        river: "Microcuenca Santa Elena",
        municipality: "Santa Elena / Medellín",
        elevation_m: 2150,
        ph: 7.6,
        turbidity: "4.1 NTU",
        pm25: "9 µg/m³ (Excelente)",
        do: "8.2 mg/L",
        status: "Reserva Natural",
        color: "#06b6d4"
      },
      geometry: { type: "Point", coordinates: [-75.522, 6.238] }
    },
    {
      type: "Feature",
      properties: {
        id: "VA-05",
        name: "Estación Cerro El Picacho",
        river: "Mirador Noroccidental",
        municipality: "Medellín Noroccidente",
        elevation_m: 2110,
        ph: 7.4,
        turbidity: "5.8 NTU",
        pm25: "12 µg/m³ (Bueno)",
        do: "7.9 mg/L",
        status: "Óptimo",
        color: "#10b981"
      },
      geometry: { type: "Point", coordinates: [-75.592, 6.302] }
    },
    {
      type: "Feature",
      properties: {
        id: "VA-06",
        name: "Estación Bello - Q. La García",
        river: "Río Aburrá (Norte) - Bello",
        municipality: "Bello",
        elevation_m: 1435,
        ph: 6.4,
        turbidity: "35.2 NTU",
        pm25: "31 µg/m³ (Sensible)",
        do: "2.8 mg/L",
        status: "Crítico",
        color: "#f43f5e"
      },
      geometry: { type: "Point", coordinates: [-75.556, 6.335] }
    }
  ]
};

// 3D Architectural Polygons for Iconic Medellín Skylines and Complexes
const medellin3DLandmarks = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Edificio Coltejer",
        category: "Rascacielos Icónico",
        height: 175,
        min_height: 0,
        color: "#10b981",
        description: "El rascacielos más emblemático de Medellín (175m). Monitoreo de vientos térmicos."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.5667, 6.2510],
          [-75.5659, 6.2510],
          [-75.5659, 6.2518],
          [-75.5667, 6.2518],
          [-75.5667, 6.2510]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Torre del Café",
        category: "Rascacielos Financiero",
        height: 160,
        min_height: 0,
        color: "#06b6d4",
        description: "Segunda torre más alta de Medellín (160m). Parque Berrío."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.5688, 6.2501],
          [-75.5680, 6.2501],
          [-75.5680, 6.2509],
          [-75.5688, 6.2509],
          [-75.5688, 6.2501]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Centro Administrativo La Alpujarra",
        category: "Complejo Cívico",
        height: 48,
        min_height: 0,
        color: "#f59e0b",
        description: "Sede de gobierno departamental y municipal. Microclima urbano céntrico."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.5752, 6.2435],
          [-75.5732, 6.2435],
          [-75.5732, 6.2452],
          [-75.5752, 6.2452],
          [-75.5752, 6.2435]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "Campus Bancolombia Industriales",
        category: "Arquitectura Sostenible",
        height: 52,
        min_height: 0,
        color: "#10b981",
        description: "Gran manzana corporativa bioclimática con certificación ambiental LEED."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.5765, 6.2295],
          [-75.5738, 6.2295],
          [-75.5738, 6.2318],
          [-75.5765, 6.2318],
          [-75.5765, 6.2295]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        name: "San Fernando Plaza - Milla de Oro",
        category: "Complejo Financiero Poblado",
        height: 110,
        min_height: 0,
        color: "#38bdf8",
        description: "Clúster corporativo El Poblado. Altura 110m sobre la ladera sur."
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.5748, 6.2018],
          [-75.5722, 6.2018],
          [-75.5722, 6.2045],
          [-75.5748, 6.2045],
          [-75.5748, 6.2018]
        ]]
      }
    }
  ]
};

// Radar & Cloud Layer over Valle de Aburrá (Precipitation Bands)
const aburraWeatherClouds = {
  type: "FeatureCollection",
  features: [
    // 1. Broad Cloud Cover Bank (Dense overcast over the mountains and valley)
    {
      type: "Feature",
      properties: {
        id: "cloud-bank",
        type: "Masa Nubosa General",
        coverage: "85% Nubosidad",
        altitude: "3,800m - 9,500m",
        wind_speed: "18 km/h",
        direction: "Este a Oeste (Cordillera Central)",
        color: "#94a3b8",
        opacity: 0.35
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.510, 6.210],
          [-75.495, 6.250],
          [-75.520, 6.310],
          [-75.560, 6.345],
          [-75.600, 6.320],
          [-75.615, 6.270],
          [-75.605, 6.210],
          [-75.575, 6.170],
          [-75.540, 6.180],
          [-75.510, 6.210]
        ]]
      }
    },
    // 2. Light Rain & Drizzle Fringe (Verde / Cyan: 15-25 dBZ)
    {
      type: "Feature",
      properties: {
        id: "rain-light",
        intensity: "Lluvia Ligera / Llovizna",
        dbz: "22 dBZ",
        rate: "4 - 8 mm/h",
        color: "#10b981", // Emerald/cyan
        opacity: 0.45,
        probability: "75%",
        eta: "Inmediata"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.520, 6.215],
          [-75.505, 6.255],
          [-75.535, 6.295],
          [-75.570, 6.285],
          [-75.590, 6.250],
          [-75.580, 6.210],
          [-75.550, 6.195],
          [-75.520, 6.215]
        ]]
      }
    },
    // 3. Moderate Precipitation Band (Amarillo: 30-40 dBZ)
    {
      type: "Feature",
      properties: {
        id: "rain-moderate",
        intensity: "Precipitación Moderada",
        dbz: "35 dBZ",
        rate: "14 - 22 mm/h",
        color: "#eab308", // Yellow
        opacity: 0.65,
        probability: "88%",
        eta: "En curso (Ladera Oriental)"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.530, 6.225],
          [-75.515, 6.260],
          [-75.540, 6.280],
          [-75.568, 6.265],
          [-75.575, 6.235],
          [-75.555, 6.215],
          [-75.530, 6.225]
        ]]
      }
    },
    // 4. Intense Storm Core & Convective Cell (Naranja / Rojo: 45-55 dBZ)
    {
      type: "Feature",
      properties: {
        id: "rain-core",
        intensity: "Tormenta Convectiva Fuerte",
        dbz: "49 dBZ (Máxima Reflectividad)",
        rate: "38 - 52 mm/h",
        top_height: "11,200 m (Cumulonimbus)",
        color: "#ef4444", // Red/Orange
        opacity: 0.85,
        probability: "94%",
        alerta: "Riesgo de crecientes súbitas en Q. Santa Elena y La Palencia",
        eta: "Impactando Centro y Oriente de Medellín"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.538, 6.235],
          [-75.525, 6.258],
          [-75.548, 6.270],
          [-75.562, 6.250],
          [-75.550, 6.230],
          [-75.538, 6.235]
        ]]
      }
    }
  ]
};

const rioMedellin = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Río Medellín (Aburrá)",
        status: "Eje hidrológico"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-75.625, 6.12],
          [-75.618, 6.151],
          [-75.595, 6.185],
          [-75.575, 6.21],
          [-75.575, 6.244],
          [-75.568, 6.28],
          [-75.556, 6.335],
          [-75.545, 6.37]
        ]
      }
    }
  ]
};

const reservasForestales = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Reserva Santa Elena / Pan de Azúcar",
        cover: "Bosque andino"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-75.54, 6.22],
          [-75.5, 6.22],
          [-75.495, 6.27],
          [-75.525, 6.285],
          [-75.545, 6.25],
          [-75.54, 6.22]
        ]]
      }
    }
  ]
};

const RAIN_LAYERS = [
  "weather-cloud-bank",
  "weather-rain-light",
  "weather-rain-moderate",
  "weather-rain-core",
  "weather-rain-lines"
];

function setLayerVisibility(map: maplibregl.Map, layerIds: string[], visible: boolean) {
  const visibility = visible ? "visible" : "none";
  layerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
  });
}

export const MapViewport: React.FC<MapViewportProps> = ({
  rainLayerActive = true,
  terrainActive = true,
  buildingsActive = true,
  airActive = true,
  waterActive = true,
  forestActive = true,
  onToggleRain,
  onToggleTerrain,
  onToggleBuildings,
  onSelectStation,
  onSelectRainCell
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const [coords, setCoords] = useState({ lng: -75.567, lat: 6.247, zoom: 12.2, pitch: 65, bearing: 20 });
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    setLayerVisibility(mapInstance.current, RAIN_LAYERS, rainLayerActive);
  }, [rainLayerActive, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    setLayerVisibility(mapInstance.current, ["aburra-halo", "aburra-core"], airActive);
  }, [airActive, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    setLayerVisibility(mapInstance.current, ["rio-medellin-line"], waterActive);
  }, [waterActive, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    setLayerVisibility(mapInstance.current, ["forest-fill", "forest-outline"], forestActive);
  }, [forestActive, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    setLayerVisibility(mapInstance.current, ["3d-buildings-city", "3d-landmarks"], buildingsActive);
  }, [buildingsActive, mapReady]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    if (terrainActive) {
      if (mapInstance.current.getSource("terrain-dem")) {
        mapInstance.current.setTerrain({ source: "terrain-dem", exaggeration: 1.6 });
      }
    } else {
      mapInstance.current.setTerrain(null);
    }
  }, [terrainActive, mapReady]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize MapLibre GL focused on Valle de Aburrá, Colombia
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: terramindBasemap,
      center: [-75.567, 6.247],
      zoom: 12.6,
      pitch: 48,
      bearing: 15,
      maxPitch: 85,
      preserveDrawingBuffer: true,
      transformRequest: (url) => {
        if (url.startsWith("/")) {
          return { url: `${window.location.origin}${url}` };
        }
        return { url };
      }
    });

    mapInstance.current = map;
    (window as Window & { __terraMap?: maplibregl.Map }).__terraMap = map;

    map.on("error", (event) => {
      console.error("TerraMind map error", event.error ?? event);
    });

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(mapContainer.current);

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    map.on("move", () => {
      const center = map.getCenter();
      setCoords({
        lng: Number(center.lng.toFixed(4)),
        lat: Number(center.lat.toFixed(4)),
        zoom: Number(map.getZoom().toFixed(1)),
        pitch: Math.round(map.getPitch()),
        bearing: Math.round(map.getBearing())
      });
    });

    map.on("load", () => {
      map.resize();
      setTimeout(() => {
        if (mapInstance.current) mapInstance.current.resize();
      }, 200);

      // Dark Sky styling so the horizon matches the sleek dark theme
      try {
        map.setSky({
          "sky-color": "#020617",
          "horizon-color": "#0f172a",
          "fog-color": "#020617"
        });
      } catch (err) {
        console.warn("Sky styling not applied:", err);
      }

      // 1. 3D TERRAIN DEM (AWS Terrarium)
      try {
        map.addSource("terrain-dem", {
          type: "raster-dem",
          tiles: ["/dem-tiles/terrarium/{z}/{x}/{y}.png"],
          encoding: "terrarium",
          tileSize: 256,
          maxzoom: 15
        });
        map.setTerrain({ source: "terrain-dem", exaggeration: 1.6 });
      } catch (err) {
        console.warn("Terrain DEM error:", err);
      }

      // 2. Hillshading (without place_other beforeId bug)
      try {
        map.addLayer({
          id: "valley-hills",
          type: "hillshade",
          source: "terrain-dem",
          paint: {
            "hillshade-shadow-color": "#020617",
            "hillshade-highlight-color": "#1e293b",
            "hillshade-accent-color": "#059669",
            "hillshade-exaggeration": 0.85
          }
        });
      } catch (err) {
        console.warn("Hillshade layer error:", err);
      }

      // 3. City-wide 3D buildings from vector tiles (optional; raster basemap always shows)
      try {
        if (!map.getSource("carto")) {
          map.addSource("carto", {
            type: "vector",
            url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json"
          });
        }
        map.addLayer({
          id: "3d-buildings-city",
          source: "carto",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 13.5,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13.5, "#090d16",
              15, "#151e2e",
              17, "#1e293b"
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              13.5, 0,
              14.5, 14,
              16, 24
            ],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.82
          }
        });
      } catch (err) {
        console.warn("3D city buildings unavailable:", err);
      }

      // 4. Iconic Landmarks 3D
      map.addSource("medellin-landmarks", {
        type: "geojson",
        data: medellin3DLandmarks as GeoJSON.FeatureCollection
      });

      map.addLayer({
        id: "3d-landmarks",
        type: "fill-extrusion",
        source: "medellin-landmarks",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.92
        }
      });

      // 5. RADAR WEATHER CLOUD & PRECIPITATION LAYERS (SIATA Simulation)
      map.addSource("weather-clouds", {
        type: "geojson",
        data: aburraWeatherClouds as GeoJSON.FeatureCollection
      });

      // Layer 5.1: Broad Overcast Cloud Blanket
      map.addLayer({
        id: "weather-cloud-bank",
        type: "fill",
        source: "weather-clouds",
        filter: ["==", "id", "cloud-bank"],
        paint: {
          "fill-color": "#cbd5e1",
          "fill-opacity": 0.28
        }
      });

      // Layer 5.2: Light Rain (Green/Cyan)
      map.addLayer({
        id: "weather-rain-light",
        type: "fill",
        source: "weather-clouds",
        filter: ["==", "id", "rain-light"],
        paint: {
          "fill-color": "#10b981",
          "fill-opacity": 0.45
        }
      });

      // Layer 5.3: Moderate Rain (Yellow)
      map.addLayer({
        id: "weather-rain-moderate",
        type: "fill",
        source: "weather-clouds",
        filter: ["==", "id", "rain-moderate"],
        paint: {
          "fill-color": "#eab308",
          "fill-opacity": 0.65
        }
      });

      // Layer 5.4: Intense Storm Core (Red/Orange Convective Cell)
      map.addLayer({
        id: "weather-rain-core",
        type: "fill",
        source: "weather-clouds",
        filter: ["==", "id", "rain-core"],
        paint: {
          "fill-color": "#ef4444",
          "fill-opacity": 0.82
        }
      });

      // Layer 5.5: Outline for radar storm fronts
      map.addLayer({
        id: "weather-rain-lines",
        type: "line",
        source: "weather-clouds",
        paint: {
          "line-color": "#f87171",
          "line-width": 1.5,
          "line-dasharray": [2, 2],
          "line-opacity": 0.75
        }
      });

      // Click on Rain / Cloud Cells to display radar telemetry
      map.on("click", "weather-rain-core", (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as RainCellInfo;
        const coordinates = e.lngLat;

        if (onSelectRainCell) {
          onSelectRainCell(props);
        }

        new maplibregl.Popup({ offset: 12 })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="font-family: sans-serif; padding: 6px; min-width: 210px; color: #0f172a;">
              <div style="display: flex; align-items: center; gap: 4px; font-weight: 800; font-size: 13px; color: #dc2626;">
                <span>⛈️</span> ${props.intensity}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">Radar Meteorológico SIATA • Valle de Aburrá</div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 6px;" />
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Reflectividad:</span><strong style="color: #b91c1c;">${props.dbz}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Tasa Lluvia:</span><strong>${props.rate}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Cima de Nube:</span><strong>${props.top_height}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span>Probabilidad:</span><strong style="color: #15803d;">${props.probability}</strong>
              </div>
              <div style="font-size: 10px; padding: 4px; border-radius: 4px; background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; margin-top: 4px;">
                ⚠️ ${props.alerta}
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseenter", "weather-rain-core", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "weather-rain-core", () => {
        map.getCanvas().style.cursor = "";
      });

      // 6. Environmental Monitoring Stations (SIATA)
      map.addSource("aburra-stations", {
        type: "geojson",
        data: aburraStations as GeoJSON.FeatureCollection
      });

      map.addLayer({
        id: "aburra-halo",
        type: "circle",
        source: "aburra-stations",
        paint: {
          "circle-radius": 16,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.35,
          "circle-stroke-width": 1.5,
          "circle-stroke-color": ["get", "color"]
        }
      });

      map.addLayer({
        id: "aburra-core",
        type: "circle",
        source: "aburra-stations",
        paint: {
          "circle-radius": 7,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        }
      });

      map.on("click", "aburra-core", (e) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties as StationInfo;
        const coordinates = e.lngLat;

        if (onSelectStation) {
          onSelectStation(props);
        }

        new maplibregl.Popup({ offset: 12, className: "aburra-popup" })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="font-family: sans-serif; padding: 6px; min-width: 190px; color: #0f172a;">
              <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px;">${props.name}</div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">${props.municipality} • ${props.elevation_m}m s.n.m.</div>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 6px;" />
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Aire (PM2.5):</span><strong>${props.pm25}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px;">
                <span>Turbidez:</span><strong>${props.turbidity}</strong>
              </div>
              <div style="font-size: 10px; text-transform: uppercase; font-weight: bold; color: ${props.color ?? "#10b981"}; margin-top: 4px;">
                ● Estado: ${props.status}
              </div>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseenter", "aburra-core", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "aburra-core", () => {
        map.getCanvas().style.cursor = "";
      });

      map.addSource("rio-medellin", {
        type: "geojson",
        data: rioMedellin as GeoJSON.FeatureCollection
      });
      map.addLayer({
        id: "rio-medellin-line",
        type: "line",
        source: "rio-medellin",
        paint: {
          "line-color": "#22d3ee",
          "line-width": 3.5,
          "line-opacity": 0.85
        }
      });

      map.addSource("reservas-forestales", {
        type: "geojson",
        data: reservasForestales as GeoJSON.FeatureCollection
      });
      map.addLayer({
        id: "forest-fill",
        type: "fill",
        source: "reservas-forestales",
        paint: {
          "fill-color": "#34d399",
          "fill-opacity": 0.18
        }
      });
      map.addLayer({
        id: "forest-outline",
        type: "line",
        source: "reservas-forestales",
        paint: {
          "line-color": "#6ee7b7",
          "line-width": 1.5,
          "line-opacity": 0.7
        }
      });

      setMapReady(true);
    });

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstance.current = null;
      setMapReady(false);
    };
  }, []);

  const flyToPreset = (target: "panoramic" | "coltejer" | "poblado" | "tormenta") => {
    if (!mapInstance.current) return;
    if (target === "panoramic") {
      mapInstance.current.flyTo({
        center: [-75.567, 6.247],
        zoom: 12.0,
        pitch: 65,
        bearing: 20,
        duration: 1800
      });
    } else if (target === "coltejer") {
      mapInstance.current.flyTo({
        center: [-75.5663, 6.2514],
        zoom: 16.2,
        pitch: 75,
        bearing: -35,
        duration: 2000
      });
    } else if (target === "poblado") {
      mapInstance.current.flyTo({
        center: [-75.5740, 6.2040],
        zoom: 15.8,
        pitch: 72,
        bearing: 15,
        duration: 2000
      });
    } else if (target === "tormenta") {
      mapInstance.current.flyTo({
        center: [-75.545, 6.248],
        zoom: 13.8,
        pitch: 68,
        bearing: -15,
        duration: 2000
      });
    }
  };

  const handleToggleRain = () => {
    onToggleRain?.(!rainLayerActive);
  };

  const handleToggleBuildings = () => {
    onToggleBuildings?.(!buildingsActive);
  };

  const handleToggleTerrain = () => {
    const nextState = !terrainActive;
    onToggleTerrain?.(nextState);
    if (!mapInstance.current) return;
    if (nextState) {
      mapInstance.current.easeTo({ pitch: 48, bearing: 15, duration: 600 });
    } else {
      mapInstance.current.easeTo({ pitch: 0, bearing: 0, duration: 600 });
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      <div ref={mapContainer} className="w-full h-full" />

      {/* TOP FLOATING OVERLAYS */}
      <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none z-10">
        <span className="px-3 py-1 bg-slate-950/90 border border-cyan-500/50 rounded-full text-xs text-cyan-300 font-mono shadow-2xl backdrop-blur pointer-events-auto flex items-center gap-1.5">
          <CloudRain className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          {rainLayerActive ? "Radar de Lluvia Activo (SIATA)" : "Radar Desactivado"}
        </span>

        {rainLayerActive && (
          <span className="px-3 py-1 bg-slate-950/90 border border-rose-500/40 rounded-full text-xs text-rose-300 font-mono shadow-2xl backdrop-blur pointer-events-auto flex items-center gap-1.5">
            <CloudLightning className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> Tormenta Convectiva: 49 dBZ
          </span>
        )}
      </div>

      {/* RADAR INTENSITY LEGEND (TOP-RIGHT UNDER CONTROLS) */}
      {rainLayerActive && (
        <div className="absolute top-28 right-4 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 text-[10px] font-mono text-slate-300 shadow-2xl backdrop-blur z-10 space-y-1">
          <div className="text-slate-400 font-bold mb-1 flex items-center gap-1">
            <span>🌧️</span> Reflectividad (Lluvia)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded bg-emerald-500/80"></span>
            <span>Ligera (15-25 dBZ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded bg-yellow-500/80"></span>
            <span>Moderada (30-40 dBZ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 rounded bg-rose-500/90"></span>
            <span>Fuerte/Tormenta (&gt;45 dBZ)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[9px] text-slate-400">
            <span>Dirección: Este ➔ Oeste (18 km/h)</span>
          </div>
        </div>
      )}

      {/* CONTROLS (BOTTOM-LEFT) */}
      <div className="absolute bottom-6 left-4 flex flex-wrap items-center gap-2 z-10">
        <button
          onClick={handleToggleRain}
          className={`px-3 py-1.5 border text-xs font-semibold rounded-lg shadow-xl backdrop-blur transition flex items-center gap-1.5 ${
            rainLayerActive
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
              : "bg-slate-900/90 border-slate-700 text-slate-400"
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          {rainLayerActive ? "Capa Lluvia: ON" : "Capa Lluvia: OFF"}
        </button>

        <button
          onClick={handleToggleBuildings}
          className={`px-3 py-1.5 border text-xs font-semibold rounded-lg shadow-xl backdrop-blur transition flex items-center gap-1.5 ${
            buildingsActive
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
              : "bg-slate-900/90 border-slate-700 text-slate-400"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {buildingsActive ? "Edificios 3D" : "2D"}
        </button>

        <button
          onClick={handleToggleTerrain}
          className="px-3 py-1.5 bg-slate-900/90 border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-white rounded-lg shadow-xl backdrop-blur transition flex items-center gap-1.5"
        >
          <Mountain className="w-3.5 h-3.5 text-emerald-400" />
          {terrainActive ? "Montañas 3D" : "Plano"}
        </button>

        <div className="flex bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 shadow-xl backdrop-blur text-xs">
          <button
            onClick={() => flyToPreset("tormenta")}
            className="px-2.5 py-1 text-rose-400 font-medium hover:text-white hover:bg-slate-800 rounded transition flex items-center gap-1"
            title="Enfocar la Célula de Lluvia"
          >
            <span>⛈️</span> Ver Tormenta
          </button>
          <button
            onClick={() => flyToPreset("poblado")}
            className="px-2.5 py-1 text-emerald-400 font-medium hover:text-white hover:bg-slate-800 rounded transition"
          >
            Milla de Oro
          </button>
          <button
            onClick={() => flyToPreset("coltejer")}
            className="px-2.5 py-1 text-emerald-400 font-medium hover:text-white hover:bg-slate-800 rounded transition"
          >
            Centro Coltejer
          </button>
          <button
            onClick={() => flyToPreset("panoramic")}
            className="px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition"
          >
            Valle Completo
          </button>
        </div>
      </div>

      {/* HUD TELEMETRY BADGE (BOTTOM-RIGHT) */}
      <div className="absolute bottom-6 right-4 bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-300 shadow-2xl backdrop-blur z-10 flex items-center gap-4">
        <div>
          <span className="text-slate-500">Lon/Lat: </span>
          <span className="text-emerald-400 font-bold">{coords.lng}, {coords.lat}</span>
        </div>
        <div>
          <span className="text-slate-500">Inclinación: </span>
          <span className="text-cyan-400 font-bold">{coords.pitch}°</span>
        </div>
      </div>
    </div>
  );
};
