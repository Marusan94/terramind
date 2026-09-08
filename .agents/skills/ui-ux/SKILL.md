---
name: ui-ux
description: Guides frontend interface design, 3D MapLibre/deck.gl visualization, layer control panels, and the conversational AI copilot drawer in Terramind.
---

# 🎨 UI/UX Engineer Skill — Terramind

## Role Overview
The UI/UX skill guides development of the unified environmental dashboard, combining high-performance 3D mapping with a natural conversational drawer and intuitive environmental data visualizations.

## Key UI Components & Layout
1. **Full-Viewport 3D Map**:
   - Built with MapLibre GL JS and deck.gl.
   - Smooth pitch and bearing controls for 3D terrain exploration.
   - Hover tooltips for interactive features (e.g., sensor stations, water sampling points).
2. **Layer Management Drawer (Left)**:
   - Categorized accordions: Satellite Imagery, Water Networks, Air Quality Sensors, Deforestation Risks, Renewable Forecasts.
   - Opacity sliders and legend swatches.
3. **AI Copilot Drawer (Right)**:
   - Chat feed with streaming responses.
   - Interactive citations linking to papers and dataset origins.
   - "Focus on Map" button on agent outputs to fly camera directly to referenced coordinates.
4. **Design System & Theme**:
   - Dark-mode first palette inspired by planetary monitoring consoles (deep slate, emerald green, celestial cyan).
   - Component library: Tailwind CSS + shadcn/ui.
