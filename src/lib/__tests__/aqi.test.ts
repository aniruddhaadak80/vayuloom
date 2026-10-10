import { describe, expect, it } from "vitest";
import {
  aqiFromPM25,
  categoryForAQI,
  getHistory,
  getZoneById,
  getZones,
} from "../aqi";

describe("aqiFromPM25 (CPCB breakpoints)", () => {
  it("maps clean air to single digits", () => {
    expect(aqiFromPM25(10)).toBe(17);
  });
  it("maps 45 µg/m³ to 75", () => {
    expect(aqiFromPM25(45)).toBe(75);
  });
  it("maps 75 µg/m³ to 150", () => {
    expect(aqiFromPM25(75)).toBe(150);
  });
  it("maps 105 µg/m³ to 250", () => {
    expect(aqiFromPM25(105)).toBe(250);
  });
  it("maps 180 µg/m³ to 346", () => {
    expect(aqiFromPM25(180)).toBe(346);
  });
  it("maps 300 µg/m³ to 421", () => {
    expect(aqiFromPM25(300)).toBe(421);
  });
  it("hits band edges exactly", () => {
    expect(aqiFromPM25(30)).toBe(50);
    expect(aqiFromPM25(60)).toBe(100);
    expect(aqiFromPM25(90)).toBe(200);
    expect(aqiFromPM25(120)).toBe(300);
    expect(aqiFromPM25(250)).toBe(400);
  });
  it("clamps zero, negative and extreme values", () => {
    expect(aqiFromPM25(0)).toBe(0);
    expect(aqiFromPM25(-5)).toBe(0);
    expect(aqiFromPM25(500)).toBe(500);
    expect(aqiFromPM25(800)).toBe(500);
  });
});

describe("categoryForAQI", () => {
  it("classifies Good / Moderate / Poor", () => {
    expect(categoryForAQI(25)).toBe("Good");
    expect(categoryForAQI(75)).toBe("Moderate");
    expect(categoryForAQI(150)).toBe("Poor");
  });
  it("classifies 312 as Very Poor (Stage III band)", () => {
    expect(categoryForAQI(312)).toBe("Very Poor");
  });
  it("classifies Severe and Severe+ above 400", () => {
    expect(categoryForAQI(420)).toBe("Severe");
    expect(categoryForAQI(480)).toBe("Severe+");
  });
  it("handles boundary values", () => {
    expect(categoryForAQI(50)).toBe("Good");
    expect(categoryForAQI(100)).toBe("Moderate");
    expect(categoryForAQI(200)).toBe("Poor");
    expect(categoryForAQI(400)).toBe("Very Poor");
    expect(categoryForAQI(450)).toBe("Severe");
    expect(categoryForAQI(451)).toBe("Severe+");
  });
});

describe("zones", () => {
  it("returns all 12 Delhi zones with real names", () => {
    const zones = getZones();
    expect(zones).toHaveLength(12);
    const names = zones.map((z) => z.name);
    for (const n of [
      "Anand Vihar",
      "Mundka",
      "Jahangirpuri",
      "DTU",
      "RK Puram",
      "Punjabi Bagh",
      "ITO",
      "Lodhi Road",
      "Okhla",
      "Najafgarh",
      "Dwarka",
      "Bawana",
    ]) {
      expect(names).toContain(n);
    }
  });
  it("keeps AQI consistent with PM2.5 and category", () => {
    for (const z of getZones()) {
      expect(z.aqi).toBe(aqiFromPM25(z.pm25));
      expect(z.category).toBe(categoryForAQI(z.aqi));
      expect(z.aqi).toBeGreaterThanOrEqual(0);
      expect(z.aqi).toBeLessThanOrEqual(500);
    }
  });
  it("is deterministic across calls", () => {
    expect(getZones()).toEqual(getZones());
  });
  it("finds zones by id", () => {
    expect(getZoneById("ito")?.name).toBe("ITO");
    expect(getZoneById("nope")).toBeUndefined();
  });
});

describe("getHistory", () => {
  it("returns 24 deterministic points", () => {
    const h = getHistory("ito");
    expect(h).toHaveLength(24);
    expect(h).toEqual(getHistory("ito"));
    expect(h[0]!.hourAgo).toBe(23);
    expect(h[23]!.hourAgo).toBe(0);
    expect(h[23]!.label).toBe("now");
  });
  it("stays in valid ranges", () => {
    for (const p of getHistory("bawana")) {
      expect(p.aqi).toBeGreaterThanOrEqual(0);
      expect(p.aqi).toBeLessThanOrEqual(500);
      expect(p.pm25).toBeGreaterThan(0);
    }
  });
  it("handles unknown zone ids deterministically", () => {
    const h = getHistory("mystery-zone");
    expect(h).toHaveLength(24);
    expect(h).toEqual(getHistory("mystery-zone"));
  });
});
