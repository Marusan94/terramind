# TerraMind — Product Requirements Document (PRD)

> Plataforma de inteligencia ambiental para el monitoreo de calidad del aire
> en el Valle de Aburrá (Medellín, Colombia).
> Versión: 0.3.0 · Estado: MVP frontend-first · Última actualización: 2026-09-07

## 1. Problema que resuelve

El Valle de Aburrá concentra 10 municipios en una cuenca estrecha rodeada de
montañas. La topografía atrapa contaminantes, el tráfico en hora pico genera
picos recurrentes de PM2.5/PM10 y los niveles superan con frecuencia los
límites de la OMS. Los datos existen (red SIATA, modelos globales de calidad
del aire) pero están dispersos, son técnicos y no ofrecen contexto accionable
para decisiones cotidianas.

TerraMind unifica en un solo "cockpit":

- **Monitoreo**: AQI en tiempo real por estación.
- **Predicción**: pronóstico 48h y semanal con intervalo de confianza.
- **Explicación**: asistente conversacional (RAG + OpenRouter) que responde en
  lenguaje cotidiano ("¿puedo salir a correr hoy?") con fuentes citadas.

## 2. Usuarios

| Usuario | Perfil | Necesidad principal |
|---|---|---|
| Ciudadano | Habitante del Valle de Aburrá | Decidir rutinas diarias según AQI, pronóstico y recomendaciones de salud |
| Autoridad / gestor público | Secretarías de ambiente, Área Metropolitana | Estado por barrio/estación, comparación contra estándares OMS, insumo para políticas (Pico y Placa, ZBE) |
| Investigador / estudiante (UdeA) | Academia | Metodología, documentos indexados vía RAG, generación de datasets, scripts y artículos |

## 3. Pantallas existentes

| Pantalla | Descripción | Estado |
|---|---|---|
| Mapa principal (fullscreen) | Terreno 3D + edificios del Valle de Aburrá, 10 estaciones SIATA con marcador AQI coloreado, leyenda EPA, HUD de coordenadas, toggles de capas (Aire, Clima, Agua, Vegetación) | En integración: falta activar terreno 3D y capa de edificios |
| Sidebar (260px) | Logo + badges AQI/PM2.5, toggles de capas, acciones (Dashboard, Alertas, Compartir), estado de conexión | Activa |
| Dashboard (overlay modal) | Pestañas: Resumen, Territorio, Pronóstico, Estaciones, Científico. Gráficos AQI por estación, scatter AQI vs altitud, serie horaria con predicción, tabla OMS vs actual | Componente existe (`AirDashboard`) pero no conectado: falta CSS, overlay y gráficos |
| Chat flotante | Conversación con TerraMind AI (OpenRouter), panel de documentos RAG (PDF/Excel/Word), sugerencias, acciones de generación (artículo, script, dataset) | Activo sin streaming; generadores pendientes |

## 4. Capacidades por usuario

| Capacidad | Ciudadano | Autoridad | Investigador |
|---|---|---|---|
| Ver AQI por estación en el mapa | Sí | Sí | Sí |
| Pronóstico 48h y semanal | Sí | Sí | Sí |
| Recomendaciones de salud por nivel AQI | Sí | Sí | — |
| Preguntar al chat en español | Sí | Sí | Sí |
| Comparación contra límites OMS | — | Sí | Sí |
| Ranking por barrio / vista Territorio | — | Sí | Sí |
| Metodología científica y políticas públicas | — | Sí | Sí |
| Subir documentos al RAG y obtener citas | — | — | Sí |
| Generar dataset CSV / script Python / artículo | — | — | Sí |
| Exportar / compartir estado | Sí | Sí | Sí |

## 5. Organización del código

Monorepo `terramind/`:

```text
terramind/
├── apps/
│   ├── web/                      # React 18 + TypeScript + Vite
│   │   └── src/
│   │       ├── components/       # AirMap, AirDashboard, ChatWidget, ChatPanel, ...
│   │       ├── data/             # stations.ts (10 estaciones SIATA)
│   │       ├── services/         # openMeteo, openRouter, rag, predictions, basemaps
│   │       └── styles/           # theme.css (tema oscuro estilo Cursor)
│   └── api/                      # FastAPI (fase posterior)
│       └── app/core/llm.py       # OmniRoute: abstracción de proveedores LLM
├── agents/  ml/  data/  pipelines/  database/   # Capas de datos y ML (fase posterior)
├── .agents/skills/               # Skills de agentes de dominio (pospuesto)
└── PRD.md  ROADMAP.md  AGENTS.md README.md
```

Convenciones: TypeScript strict, sin `any`; estado global con Zustand o
Context; GeoJSON inmutable; commits convencionales (`feat(map): ...`).

## 6. Tecnologías

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | React 18, TypeScript, Vite | SPA, build `tsc -b && vite build` |
| Mapa 3D | MapLibre GL 4 + deck.gl 9 | Terreno + edificios extruidos |
| Estilos | Tailwind CSS + `theme.css` | Tema oscuro (fondo negro, acento violeta `#8b5cf6`, cian `#06b6d4`) |
| Gráficos | recharts | Barras, scatter, series temporales del dashboard |
| Datos aire/clima | Open-Meteo (forecast + air-quality API) | Gratis, sin API key, zona `America/Bogota` |
| Mapa base | OpenFreeMap / OSM | Gratis, sin key; capa `building` para extrusión 3D |
| Terreno | AWS elevation tiles (terrarium) | Gratis, vía `getTerrainSource()` existente |
| Chat LLM | OpenRouter (`meta-llama/llama-3.1-8b-instruct:free`) | Streaming SSE; clave vía variable de entorno |
| RAG local | Servicio en memoria + IndexedDB | Chunking por palabras clave, citas de fuentes en respuestas |
| Cache | IndexedDB + memoria (`tileCache.ts`) | Tiles y documentos |
| Backend (futuro) | FastAPI + PostGIS 16 + pgvector | OmniRoute para LLMs, columnas `geometry(Geometry, 4326)` |

## 7. Manejo de errores

- **Red / APIs externas**: `try/catch` con mensajes en español orientados al
  usuario (p. ej. chat: error de conexión con OpenRouter). Si Open-Meteo
  falla, fallback a datos simulados realistas marcando el origen.
- **Tiles del mapa**: los errores de carga se registran en consola sin mostrar
  alertas; si OpenFreeMap no responde, fallback automático a OSM raster.
- **Estados de carga**: spinner en mapa y dashboard durante la carga inicial.
- **Subida de documentos RAG**: validación de tipo (PDF, Excel, Word, TXT, MD)
  con mensaje de éxito/error por archivo.
- **Calidad**: `npm run lint` con cero warnings; TypeScript strict.

## 8. Validación de datos

- **AQI**: breakpoints EPA (US AQI) calculados sobre PM2.5
  (`data/stations.ts:calculateAQI`).
- **Referencia OMS**: tabla de comparación OMS vs actual en la pestaña
  Científico (PM2.5: 15, PM10: 45, O₃: 60, NO₂: 25 µg/m³).
- **Procedencia**: todo dato indica su origen (real Open-Meteo vs simulado con
  patrones de hora pico, altitud y tipo de distrito).
- **Predicción**: regresión lineal con intervalo de confianza del 95%.
- **Anti-alucinación**: el chat cita chunks de documentos RAG y datos de
  estaciones; sin fuente, la respuesta lo declara.

## 9. Comportamiento en móvil

Estado actual: **no responsivo** (diseño desktop-first: sidebar fija de 260px,
grid de dashboard multicolumna).

Objetivo móvil (< 768px):

- Sidebar colapsada tras botón hamburguesa flotante.
- Dashboard overlay a pantalla completa con grid de una columna.
- Chat como botón flotante (💬) con panel a pantalla completa.
- Mapa fullscreen con controles táctiles (pitch con dos dedos); leyenda
  colapsable.

Esto es trabajo explícitamente pendiente, posterior a la integración desktop.

## 10. Definición de terminado (DoD)

Una funcionalidad se considera terminada cuando:

1. `npm run build`, `npm run lint` (0 warnings) y `npm test` pasan en `apps/web`.
2. El mapa 3D muestra el Valle de Aburrá con terreno + edificios y las 10
   estaciones SIATA correctamente geolocalizadas.
3. El dashboard abre como overlay desde el sidebar, con sus 5 pestañas y
   gráficos funcionales.
4. El chat responde con streaming, soporta subida de documentos RAG y cita
   fuentes.
5. No hay secretos en el repositorio (la clave de OpenRouter vive en variable
   de entorno, nunca hardcodeada).
6. README y esquemas/API reflejan el estado real del código.
7. Sin regresiones visuales del layout base (sidebar + mapa + chat flotante,
   tema oscuro Cursor).

## 11. Alcance de la integración en curso (UI primero)

1. Mapa 3D: activar terreno existente + capa de edificios extruidos
   (OpenFreeMap) + toggle 3D.
2. Dashboard: CSS faltante en `theme.css`, modo overlay modal, gráficos con
   recharts, pestaña Territorio (adaptación del prototipo de vulnerabilidad
   por barrios a calidad del aire).
3. Chat: streaming SSE + acciones de generación (artículo, script, dataset).
4. Cableado en `App.tsx`: botón "Ver Dashboard" abre el overlay.
5. Datos reales (Open-Meteo/SIATA) en fase posterior; UI funciona con datos
   simulados realistas mientras tanto.

## 12. Fuera de alcance (por ahora)

- Backend FastAPI / PostGIS en producción.
- Sistema de skills/plugins de opencode (`.agents/skills/`).
- Diseño responsivo móvil completo.
- Autenticación y roles de usuario diferenciados en la UI.
