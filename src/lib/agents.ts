// VayuLoom school autopilot brain (Track 01 Air).
//
// Deterministic finite-state controller: PERCEIVE → PLAN → ACT → REFLECT.
// No API keys, no network — pure functions of {aqi, zoneName, students}.
//
// HOW TO PLUG STRANDS AGENTS SDK LATER (no code change needed to callers):
//   1. `npm i @strands-agents/sdk` (or the Python `strands-agents` package
//      for the server-side agent) and expose `autopilotPlan` as a tool:
//         tool("school_autopilot", AutopilotInputSchema, (input) => autopilotPlan(input))
//   2. Give the Strands agent this file's PLAN policies as its system prompt
//      and let it call the tool for the deterministic core, then use the LLM
//      only to rephrase `parentSMS_EN/HI` and `principalCard` in tone.
//   3. Keep GRAP as the authoritative floor: the agent may ESCALATE above
//      the utility winner, never de-escalate below the stage floor.

import { z } from "zod";
import { categoryForAQI } from "./aqi";
import { grapActionForAQI, stageLabel, type GrapStage } from "./grap";
import { hashStringToSeed, mulberry32 } from "./seed";

export const AutopilotInputSchema = z.object({
  aqi: z.number().finite().min(0).max(1000),
  zoneName: z.string().trim().min(1).max(80),
  students: z.number().int().min(1).max(10000),
});
export type AutopilotInput = z.infer<typeof AutopilotInputSchema>;

export interface AutopilotPlan {
  stage: GrapStage;
  actions: string[];
  parentSMS_EN: string;
  parentSMS_HI: string;
  principalCard: string[];
}

// FSM states (documented for future agent harnesses).
type FsmState = "perceive" | "plan" | "act" | "reflect";

type Policy = "normal" | "restricted" | "hybrid-primary" | "full-online";

const POLICY_RANK: Record<Policy, number> = {
  normal: 0,
  restricted: 1,
  "hybrid-primary": 2,
  "full-online": 3,
};

// GRAP stage → minimum policy floor (agent may escalate, never de-escalate).
const STAGE_FLOOR: Record<GrapStage, Policy> = {
  None: "normal",
  I: "restricted",
  II: "restricted",
  III: "hybrid-primary",
  IV: "full-online",
};

const POLICY_HEADLINE: Record<Policy, string> = {
  normal: "School runs normally with daily AQI watch.",
  restricted: "No outdoor assembly or sports; N95 outdoors.",
  "hybrid-primary": "Primary wing hybrid; middle/senior restricted on campus.",
  "full-online": "Full school online till AQI recovers.",
};

/**
 * Utility of a protection policy at a given AQI.
 * benefit grows with AQI (steeper for stronger policies), cost is the
 * disruption of that policy; sizeTerm is shared by all non-normal policies
 * so school size never shifts crossovers, only absolute scores.
 */
function utility(policy: Policy, aqi: number, sizeTerm: number, noise: number): number {
  switch (policy) {
    case "normal":
      return 0 + noise;
    case "restricted":
      return 0.35 * aqi - 40 - sizeTerm + noise;
    case "hybrid-primary":
      return 0.6 * aqi - 112 - sizeTerm + noise;
    case "full-online":
      return 0.85 * aqi - 212 - sizeTerm + noise;
  }
}

/**
 * Deterministic school autopilot plan.
 * Crossovers (≈114 / ≈288 / ≈400) align with GRAP I / III / IV boundaries;
 * the GRAP floor then guarantees stage-correct decisions while utility
 * can only escalate protection above the floor.
 */
export function autopilotPlan(input: AutopilotInput): AutopilotPlan {
  const { aqi, zoneName, students } = AutopilotInputSchema.parse(input);

  // ── PERCEIVE ──────────────────────────────────────────────
  const _perceive: FsmState = "perceive";
  void _perceive;
  const grap = grapActionForAQI(aqi);
  const category = categoryForAQI(aqi);
  const classrooms = Math.max(1, Math.ceil(students / 40));

  // ── PLAN (utility scoring + seeded tie-break noise) ───────
  const _plan: FsmState = "plan";
  void _plan;
  const noiseRand = mulberry32(hashStringToSeed(`autopilot:${zoneName}:${Math.round(aqi)}`));
  const sizeTerm = students / 1000; // shared → crossover-neutral
  const policies: Policy[] = ["normal", "restricted", "hybrid-primary", "full-online"];
  const scored = policies.map((p) => ({
    policy: p,
    score: utility(p, aqi, p === "normal" ? 0 : sizeTerm, (noiseRand() - 0.5) * 2),
  }));
  scored.sort((a, b) => b.score - a.score);
  const winner = scored[0]!.policy;

  // GRAP floor: escalate to stage minimum, never below.
  const floor = STAGE_FLOOR[grap.stage];
  const policy: Policy =
    POLICY_RANK[winner] >= POLICY_RANK[floor] ? winner : floor;

  // ── ACT ───────────────────────────────────────────────────
  const _act: FsmState = "act";
  void _act;
  const policyExtras: Record<Policy, string[]> = {
    normal: [],
    restricted: [
      `Stagger games periods for ${classrooms} classrooms; indoor activity rooms on standby`,
    ],
    "hybrid-primary": [
      `Primary wing online; share links for ~${Math.ceil(classrooms / 3)} primary sections by 7:30 am`,
      "Bus fleet on early-dispersal routing; windows shut, recirculation on",
    ],
    "full-online": [
      "Publish full online timetable; attendance leniency for connectivity gaps",
      "Daily student health check-in form to class teachers",
    ],
  };
  const logistics = [
    `Attendance leniency for ${students} students with respiratory symptoms (no medical certificate needed)`,
    `Verify purifiers in all ${classrooms} classrooms before first bell`,
  ];
  const actions = [...grap.schoolActions, ...policyExtras[policy], ...logistics];

  const headline = POLICY_HEADLINE[policy];
  const parentSMS_EN =
    `VayuLoom alert: ${zoneName} AQI ${Math.round(aqi)} (${category}), ${stageLabel(grap.stage)}. ` +
    `${headline} ${grap.dispersalNote} Masks: ${grap.maskRequired ? "N95 compulsory outdoors" : "keep N95 handy"}. - School Office`;
  const parentSMS_HI =
    `वायुलूम अलर्ट: ${zoneName} AQI ${Math.round(aqi)} (${category}), ${stageLabel(grap.stage)}। ` +
    `${policy === "normal" ? "विद्यालय सामान्य रहेगा, रोज़ AQI निगरानी होगी।" : policy === "restricted" ? "बाहरी assembly व खेल बंद; बाहर N95 अनिवार्य।" : policy === "hybrid-primary" ? "प्राइमरी विंग हाइब्रिड; dispersal समय से पहले।" : "पूरा विद्यालय ऑनलाइन; campus बंद रहेगा।"} ` +
    `${grap.maskRequired ? "बाहर N95 मास्क अनिवार्य।" : "N95 मास्क साथ रखें।"} - स्कूल कार्यालय`;

  // ── REFLECT (self-check + re-evaluation triggers) ─────────
  const _reflect: FsmState = "reflect";
  void _reflect;
  const nextThreshold =
    grap.stage === "None"
      ? 101
      : grap.stage === "I"
        ? 201
        : grap.stage === "II"
          ? 301
          : grap.stage === "III"
            ? 401
            : null;
  const principalCard: string[] = [
    `VAYULOOM PRINCIPAL CARD — ${zoneName} | AQI ${Math.round(aqi)} (${category}) | ${stageLabel(grap.stage)}`,
    `Decision: ${headline}`,
    ...actions.map((a, i) => `${i + 1}. ${a}`),
    nextThreshold === null
      ? "Reflect: hold online mode until AQI < 400 for 48 hours, then step down one stage at a time."
      : `Reflect: re-run autopilot if AQI crosses ${nextThreshold} (next GRAP stage) or wind shifts from NW.`,
    "Reflect: log absenteeism + nurse visits today; feed back into tomorrow's 7 am plan.",
  ];

  return {
    stage: grap.stage,
    actions,
    parentSMS_EN,
    parentSMS_HI,
    principalCard,
  };
}
