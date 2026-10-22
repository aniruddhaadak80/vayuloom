export const dynamic = "force-dynamic";

import { categoryForAQI } from "@/lib/aqi";
import { SEED } from "@/lib/seed";

export { SEED };

export const ZONE_NAMES: readonly string[] = [
  "Anand Vihar",
  "Mundka",
  "Wazirpur",
  "Rohini",
  "Punjabi Bagh",
  "RK Puram",
  "ITO",
  "Jahangirpuri",
  "Bawana",
  "Narela",
  "Okhla Phase 2",
  "Siri Fort",
] as const;

export interface ZoneAqi {
  zone: string;
  aqi: number;
  category: string;
  seed: number;
}

export function deterministicAqi(name: string, index: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 100000;
  }
  return 90 + ((SEED + h * 7 + index * 53) % 330);
}

/**
 * AQI → category, on the same scale the app uses.
 *
 * This used to be a second copy of the classification with different band
 * edges and no "Moderate" band, so the API reported "Good" for an AQI of
 * 75 and "Severe" for an AQI of 312.
 */
export function aqiCategory(aqi: number): string {
  return categoryForAQI(aqi);
}

export async function GET(): Promise<Response> {
  const zones: ZoneAqi[] = ZONE_NAMES.map((zone, i) => {
    const aqi = deterministicAqi(zone, i);
    return { zone, aqi, category: aqiCategory(aqi), seed: SEED };
  });
  return Response.json({ seed: SEED, count: zones.length, zones });
}
