// VayuLoom fire-to-smoke tracer (Track 01 Air).
//
// 8 stubble-fire clusters across Punjab/Haryana with real lat/lon. A NW
// surface wind advects smoke toward Delhi; each cluster's 48-h PM2.5
// contribution decays with distance (haversine km) and wind alignment
// (cosine between the fire→Delhi bearing and the downwind direction).
// Fully deterministic: the only "randomness" is a hash-derived ±6% jitter
// so values are stable across renders and tests.
//
// Delhi reference: 28.6139 N, 77.2090 E.

import { z } from "zod";
import { aqiFromPM25 } from "./aqi";
import { hashStringToSeed, mulberry32 } from "./seed";

export interface FireCluster {
  id: string;
  name: string;
  state: "Punjab" | "Haryana";
  lat: number;
  lon: number;
  /** Active fire pixels (satellite count, demo). */
  fireCount: number;
  /** Fire radiative power, MW (demo). */
  frpMW: number;
}

export const DELHI = { lat: 28.6139, lon: 77.209 } as const;

export const FIRE_CLUSTERS: FireCluster[] = [
  { id: "ludhiana", name: "Ludhiana", state: "Punjab", lat: 30.901, lon: 75.8573, fireCount: 46, frpMW: 820 },
  { id: "bathinda", name: "Bathinda", state: "Punjab", lat: 30.211, lon: 74.9455, fireCount: 58, frpMW: 1050 },
  { id: "patiala", name: "Patiala", state: "Punjab", lat: 30.3398, lon: 76.3869, fireCount: 39, frpMW: 690 },
  { id: "sangrur", name: "Sangrur", state: "Punjab", lat: 30.245, lon: 75.842, fireCount: 52, frpMW: 940 },
  { id: "amritsar", name: "Amritsar", state: "Punjab", lat: 31.634, lon: 74.8723, fireCount: 31, frpMW: 540 },
  { id: "karnal", name: "Karnal", state: "Haryana", lat: 29.6857, lon: 76.9905, fireCount: 27, frpMW: 430 },
  { id: "kaithal", name: "Kaithal", state: "Haryana", lat: 29.801, lon: 76.399, fireCount: 34, frpMW: 560 },
  { id: "fatehabad", name: "Fatehabad", state: "Haryana", lat: 29.515, lon: 75.455, fireCount: 41, frpMW: 700 },
];

/** Prevailing post-monsoon wind: FROM the NW (300°) → blows toward ESE (120°). */
export const WIND = {
  fromDeg: 300,
  toDeg: 120,
  speedKph: 14,
  label: "NW → SE at 14 km/h (smoke advection toward Delhi)",
} as const;

export interface FireContribution {
  fireId: string;
  name: string;
  state: "Punjab" | "Haryana";
  distanceKm: number;
  arrivalHour: number;
  peakHour: number;
  /** 48-h integrated Delhi PM2.5 contribution (µg/m³). */
  contributionPM25: number;
}

export interface SmokeForecast {
  perFire: FireContribution[];
  totalPM25: number;
  /** Delhi estimate = rural background (55) + transported smoke. */
  delhiPM25Estimate: number;
  delhiAqiEstimate: number;
  peakHour: number;
  note: string;
}

const BACKGROUND_PM25 = 55;

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const a =
    s1 * s1 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

function bearingDeg(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((bLat * Math.PI) / 180);
  const x =
    Math.cos((aLat * Math.PI) / 180) * Math.sin((bLat * Math.PI) / 180) -
    Math.sin((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Per-fire → Delhi 48-h PM2.5 contribution, nearest-arrival first. */
export function transport48h(): FireContribution[] {
  const rows = FIRE_CLUSTERS.map((f) => {
    const distanceKm = haversineKm(f.lat, f.lon, DELHI.lat, DELHI.lon);
    const bearing = bearingDeg(f.lat, f.lon, DELHI.lat, DELHI.lon);
    const diff = (((bearing - WIND.toDeg + 540) % 360) - 180) * (Math.PI / 180);
    const alignment = Math.cos(diff); // 1 = dead downwind
    const windFactor = 0.35 + 0.65 * Math.max(0, alignment);
    const jitterRand = mulberry32(hashStringToSeed(`fire:${f.id}`));
    const jitter = 0.94 + 0.12 * jitterRand();
    const emission = f.fireCount * (f.frpMW / 100);
    // Scale satellite pixel counts to surface PM2.5: a single large cluster
    // weekend typically adds low-tens of µg/m³ in Delhi, not hundreds.
    const EMISSION_SCALE = 0.06;
    const contributionPM25 =
      Math.round(emission * EMISSION_SCALE * Math.exp(-distanceKm / 600) * windFactor * jitter * 10) / 10;
    const arrivalHour = Math.max(0, Math.min(48, Math.round(distanceKm / WIND.speedKph)));
    return {
      fireId: f.id,
      name: f.name,
      state: f.state,
      distanceKm: Math.round(distanceKm),
      arrivalHour,
      peakHour: Math.min(47, arrivalHour + 6),
      contributionPM25: Math.max(0, contributionPM25),
    };
  });
  rows.sort((a, b) => a.arrivalHour - b.arrivalHour);
  return rows;
}

export const ForecastSchema = z.object({
  totalPM25: z.number().min(0),
  delhiPM25Estimate: z.number().min(0),
  delhiAqiEstimate: z.number().int().min(0).max(500),
  peakHour: z.number().int().min(0).max(47),
});

/** Aggregate forecast across all clusters (validated). */
export function totalForecast(): SmokeForecast {
  const perFire = transport48h();
  const totalPM25 = Math.round(perFire.reduce((s, r) => s + r.contributionPM25, 0) * 10) / 10;
  const delhiPM25Estimate = Math.round((BACKGROUND_PM25 + totalPM25) * 10) / 10;
  const peakHour = perFire.reduce((best, r) => (r.contributionPM25 > best.contributionPM25 ? r : best), perFire[0]!).peakHour;
  const delhiAqiEstimate = aqiFromPM25(Math.round(delhiPM25Estimate));
  const parsed = ForecastSchema.parse({ totalPM25, delhiPM25Estimate, delhiAqiEstimate, peakHour });
  return {
    perFire,
    ...parsed,
    note: `NW wind (${WIND.speedKph} km/h) carries Punjab/Haryana stubble smoke to Delhi within 48 h; rural background ${BACKGROUND_PM25} µg/m³ included.`,
  };
}

/** 48 hourly Delhi PM2.5 values (background + gaussian plume per fire). */
export function forecastSeries(): number[] {
  const perFire = transport48h();
  const series: number[] = [];
  for (let h = 0; h < 48; h++) {
    let v = BACKGROUND_PM25;
    for (const f of perFire) {
      const sigma = 7;
      const g = Math.exp(-Math.pow(h - f.peakHour, 2) / (2 * sigma * sigma));
      v += f.contributionPM25 * g * 2.2;
    }
    series.push(Math.round(v * 10) / 10);
  }
  return series;
}
