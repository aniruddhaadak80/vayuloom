import { describe, expect, it } from "vitest";
import {
  GrapActionSchema,
  grapActionForAQI,
  grapStageForAQI,
  stageLabel,
} from "../grap";

describe("grapStageForAQI", () => {
  it("returns None at or below 100", () => {
    expect(grapStageForAQI(50)).toBe("None");
    expect(grapStageForAQI(100)).toBe("None");
  });
  it("returns Stage I for 101–200", () => {
    expect(grapStageForAQI(101)).toBe("I");
    expect(grapStageForAQI(150)).toBe("I");
    expect(grapStageForAQI(200)).toBe("I");
  });
  it("returns Stage II for 201–300", () => {
    expect(grapStageForAQI(201)).toBe("II");
    expect(grapStageForAQI(250)).toBe("II");
    expect(grapStageForAQI(300)).toBe("II");
  });
  it("returns Stage III for 301–400 (312 → III)", () => {
    expect(grapStageForAQI(301)).toBe("III");
    expect(grapStageForAQI(312)).toBe("III");
    expect(grapStageForAQI(400)).toBe("III");
  });
  it("returns Stage IV above 400", () => {
    expect(grapStageForAQI(401)).toBe("IV");
    expect(grapStageForAQI(480)).toBe("IV");
  });
  it("rejects invalid input", () => {
    expect(() => grapStageForAQI(-1)).toThrow();
    expect(() => grapStageForAQI(Number.NaN)).toThrow();
  });
});

describe("grapActionForAQI", () => {
  it("gives non-empty school actions for every stage", () => {
    for (const aqi of [40, 150, 250, 350, 470]) {
      const a = grapActionForAQI(aqi);
      expect(a.schoolActions.length).toBeGreaterThan(0);
      expect(a.dispersalNote.length).toBeGreaterThan(0);
      expect(a.stageLabel).toBe(stageLabel(a.stage));
    }
  });
  it("requires masks only from Stage II up", () => {
    expect(grapActionForAQI(40).maskRequired).toBe(false);
    expect(grapActionForAQI(150).maskRequired).toBe(false);
    expect(grapActionForAQI(250).maskRequired).toBe(true);
    expect(grapActionForAQI(350).maskRequired).toBe(true);
    expect(grapActionForAQI(470).maskRequired).toBe(true);
  });
  it("bans outdoor activity from Stage II up", () => {
    expect(grapActionForAQI(40).outdoorBan).toBe(false);
    expect(grapActionForAQI(150).outdoorBan).toBe(false);
    expect(grapActionForAQI(250).outdoorBan).toBe(true);
    expect(grapActionForAQI(470).outdoorBan).toBe(true);
  });
  it("escalates Stage III to hybrid and Stage IV to online", () => {
    const iii = grapActionForAQI(350).schoolActions.join(" ").toLowerCase();
    const iv = grapActionForAQI(470).schoolActions.join(" ").toLowerCase();
    expect(iii).toContain("hybrid");
    expect(iv).toContain("online");
    expect(iv).toContain("helpline");
  });
  it("Stage II stops assembly and switches purifiers on", () => {
    const text = grapActionForAQI(250).schoolActions.join(" ").toLowerCase();
    expect(text).toContain("assembly");
    expect(text).toContain("purifier");
  });
  it("passes zod validation", () => {
    expect(() => GrapActionSchema.parse(grapActionForAQI(312))).not.toThrow();
  });
});
