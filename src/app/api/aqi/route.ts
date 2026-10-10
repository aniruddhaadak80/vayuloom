export const dynamic = "force-dynamic";

export const SEED = 7331;

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

export function aqiCategory(aqi: number): string {
  if (aqi > 400) return "Severe Plus";
  if (aqi > 300) return "Severe";
  if (aqi > 200) return "Very Poor";
  if (aqi > 100) return "Poor";
  return "Good";
}

export async function GET(): Promise<Response> {
  const zones: ZoneAqi[] = ZONE_NAMES.map((zone, i) => {
    const aqi = deterministicAqi(zone, i);
    return { zone, aqi, category: aqiCategory(aqi), seed: SEED };
  });
  return Response.json({ seed: SEED, count: zones.length, zones });
}
