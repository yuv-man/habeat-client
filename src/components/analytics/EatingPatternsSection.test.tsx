import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@/test/test-utils";
import EatingPatternsSection from "./EatingPatternsSection";
import { useCBTStore } from "@/stores/cbtStore";
import { usePatternStore, PatternEvent } from "@/stores/patternStore";
import { IEmotionalEatingInsight } from "@/types/interfaces";
import { toLocalDateString } from "@/lib/dateUtils";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
};

const insight = (over: Partial<IEmotionalEatingInsight> = {}) =>
  ({
    period: { start: "", end: "" },
    totalMeals: 14,
    emotionalEatingInstances: 4,
    emotionalEatingPercentage: 28,
    mindfulEatingScore: 72,
    satietyRate: 0,
    patternSpotlight: null,
    weeklyTrend: [
      { week: "W1", score: 58 },
      { week: "W2", score: 64 },
      { week: "W3", score: 69 },
      { week: "W4", score: 72 },
    ],
    strongestMealType: null,
    dailyBreakdown: [],
    commonTriggers: [],
    reflectionDays: 0,
    reflectionTriggers: [],
    reflectionFacilitators: [],
    riskWindows: [],
    commonEmotions: [],
    mealTypeBreakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 },
    recommendations: [],
    ...over,
  }) as IEmotionalEatingInsight;

const setEvents = (events: PatternEvent[]) => usePatternStore.setState({ events });

/** Scopes an assertion to one tile — several tiles legitimately show the same
 *  delta wording, so a bare text query is ambiguous. */
const tile = (label: string) => within(screen.getByText(label).parentElement!);

const setInsight = (value: IEmotionalEatingInsight | null) =>
  useCBTStore.setState({
    emotionalEatingInsight: value,
    fetchEmotionalEatingInsight: vi.fn().mockResolvedValue(undefined),
  });

describe("EatingPatternsSection", () => {
  beforeEach(() => {
    setEvents([]);
    setInsight(null);
  });

  it("admits it has nothing rather than showing a grid of zeroes", () => {
    render(<EatingPatternsSection period="week" />);
    expect(screen.getByText("Nothing to compare yet")).toBeInTheDocument();
    expect(screen.queryByText("Cooked at home")).toBeNull();
  });

  it("treats an insight with no logged meals as no data", () => {
    setInsight(insight({ totalMeals: 0 }));
    render(<EatingPatternsSection period="week" />);
    expect(screen.getByText("Nothing to compare yet")).toBeInTheDocument();
  });

  it("shows the score with its trend and evidence", () => {
    setInsight(insight());
    render(<EatingPatternsSection period="week" />);

    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("+3 vs last week")).toBeInTheDocument();
    expect(screen.getByText(/14/)).toBeInTheDocument();
    expect(screen.getByText(/4 of which leaned emotional/)).toBeInTheDocument();
  });

  it("counts behaviours against the period before", () => {
    setEvents([
      { kind: "meal-source", date: daysAgo(1), mealType: "dinner", source: "cooked" },
      { kind: "meal-source", date: daysAgo(2), mealType: "dinner", source: "cooked" },
      { kind: "meal-source", date: daysAgo(9), mealType: "dinner", source: "cooked" },
      { kind: "meal-source", date: daysAgo(3), mealType: "lunch", source: "ordered" },
      { kind: "late-snack", date: daysAgo(1), hour: 22 },
    ]);
    render(<EatingPatternsSection period="week" />);

    // 2 cooked this week against 1 last week; 1 ordered against none.
    expect(tile("Cooked at home").getByText("1 more than last week")).toBeInTheDocument();
    expect(tile("Ordered or ate out").getByText("1 more than last week")).toBeInTheDocument();
    expect(tile("Late-night snacks").getByText("1 more than last week")).toBeInTheDocument();
    expect(tile("Meals missed").getByText("Same as last week")).toBeInTheDocument();
  });

  it("states the direction in words, never colour alone", () => {
    setEvents([
      { kind: "late-snack", date: daysAgo(8), hour: 22 },
      { kind: "late-snack", date: daysAgo(9), hour: 23 },
      { kind: "late-snack", date: daysAgo(1), hour: 22 },
    ]);
    render(<EatingPatternsSection period="week" />);
    expect(tile("Late-night snacks").getByText("1 fewer than last week")).toBeInTheDocument();
  });

  it("declines to show a delta when the earlier window was never observed", () => {
    setEvents([
      { kind: "meal-source", date: daysAgo(1), mealType: "dinner", source: "cooked" },
    ]);
    render(<EatingPatternsSection period="week" />);
    expect(screen.getAllByText("No earlier data").length).toBeGreaterThan(0);
    expect(screen.queryByText(/than last week/)).toBeNull();
  });

  it("names the window the counts came from", () => {
    setEvents([
      { kind: "meal-source", date: daysAgo(1), mealType: "dinner", source: "cooked" },
    ]);
    render(<EatingPatternsSection period="month" />);
    expect(screen.getByText(/last 30 days/)).toBeInTheDocument();
  });

  it("renders behaviour counts even when the server insight is unavailable", () => {
    setInsight(null);
    setEvents([
      { kind: "missed-meal", date: daysAgo(1), mealType: "lunch", reason: "stress" },
    ]);
    render(<EatingPatternsSection period="week" />);
    expect(screen.getByText("Meals missed")).toBeInTheDocument();
    expect(screen.queryByText("Mindful eating score")).toBeNull();
  });
});
