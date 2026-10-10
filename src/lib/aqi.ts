// VayuLoom AQI core (Track 01 Air).
//
// CPCB PM2.5 (24-hr avg, µg/m³) → AQI sub-index bands, with linear
// interpolation inside each band:
//
//   0–30    →   0–50      30–60   →  51–100    60–90   → 101–200
//   90–120  → 201–300     120–250 → 301–400    250–500 → 401–500 (capped)
//
// Category scale used by VayuLoom (simplified 6-step CPCB-style scale:
// "Satisfactory" folds into Moderate, "Moderate"+"Poor" fold into Poor, so
// that GRAP Stage III (301–400) reads "Very Poor" and 401+ reads Severe/+):
//
//   0–50 Good · 51–100 Moderate · 101–200 Poor · 201–400 Very Poor
//   401–450 Severe · 451+ Severe+

import { SEED, hashStringToSeed, mulberry32, seededRange } from "./seed";

export type AqiCategory =
  | "Good"
  | "Moderate"
  | "Poor"
  | "Very Poor"
  | "Severe"
  | "Severe+";

export interface Zone {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Representative PM2.5 (µg/m³), deterministic demo value. */
  pm25: number;
  /** AQI derived from pm25 via aqiFromPM25(). */
  aqi: number;
  category: AqiCategory;
}

export interface HistoryPoint {
  /** Hours before "now" (23 = oldest, 0 = current). */
  hourAgo: number;
  aqi: number;
  pm25: number;
  label: string;
}

type Band = [cLow: number, cHigh: number, iLow: number, iHigh: number];

const PM25_BANDS: Band[] = [
  [0, 30, 0, 50],
  [30, 60, 50, 100],
  [60, 90, 100, 200],
  [90, 120, 200, 300],
  [120, 250, 300, 400],
  [250, 500, 401, 500],
];

const MAX_AQI = 500;

/** CPCB PM2.5 → AQI sub-index (rounded, clamped to 0–500). */
export function aqiFromPM25(pm25: number): number {
  if (!Number.isFinite(pm25) || pm25 <= 0) return 0;
  const c = Math.min(pm25, 500);
  for (const [cLow, cHigh, iLow, iHigh] of PM25_BANDS) {
    if (c <= cHigh) {
      const span = cHigh - cLow;
      const aqi = span === 0 ? iLow : ((iHigh - iLow) / span) * (c - cLow) + iLow;
      return Math.min(MAX_AQI, Math.round(aqi));
    }
  }
  return MAX_AQI;
}

/** AQI value → simplified 6-step category. */
export function categoryForAQI(aqi: number): AqiCategory {
  const v = Math.max(0, Math.floor(aqi));
  if (v <= 50) return "Good";
  if (v <= 100) return "Moderate";
  if (v <= 200) return "Poor";
  if (v <= 400) return "Very Poor";
  if (v <= 450) return "Severe";
  return "Severe+";
}

interface ZoneSeed {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Typical winter PM2.5 baseline for the zone (µg/m³). */
  basePM25: number;
}

// Real Delhi monitoring-zone names (CPCB station localities), approx coords.
const ZONE_SEEDS: ZoneSeed[] = [
  { id: "anand-vihar", name: "Anand Vihar", lat: 28.6509, lon: 77.3161, basePM25: 185 },
  { id: "mundka", name: "Mundka", lat: 28.682, lon: 77.03, basePM25: 150 },
  { id: "jahangirpuri", name: "Jahangirpuri", lat: 28.725, lon: 77.165, basePM25: 170 },
  { id: "dtu", name: "DTU", lat: 28.7501, lon: 77.1177, basePM25: 140 },
  { id: "rk-puram", name: "RK Puram", lat: 28.562, lon: 77.18, basePM25: 120 },
  { id: "punjabi-bagh", name: "Punjabi Bagh", lat: 28.668, lon: 77.128, basePM25: 135 },
  { id: "ito", name: "ITO", lat: 28.6315, lon: 77.2507, basePM25: 160 },
  { id: "lodhi-road", name: "Lodhi Road", lat: 28.591, lon: 77.227, basePM25: 95 },
  { id: "okhla", name: "Okhla", lat: 28.5355, lon: 77.275, basePM25: 155 },
  { id: "najafgarh", name: "Najafgarh", lat: 28.61, lon: 76.98, basePM25: 125 },
  { id: "dwarka", name: "Dwarka", lat: 28.5921, lon: 77.046, basePM25: 110 },
  { id: "bawana", name: "Bawana", lat: 28.798, lon: 77.033, basePM25: 175 },
];

/**
 * All 12 Delhi zones with deterministic demo readings.
 * Fresh PRNG from SEED on every call → identical output, no shared state.
 */
export function getZones(): Zone[] {
  const rand = mulberry32(SEED);
  return ZONE_SEEDS.map((z) => {
    const pm25 = Math.max(8, Math.round(z.basePM25 + (rand() - 0.5) * 36));
    const aqi = aqiFromPM25(pm25);
    return {
      id: z.id,
      name: z.name,
      lat: z.lat,
      lon: z.lon,
      pm25,
      aqi,
      category: categoryForAQI(aqi),
    };
  });
}

/** Look up a single zone by id (undefined when unknown). */
export function getZoneById(zoneId: string): Zone | undefined {
  return getZones().find((z) => z.id === zoneId);
}

/**
 * 24 hourly history points for a zone (oldest → newest).
 * Diurnal winter pattern (dawn/dusk peaks) + seeded noise.
 * Unknown ids still yield a deterministic series from the id hash.
 */
export function getHistory(zoneId: string): HistoryPoint[] {
  const zone = getZoneById(zoneId);
  const basePM25 = zone ? zone.pm25 : 120;
  const rand = mulberry32(SEED ^ hashStringToSeed(`history:${zoneId}`));
  const jitter = Array.from({ length: 24 }, () => seededRange(rand, -14, 14));
  const points: HistoryPoint[] = [];
  for (let i = 23; i >= 0; i--) {
    // Hour-of-day proxy: assume "now" = 09:00; diurnal peaks near 08:00 & 21:00.
    const hod = (((9 - i) % 24) + 24) % 24;
    const diurnal =
      18 * Math.exp(-Math.pow(hod - 8, 2) / 8) +
      22 * Math.exp(-Math.pow(hod - 21, 2) / 12);
    const pm25 = Math.max(5, Math.round(basePM25 * 0.82 + diurnal + jitter[23 - i]!));
    const aqi = aqiFromPM25(pm25);
    points.push({
      hourAgo: i,
      aqi,
      pm25,
      label: i === 0 ? "now" : `${i}h ago`,
    });
  }
  return points;
}
