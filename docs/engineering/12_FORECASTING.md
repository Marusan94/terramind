# 12 — Pronóstico

Hoy: extrapolación de patrones horarios (`services/predictions.ts`) + 48h y
semanal en dashboard. Marcar como baseline ingenuo.

Roadmap (en orden, sin saltarse pasos):
1. Persistencia y seasonal-naive (baselines a batir).
2. RandomForest/XGBoost con features hora/día/mes + rezagos + clima.
3. LSTM/Transformer solo si baten a (2) en backtest.
4. Siempre con intervalo: `34 µg/m³ (rango esperado 28–42, confianza 87%)`.
