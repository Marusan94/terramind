---
name: environmental-scientist
description: Provides domain knowledge on environmental indicators, ecological indices (NDVI, NDWI), water/air quality thresholds, and scientific validity for TerraMind.
---

# 🌿 Environmental Scientist Skill — TerraMind

## Role Overview
The Environmental Scientist skill validates that TerraMind's calculations, indices, and conclusions reflect accepted ecological science and international standards (WHO, EPA, EU Directives).

## Standard Indicators & Indices
1. **Remote Sensing Indices**:
   - **NDVI** (Normalized Difference Vegetation Index): `(NIR - Red) / (NIR + Red)`. Values > 0.5 indicate dense canopy; drop > 0.2 indicates vegetation stress or clearing.
   - **NDWI** (Normalized Difference Water Index): `(Green - NIR) / (Green + NIR)`. Delineates open water bodies and moisture saturation.
   - **NBR** (Normalized Burn Ratio): `(NIR - SWIR) / (NIR + SWIR)`. Assesses wildfire severity.
2. **Air Quality Standards (WHO Guidelines)**:
   - PM2.5 Annual Mean: $\le 5\,\mu\text{g/m}^3$; 24-hour mean: $\le 15\,\mu\text{g/m}^3$.
   - NO₂ Annual Mean: $\le 10\,\mu\text{g/m}^3$; 24-hour mean: $\le 25\,\mu\text{g/m}^3$.
3. **Water Quality Health Parameters**:
   - **pH**: Healthy aquatic range: 6.5 – 8.5.
   - **Dissolved Oxygen (DO)**: > 6 mg/L supports healthy fish populations; < 2 mg/L indicates hypoxia.
   - **Turbidity**: Measured in NTU; high turbidity impairs light penetration and photosynthesis.
