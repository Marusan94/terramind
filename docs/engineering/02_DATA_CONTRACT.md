# 02 — Contrato de datos (registro observado)

Cada registro horario por estación:

| Campo | Tipo | Reglas |
|---|---|---|
| station_code | string | `AAA-BBBB` SIATA (ej. `MED-VILL`) |
| parameter | enum | pm25, pm10, o3, no2 |
| timestamp_utc | ISO8601 | hora cerrada |
| value | float\|null | µg/m³; `null` si faltante |
| quality_flag | enum | VALID, MISSING (-9999), SUSPECT, SIMULATED |
| source | string | `SIATA`, `OPEN_METEO_CAMS`, `SIM` |

**Invariantes:** nunca inventar `VALID`; `-9999` siempre → MISSING;
los promedios excluyen MISSING; todo número en UI lleva fuente+fecha.
Ref: `services/siata.ts`, `services/valley.ts`.
