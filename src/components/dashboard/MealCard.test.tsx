import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
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

vi.mock("@/stores/progressStore", () => ({
  useProgressStore: () => ({
    completeMeal: vi.fn(),
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
    expect(screen.getByText(mockBreakfast.name)).toBeInTheDocument();
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
    expect(screen.getByText("Show more")).toBeInTheDocument();
  });

  it("expands to show more details when clicked", () => {
    render(<MealCard {...defaultProps} />);

    const expandButton = screen.getByText("Show more");
    fireEvent.click(expandButton);

    expect(screen.getByText("Show less")).toBeInTheDocument();
    // Should show macros when expanded
    expect(
      screen.getByText(`Protein: ${mockBreakfast.macros.protein}g`)
    ).toBeInTheDocument();
  });

  it("shows mark complete button", () => {
    render(<MealCard {...defaultProps} />);
    expect(screen.getByLabelText("Mark as complete")).toBeInTheDocument();
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
});
