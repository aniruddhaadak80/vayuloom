import { describe, expect, it } from "vitest";
import { categoryForAQI } from "@/lib/aqi";
import { aqiCategory, deterministicAqi, ZONE_NAMES } from "../aqi/route";

describe("/api/aqi category scale", () => {
  it("agrees with the app for every AQI value", () => {
    for (let aqi = 0; aqi <= 500; aqi++) {
      expect(aqiCategory(aqi)).toBe(categoryForAQI(aqi));
    }
  });

  it("keeps the documented bands", () => {
    expect(aqiCategory(25)).toBe("Good");
    expect(aqiCategory(75)).toBe("Moderate");
    expect(aqiCategory(150)).toBe("Poor");
    expect(aqiCategory(250)).toBe("Very Poor");
    expect(aqiCategory(312)).toBe("Very Poor");
    expect(aqiCategory(420)).toBe("Severe");
    expect(aqiCategory(480)).toBe("Severe+");
  });

  it("classifies every reported zone consistently", () => {
    ZONE_NAMES.forEach((name, i) => {
      const aqi = deterministicAqi(name, i);
      expect(aqiCategory(aqi)).toBe(categoryForAQI(aqi));
    });
  });
});
