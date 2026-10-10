import { describe, expect, it } from "vitest";
import {
  AutopilotSchema,
  autopilotActions,
  grapStage,
} from "../autopilot/route";
import { ZONE_NAMES, aqiCategory, deterministicAqi } from "../aqi/route";

describe("grapStage boundaries", () => {
  it("maps Good range to None", () => {
    expect(grapStage(0)).toBe("None — Good");
    expect(grapStage(50)).toBe("None — Good");
    expect(grapStage(100)).toBe("None — Good");
  });

  it("maps Poor range to Stage I", () => {
    expect(grapStage(101)).toBe("Stage I — Poor");
    expect(grapStage(200)).toBe("Stage I — Poor");
  });

  it("maps Very Poor range to Stage II", () => {
    expect(grapStage(201)).toBe("Stage II — Very Poor");
    expect(grapStage(300)).toBe("Stage II — Very Poor");
  });

  it("maps Severe range to Stage III", () => {
    expect(grapStage(301)).toBe("Stage III — Severe");
    expect(grapStage(400)).toBe("Stage III — Severe");
  });

  it("maps Severe Plus range to Stage IV", () => {
    expect(grapStage(401)).toBe("Stage IV — Severe Plus");
    expect(grapStage(999)).toBe("Stage IV — Severe Plus");
  });
});

describe("AutopilotSchema", () => {
  it("accepts a valid payload", () => {
    const r = AutopilotSchema.safeParse({
      aqi: 320,
      zoneName: "Anand Vihar",
      students: 1200,
    });
    expect(r.success).toBe(true);
  });

  it("rejects out-of-range and missing fields", () => {
    expect(
      AutopilotSchema.safeParse({ aqi: 1000, zoneName: "X", students: 1 })
        .success,
    ).toBe(false);
    expect(
      AutopilotSchema.safeParse({ aqi: -5, zoneName: "X", students: 1 })
        .success,
    ).toBe(false);
    expect(
      AutopilotSchema.safeParse({ aqi: 100, zoneName: "", students: 1 })
        .success,
    ).toBe(false);
    expect(
      AutopilotSchema.safeParse({ aqi: 100, zoneName: "X" }).success,
    ).toBe(false);
  });
});

describe("autopilotActions", () => {
  it("returns a non-empty action list for every stage", () => {
    const stages = [
      "None — Good",
      "Stage I — Poor",
      "Stage II — Very Poor",
      "Stage III — Severe",
      "Stage IV — Severe Plus",
    ] as const;
    for (const s of stages) {
      const actions = autopilotActions(s);
      expect(actions.length).toBeGreaterThanOrEqual(2);
      expect(actions.every((a) => a.length > 0)).toBe(true);
    }
  });

  it("escalates Stage IV to closure", () => {
    const actions = autopilotActions("Stage IV — Severe Plus");
    expect(actions.join(" ").toLowerCase()).toContain("online");
  });
});

describe("aqi zones", () => {
  it("exposes exactly 12 Delhi zones starting with Anand Vihar", () => {
    expect(ZONE_NAMES.length).toBe(12);
    expect(ZONE_NAMES[0]).toBe("Anand Vihar");
    expect(new Set(ZONE_NAMES).size).toBe(12);
  });

  it("produces deterministic AQI values in range", () => {
    const first = deterministicAqi("Anand Vihar", 0);
    expect(deterministicAqi("Anand Vihar", 0)).toBe(first);
    for (let i = 0; i < ZONE_NAMES.length; i++) {
      const v = deterministicAqi(ZONE_NAMES[i], i);
      expect(v).toBeGreaterThanOrEqual(90);
      expect(v).toBeLessThanOrEqual(419);
      expect(aqiCategory(v).length).toBeGreaterThan(0);
    }
  });
});
