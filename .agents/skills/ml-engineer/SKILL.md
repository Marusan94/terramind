---
name: ml-engineer
description: Implements machine learning models for environmental forecasting, time-series analysis, satellite change detection, and computer vision in TerraMind.
---

# 🤖 ML Engineer Skill — TerraMind

## Role Overview
The ML Engineer skill guides the development, training, evaluation, and serving of predictive models in `ml/`, including regression for air/water parameters, time-series forecasting, and computer vision models.

## Model Domains
1. **Water Quality Prediction (`ml/water/`)**:
   - Models: XGBoost / Random Forest regression.
   - Target: Predict dissolved oxygen, biological oxygen demand (BOD), and turbidity over a 7-day horizon based on upstream rainfall and industrial discharge indicators.
2. **Air Dispersion & Interpolation (`ml/air/`)**:
   - Models: Spatial Kriging and gradient boosting models estimating PM2.5 / NO₂ across unmonitored coordinates.
3. **Computer Vision & Change Detection (`ml/vegetation/` & `agents/vision/`)**:
   - Models: YOLOv8 for detecting structures, waste deposits, and road expansions in aerial imagery.
   - Pixel-level difference calculation for deforestation tracking over multi-temporal Sentinel-2 imagery.
4. **Reproducibility & Evaluation**:
   - Always report metrics: $R^2$, RMSE, MAE for regression; Precision, Recall, mAP for detection.
   - Save lightweight serialized weights in `ml/weights/` with versioning.
