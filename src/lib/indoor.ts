// VayuLoom classroom guardian model (Track 01 Air).
//
// Steady-state box model for a classroom over a school day:
//   PM2.5: sources = outdoor infiltration baseline + per-student resuspension,
//          sink   = purifier (CADR → equivalent air changes).
//   CO2:   source = student respiration (~0.0045 L/s each), sink = natural
//          ventilation λ = 2.5 ACH (windows ajar). Purifiers do NOT remove
//          CO2 — the advice always says so when CO2 is high.
// Reference: WHO (2021) PM2.5 24-h guideline 15 µg/m³; ASHRAE comfort
// guidance ~1000 ppm CO2 as an action level for classrooms.

import { z } from "zod";

export const IndoorInputSchema = z.object({
  students: z.number().int().min(1).max(200),
  roomM3: z.number().finite().min(20).max(1000),
  purifierCADR: z.number().finite().min(0).max(2000),
  hours: z.number().finite().min(0.5).max(12),
});
export type IndoorInput = z.infer<typeof IndoorInputSchema>;

export interface IndoorResult {
  /** Modelled indoor PM2.5 (µg/m³). */
  pm25Indoor: number;
  /** Modelled CO2 (ppm). */
  co2: number;
  purifierAdvice: string;
}

const NATURAL_ACH = 2.5; // windows-ajar ventilation, per hour
const CO2_OUTDOOR = 420; // ppm

export function co2pm25(input: IndoorInput): IndoorResult {
  const { students, roomM3, purifierCADR, hours } = IndoorInputSchema.parse(input);

  // PM2.5: baseline infiltration + resuspension scaled by occupancy density
  // and school-day fraction; purifier adds equivalent air changes.
  const dayFraction = Math.min(hours, 8) / 6;
  const pmBase = 42 + ((students * 95) / roomM3) * dayFraction;
  const achPurifier = purifierCADR / roomM3;
  const pm25Indoor = Math.max(3, Math.round(pmBase / (1 + 0.85 * achPurifier)));

  // CO2: C(t) = C_out + Css × (1 − e^(−λt)).
  const flowLps = (NATURAL_ACH * roomM3) / 3.6;
  const cssIncrement = ((students * 0.0045) / flowLps) * 1e6;
  const co2 = Math.round(CO2_OUTDOOR + cssIncrement * (1 - Math.exp(-NATURAL_ACH * hours)));

  let purifierAdvice: string;
  if (pm25Indoor > 60) {
    purifierAdvice =
      purifierCADR > 0
        ? `Indoor PM2.5 ${pm25Indoor} µg/m³ is too high — add a second purifier or upgrade CADR above ${Math.round(roomM3 * 3)} m³/h (≈3 air changes/h).`
        : `Indoor PM2.5 ${pm25Indoor} µg/m³ is too high — install a purifier with CADR ≥ ${Math.round(roomM3 * 2.5)} m³/h for this room.`;
  } else if (co2 > 1200) {
    purifierAdvice = `PM2.5 is OK (${pm25Indoor} µg/m³) but CO2 ${co2} ppm is high — purifiers cannot remove CO2, so ventilate between periods or split the class.`;
  } else if (co2 > 1000) {
    purifierAdvice = `CO2 ${co2} ppm is rising — open windows fully during breaks; current purifier cover is adequate for particles.`;
  } else {
    purifierAdvice = `Air looks good (PM2.5 ${pm25Indoor} µg/m³, CO2 ${co2} ppm) — keep the current setup and clean filters monthly.`;
  }

  return { pm25Indoor, co2, purifierAdvice };
}
