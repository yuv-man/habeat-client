import { useAuthStore } from "@/stores/authStore";
import { useProgressStore } from "@/stores/progressStore";
import type { IMeal, IPlan } from "@/types/interfaces";

/**
 * Bring every client cache back in line after a meal is swapped.
 *
 * The server has always written all three records in one request — the plan,
 * the day's progress, and the shopping list. The client keeps its own copy of
 * the first two in separate stores, and each swap screen only ever refreshed
 * the one it was reading from:
 *
 *   - the daily tracker wrote `progressStore.todayProgress` and left
 *     `authStore.plan` stale, so the weekly plan still showed the old meal;
 *   - the weekly plan patched `authStore.plan` and left the progress record
 *     stale, so the daily tracker still showed the old meal.
 *
 * Every swap path goes through here now, so neither direction can drift.
 */
export async function syncStoresAfterMealSwap({
  date,
  mealType,
  snackIndex,
  newMeal,
  updatedPlan,
}: {
  /** The plan date the swap applies to, "YYYY-MM-DD". */
  date: string;
  mealType: string;
  /** Required when `mealType` is "snacks" — which one was replaced. */
  snackIndex?: number;
  newMeal: IMeal;
  /** The plan as the server now has it. Preferred over patching locally,
   *  because the server resolves the meal (ids, ingredients, macros) and its
   *  version is the one the shopping list was rebuilt from. */
  updatedPlan?: IPlan | null;
}): Promise<void> {
  const { user, plan, setPlan } = useAuthStore.getState();

  if (updatedPlan) {
    setPlan(updatedPlan);
  } else if (plan?.weeklyPlan?.[date]) {
    // No plan came back (the rescue-meal endpoint returns only the meal), so
    // patch the day in place rather than leave the weekly view stale.
    const day = plan.weeklyPlan[date];
    const meals =
      mealType === "snacks"
        ? {
            ...day.meals,
            snacks: day.meals.snacks.map((snack, i) =>
              i === (snackIndex ?? 0) ? newMeal : snack
            ),
          }
        : { ...day.meals, [mealType]: newMeal };

    setPlan({
      ...plan,
      weeklyPlan: {
        ...plan.weeklyPlan,
        [date]: { ...day, meals },
      },
    });
  }

  // The server already rewrote this day's progress as part of the swap, so
  // this is a read-back rather than a push — it also picks up the `done` reset
  // and the consumed-calorie adjustment that go with replacing a meal.
  const { todayProgress, fetchTodayProgress } = useProgressStore.getState();
  if (user?._id && todayProgress?.date === date) {
    await fetchTodayProgress(user._id, true);
  }
}
