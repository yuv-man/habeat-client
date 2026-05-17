import { describe, it, expect } from "vitest";
import { deriveStressLevel, deriveSleepQuality } from "./types";

describe("deriveStressLevel", () => {
  it("returns 'high' for HRV below 20ms", () => {
    expect(deriveStressLevel(0)).toBe("high");
    expect(deriveStressLevel(10)).toBe("high");
    expect(deriveStressLevel(19)).toBe("high");
  });

  it("returns 'moderate' for HRV between 20 and 50ms inclusive", () => {
    expect(deriveStressLevel(20)).toBe("moderate");
    expect(deriveStressLevel(35)).toBe("moderate");
    expect(deriveStressLevel(50)).toBe("moderate");
  });

  it("returns 'low' for HRV above 50ms", () => {
    expect(deriveStressLevel(51)).toBe("low");
    expect(deriveStressLevel(80)).toBe("low");
    expect(deriveStressLevel(150)).toBe("low");
  });
});

describe("deriveSleepQuality", () => {
  it("returns 'poor' for sleep under 6 hours", () => {
    expect(deriveSleepQuality(0)).toBe("poor");
    expect(deriveSleepQuality(4)).toBe("poor");
    expect(deriveSleepQuality(5.9)).toBe("poor");
  });

  it("returns 'fair' for sleep between 6 and 7 hours inclusive", () => {
    expect(deriveSleepQuality(6)).toBe("fair");
    expect(deriveSleepQuality(6.5)).toBe("fair");
    expect(deriveSleepQuality(7)).toBe("fair");
  });

  it("returns 'good' for sleep over 7 hours", () => {
    expect(deriveSleepQuality(7.1)).toBe("good");
    expect(deriveSleepQuality(8)).toBe("good");
    expect(deriveSleepQuality(10)).toBe("good");
  });
});
