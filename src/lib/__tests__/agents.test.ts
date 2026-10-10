import { describe, expect, it } from "vitest";
import { autopilotPlan } from "../agents";

describe("autopilotPlan", () => {
  it("stays normal under GRAP None", () => {
    const p = autopilotPlan({ aqi: 50, zoneName: "Lodhi Road", students: 800 });
    expect(p.stage).toBe("None");
    expect(p.actions.length).toBeGreaterThan(0);
  });
  it("restricts outdoors at Stage I", () => {
    const p = autopilotPlan({ aqi: 150, zoneName: "ITO", students: 800 });
    expect(p.stage).toBe("I");
    expect(p.actions.join(" ").toLowerCase()).toContain("advisory");
  });
  it("bans outdoors at Stage II", () => {
    const p = autopilotPlan({ aqi: 250, zoneName: "Okhla", students: 1200 });
    expect(p.stage).toBe("II");
    expect(p.actions.join(" ").toLowerCase()).toContain("n95");
  });
  it("goes hybrid-primary at 312 / Stage III", () => {
    const p = autopilotPlan({ aqi: 312, zoneName: "Anand Vihar", students: 1500 });
    expect(p.stage).toBe("III");
    expect(p.actions.join(" ").toLowerCase()).toContain("hybrid");
  });
  it("goes full-online at Stage IV", () => {
    const p = autopilotPlan({ aqi: 470, zoneName: "Bawana", students: 2000 });
    expect(p.stage).toBe("IV");
    expect(p.actions.join(" ").toLowerCase()).toContain("online");
  });
  it("scales logistics to school size", () => {
    const p = autopilotPlan({ aqi: 250, zoneName: "Dwarka", students: 1600 });
    expect(p.actions.join(" ")).toContain("1600");
    expect(p.actions.join(" ")).toContain("40 classrooms");
  });
  it("drafts EN + HI parent SMS with zone and AQI", () => {
    const p = autopilotPlan({ aqi: 312, zoneName: "Anand Vihar", students: 900 });
    expect(p.parentSMS_EN).toContain("Anand Vihar");
    expect(p.parentSMS_EN).toContain("312");
    expect(p.parentSMS_HI).toContain("Anand Vihar");
    expect(p.parentSMS_HI.length).toBeGreaterThan(20);
  });
  it("emits a printable principal card with reflect step", () => {
    const p = autopilotPlan({ aqi: 150, zoneName: "ITO", students: 500 });
    expect(p.principalCard.length).toBeGreaterThanOrEqual(5);
    expect(p.principalCard[0]).toContain("PRINCIPAL CARD");
    expect(p.principalCard.join(" ").toLowerCase()).toContain("reflect");
  });
  it("is deterministic for the same input", () => {
    const input = { aqi: 312, zoneName: "Anand Vihar", students: 1500 } as const;
    expect(autopilotPlan(input)).toEqual(autopilotPlan(input));
  });
  it("rejects invalid input", () => {
    expect(() => autopilotPlan({ aqi: -5, zoneName: "ITO", students: 100 })).toThrow();
    expect(() => autopilotPlan({ aqi: 100, zoneName: "", students: 100 })).toThrow();
    expect(() => autopilotPlan({ aqi: 100, zoneName: "ITO", students: 0 })).toThrow();
  });
});
