import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@/test/test-utils";
import MealCard from "./MealCard";
import { mockBreakfast, mockSnack } from "@/test/mocks";

// Mock the stores
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: { _id: "test_user_123" },
  }),
}));

vi.mock("@/stores/favoritesStore", () => ({
  useFavoritesStore: () => ({
    isMealFavorite: vi.fn().mockReturnValue(false),
    toggleFavoriteMeal: vi.fn(),
  }),
}));

const { setMealEatenTime } = vi.hoisted(() => ({
  setMealEatenTime: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/stores/progressStore", () => ({
  useProgressStore: () => ({
    completeMeal: vi.fn(),
    setMealEatenTime,
    todayProgress: { date: new Date() },
  }),
}));

// Mock the image helper
vi.mock("@/lib/mealImageHelper", () => ({
  getMealImageVite: () => "mock-image-url.jpg",
}));

describe("MealCard", () => {
  const defaultProps = {
    meal: mockBreakfast,
    mealType: "breakfast",
    mealTime: "8:00 AM",
    date: "2024-12-17",
    onSwap: vi.fn(),
    onViewRecipe: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders meal name correctly", () => {
    render(<MealCard {...defaultProps} />);
    expect(screen.getByText("Oatmeal With Berries")).toBeInTheDocument();
  });

  it("displays meal time", () => {
    render(<MealCard {...defaultProps} />);
    expect(screen.getByText("8:00 AM")).toBeInTheDocument();
  });

  it("displays calories", () => {
    render(<MealCard {...defaultProps} />);
    expect(
      screen.getByText(`${mockBreakfast.calories} kcal`)
    ).toBeInTheDocument();
  });

  it("renders expand/collapse toggle button", () => {
    render(<MealCard {...defaultProps} />);
    // Card auto-expands when mealStatus="current" (default)
    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
  });

  it("expands to show more details when clicked", () => {
    render(<MealCard {...defaultProps} mealStatus="future" />);

    const expandButton = screen.getByRole("button", { name: "Expand" });
    fireEvent.click(expandButton);

    expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();
    expect(
      screen.getByText(`Protein: ${mockBreakfast.macros.protein}g`)
    ).toBeInTheDocument();
  });

  it("shows mark complete button", () => {
    render(<MealCard {...defaultProps} mealStatus="future" />);
    expect(screen.getByRole("button", { name: "Mark as complete" })).toBeInTheDocument();
  });

  describe("Eaten time", () => {
    // 2024-12-17T11:04 local — the meal was eaten at 11:04, not at the 8:00
    // slot it was planned for.
    const eatenAt = new Date(2024, 11, 17, 11, 4).toISOString();
    const eatenBreakfast = {
      ...mockBreakfast,
      done: true,
      completedAt: eatenAt,
      completedAtSource: "user" as const,
    };

    it("shows the scheduled time, not editable, until the meal is ticked", () => {
      render(<MealCard {...defaultProps} mealStatus="future" />);
      expect(screen.getByText("8:00 AM")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", {
          name: "Change the time you ate this meal",
        })
      ).not.toBeInTheDocument();
    });

    it("shows when a completed meal was actually eaten, next to the plan", () => {
      render(<MealCard {...defaultProps} meal={eatenBreakfast} />);
      expect(screen.getByText("ate at 11:04 AM")).toBeInTheDocument();
      expect(screen.getByText("planned 8:00 AM")).toBeInTheDocument();
    });

    it("saves a corrected time against the meal's own date", async () => {
      render(<MealCard {...defaultProps} meal={eatenBreakfast} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Change the time you ate this meal" })
      );

      const input = screen.getByLabelText("Time you ate this meal");
      fireEvent.change(input, { target: { value: "09:30" } });
      // Saving awaits the store, so let the resulting state updates settle.
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Save time" }));
      });

      expect(setMealEatenTime).toHaveBeenCalledWith(
        "test_user_123",
        "2024-12-17",
        "breakfast",
        mockBreakfast._id,
        "09:30"
      );
    });
  });

  describe("Snack Card Variant", () => {
    const snackProps = {
      meal: mockSnack,
      mealType: "snacks",
      mealTime: "3:00 PM",
      date: "2024-12-17",
      snackIndex: 0,
      onSwap: vi.fn(),
      isSnack: true,
    };

    it("renders snack in compact form", () => {
      render(<MealCard {...snackProps} />);
      expect(screen.getByText(mockSnack.name)).toBeInTheDocument();
      expect(screen.queryByText("Show more")).not.toBeInTheDocument();
    });

    it("shows snack calories", () => {
      render(<MealCard {...snackProps} />);
      expect(
        screen.getByText(`${mockSnack.calories} kcal`)
      ).toBeInTheDocument();
    });

    it("has swap button for snacks", () => {
      render(<MealCard {...snackProps} />);
      expect(screen.getByLabelText("Swap snack")).toBeInTheDocument();
    });
  });

  describe("The user's own dish", () => {
    const side = {
      name: "Rice & Israeli salad",
      calories: 430,
      macros: { protein: 7, carbs: 81, fat: 5 },
      ingredients: [["rice", "240 g"]] as [string, string][],
    };

    it("says what is served next to their dish", () => {
      render(
        <MealCard
          {...defaultProps}
          meal={{ ...mockBreakfast, fromRepertoire: "dish-1", side }}
          mealType="lunch"
        />
      );
      expect(screen.getByText("Your dish")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Change side: Rice & Israeli salad" })).toBeInTheDocument();
    });

    it("says which of their dishes a swap replaces", () => {
      render(
        <MealCard
          {...defaultProps}
          meal={{ ...mockBreakfast, fromRepertoire: "dish-1", tuneLevel: 1, insteadOf: "Beef burger" }}
        />
      );
      expect(screen.getByText("A lighter take on your Beef burger")).toBeInTheDocument();
    });

    it("names both the swap and its side", () => {
      render(
        <MealCard
          {...defaultProps}
          meal={{ ...mockBreakfast, fromRepertoire: "dish-1", tuneLevel: 1, insteadOf: "Chicken schnitzel", side }}
          mealType="lunch"
        />
      );
      expect(screen.getByText("A lighter take on your Chicken schnitzel")).toBeInTheDocument();
      expect(screen.getByText("with Rice & Israeli salad")).toBeInTheDocument();
    });

    it("adds nothing to an ordinary meal", () => {
      render(<MealCard {...defaultProps} />);
      expect(screen.queryByText(/Your dish|A lighter take|Add side/)).not.toBeInTheDocument();
    });
  });
});
