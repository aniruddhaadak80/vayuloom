import { z } from "zod";

export const dynamic = "force-dynamic";

export const AutopilotSchema = z.object({
  aqi: z.number().int().min(0).max(999),
  zoneName: z.string().min(1).max(80),
  students: z.number().int().min(0).max(100000),
});

export type AutopilotInput = z.infer<typeof AutopilotSchema>;

export type GrapStage =
  | "None — Good"
  | "Stage I — Poor"
  | "Stage II — Very Poor"
  | "Stage III — Severe"
  | "Stage IV — Severe Plus";

export function grapStage(aqi: number): GrapStage {
  if (aqi > 400) return "Stage IV — Severe Plus";
  if (aqi > 300) return "Stage III — Severe";
  if (aqi > 200) return "Stage II — Very Poor";
  if (aqi > 100) return "Stage I — Poor";
  return "None — Good";
}

const ACTIONS: Record<GrapStage, string[]> = {
  "None — Good": [
    "Outdoor activities as normal",
    "Monitor AQI twice daily",
  ],
  "Stage I — Poor": [
    "Stop outdoor morning assembly",
    "Limit prolonged outdoor exertion",
    "Keep asthma medication accessible",
  ],
  "Stage II — Very Poor": [
    "Shift outdoor sports indoors",
    "Run air purifiers in classrooms",
    "Issue masks for commute",
  ],
  "Stage III — Severe": [
    "Suspend all outdoor activities",
    "Consider hybrid classes for primary sections",
    "Send daily parent advisory via SMS",
  ],
  "Stage IV — Severe Plus": [
    "Close schools / move fully online",
    "Send emergency parent alert in EN + HI",
    "Report compliance to DOE helpline",
  ],
};

export function autopilotActions(stage: GrapStage): string[] {
  return [...ACTIONS[stage]];
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = AutopilotSchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { aqi, zoneName, students }: AutopilotInput = parsed.data;
  const stage = grapStage(aqi);
  const actions = autopilotActions(stage);
  const sms_en = `VayuLoom alert for ${zoneName}: AQI ${aqi} (${stage}). ${actions[0]}. ${students} students covered.`;
  const sms_hi = `VayuLoom alert: ${zoneName} me AQI ${aqi} (${stage}). ${actions[0]}. ${students} chhatra surakshit.`;
  return Response.json({ stage, actions, sms_en, sms_hi });
}
