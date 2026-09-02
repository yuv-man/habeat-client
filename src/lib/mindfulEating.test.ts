import { describe, it, expect } from "vitest";
import {
  calcEmotionalEatingScore,
  getNudgeMessage,
  shouldNudge,
  LATE_NIGHT_HOUR,
} from "./mindfulEating";
import { WatchSnapshot } from "@/services/watch/types";

const at = (hour: number): Date => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
};

const NOON = at(12);
const LATE = at(LATE_NIGHT_HOUR + 1);

describe("calcEmotionalEatingScore", () => {
  it("scores nothing when nothing is known", () => {
    expect(calcEmotionalEatingScore(null, null, "dinner", null, NOON)).toBe(0);
  });

  it("weighs low hunger most heavily", () => {
    expect(calcEmotionalEatingScore(null, 1, "dinner", null, NOON)).toBeCloseTo(0.4);
    expect(calcEmotionalEatingScore(null, 2, "dinner", null, NOON)).toBeCloseTo(0.25);
    expect(calcEmotionalEatingScore(null, 3, "dinner", null, NOON)).toBeCloseTo(0.1);
  });

  it("adds nothing for genuine hunger", () => {
    expect(calcEmotionalEatingScore(null, 4, "dinner", null, NOON)).toBe(0);
    expect(calcEmotionalEatingScore(null, 5, "dinner", null, NOON)).toBe(0);
  });

  it("treats tiredness as weaker evidence than distress", () => {
    const tired = calcEmotionalEatingScore("tired", null, "dinner", null, NOON);
    const stressed = calcEmotionalEatingScore("stressed", null, "dinner", null, NOON);
    expect(tired).toBeLessThan(stressed);
  });

  it("adds the late-night increment only for snacks after the cutoff", () => {
    const lateSnack = calcEmotionalEatingScore(null, 3, "snacks", null, LATE);
    const daySnack = calcEmotionalEatingScore(null, 3, "snacks", null, NOON);
    const lateDinner = calcEmotionalEatingScore(null, 3, "dinner", null, LATE);

    expect(lateSnack - daySnack).toBeCloseTo(0.1);
    expect(lateDinner).toBeCloseTo(daySnack);
  });

  it("folds in body signals when a watch is connected", () => {
    const snapshot: WatchSnapshot = {
      stressLevel: "high",
      sleepQuality: "poor",
    } as WatchSnapshot;

    const withBody = calcEmotionalEatingScore("neutral", 3, "dinner", snapshot, NOON);
    const without = calcEmotionalEatingScore("neutral", 3, "dinner", null, NOON);
    expect(withBody).toBeGreaterThan(without);
  });

  it("never exceeds 1", () => {
    const snapshot: WatchSnapshot = {
      stressLevel: "high",
      sleepQuality: "poor",
      heartRate: 130,
      restingHeartRate: 60,
      stepCount: 100,
    } as WatchSnapshot;
    expect(
      calcEmotionalEatingScore("stressed", 1, "snacks", snapshot, LATE)
    ).toBe(1);
  });
});

describe("shouldNudge", () => {
  it("stays silent until something has been answered", () => {
    expect(shouldNudge(null, null, "snacks", null, LATE)).toBe(false);
  });

  it("does not interrupt on low hunger alone", () => {
    // 0.40 on its own sits under the threshold on purpose — one signal is not
    // enough to stop someone mid-meal.
    expect(shouldNudge(null, 1, "dinner", null, NOON)).toBe(false);
  });

  it("speaks up when low hunger meets a difficult mood", () => {
    expect(shouldNudge("stressed", 1, "dinner", null, NOON)).toBe(true);
  });

  it("speaks up for a late snack eaten without hunger", () => {
    expect(shouldNudge("tired", 1, "snacks", null, LATE)).toBe(true);
  });

  it("leaves a genuinely hungry person alone, whatever the hour", () => {
    expect(shouldNudge("tired", 5, "snacks", null, LATE)).toBe(false);
  });
});

describe("getNudgeMessage", () => {
  it("speaks to the hour for any late snack, not just a tired one", () => {
    // The previous version required the mood to be exactly "tired", which is
    // the least likely thing anyone taps at 11pm.
    expect(getNudgeMessage("neutral", 2, "snacks", LATE)).toMatch(/[Ee]vening/);
    expect(getNudgeMessage("tired", 2, "snacks", LATE)).toMatch(/Late-night/);
  });

  it("names the feeling when low hunger meets distress", () => {
    expect(getNudgeMessage("anxious", 1, "dinner", NOON)).toContain("anxious");
  });

  it("falls back to a plain hunger observation", () => {
    expect(getNudgeMessage("neutral", 2, "dinner", NOON)).toMatch(/hunger seems low/);
  });
});
