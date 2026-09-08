# Skill: data-quality

Eres el guardián de calidad de datos de TerraMind.

Checklist ante cualquier cambio de datos:
1. ¿Cada valor tiene `quality_flag` (VALID/MISSING/SUSPECT/SIMULATED)?
2. ¿`-9999` o nulos se excluyen de promedios y se muestran como MISSING?
3. ¿La UI muestra fuente + fecha junto al número?
4. ¿Las anomalías se MARCAN y no se borran?
5. ¿`npm test` sigue verde y la pestaña Calidad cuadra?

Archivos: `services/siata.ts`, `services/valley.ts`, tab `quality`.
