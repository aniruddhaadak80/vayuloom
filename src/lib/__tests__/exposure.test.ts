import { describe, expect, it } from "vitest";
import { exposureScore } from "../exposure";

describe("exposureScore", () => {
  it("scores zero exposure as 0 / Low", () => {
    const r = exposureScore({ pm25: 120, hoursOutdoor: 0, mask: false, purifier: false });
    expect(r.score).toBe(0);
    expect(r.band).toBe("Low");
  });
  it("scores clean air as Low", () => {
    const r = exposureScore({ pm25: 0, hoursOutdoor: 6, mask: false, purifier: false });
    expect(r.score).toBe(0);
    expect(r.band).toBe("Low");
  });
  it("scores the severe reference day as 100 / Very High", () => {
    const r = exposureScore({ pm25: 250, hoursOutdoor: 6, mask: false, purifier: false });
    expect(r.score).toBe(100);
    expect(r.band).toBe("Very High");
  });
  it("caps extreme exposure at 100", () => {
    const r = exposureScore({ pm25: 500, hoursOutdoor: 12, mask: false, purifier: false });
    expect(r.score).toBe(100);
  });
  it("proves N95 masks cut the score", () => {
    const bare = exposureScore({ pm25: 150, hoursOutdoor: 8, mask: false, purifier: false });
    const masked = exposureScore({ pm25: 150, hoursOutdoor: 8, mask: true, purifier: false });
    expect(masked.score).toBeLessThan(bare.score);
    expect(masked.score).toBe(20);
    expect(bare.score).toBe(80);
  });
  it("lands a mid smog day in High", () => {
    const r = exposureScore({ pm25: 120, hoursOutdoor: 6, mask: false, purifier: false });
    expect(r.score).toBe(48);
    expect(r.band).toBe("High");
  });
  it("always returns actionable advice", () => {
    const a = exposureScore({ pm25: 40, hoursOutdoor: 2, mask: false, purifier: false });
    expect(a.advice.length).toBeGreaterThan(0);
    const withPurifier = exposureScore({ pm25: 200, hoursOutdoor: 5, mask: true, purifier: true });
    expect(withPurifier.advice.join(" ").toLowerCase()).toContain("purifier");
    const noMask = exposureScore({ pm25: 200, hoursOutdoor: 5, mask: false, purifier: false });
    expect(noMask.advice.join(" ")).toContain("N95");
  });
  it("warns sensitive groups at high bands", () => {
    const r = exposureScore({ pm25: 300, hoursOutdoor: 4, mask: false, purifier: false });
    expect(r.band).toBe("Very High");
    expect(r.advice.join(" ").toLowerCase()).toContain("sensitive");
  });
  it("is deterministic", () => {
    const input = { pm25: 180, hoursOutdoor: 3, mask: true, purifier: true } as const;
    expect(exposureScore(input)).toEqual(exposureScore(input));
  });
  it("rejects invalid input", () => {
    expect(() => exposureScore({ pm25: -1, hoursOutdoor: 2, mask: false, purifier: false })).toThrow();
    expect(() => exposureScore({ pm25: 100, hoursOutdoor: 30, mask: false, purifier: false })).toThrow();
  });
});
