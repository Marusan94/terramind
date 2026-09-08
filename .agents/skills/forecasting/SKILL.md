# Skill: forecasting

Dueño de `services/predictions.ts` y pestaña Pronóstico.

Reglas:
- El extrapolador actual es baseline ingenuo: etiquétalo así.
- Orden obligatorio: persistencia → seasonal-naive → RF/XGBoost → LSTM.
- Publicar solo con intervalo (rango + confianza), jamás número seco.
- Backtest antes de cambiar el modelo en UI + model card (doc 13).
