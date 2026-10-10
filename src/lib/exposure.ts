// VayuLoom personal exposure calculator (Track 01 Air).
//
// Dose proxy: effectiveDose = pm25 × hoursOutdoor × maskFactor.
// Reference: WHO Global Air Quality Guidelines (2021) — 24-h PM2.5 guideline
// 15 µg/m³, annual guideline 5 µg/m³. A full school day outdoors at the WHO
// 24-h guideline (15 µg/m³ × 8 h = 120 dose-units) is the "Low" anchor; the
// score normalises against a severe reference day (250 µg/m³ × 6 h).
// Mask factor 0.25 assumes a well-fitted N95 (≈75% particle reduction).
// Purifier flag models a cleaned indoor recovery environment and unlocks
// extra advice lines (it does not change the outdoor dose itself).

import { z } from "zod";

export const ExposureInputSchema = z.object({
  pm25: z.number().finite().min(0).max(1000),
  hoursOutdoor: z.number().finite().min(0).max(24),
  mask: z.boolean(),
  purifier: z.boolean(),
});
export type ExposureInput = z.infer<typeof ExposureInputSchema>;

export const ExposureBandSchema = z.enum(["Low", "Moderate", "High", "Very High"]);
export type ExposureBand = z.infer<typeof ExposureBandSchema>;

export interface ExposureResult {
  /** 0 (no exposure) → 100 (severe reference day or worse). */
  score: number;
  band: ExposureBand;
  advice: string[];
}

const SEVERE_REFERENCE_DOSE = 250 * 6; // 1500 dose-units

export function exposureScore(input: ExposureInput): ExposureResult {
  const { pm25, hoursOutdoor, mask, purifier } = ExposureInputSchema.parse(input);
  const dose = pm25 * hoursOutdoor * (mask ? 0.25 : 1);
  const score = Math.max(0, Math.min(100, Math.round((100 * dose) / SEVERE_REFERENCE_DOSE)));
  const band: ExposureBand =
    score < 20 ? "Low" : score < 45 ? "Moderate" : score < 70 ? "High" : "Very High";

  const advice: string[] = [];
  if (pm25 > 250) advice.push("PM2.5 is in emergency territory — stay indoors except for essential movement.");
  else if (pm25 > 120) advice.push("PM2.5 is very unhealthy — shift all exercise and play indoors.");
  else if (pm25 > 60) advice.push("PM2.5 is elevated — shorten outdoor time and avoid exertion near traffic.");
  else advice.push("Outdoor air is acceptable — normal activity with routine precautions.");

  if (hoursOutdoor >= 4) advice.push("Long outdoor stint: split it with indoor breaks every 60–90 minutes.");
  if (!mask && pm25 > 60)
    advice.push("Wear a well-fitted N95 mask outdoors — it cuts inhaled particles by ~75%.");
  if (mask) advice.push("Good — keep the N95 sealed over nose and mouth; replace if damp or soiled.");
  if (purifier) advice.push("Recover indoors in a purifier-cleaned room; keep windows shut during peak hours.");
  else advice.push("No purifier at home: create one clean room with doors/windows closed during peaks.");
  if (band === "Very High" || band === "High")
    advice.push("Sensitive groups (asthma, under-10s, elderly): consult a doctor if breathless or wheezing.");

  return { score, band, advice };
}
