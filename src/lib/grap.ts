// VayuLoom GRAP engine (Track 01 Air).
//
// Graded Response Action Plan mapping, revised-2024 style but following the
// VayuLoom school contract:
//
//   AQI 0–100   → No GRAP (preventive watch)
//   AQI 101–200 → Stage I
//   AQI 201–300 → Stage II
//   AQI 301–400 → Stage III
//   AQI 401+    → Stage IV  (covers Severe 401–450 and Severe+ 451+)
//
// All functions are pure; I/O boundaries validated with zod.

import { z } from "zod";

export const GrapStageSchema = z.enum(["None", "I", "II", "III", "IV"]);
export type GrapStage = z.infer<typeof GrapStageSchema>;

export const GrapActionSchema = z.object({
  stage: GrapStageSchema,
  stageLabel: z.string().min(1),
  schoolActions: z.array(z.string().min(1)).min(1),
  maskRequired: z.boolean(),
  outdoorBan: z.boolean(),
  dispersalNote: z.string().min(1),
});
export type GrapAction = z.infer<typeof GrapActionSchema>;

export const GrapInputSchema = z.object({
  aqi: z.number().finite().min(0).max(1000),
});
export type GrapInput = z.infer<typeof GrapInputSchema>;

/** AQI → GRAP stage (validated). */
export function grapStageForAQI(aqi: number): GrapStage {
  const v = GrapInputSchema.parse({ aqi }).aqi;
  if (v <= 100) return "None";
  if (v <= 200) return "I";
  if (v <= 300) return "II";
  if (v <= 400) return "III";
  return "IV";
}

/** Human label for a stage code. */
export function stageLabel(stage: GrapStage): string {
  switch (stage) {
    case "None":
      return "No GRAP — Preventive watch";
    case "I":
      return "GRAP Stage I (Poor)";
    case "II":
      return "GRAP Stage II (Very Poor)";
    case "III":
      return "GRAP Stage III (Severe risk)";
    case "IV":
      return "GRAP Stage IV (Severe+ emergency)";
  }
}

/**
 * AQI → full school action card. CPCB-style measures:
 * stop outdoor assembly, N95 masks, purifiers on, hybrid consideration,
 * early/staggered dispersal.
 */
export function grapActionForAQI(aqi: number): GrapAction {
  const stage = grapStageForAQI(aqi);
  let action: GrapAction;
  switch (stage) {
    case "None":
      action = {
        stage,
        stageLabel: stageLabel(stage),
        schoolActions: [
          "Continue normal classes with daily AQI watch at assembly",
          "Keep N95 buffer stock for sensitive / asthmatic students",
          "Morning assembly and outdoor sports permitted",
          "Log classroom PM2.5 weekly; service purifier filters",
        ],
        maskRequired: false,
        outdoorBan: false,
        dispersalNote: "Normal schedule; no dispersal change.",
      };
      break;
    case "I":
      action = {
        stage,
        stageLabel: stageLabel(stage),
        schoolActions: [
          "Suspend outdoor morning assembly when AQI crosses 150",
          "Cap outdoor sports at 30 minutes with indoor breaks",
          "Keep classrooms cross-ventilated; purifiers on standby",
          "Issue written advisory to asthmatic students and parents",
          "Ban garbage / leaf burning within 500 m of campus",
        ],
        maskRequired: false,
        outdoorBan: false,
        dispersalNote:
          "Normal schedule; sensitive students excused from outdoor PE.",
      };
      break;
    case "II":
      action = {
        stage,
        stageLabel: stageLabel(stage),
        schoolActions: [
          "Stop all outdoor assembly, sports and inter-school events",
          "N95 masks mandatory for every student and staffer outdoors",
          "Air purifiers ON in all occupied classrooms; windows shut 7–11 am",
          "Daily wet mopping of corridors; no construction dust activity",
          "Shift PT / games periods to indoor activity rooms",
        ],
        maskRequired: true,
        outdoorBan: true,
        dispersalNote:
          "Staggered dispersal to avoid peak-hour exposure; consider early dispersal if Very Poor persists 48 hours.",
      };
      break;
    case "III":
      action = {
        stage,
        stageLabel: stageLabel(stage),
        schoolActions: [
          "Enforce all Stage II measures without exception",
          "Move primary wing (up to Class 5) to hybrid / online mode",
          "Cancel all inter-school outdoor meets and excursions",
          "Daily AQI briefing to parents via SMS by 7 am",
          "Run purifiers on max; seal windows during 6–11 am peak",
          "Prepare bus fleet for early-dispersal schedule",
        ],
        maskRequired: true,
        outdoorBan: true,
        dispersalNote:
          "Early dispersal by 60–90 minutes; primary wing hybrid recommended until AQI drops below 300.",
      };
      break;
    case "IV":
      action = {
        stage,
        stageLabel: stageLabel(stage),
        schoolActions: [
          "Suspend physical classes — full school to hybrid / online",
          "N95 mandatory for any staff entering campus; minimise footfall",
          "Close playgrounds; no outdoor student movement at all",
          "Activate emergency parent helpline and daily health check-in",
          "Purifiers on max with sealed windows in staff / exam rooms",
          "Resume on-campus classes only after AQI < 400 for 48 hours",
        ],
        maskRequired: true,
        outdoorBan: true,
        dispersalNote:
          "Immediate early dispersal; switch to online until AQI stays below 400 for 48 hours.",
      };
      break;
  }
  return GrapActionSchema.parse(action);
}
