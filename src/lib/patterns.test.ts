import { describe, it, expect } from "vitest";
import { comparePeriods, deriveObservations } from "./patterns";
import { PatternEvent, MealSlot } from "@/stores/patternStore";
import { toLocalDateString } from "./dateUtils";

/** A local date string `n` days before today, matching how events are stamped. */
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
};

const ordered = (dayOffset: number, mealType: MealSlot = "dinner"): PatternEvent => ({
  kind: "meal-source",
  date: daysAgo(dayOffset),
  mealType,
  source: "ordered",
});

const cooked = (dayOffset: number, mealType: MealSlot = "dinner"): PatternEvent => ({
  kind: "meal-source",
  date: daysAgo(dayOffset),
  mealType,
  source: "cooked",
});

const missed = (
  dayOffset: number,
  mealType: MealSlot = "lunch",
  reason: Extract<PatternEvent, { kind: "missed-meal" }>["reason"] = "time-pressure"
): PatternEvent => ({
  kind: "missed-meal",
  date: daysAgo(dayOffset),
  mealType,
  reason,
});

const lateSnack = (dayOffset: number, hour = 22): PatternEvent => ({
  kind: "late-snack",
  date: daysAgo(dayOffset),
  hour,
});

const keys = (events: PatternEvent[]) =>
  deriveObservations(events).map((o) => o.key);

describe("deriveObservations", () => {
  it("says nothing when there is nothing to say", () => {
    expect(deriveObservations([])).toEqual([]);
  });

  it("stays quiet below the pattern threshold", () => {
    // Two ordered dinners is a week, not a pattern.
    expect(keys([ordered(1), ordered(2)])).toEqual([]);
  });

  describe("ordering", () => {
    it("speaks up at three distinct days", () => {
      const out = deriveObservations([ordered(1), ordered(2), ordered(3)]);
      expect(out).toHaveLength(1);
      expect(out[0].key).toMatch(/^ordering-3$/);
      expect(out[0].evidence).toBe("3 of the last 7 days");
    });

    it("counts days rather than events, so one bad day is not a pattern", () => {
      // Three orders, all on the same day.
      expect(
        keys([
          ordered(1, "breakfast"),
          ordered(1, "lunch"),
          ordered(1, "dinner"),
        ])
      ).toEqual([]);
    });

    it("ignores events that have aged out of the window", () => {
      expect(keys([ordered(8), ordered(9), ordered(10)])).toEqual([]);
    });

    it("names the dominant meal slot", () => {
      const out = deriveObservations([
        ordered(1, "dinner"),
        ordered(2, "dinner"),
        ordered(3, "dinner"),
      ]);
      expect(out[0].title).toContain("Dinner");
    });

    it("declines to name a slot when there is a tie", () => {
      const out = deriveObservations([
        ordered(1, "lunch"),
        ordered(2, "dinner"),
        ordered(3, "breakfast"),
      ]);
      expect(out[0].title).toBe("Most meals came from outside this week");
    });

    it("credits cooking when it dominates", () => {
      const out = deriveObservations([
        cooked(1),
        cooked(2),
        cooked(3),
        cooked(4),
      ]);
      expect(out[0].tone).toBe("positive");
      expect(out[0].evidence).toBe("4 of the last 7 days");
    });

    it("withholds credit for cooking when ordering was more common", () => {
      const events = [
        cooked(1),
        cooked(2),
        cooked(3),
        cooked(4),
        ordered(1, "lunch"),
        ordered(2, "lunch"),
        ordered(3, "lunch"),
        ordered(4, "lunch"),
        ordered(5, "lunch"),
      ];
      expect(keys(events).some((k) => k.startsWith("cooking-"))).toBe(false);
    });
  });

  describe("missed meals", () => {
    it("speaks to today's skipped meal before anything else", () => {
      const out = deriveObservations([missed(0), ordered(1), ordered(2), ordered(3)]);
      expect(out[0].key).toContain("missed-today");
      expect(out[0].evidence).toBe("today");
    });

    it("treats 'wasn't hungry' as a non-event", () => {
      const out = deriveObservations([missed(0, "lunch", "not-hungry")]);
      expect(out).toEqual([]);
    });

    it("does not treat an unexplained skip as a non-event", () => {
      const out = deriveObservations([missed(0, "lunch", null)]);
      expect(out).toHaveLength(1);
    });

    it("flags a repeatedly skipped meal", () => {
      const out = deriveObservations([missed(1), missed(2), missed(3)]);
      const repeat = out.find((o) => o.key === "missed-lunch-3");
      expect(repeat).toBeDefined();
      expect(repeat!.evidence).toBe("3 of the last 7 days");
    });

    it("offers breathing rather than food when stress is the given reason", () => {
      const out = deriveObservations([
        missed(1, "lunch", "stress"),
        missed(2, "lunch", "stress"),
        missed(3, "lunch", "time-pressure"),
      ]);
      const repeat = out.find((o) => o.key === "missed-lunch-3");
      expect(repeat!.action).toEqual({
        kind: "breathing",
        label: "Two minutes of breathing",
      });
    });

    it("offers faster meals when time is the given reason", () => {
      const out = deriveObservations([
        missed(1, "lunch", "time-pressure"),
        missed(2, "lunch", "time-pressure"),
        missed(3, "lunch", "stress"),
      ]);
      const repeat = out.find((o) => o.key === "missed-lunch-3");
      expect(repeat!.action?.kind).toBe("quick-meals");
    });
  });

  describe("late-night eating", () => {
    it("needs three nights before naming an hour", () => {
      expect(keys([lateSnack(1), lateSnack(2)])).toEqual([]);
    });

    it("names the snacking hour", () => {
      const out = deriveObservations([
        lateSnack(1, 22),
        lateSnack(2, 22),
        lateSnack(3, 22),
      ]);
      const night = out.find((o) => o.key.startsWith("late-night"));
      expect(night!.title).toContain("10pm");
      expect(night!.action?.kind).toBe("urge-surfing");
    });

    it("connects late snacking to the days a meal was skipped", () => {
      // The link the app could not previously draw: two nights that follow
      // days with a skipped meal.
      const out = deriveObservations([
        missed(1, "lunch", "stress"),
        missed(2, "lunch", "stress"),
        lateSnack(1),
        lateSnack(2),
        lateSnack(3),
      ]);
      const night = out.find((o) => o.key.startsWith("late-night"));
      expect(night!.key).toContain("-linked");
      expect(night!.title).toContain("ate less earlier");
    });

    it("does not claim a link on a single overlapping day", () => {
      const out = deriveObservations([
        missed(1, "lunch", "stress"),
        lateSnack(1),
        lateSnack(2),
        lateSnack(3),
      ]);
      const night = out.find((o) => o.key.startsWith("late-night"));
      expect(night!.key).not.toContain("-linked");
    });
  });

  it("orders observations by how time-sensitive they are", () => {
    const out = deriveObservations([
      ordered(1),
      ordered(2),
      ordered(3),
      lateSnack(1),
      lateSnack(2),
      lateSnack(3),
      missed(0),
    ]);
    expect(out[0].key).toContain("missed-today");
    expect(out[out.length - 1].key).toContain("ordering");
  });
});

describe("comparePeriods", () => {
  it("reports nothing to compare against on an empty log", () => {
    const out = comparePeriods([], 7);
    expect(out.hasPrevious).toBe(false);
    expect(out.current).toEqual({
      homeCooked: 0,
      orderedIn: 0,
      mealsMissed: 0,
      lateNights: 0,
    });
  });

  it("splits events into this window and the one before it", () => {
    const out = comparePeriods(
      [cooked(1), cooked(2), cooked(9), ordered(10)],
      7
    );
    expect(out.current.homeCooked).toBe(2);
    expect(out.previous.homeCooked).toBe(1);
    expect(out.previous.orderedIn).toBe(1);
    expect(out.hasPrevious).toBe(true);
  });

  it("excludes events older than both windows", () => {
    const out = comparePeriods([cooked(1), cooked(20)], 7);
    expect(out.current.homeCooked).toBe(1);
    expect(out.previous.homeCooked).toBe(0);
    expect(out.hasPrevious).toBe(false);
  });

  it("counts eating out alongside ordering in", () => {
    const out = comparePeriods(
      [
        ordered(1),
        { kind: "meal-source", date: daysAgo(2), mealType: "dinner", source: "eaten-out" },
      ],
      7
    );
    expect(out.current.orderedIn).toBe(2);
    expect(out.current.homeCooked).toBe(0);
  });

  it("does not count a meal skipped for lack of hunger as missed", () => {
    const out = comparePeriods(
      [missed(1, "lunch", "not-hungry"), missed(2, "lunch", "stress")],
      7
    );
    expect(out.current.mealsMissed).toBe(1);
  });

  it("counts an unexplained skip as missed", () => {
    const out = comparePeriods([missed(1, "lunch", null)], 7);
    expect(out.current.mealsMissed).toBe(1);
  });

  it("tallies late nights", () => {
    const out = comparePeriods([lateSnack(1), lateSnack(2), lateSnack(9)], 7);
    expect(out.current.lateNights).toBe(2);
    expect(out.previous.lateNights).toBe(1);
  });

  it("compares a month against the month before it", () => {
    const out = comparePeriods([cooked(5), cooked(40)], 30);
    expect(out.current.homeCooked).toBe(1);
    expect(out.previous.homeCooked).toBe(1);
    expect(out.windowDays).toBe(30);
  });

  it("puts a boundary event in exactly one window", () => {
    // Sits on the current window's lower edge — it belongs to `current`, and
    // must not be double-counted into `previous`.
    const out = comparePeriods([cooked(7)], 7);
    expect(out.current.homeCooked + out.previous.homeCooked).toBe(1);
  });
});
