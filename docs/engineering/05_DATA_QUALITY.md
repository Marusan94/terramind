# 05 — Calidad de datos

**Reglas:** `-9999` → MISSING (excluido de promedios) · flag SIATA ≥2.6 →
no calificado · anomalía (3σ/IQR) se MARCA, nunca se borra ·
SIMULATED siempre etiquetado.

**Métricas visibles (pestaña Calidad):** % válidos / faltantes / simulados,
estaciones en línea X/N, panel Data Health por fuente.

**Score global (roadmap):** `0.5*completitud + 0.3*validez + 0.2*frescura`
→ 0-100 por estación y valle.
