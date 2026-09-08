/**
 * Demo Mode Service
 * Permite que Terramind funcione completamente offline con datos simulados
 * cuando el backend no está disponible.
 */

import type { CopilotResponse } from '../types/copilot';

export const DEMO_RESPONSES: Record<string, CopilotResponse> = {
  lluvia: {
    summary: "⛈️ **Pronóstico Hidrometeorológico Valle de Aburrá**\n\nEl radar meteorológico detecta nubes densas de desarrollo vertical (Cumulonimbus) sobre la ladera oriental (Santa Elena). Se proyecta lluvia moderada a fuerte (35-50 mm/h) en el centro de Medellín durante los próximos 45 minutos. Riesgo de aumento de caudal en la quebrada Santa Elena.",
    confidence_score: 0.94,
    metrics: {
      analyzed_region: "Valle de Aburrá",
      dbz_max: 49,
      precipitacion_rate: "35-50 mm/h",
      wind_direction: "Este → Oeste (18 km/h)",
      risk_level: "Alerta Naranja"
    },
    sources: [
      {
        title: "Radar Meteorológico SIATA & Sistema de Alerta Temprana",
        doi_or_url: "https://siata.gov.co",
        confidence: "high"
      }
    ],
    suggested_actions: [
      "Enfocar cámara 3D en célula de tormenta",
      "Activar capa de reflectividad dBZ",
      "Monitorear estaciones de quebradas"
    ]
  },
  aire: {
    summary: "🌫️ **Calidad del Aire - Valle de Aburrá**\n\nLa estación de La Alpujarra (Centro) registra PM2.5 en 38 µg/m³ (Alerta Naranja). La ladera oriental (Pan de Azúcar) mantiene condiciones óptimas con 9 µg/m³. Se observa gradiente típico valle-montaña con mayor contaminación en el centro urbano.",
    confidence_score: 0.91,
    metrics: {
      pm25_avg: 24.5,
      worst_station: "La Alpujarra",
      best_station: "Pan de Azúcar",
      air_quality: "Moderado-Sensible"
    },
    sources: [
      {
        title: "Red de Monitoreo de Calidad del Aire - SIATA",
        doi_or_url: "https://siata.gov.co",
        confidence: "high"
      }
    ],
    suggested_actions: [
      "Activar capa de PM2.5 en el mapa",
      "Revisar recomendaciones para grupos sensibles"
    ]
  },
  agua: {
    summary: "💧 **Monitoreo Hidrológico**\n\nLa estación de Bello (Q. La García) reporta turbidez crítica de 35.2 NTU con oxígeno disuelto bajo (2.8 mg/L). El Río Medellín en el sur (Sabaneta) mantiene condiciones óptimas. Riesgo de contaminación en el norte del valle.",
    confidence_score: 0.88,
    metrics: {
      turbidity_max: 35.2,
      do_min: 2.8,
      ph_range: "6.4 - 7.6",
      status: "Precaución en zona norte"
    },
    sources: [
      {
        title: "Red Hidrológica del Valle de Aburrá",
        doi_or_url: "https://siata.gov.co",
        confidence: "high"
      }
    ],
    suggested_actions: [
      "Activar capa hidrológica",
      "Monitorear quebrada La García"
    ]
  },
  vegetacion: {
    summary: "🌳 **Cobertura Forestal**\n\nLa Reserva Forestal Santa Elena / Pan de Azúcar mantiene bosque andino saludable. Se detecta ligera presión urbana en el borde sur. NDVI promedio de 0.78 en zonas protegidas, indicando buena cobertura vegetal.",
    confidence_score: 0.86,
    metrics: {
      ndvi_avg: 0.78,
      protected_area: "12.4 km²",
      deforestation_risk: "Bajo"
    },
    sources: [
      {
        title: "Sentinel-2 NDVI Analysis - Valle de Aburrá",
        doi_or_url: "https://scihub.copernicus.eu",
        confidence: "high"
      }
    ],
    suggested_actions: [
      "Activar capa de Reservas Forestales",
      "Comparar con imágenes históricas"
    ]
  },
  default: {
    summary: "🌎 **Terramind Environmental Intelligence**\n\nEstoy en modo demostración. Puedo ayudarte con información sobre:\n\n• **Lluvias y radar meteorológico** (escribe 'lluvia')\n• **Calidad del aire PM2.5** (escribe 'aire')\n• **Monitoreo hidrológico** (escribe 'agua')\n• **Cobertura forestal** (escribe 'vegetacion')\n\nPregúntame sobre el Valle de Aburrá y sus condiciones ambientales actuales.",
    confidence_score: 0.85,
    metrics: {
      mode: "demo",
      available_queries: ["lluvia", "aire", "agua", "vegetacion"]
    },
    sources: [
      {
        title: "Terramind - Sistema de Inteligencia Ambiental",
        doi_or_url: "https://github.com/Marusan94/terramind",
        confidence: "high"
      }
    ],
    suggested_actions: [
      "Probar consulta: lluvia",
      "Probar consulta: aire",
      "Probar consulta: agua"
    ]
  }
};

export function getDemoResponse(query: string): CopilotResponse {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes("lluvia") || lowerQuery.includes("tormenta") || lowerQuery.includes("radar")) {
    return DEMO_RESPONSES.lluvia;
  }
  if (lowerQuery.includes("aire") || lowerQuery.includes("pm2.5") || lowerQuery.includes("contaminac")) {
    return DEMO_RESPONSES.aire;
  }
  if (lowerQuery.includes("agua") || lowerQuery.includes("rio") || lowerQuery.includes("quebrada") || lowerQuery.includes("hidro")) {
    return DEMO_RESPONSES.agua;
  }
  if (lowerQuery.includes("arbol") || lowerQuery.includes("bosque") || lowerQuery.includes("vegetac") || lowerQuery.includes("ndvi")) {
    return DEMO_RESPONSES.vegetacion;
  }
  
  return DEMO_RESPONSES.default;
}
