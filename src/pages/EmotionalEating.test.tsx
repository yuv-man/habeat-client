import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
import EmotionalEating from "./EmotionalEating";
import { useCBTStore } from "@/stores/cbtStore";
import { IEmotionalEatingInsight } from "@/types/interfaces";
import { toLocalDateString } from "@/lib/dateUtils";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toLocalDateString(d);
};

/** Seven days of breakdown, newest last, matching what the server sends. */
const breakdown = (
  over: Partial<IEmotionalEatingInsight["dailyBreakdown"][number]>[] = []
) =>
  Array.from({ length: 7 }, (_, i) => ({
    date: daysAgo(6 - i),
    mindfulScore: null,
    moodAvg: null,
    mealsLogged: 0,
    mealsScored: 0,
    hasData: false,
    ...(over[i] ?? {}),
  }));

const insight = (over: Partial<IEmotionalEatingInsight> = {}) =>
  ({
    period: { start: daysAgo(6), end: daysAgo(0) },
    totalMeals: 0,
    mealsLogged: 0,
    linkedMeals: 0,
    inferredMeals: 0,
    unscoredMeals: 0,
    emotionalEatingInstances: 0,
    emotionalEatingPercentage: 0,
    mindfulEatingScore: 100,
    satietyRate: 0,
    satietyBasis: 0,
    patternSpotlight: null,
    weeklyTrend: [],
    strongestMealType: null,
    dailyBreakdown: breakdown(),
    patterns: [],
    commonTriggers: [],
    reflectionDays: 0,
    reflectionTriggers: [],
    reflectionFacilitators: [],
    riskWindows: [],
    commonEmotions: [],
    mealTypeBreakdown: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 },
    mealTypeLogged: { breakfast: 0, lunch: 0, dinner: 0, snacks: 0 },
    recommendations: [],
    ...over,
  }) as IEmotionalEatingInsight;

const setInsight = (value: IEmotionalEatingInsight | null) =>
  useCBTStore.setState({
    emotionalEatingInsight: value,
    moodHistory: [],
    fetchEmotionalEatingInsight: vi.fn().mockResolvedValue(undefined),
    fetchMoodHistory: vi.fn().mockResolvedValue(undefined),
  });

describe("EmotionalEating", () => {
  beforeEach(() => setInsight(null));

  it("shows meals on the chart even when no mood was logged near them", () => {
    setInsight(
      insight({
        mealsLogged: 3,
        unscoredMeals: 3,
        dailyBreakdown: breakdown([
          {},
          {},
          {},
          {},
          {},
          {},
          { date: daysAgo(0), mealsLogged: 3, hasData: true },
        ]),
      })
    );

    render(<EmotionalEating />);

    // The regression: a day with three logged meals used to render as "no
    // meals logged" because nothing had been linked to a mood.
    expect(
      screen.getByLabelText(/3 meals logged, no mood nearby to score them/i)
    ).toBeInTheDocument();
  });

  it("says how many meals it is working from, not just how many were linked", () => {
    setInsight(
      insight({
        mealsLogged: 5,
        totalMeals: 2,
        linkedMeals: 1,
        inferredMeals: 1,
        unscoredMeals: 3,
      })
    );

    render(<EmotionalEating />);

    expect(screen.getByText(/meals? you logged/i)).toBeInTheDocument();
    expect(
      screen.getByText(/of them with a mood close enough to read/i)
    ).toBeInTheDocument();
  });

  it("tells a user with meals but no nearby moods which half is missing", () => {
    setInsight(insight({ mealsLogged: 4, unscoredMeals: 4 }));

    render(<EmotionalEating />);

    expect(
      screen.getByText(/Your meals are here — the feelings aren't yet/i)
    ).toBeInTheDocument();
  });

  it("renders the server's observed patterns without the Example badge", () => {
    setInsight(
      insight({
        mealsLogged: 6,
        patterns: [
          {
            key: "late-night",
            emoji: "🌙",
            name: "Late-night eating",
            context: "9 PM–12 AM, most days",
            frequency: "3 nights",
            impact: "negative",
            evidence: 3,
          },
        ],
      })
    );

    render(<EmotionalEating />);

    expect(screen.getByText("Late-night eating")).toBeInTheDocument();
    expect(screen.getByText("9 PM–12 AM, most days")).toBeInTheDocument();
    expect(screen.queryByText("Example")).not.toBeInTheDocument();
  });

  it("labels the placeholder rows as examples when nothing has been observed", () => {
    setInsight(insight({ mealsLogged: 2 }));

    render(<EmotionalEating />);

    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(
      screen.getByText(/they are not your\s+patterns/i)
    ).toBeInTheDocument();
  });

  it("reports satiety as unasked rather than 0% Low", () => {
    setInsight(
      insight({
        mealsLogged: 4,
        totalMeals: 4,
        inferredMeals: 4,
        satietyBasis: 0,
        satietyRate: 0,
      })
    );

    render(<EmotionalEating />);

    expect(screen.getByText("Not asked yet")).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });
});
