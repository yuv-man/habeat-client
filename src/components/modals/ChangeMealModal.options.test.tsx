import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import ChangeMealModal from "./ChangeMealModal";
import TiredButton from "@/components/dashboard/TiredButton";
import type { IMeal } from "@/types/interfaces";

/**
 * The free alternatives ("My Meals", "Something Quicker"), swap reasons and
 * Undo. Free-tier user throughout: none of this may sit behind a paywall.
 */

const { api, toastSuccess, authState, recordPattern, trackEvent } = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  api: {
    changeMealInPlan: vi.fn(),
    getMealOptions: vi.fn(),
    getAIMealSuggestions: vi.fn(),
    getNutritionFromUSDA: vi.fn(),
  },
  toastSuccess: vi.fn(),
  authState: {
    user: { _id: "user_1", name: "Free User", subscriptionTier: "free" as const, favoriteMeals: [] },
    plan: { _id: "plan_1" },
    favoriteMealsData: [] as IMeal[],
    favoriteMealsLoaded: true,
    fetchFavoriteMeals: vi.fn(),
  },
  recordPattern: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  userAPI: api,
  cbtAPI: { getMoodBasedMealRecommendations: vi.fn().mockResolvedValue({ data: null }) },
}));
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: toastSuccess, error: vi.fn(), message: vi.fn() }),
}));
vi.mock("@/stores/authStore", () => {
  const useAuthStore = () => authState;
  useAuthStore.getState = () => ({ ...authState, setPlan: vi.fn() });
  return { useAuthStore };
});
vi.mock("@/stores/progressStore", () => {
  const useProgressStore = () => ({});
  useProgressStore.getState = () => ({ todayProgress: null, fetchTodayProgress: vi.fn() });
  return { useProgressStore };
});
vi.mock("@/stores/patternStore", () => ({
  usePatternStore: (selector: (s: { record: typeof recordPattern }) => unknown) =>
    selector({ record: recordPattern }),
}));
vi.mock("@/stores/cbtStore", () => ({ useTodayMoods: vi.fn(() => []) }));
vi.mock("@/lib/mealImageHelper", () => ({ getMealImageVite: () => "img.jpg" }));
vi.mock("@/lib/analytics", () => ({ trackEvent }));
vi.mock("@/components/helper/MealLoader", () => ({ default: () => <div data-testid="loader" /> }));
vi.mock("@/components/meal/PhotoMealTab", () => ({ default: () => <div /> }));

const planned: IMeal = {
  _id: "507f1f77bcf86cd799439011",
  name: "Beef Tomato Garlic Tacos",
  calories: 735,
  macros: { protein: 46, carbs: 75, fat: 28 },
  category: "dinner",
  ingredients: [["ground beef", "150 g"]],
  prepTime: 15,
  done: false,
} as unknown as IMeal;

const ownDish = {
  _id: "own-1",
  name: "Chicken and rice",
  calories: 595,
  macros: { protein: 42, carbs: 60, fat: 19 },
  category: "dinner",
  ingredients: [["chicken breast", "150 g"]],
  prepTime: 25,
  fromRepertoire: "dish_1",
  done: false,
} as unknown as IMeal;

const renderModal = (props: Partial<React.ComponentProps<typeof ChangeMealModal>> = {}) =>
  render(
    <ChangeMealModal currentMeal={planned} mealType="dinner" date="2026-10-11" onMealChange={vi.fn()} {...props}>
      <button>Swap</button>
    </ChangeMealModal>,
  );

describe("ChangeMealModal free alternatives", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.changeMealInPlan.mockResolvedValue({ data: { plan: { _id: "plan_1" } } });
    api.getMealOptions.mockResolvedValue({
      data: {
        options: [{ meal: ownDish, source: "own", reason: "Your dish · 25 min" }],
        current: null,
        latencyMs: 12,
        requestId: "req_1",
      },
    });
  });

  const resolved = () => trackEvent.mock.calls.filter(([name]) => name === "meal_help_resolved").map(([, p]) => p);

  it("reports an accepted offer with what was picked", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    fireEvent.click(screen.getByRole("button", { name: "No time" }));
    fireEvent.click(await screen.findByText("Chicken And Rice"));

    await waitFor(() => expect(resolved()).toHaveLength(1));
    expect(resolved()[0]).toEqual({
      request_id: "req_1",
      entry: "mine",
      offered: 1,
      outcome: "accepted",
      reason: "no_time",
      chosen_source: "own",
      option_rank: 0,
    });
  });

  it("reports a dismissed offer when the user closes without swapping", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    await screen.findByText("Chicken And Rice");
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(resolved()).toEqual([
      expect.objectContaining({ request_id: "req_1", outcome: "dismissed", offered: 1 }),
    ]);
  });

  it("reports an adapted offer when the user swaps another way after seeing it", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    await screen.findByText("Chicken And Rice");
    fireEvent.click(screen.getByText("Back"));
    fireEvent.click(screen.getByText("Manual Entry"));
    fireEvent.change(screen.getByPlaceholderText("E.g., Chicken Salad"), { target: { value: "Leftover pizza" } });
    fireEvent.click(screen.getByText("Save Meal"));

    await waitFor(() => expect(resolved()).toHaveLength(1));
    expect(resolved()[0]).toEqual(expect.objectContaining({ outcome: "adapted", chosen_via: "manual" }));
  });

  it("offers My Meals and Something Quicker to a free user, unlocked", () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));

    for (const label of ["My Meals", "Something Quicker"]) {
      const tile = screen.getByText(label).closest("button")!;
      expect(tile).not.toHaveTextContent(/Upgrade|See plans/);
    }
  });

  it("lists the user's own dishes without changing anything until one is picked", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));

    expect(await screen.findByText("Chicken And Rice")).toBeInTheDocument();
    expect(screen.getByText("Your dish · 25 min")).toBeInTheDocument();
    expect(api.getMealOptions).toHaveBeenCalledWith("user_1", "plan_1", "2026-10-11", "dinner", "mine", undefined);
    expect(api.changeMealInPlan).not.toHaveBeenCalled();
  });

  it("applies the picked option with its origin and the optional reason", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    await screen.findByText("Chicken And Rice");

    fireEvent.click(screen.getByRole("button", { name: "Missing ingredients" }));
    fireEvent.click(screen.getByText("Chicken And Rice"));

    await waitFor(() => expect(api.changeMealInPlan).toHaveBeenCalled());
    const [, , date, slot, meal, , extras] = api.changeMealInPlan.mock.calls[0];
    expect([date, slot, meal.name, meal.fromRepertoire]).toEqual(["2026-10-11", "dinner", "Chicken and rice", "dish_1"]);
    expect(extras).toEqual({ via: "my_meals", reason: "missing_ingredients" });
  });

  it("sends no reason when the user doesn't give one", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    fireEvent.click(await screen.findByText("Chicken And Rice"));

    await waitFor(() => expect(api.changeMealInPlan).toHaveBeenCalled());
    expect(api.changeMealInPlan.mock.calls[0][6]).toEqual({ via: "my_meals" });
  });

  it("offers Undo, which puts the planned meal back", async () => {
    const onMealChange = vi.fn();
    renderModal({ onMealChange });
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    fireEvent.click(await screen.findByText("Chicken And Rice"));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const [message, opts] = toastSuccess.mock.calls[0];
    expect(message).toBe("Swapped to Chicken And Rice");
    expect(opts.action.label).toBe("Undo");

    opts.action.onClick();
    await waitFor(() => expect(api.changeMealInPlan).toHaveBeenCalledTimes(2));
    const [, , , , restored, , extras] = api.changeMealInPlan.mock.calls[1];
    expect(restored).toBe(planned);
    expect(extras).toEqual({ undo: true, via: "undo" });
    await waitFor(() => expect(onMealChange).toHaveBeenLastCalledWith(planned));
  });

  it("undoes with the plan's complete meal when Today's copy has no ingredients", async () => {
    // Today's cards come from the progress snapshot, which stores no
    // ingredients; restoring that copy would ask the server to generate a meal.
    const snapshot = { ...planned, ingredients: undefined } as unknown as IMeal;
    const original = authState.plan;
    authState.plan = {
      _id: "plan_1",
      weeklyPlan: { "2026-10-11": { meals: { dinner: planned } } },
    } as typeof authState.plan;
    try {
      renderModal({ currentMeal: snapshot });
      fireEvent.click(screen.getByText("Swap"));
      fireEvent.click(screen.getByText("My Meals"));
      fireEvent.click(await screen.findByText("Chicken And Rice"));

      await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
      const [, opts] = toastSuccess.mock.calls[0];
      opts.action.onClick();
      await waitFor(() => expect(api.changeMealInPlan).toHaveBeenCalledTimes(2));
      expect(api.changeMealInPlan.mock.calls[1][4].ingredients).toEqual(planned.ingredients);
    } finally {
      authState.plan = original;
    }
  });

  it("leads with the two free routes and keeps the rest under More ways", () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    const buttons = screen.getAllByRole("button").map((b) => b.textContent ?? "");
    const at = (label: string) => buttons.findIndex((t) => t.includes(label));
    expect(at("My Meals")).toBeLessThan(at("AI Suggestion"));
    expect(at("Something Quicker")).toBeLessThan(at("AI Suggestion"));
    expect(screen.getByText("More ways")).toBeInTheDocument();
    // Paid routes still say so for a free user.
    expect(screen.getByText("AI Suggestion").closest("button")).toHaveTextContent("Plus");
    expect(screen.getByText("Take Photo").closest("button")).toHaveTextContent("Premium");
  });

  it("asks why on the first screen, and sends the reason whichever way the user swaps", async () => {
    // Without a reason two swaps drop the dish from future plans, so routes
    // other than the free lists must be able to carry one too.
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByRole("button", { name: "Not in the mood" }));
    fireEvent.click(screen.getByText("Manual Entry"));
    fireEvent.change(screen.getByPlaceholderText("E.g., Chicken Salad"), { target: { value: "Leftover pizza" } });
    fireEvent.click(screen.getByText("Save Meal"));

    await waitFor(() => expect(api.changeMealInPlan).toHaveBeenCalled());
    expect(api.changeMealInPlan.mock.calls[0][6]).toEqual({ via: "manual", reason: "not_in_mood" });
  });

  it("says a 'Don't like it' swap will change future plans, with a way to manage it", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByRole("button", { name: "Don't like it" }));
    fireEvent.click(screen.getByText("My Meals"));
    fireEvent.click(await screen.findByText("Chicken And Rice"));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const [, opts] = toastSuccess.mock.calls[0];
    expect(opts.description).toBe("We'll suggest Beef Tomato Garlic Tacos less.");
    expect(opts.cancel.label).toBe("Manage");
    expect(opts.action.label).toBe("Undo");
  });

  it("doesn't claim to learn anything from other reasons", async () => {
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByRole("button", { name: "No time" }));
    fireEvent.click(screen.getByText("My Meals"));
    fireEvent.click(await screen.findByText("Chicken And Rice"));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const [, opts] = toastSuccess.mock.calls[0];
    expect(opts.description).toBeUndefined();
    expect(opts.cancel).toBeUndefined();
  });

  it("shows a way to add dishes when none suit the meal", async () => {
    api.getMealOptions.mockResolvedValue({ data: { options: [], current: null, latencyMs: 5 } });
    renderModal();
    fireEvent.click(screen.getByText("Swap"));
    fireEvent.click(screen.getByText("My Meals"));
    expect(await screen.findByText("None of your dishes suit this meal yet.")).toBeInTheDocument();
    expect(screen.getByText("Add the dishes you cook")).toBeInTheDocument();
  });
});

describe("TiredButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.changeMealInPlan.mockResolvedValue({ data: { plan: { _id: "plan_1" } } });
    api.getMealOptions.mockResolvedValue({
      data: {
        options: [{ meal: { ...ownDish, name: "Scrambled eggs on toast", prepTime: 7 }, source: "own", reason: "Your dish · 7 min" }],
        current: null,
        latencyMs: 9,
      },
    });
  });

  it("shows quicker options instead of swapping straight away, with No time given", async () => {
    render(<TiredButton meal={planned} mealType="dinner" date="2026-10-11" onMealChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /show quicker options/i }));

    expect(await screen.findByText("Scrambled Eggs On Toast")).toBeInTheDocument();
    expect(api.getMealOptions).toHaveBeenCalledWith("user_1", "plan_1", "2026-10-11", "dinner", "quicker", undefined);
    expect(api.changeMealInPlan).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "No time" })).toHaveAttribute("aria-pressed", "true");
  });

  it("records the quick swap as a pattern when one is picked", async () => {
    render(<TiredButton meal={planned} mealType="dinner" date="2026-10-11" onMealChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /show quicker options/i }));
    fireEvent.click(await screen.findByText("Scrambled Eggs On Toast"));

    await waitFor(() => expect(api.changeMealInPlan).toHaveBeenCalled());
    expect(api.changeMealInPlan.mock.calls[0][6]).toEqual({ via: "quicker", reason: "no_time" });
    expect(recordPattern).toHaveBeenCalledWith({ kind: "rescue-swap", date: "2026-10-11", mealType: "dinner" });
  });

  it("isn't offered at breakfast", () => {
    const { container } = render(
      <TiredButton meal={planned} mealType="breakfast" date="2026-10-11" onMealChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
