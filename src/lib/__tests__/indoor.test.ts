import { describe, expect, it } from "vitest";
import { co2pm25 } from "../indoor";

const BASE = { students: 40, roomM3: 180, purifierCADR: 0, hours: 6 } as const;

describe("co2pm25", () => {
  it("models a crowded room without purifier realistically", () => {
    const r = co2pm25({ ...BASE });
    expect(r.pm25Indoor).toBe(63);
    expect(r.co2).toBeGreaterThan(1000);
    expect(r.co2).toBeLessThan(3000);
  });
  it("proves purifiers cut indoor PM2.5", () => {
    const dirty = co2pm25({ ...BASE, purifierCADR: 0 });
    const clean = co2pm25({ ...BASE, purifierCADR: 400 });
    expect(clean.pm25Indoor).toBeLessThan(dirty.pm25Indoor);
    expect(clean.pm25Indoor).toBe(22);
  });
  it("raises CO2 with more students", () => {
    const small = co2pm25({ ...BASE, students: 10 });
    const big = co2pm25({ ...BASE, students: 60 });
    expect(big.co2).toBeGreaterThan(small.co2);
  });
  it("lowers particle load in bigger rooms", () => {
    const small = co2pm25({ ...BASE, roomM3: 90 });
    const big = co2pm25({ ...BASE, roomM3: 360 });
    expect(big.pm25Indoor).toBeLessThan(small.pm25Indoor);
  });
  it("never reports below outdoor CO2 floor", () => {
    const r = co2pm25({ students: 1, roomM3: 1000, purifierCADR: 2000, hours: 0.5 });
    expect(r.co2).toBeGreaterThanOrEqual(420);
    expect(r.pm25Indoor).toBeGreaterThan(0);
  });
  it("recommends a purifier for dirty rooms", () => {
    const r = co2pm25({ ...BASE });
    expect(r.purifierAdvice.toLowerCase()).toContain("purifier");
    expect(r.purifierAdvice.length).toBeGreaterThan(0);
  });
  it("warns that purifiers cannot fix CO2", () => {
    const r = co2pm25({ students: 60, roomM3: 150, purifierCADR: 800, hours: 8 });
    expect(r.purifierAdvice).toContain("CO2");
  });
  it("approves a well-ventilated clean room", () => {
    const r = co2pm25({ students: 10, roomM3: 300, purifierCADR: 500, hours: 2 });
    expect(r.purifierAdvice.length).toBeGreaterThan(0);
    expect(r.co2).toBeLessThan(1200);
  });
  it("is deterministic", () => {
    expect(co2pm25({ ...BASE })).toEqual(co2pm25({ ...BASE }));
  });
  it("rejects invalid input", () => {
    expect(() => co2pm25({ ...BASE, students: 0 })).toThrow();
    expect(() => co2pm25({ ...BASE, roomM3: 5 })).toThrow();
    expect(() => co2pm25({ ...BASE, hours: 24 })).toThrow();
  });
});
