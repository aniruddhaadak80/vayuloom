import { describe, expect, it } from "vitest";
import { FIRE_CLUSTERS, WIND, forecastSeries, totalForecast, transport48h } from "../stubble";

describe("fire clusters", () => {
  it("tracks exactly 8 Punjab/Haryana clusters", () => {
    expect(FIRE_CLUSTERS).toHaveLength(8);
    const states = new Set(FIRE_CLUSTERS.map((f) => f.state));
    expect(states.has("Punjab")).toBe(true);
    expect(states.has("Haryana")).toBe(true);
  });
  it("includes key source districts with valid coords", () => {
    const names = FIRE_CLUSTERS.map((f) => f.name);
    for (const n of ["Ludhiana", "Bathinda", "Karnal", "Sangrur", "Amritsar"]) {
      expect(names).toContain(n);
    }
    for (const f of FIRE_CLUSTERS) {
      expect(f.lat).toBeGreaterThan(28);
      expect(f.lat).toBeLessThan(33);
      expect(f.lon).toBeGreaterThan(74);
      expect(f.lon).toBeLessThan(78);
      expect(f.fireCount).toBeGreaterThan(0);
      expect(f.frpMW).toBeGreaterThan(0);
    }
  });
  it("blows a NW wind toward Delhi", () => {
    expect(WIND.fromDeg).toBe(300);
    expect(WIND.toDeg).toBe(120);
    expect(WIND.speedKph).toBe(14);
  });
});

describe("transport48h", () => {
  it("returns one contribution per fire, nearest first", () => {
    const rows = transport48h();
    expect(rows).toHaveLength(8);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i]!.arrivalHour).toBeGreaterThanOrEqual(rows[i - 1]!.arrivalHour);
    }
  });
  it("keeps contributions finite and non-negative", () => {
    for (const r of transport48h()) {
      expect(Number.isFinite(r.contributionPM25)).toBe(true);
      expect(r.contributionPM25).toBeGreaterThanOrEqual(0);
      expect(r.arrivalHour).toBeGreaterThanOrEqual(0);
      expect(r.arrivalHour).toBeLessThanOrEqual(48);
      expect(r.distanceKm).toBeGreaterThan(50);
    }
  });
  it("upwind-aligned nearby fires contribute meaningfully", () => {
    const total = transport48h().reduce((s, r) => s + r.contributionPM25, 0);
    expect(total).toBeGreaterThan(5);
  });
  it("is deterministic", () => {
    expect(transport48h()).toEqual(transport48h());
  });
});

describe("totalForecast", () => {
  it("sums per-fire contributions", () => {
    const f = totalForecast();
    const sum = f.perFire.reduce((s, r) => s + r.contributionPM25, 0);
    expect(Math.abs(f.totalPM25 - sum)).toBeLessThan(0.11);
    expect(f.perFire).toHaveLength(8);
  });
  it("adds rural background to the Delhi estimate", () => {
    const f = totalForecast();
    expect(f.delhiPM25Estimate).toBeGreaterThanOrEqual(55);
    expect(f.delhiAqiEstimate).toBeGreaterThanOrEqual(0);
    expect(f.delhiAqiEstimate).toBeLessThanOrEqual(500);
  });
  it("reports a peak hour and guidance note", () => {
    const f = totalForecast();
    expect(f.peakHour).toBeGreaterThanOrEqual(0);
    expect(f.peakHour).toBeLessThanOrEqual(47);
    expect(f.note.length).toBeGreaterThan(0);
  });
  it("is deterministic", () => {
    expect(totalForecast()).toEqual(totalForecast());
  });
});

describe("forecastSeries", () => {
  it("emits 48 hourly values above background", () => {
    const s = forecastSeries();
    expect(s).toHaveLength(48);
    for (const v of s) {
      expect(v).toBeGreaterThanOrEqual(55);
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(Math.max(...s)).toBeGreaterThan(Math.min(...s));
  });
});
