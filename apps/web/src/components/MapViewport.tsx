import { useEffect, useRef, useState, memo } from 'react';
import maplibregl, { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getBasemapStyle, getTerrainSource } from '../services/basemaps';

interface MapViewportProps {
  onCoordsChange?: (lat: number, lon: number, bearing: number) => void;
  showAirQuality?: boolean;
  showWeather?: boolean;
  showWater?: boolean;
  showVegetation?: boolean;
  onStationClick?: (station: StationData) => void;
}

export interface StationData {
  id: string;
  name: string;
  type: 'air' | 'weather' | 'water' | 'vegetation';
  lat: number;
  lon: number;
  value?: number;
  unit?: string;
  status?: 'good' | 'moderate' | 'bad' | 'critical';
}

const STATIONS: StationData[] = [
  { id: 'siata-med', name: 'SIATA Medellín', type: 'weather', lat: 6.267, lon: -75.568, value: 22.5, unit: '°C', status: 'good' },
  { id: 'aq-med-centro', name: 'Aire Centro', type: 'air', lat: 6.247, lon: -75.567, value: 28, unit: 'µg/m³', status: 'moderate' },
  { id: 'aq-med-sur', name: 'Aire Sur', type: 'air', lat: 6.193, lon: -75.575, value: 45, unit: 'µg/m³', status: 'bad' },
  { id: 'aq-med-norte', name: 'Aire Norte', type: 'air', lat: 6.354, lon: -75.501, value: 22, unit: 'µg/m³', status: 'good' },
  { id: 'ri-med-rio', name: 'Río Medellín', type: 'water', lat: 6.247, lon: -75.572, value: 1.8, unit: 'm', status: 'good' },
  { id: 'ri-med-norte', name: 'Río Norte', type: 'water', lat: 6.310, lon: -75.560, value: 2.4, unit: 'm', status: 'moderate' },
  { id: 've-med-cerro', name: 'Cerro Pan de Azúcar', type: 'vegetation', lat: 6.275, lon: -75.540, value: 0.78, unit: 'NDVI', status: 'good' },
];

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'good': return '#22c55e';
    case 'moderate': return '#eab308';
    case 'bad': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#888888';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'air': return '🌫';
    case 'weather': return '🌧';
    case 'water': return '💧';
    case 'vegetation': return '🌳';
    default: return '📍';
  }
};

const VALLE_ABURRA = {
  center: [-75.567, 6.247] as [number, number],
  zoom: 11,
  pitch: 60,
  bearing: 0,
};

const MapViewport = memo(function MapViewport({
  onCoordsChange,
  showAirQuality = true,
  showWeather = true,
  showWater = true,
  showVegetation = true,
  onStationClick,
}: MapViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState({ lat: VALLE_ABURRA.center[1], lon: VALLE_ABURRA.center[0], bearing: VALLE_ABURRA.bearing });
  const [coordsVisible, setCoordsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    
    let coordsTimeout: ReturnType<typeof setTimeout>;
    
    const initMap = async () => {
      try {
        const map = new maplibregl.Map({
          container: containerRef.current!,
          style: getBasemapStyle('dark'),
          center: VALLE_ABURRA.center,
          zoom: VALLE_ABURRA.zoom,
          pitch: VALLE_ABURRA.pitch,
          bearing: VALLE_ABURRA.bearing,
          antialias: true,
          attributionControl: false,
          // Mismo límite que AirMap: z15 máx. del stack gratuito.
          maxZoom: 15,
          minZoom: 8,
        });
        
        mapRef.current = map;
        
        map.addControl(
          new maplibregl.NavigationControl({ visualizePitch: true }),
          'bottom-right'
        );
        
        map.addControl(
          new maplibregl.ScaleControl({ unit: 'metric' }),
          'bottom-left'
        );
        
        map.on('load', () => {
          setIsLoading(false);
          
          // Add terrain without 3D exaggeration for stability
          map.addSource('terrain', getTerrainSource());
          map.setTerrain({ source: 'terrain', exaggeration: 1.0 });
          
          // Add stations markers
          addStationMarkers(map);
        });
        
        map.on('error', (e) => {
          console.warn('Map error:', e);
          // Don't show error for tile loading issues, just log
          if (e.error?.message?.includes('404') || e.error?.message?.includes('Failed')) {
            setError(null); // Clear previous errors
          }
        });
        
        // Track mouse movement for coordinates
        map.on('mousemove', (e) => {
          setCoords({ 
            lat: e.lngLat.lat, 
            lon: e.lngLat.lng, 
            bearing: map.getBearing() 
          });
          setCoordsVisible(true);
          clearTimeout(coordsTimeout);
          coordsTimeout = setTimeout(() => setCoordsVisible(false), 2000);
        });
        
        map.on('moveend', () => {
          if (onCoordsChange) {
            const c = map.getCenter();
            onCoordsChange(c.lat, c.lng, map.getBearing());
          }
        });
        
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Error cargando mapa');
        setIsLoading(false);
      }
    };
    
    initMap();
    
    return () => {
      clearTimeout(coordsTimeout);
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onCoordsChange, showAirQuality, showWeather, showWater, showVegetation, onStationClick]);

  const addStationMarkers = (map: MapLibreMap) => {
    const visibleTypes = new Set<string>();
    if (showAirQuality) visibleTypes.add('air');
    if (showWeather) visibleTypes.add('weather');
    if (showWater) visibleTypes.add('water');
    if (showVegetation) visibleTypes.add('vegetation');
    
    STATIONS.filter(s => visibleTypes.has(s.type)).forEach(station => {
      const el = document.createElement('div');
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: ${getStatusColor(station.status)};
        border: 2px solid #000;
        box-shadow: 0 0 8px ${getStatusColor(station.status)}60;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        transition: transform 0.2s;
      `;
      el.textContent = getTypeIcon(station.type);
      el.title = `${station.name}: ${station.value}${station.unit}`;
      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
      el.addEventListener('click', () => onStationClick?.(station));
      
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([station.lon, station.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  };

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: '#000000',
        }}
      />
      
      {isLoading && (
        <div className="map-loading">
          <div className="loading">
            <span className="loading-dot" />
            <span className="loading-dot" style={{ animationDelay: '0.2s' }} />
            <span className="loading-dot" style={{ animationDelay: '0.4s' }} />
            <span>Cargando mapa...</span>
          </div>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          padding: '10px 14px',
          color: '#fca5a5',
          fontSize: '11px',
          fontFamily: 'var(--font)',
        }}>
          {error}
        </div>
      )}
      
      <div className={`hud-coords ${coordsVisible ? '' : 'hidden'}`}>
        <div>
          <span className="hud-coord-label">LON/LAT </span>
          <span className="hud-coord-value">
            {coords.lon.toFixed(4)}, {coords.lat.toFixed(4)}
          </span>
        </div>
        <div>
          <span className="hud-coord-label">BEARING </span>
          <span className="hud-coord-value">{Math.round(coords.bearing)}°</span>
        </div>
      </div>
    </>
  );
});

export default MapViewport;
