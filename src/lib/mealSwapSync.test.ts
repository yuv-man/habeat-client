import { describe, it, expect, vi, beforeEach } from "vitest";
import type { IDailyProgress, IMeal, IPlan } from "@/types/interfaces";

type PlanLike = { _id: string; weeklyPlan: Record<string, { meals: Record<string, unknown> }> };

const { authState, progressState } = vi.hoisted(() => ({
  authState: {
    user: { _id: "user_1" } as { _id: string } | null,
    plan: null as PlanLike | null,
    setPlan: vi.fn(),
  },
  progressState: {
    todayProgress: null as Pick<IDailyProgress, "date" | "dateKey"> | null,
    fetchTodayProgress: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: { getState: () => authState },
}));
vi.mock("@/stores/progressStore", () => ({
  useProgressStore: { getState: () => progressState },
}));

import { progressDateKey, syncStoresAfterMealSwap } from "./mealSwapSync";

const newMeal = { _id: "m2", name: "Fried Egg Sandwich" } as IMeal;

describe("progressDateKey", () => {
  it("prefers the server's dateKey", () => {
    expect(
      progressDateKey({ date: "2026-10-10T21:00:00.000Z", dateKey: "2026-10-11" })
    ).toBe("2026-10-11");
  });

  it("falls back to the local calendar day of the timestamp", () => {
    const midnight = new Date(2026, 9, 11); // local midnight, Oct 11
    expect(progressDateKey({ date: midnight.toISOString() })).toBe("2026-10-11");
  });
});

describe("syncStoresAfterMealSwap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = { _id: "user_1" };
    authState.plan = null;
  });

  it("re-reads today's progress when the swap is for today", async () => {
    // The shape the server actually returns: `date` is a UTC timestamp for
    // local midnight, which never equalled the plan date. That mismatch is
    // why the Today screen kept showing a meal the user had just replaced.
    progressState.todayProgress = {
      date: "2026-10-10T21:00:00.000Z",
      dateKey: "2026-10-11",
    };

    await syncStoresAfterMealSwap({ date: "2026-10-11", mealType: "lunch", newMeal });

    expect(progressState.fetchTodayProgress).toHaveBeenCalledWith("user_1", true);
  });

  it("leaves today's progress alone when another day was swapped", async () => {
    progressState.todayProgress = {
      date: "2026-10-10T21:00:00.000Z",
      dateKey: "2026-10-11",
    };

    await syncStoresAfterMealSwap({ date: "2026-10-14", mealType: "dinner", newMeal });

    expect(progressState.fetchTodayProgress).not.toHaveBeenCalled();
  });

  it("takes the server's plan when one comes back", async () => {
    progressState.todayProgress = null;
    const updatedPlan = { _id: "plan_1", weeklyPlan: {} } as unknown as IPlan;

    await syncStoresAfterMealSwap({
      date: "2026-10-11",
      mealType: "lunch",
      newMeal,
      updatedPlan,
    });

    expect(authState.setPlan).toHaveBeenCalledWith(updatedPlan);
  });

  it("patches the day locally when only the meal comes back", async () => {
    progressState.todayProgress = null;
    authState.plan = {
      _id: "plan_1",
      weeklyPlan: {
        "2026-10-11": { meals: { lunch: { name: "Old" }, snacks: [] } },
      },
    };

    await syncStoresAfterMealSwap({ date: "2026-10-11", mealType: "lunch", newMeal });

    const patched = authState.setPlan.mock.calls[0][0];
    expect(patched.weeklyPlan["2026-10-11"].meals.lunch).toBe(newMeal);
  });
});
