import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import ChangeMealModal from "./ChangeMealModal";
import { mockBreakfast, mockDinner } from "@/test/mocks";
import { IMeal } from "@/types/interfaces";

// Use vi.hoisted to define mock data before mocks are hoisted
const { mockFavoriteMeals, mockUser } = vi.hoisted(() => ({
  mockUser: {
    _id: "test_user_123",
    name: "Test User",
    favoriteMeals: ["fav_meal_1", "fav_meal_2"],
  },
  mockFavoriteMeals: [
    {
      _id: "fav_meal_1",
      name: "Favorite Grilled Chicken",
      icon: "",
      calories: 400,
      macros: { protein: 35, carbs: 20, fat: 15 },
      category: "lunch",
      prepTime: 20,
      done: false,
    },
    {
      _id: "fav_meal_2",
      name: "Favorite Salmon Bowl",
      icon: "",
      calories: 450,
      macros: { protein: 40, carbs: 30, fat: 18 },
      category: "dinner",
      prepTime: 25,
      done: false,
    },
  ] as IMeal[],
}));

// Mock the auth store
vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: mockUser,
    plan: { _id: "plan_123" },
  }),
}));

// Mock the API
vi.mock("@/services/api", () => ({
  userAPI: {
    getFavoritesByUserId: vi.fn().mockResolvedValue({
      data: { favoriteMeals: mockFavoriteMeals },
    }),
    changeMealInPlan: vi.fn().mockResolvedValue({ data: { success: true } }),
    getAIMealSuggestions: vi.fn().mockResolvedValue({
      data: {
        suggestions: [
          {
            _id: "ai-1",
            name: "Grilled Chicken Salad",
            icon: "",
            calories: 350,
            macros: { carbs: 15, fat: 12, protein: 40 },
            category: "breakfast",
            ingredients: [],
            prepTime: 10,
            done: false,
          },
          {
            _id: "ai-2",
            name: "Quinoa Buddha Bowl",
            icon: "",
            calories: 420,
            macros: { carbs: 55, fat: 14, protein: 18 },
            category: "breakfast",
            ingredients: [],
            prepTime: 15,
            done: false,
          },
        ],
      },
    }),
  },
}));

// Mock the image helper
vi.mock("@/lib/mealImageHelper", () => ({
  getMealImageVite: () => "mock-image-url.jpg",
}));

describe("ChangeMealModal", () => {
  const mockOnMealChange = vi.fn();

  const defaultProps = {
    currentMeal: mockBreakfast,
    mealType: "breakfast",
    date: "2024-12-17",
    onMealChange: mockOnMealChange,
    children: <button>Change Meal</button>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ============================================
  // MODAL OPEN/CLOSE TESTS
  // ============================================
  describe("Modal Open/Close", () => {
    it("renders children as trigger", () => {
      render(<ChangeMealModal {...defaultProps} />);
      expect(screen.getByText("Change Meal")).toBeInTheDocument();
    });

    it("opens modal when trigger is clicked", async () => {
      render(<ChangeMealModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Change Meal"));

      expect(
        screen.getByRole("heading", { name: "Change Meal" })
      ).toBeInTheDocument();
    });

    it("closes modal when X button is clicked", async () => {
      render(<ChangeMealModal {...defaultProps} />);

      // Open modal
      fireEvent.click(screen.getByText("Change Meal"));
      expect(
        screen.getByRole("heading", { name: "Change Meal" })
      ).toBeInTheDocument();

      // Find and click the close button (X icon)
      const closeButtons = screen.getAllByRole("button");
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector("svg.lucide-x")
      );
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: "Change Meal" })
        ).not.toBeInTheDocument();
      });
    });

    it("pre-fills form with current meal data when opened", () => {
      render(<ChangeMealModal {...defaultProps} />);

      fireEvent.click(screen.getByText("Change Meal"));

      // Check that the name input has the current meal's name
      const nameInput = screen.getByPlaceholderText("E.g., Chicken Salad");
      expect(nameInput).toHaveValue(mockBreakfast.name);

      // Check calories
      const caloriesInput = screen.getByDisplayValue(
        mockBreakfast.calories.toString()
      );
      expect(caloriesInput).toBeInTheDocument();
    });
  });

  // ============================================
  // TAB NAVIGATION TESTS
  // ============================================
  describe("Tab Navigation", () => {
    it("shows all three tabs", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      expect(
        screen.getByRole("button", { name: "Manual" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "AI Suggestion" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Favorites" })
      ).toBeInTheDocument();
    });

    it("defaults to Manual tab", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const manualTab = screen.getByRole("button", { name: "Manual" });
      expect(manualTab).toHaveClass("bg-white");
    });

    it("switches to AI Suggestion tab when clicked", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      expect(
        screen.getByPlaceholderText(/High protein, low carb/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Get AI Suggestions")).toBeInTheDocument();
    });

    it("switches to Favorites tab when clicked", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      // Should show loading or favorites list
      await waitFor(() => {
        expect(
          screen.getByText("Favorite Grilled Chicken") ||
            screen.getByText("No favorite meals yet")
        ).toBeTruthy();
      });
    });
  });

  // ============================================
  // MANUAL TAB TESTS
  // ============================================
  describe("Manual Tab", () => {
    it("renders all manual input fields", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      expect(screen.getByLabelText("Meal Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Calories")).toBeInTheDocument();
      expect(screen.getByLabelText("Carbs (g)")).toBeInTheDocument();
      expect(screen.getByLabelText("Fat (g)")).toBeInTheDocument();
      expect(screen.getByLabelText("Protein (g)")).toBeInTheDocument();
      expect(screen.getByLabelText("Prep Time (min)")).toBeInTheDocument();
    });

    it("allows updating meal name", async () => {
      const user = userEvent.setup();
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const nameInput = screen.getByPlaceholderText("E.g., Chicken Salad");
      await user.clear(nameInput);
      await user.type(nameInput, "New Meal Name");

      expect(nameInput).toHaveValue("New Meal Name");
    });

    it("allows updating calories", async () => {
      const user = userEvent.setup();
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const caloriesInput = screen.getByDisplayValue(
        mockBreakfast.calories.toString()
      );
      await user.clear(caloriesInput);
      await user.type(caloriesInput, "500");

      expect(caloriesInput).toHaveValue(500);
    });

    it("disables Save button when meal name is empty", async () => {
      const user = userEvent.setup();
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const nameInput = screen.getByPlaceholderText("E.g., Chicken Salad");
      await user.clear(nameInput);

      const saveButton = screen.getByRole("button", { name: "Save Meal" });
      expect(saveButton).toBeDisabled();
    });

    it("enables Save button when meal name is provided", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const saveButton = screen.getByRole("button", { name: "Save Meal" });
      expect(saveButton).not.toBeDisabled();
    });

    it("calls onMealChange with new meal data when Save is clicked", async () => {
      const user = userEvent.setup();
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      // Update name
      const nameInput = screen.getByPlaceholderText("E.g., Chicken Salad");
      await user.clear(nameInput);
      await user.type(nameInput, "Custom Breakfast");

      // Click save
      const saveButton = screen.getByRole("button", { name: "Save Meal" });
      fireEvent.click(saveButton);

      // Wait for async API call to complete
      await waitFor(() => {
        expect(mockOnMealChange).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Custom Breakfast",
            category: "breakfast",
          })
        );
      });
    });

    it("closes modal after saving manual meal", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const saveButton = screen.getByRole("button", { name: "Save Meal" });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: "Change Meal" })
        ).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // AI SUGGESTION TAB TESTS
  // ============================================
  describe("AI Suggestion Tab", () => {
    it("renders AI preference textarea", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      expect(
        screen.getByPlaceholderText(/High protein, low carb/i)
      ).toBeInTheDocument();
    });

    it("renders Get AI Suggestions button", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      expect(screen.getByText("Get AI Suggestions")).toBeInTheDocument();
    });

    it("allows entering AI rules", async () => {
      const user = userEvent.setup();
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      const textarea = screen.getByPlaceholderText(/High protein, low carb/i);
      await user.type(textarea, "Low carb, vegetarian");

      expect(textarea).toHaveValue("Low carb, vegetarian");
    });

    it("shows loading state when generating suggestions", async () => {
      vi.useFakeTimers();
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      const suggestButton = screen.getByText("Get AI Suggestions");
      fireEvent.click(suggestButton);

      expect(screen.getByText("Generating...")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("displays AI suggestions after loading", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      fireEvent.click(screen.getByText("Get AI Suggestions"));

      // Wait for AI suggestions to load
      await waitFor(() => {
        expect(screen.getByText("Suggested meals:")).toBeInTheDocument();
        expect(screen.getByText("Grilled Chicken Salad")).toBeInTheDocument();
        expect(screen.getByText("Quinoa Buddha Bowl")).toBeInTheDocument();
      });
    });

    it("selects AI suggestion when clicked", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      fireEvent.click(screen.getByText("Get AI Suggestions"));

      // Wait for AI suggestions to load
      await waitFor(() => {
        expect(screen.getByText("Grilled Chicken Salad")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Grilled Chicken Salad"));

      // Wait for async API call to complete
      await waitFor(() => {
        expect(mockOnMealChange).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Grilled Chicken Salad",
            calories: 350,
          })
        );
      });
    });
  });

  // ============================================
  // FAVORITES TAB TESTS
  // ============================================
  describe("Favorites Tab", () => {
    it("fetches favorite meals when tab is opened", async () => {
      const { userAPI } = await import("@/services/api");
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(userAPI.getFavoritesByUserId).toHaveBeenCalledWith(
          "test_user_123"
        );
      });
    });

    it("shows loading state while fetching favorites", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      // Should show loading state initially
      expect(screen.getByText("Loading favorites...")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Favorites" })
      ).toBeInTheDocument();
    });

    it("displays favorite meals after loading", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(
          screen.getByText("Favorite Grilled Chicken")
        ).toBeInTheDocument();
        expect(screen.getByText("Favorite Salmon Bowl")).toBeInTheDocument();
      });
    });

    it("shows meal details in favorites list", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(screen.getByText("400 cal • 35g protein")).toBeInTheDocument();
        expect(screen.getByText("450 cal • 40g protein")).toBeInTheDocument();
      });
    });

    it("selects favorite meal when clicked", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(
          screen.getByText("Favorite Grilled Chicken")
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Favorite Grilled Chicken"));

      // Wait for async API call to complete
      await waitFor(() => {
        expect(mockOnMealChange).toHaveBeenCalledWith(
          expect.objectContaining({
            _id: "fav_meal_1",
            name: "Favorite Grilled Chicken",
          })
        );
      });
    });

    it("closes modal after selecting favorite", async () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(
          screen.getByText("Favorite Grilled Chicken")
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Favorite Grilled Chicken"));

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: "Change Meal" })
        ).not.toBeInTheDocument();
      });
    });

    it("shows empty state when no favorites", async () => {
      const { userAPI } = await import("@/services/api");
      vi.mocked(userAPI.getFavoritesByUserId).mockResolvedValueOnce({
        data: { favoriteMeals: [] as IMeal[] },
      } as any);

      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(screen.getByText("No favorite meals yet")).toBeInTheDocument();
        expect(
          screen.getByText("Like meals to add them to your favorites")
        ).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  describe("Edge Cases", () => {
    it("works without currentMeal prop", () => {
      const propsWithoutMeal = {
        mealType: "lunch",
        date: "2024-12-17",
        onMealChange: mockOnMealChange,
        children: <button>Add Meal</button>,
      };

      render(<ChangeMealModal {...propsWithoutMeal} />);
      fireEvent.click(screen.getByText("Add Meal"));

      // Should have empty/default values
      const nameInput = screen.getByPlaceholderText("E.g., Chicken Salad");
      expect(nameInput).toHaveValue("");
    });

    it("handles different meal types", () => {
      const dinnerProps = {
        ...defaultProps,
        currentMeal: mockDinner,
        mealType: "dinner",
      };

      render(<ChangeMealModal {...dinnerProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      const nameInput = screen.getByPlaceholderText("E.g., Chicken Salad");
      expect(nameInput).toHaveValue(mockDinner.name);
    });

    it("resets state when modal is reopened", async () => {
      render(<ChangeMealModal {...defaultProps} />);

      // Open and modify
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "AI Suggestion" }));

      // Close
      const closeButtons = screen.getAllByRole("button");
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector("svg.lucide-x")
      );
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      await waitFor(() => {
        expect(
          screen.queryByRole("heading", { name: "Change Meal" })
        ).not.toBeInTheDocument();
      });

      // Reopen
      fireEvent.click(screen.getByText("Change Meal"));

      // Should be back to Manual tab
      const manualTab = screen.getByRole("button", { name: "Manual" });
      expect(manualTab).toHaveClass("bg-white");
    });

    it("handles API error gracefully for favorites", async () => {
      const { userAPI } = await import("@/services/api");
      vi.mocked(userAPI.getFavoritesByUserId).mockRejectedValueOnce(
        new Error("Network error")
      );

      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));
      fireEvent.click(screen.getByRole("button", { name: "Favorites" }));

      await waitFor(() => {
        expect(screen.getByText("No favorite meals yet")).toBeInTheDocument();
      });
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  describe("Accessibility", () => {
    it("has accessible labels for all inputs", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      expect(screen.getByLabelText("Meal Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Calories")).toBeInTheDocument();
      expect(screen.getByLabelText("Carbs (g)")).toBeInTheDocument();
      expect(screen.getByLabelText("Fat (g)")).toBeInTheDocument();
      expect(screen.getByLabelText("Protein (g)")).toBeInTheDocument();
      expect(screen.getByLabelText("Prep Time (min)")).toBeInTheDocument();
    });

    it("modal has proper heading structure", () => {
      render(<ChangeMealModal {...defaultProps} />);
      fireEvent.click(screen.getByText("Change Meal"));

      expect(
        screen.getByRole("heading", { name: "Change Meal" })
      ).toBeInTheDocument();
    });
  });
});
