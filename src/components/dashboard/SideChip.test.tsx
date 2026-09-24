import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@/test/test-utils";
import "@/lib/i18n";
import SideChip from "./SideChip";
import OwnDishNote from "./OwnDishNote";
import { mockLunch } from "@/test/mocks";
import { IMeal } from "@/types/interfaces";

const { getSideOptions, setMealSide, setPlan } = vi.hoisted(() => ({
  getSideOptions: vi.fn(),
  setMealSide: vi.fn(),
  setPlan: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  userAPI: { getSideOptions, setMealSide },
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: () => ({
    user: { _id: "tamir" },
    plan: { userMetrics: { targetCalories: 2803 } },
    setPlan,
  }),
}));

vi.mock("@/hooks/useShowMacros", () => ({ useShowMacros: () => true }));

const { fetchTodayProgress } = vi.hoisted(() => ({ fetchTodayProgress: vi.fn() }));
vi.mock("@/stores/progressStore", () => ({
  useProgressStore: { getState: () => ({ fetchTodayProgress }) },
}));

const side = {
  id: "potatoes+roasted-veg",
  name: "Roasted potatoes & Roasted vegetables",
  calories: 364,
  macros: { protein: 7, carbs: 56, fat: 12 },
  ingredients: [
    ["roasted potatoes", "250 g"],
    ["roasted vegetables", "150 g"],
  ] as [string, string][],
};

const schnitzel: IMeal = {
  ...mockLunch,
  name: "Chicken schnitzel",
  calories: 938,
  fromRepertoire: "dish-1",
  side,
};

const options = [
  { ...side, id: "rice+israeli-salad", name: "Rice & Israeli salad", calories: 389 },
  side,
  { ...side, id: "israeli-salad", name: "Israeli salad", calories: 140 },
];

describe("SideChip", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSideOptions.mockResolvedValue({ current: side.id, options });
    setMealSide.mockResolvedValue({ plan: { _id: "updated" } });
  });

  it("shows the side on the card, and opens the picker on tap", async () => {
    render(<SideChip meal={schnitzel} date="2026-09-24" mealType="lunch" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Change side: Roasted potatoes & Roasted vegetables" })
    );

    expect(await screen.findByText("Side for your Chicken schnitzel")).toBeInTheDocument();
    expect(getSideOptions).toHaveBeenCalledWith("tamir", "2026-09-24", "lunch");
    expect(await screen.findByRole("radio", { name: /Roasted potatoes/ })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("radio", { name: /No side/ })).toBeInTheDocument();
    expect(screen.getByText(/keep you on 2,803 kcal/)).toBeInTheDocument();
  });

  it("shows a short name on the chip, and the full one to screen readers", () => {
    render(<SideChip meal={schnitzel} date="2026-09-24" mealType="lunch" />);
    expect(screen.getByText("with Potatoes & veg")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change side: Roasted potatoes & Roasted vegetables" })
    ).toBeInTheDocument();
  });

  it("keeps the full name for a side saved before sides had ids", () => {
    const { id: _id, ...legacy } = side;
    render(<SideChip meal={{ ...schnitzel, side: legacy }} date="2026-09-24" mealType="lunch" />);
    expect(screen.getByText("with Roasted potatoes & Roasted vegetables")).toBeInTheDocument();
  });

  it("offers to add a side to any lunch or dinner, not only their own dishes", async () => {
    getSideOptions.mockResolvedValue({ current: null, options });
    render(<SideChip meal={mockLunch} date="2026-09-24" mealType="lunch" />);
    fireEvent.click(screen.getByRole("button", { name: "Add a side" }));
    expect(await screen.findByText(`Side for ${mockLunch.name}`)).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: /No side/ })).toHaveAttribute("aria-checked", "true");
  });

  it("saves the chosen side and takes the rebalanced plan", async () => {
    render(<SideChip meal={schnitzel} date="2026-01-05" mealType="lunch" />);
    fireEvent.click(screen.getByRole("button", { name: /Change side/ }));
    fireEvent.click(await screen.findByRole("radio", { name: /Rice & Israeli salad/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save side" }));
    });

    expect(setMealSide).toHaveBeenCalledWith("tamir", "2026-01-05", "lunch", "rice+israeli-salad");
    await waitFor(() => expect(setPlan).toHaveBeenCalledWith({ _id: "updated" }));
    // Not today, so the daily tracker's record is left alone.
    expect(fetchTodayProgress).not.toHaveBeenCalled();
  });

  it("refreshes the daily tracker when the meal is today's", async () => {
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    render(<SideChip meal={schnitzel} date={key} mealType="lunch" />);
    fireEvent.click(screen.getByRole("button", { name: /Change side/ }));
    fireEvent.click(await screen.findByRole("radio", { name: /Rice & Israeli salad/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save side" }));
    });
    await waitFor(() => expect(fetchTodayProgress).toHaveBeenCalledWith("tamir", true));
  });

  it("groups plates with a starch apart from vegetables alone", async () => {
    getSideOptions.mockResolvedValue({
      current: null,
      options: [
        side,
        { ...side, id: "green-beans", name: "Green beans", ingredients: [["green beans", "300 g", "Vegetables"]] },
      ],
    });
    render(<SideChip meal={schnitzel} date="2026-09-24" mealType="lunch" />);
    fireEvent.click(screen.getByRole("button", { name: /Change side/ }));
    expect(await screen.findByText("Starch & vegetables")).toBeInTheDocument();
    expect(screen.getByText("Vegetables only")).toBeInTheDocument();
  });

  it("sends null for no side", async () => {
    render(<SideChip meal={schnitzel} date="2026-09-24" mealType="lunch" />);
    fireEvent.click(screen.getByRole("button", { name: /Change side/ }));
    fireEvent.click(await screen.findByRole("radio", { name: /No side/ }));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save side" }));
    });
    expect(setMealSide).toHaveBeenCalledWith("tamir", "2026-09-24", "lunch", null);
  });

  it("only says what the side was on a past day or an eaten meal", () => {
    const { rerender } = render(
      <SideChip meal={schnitzel} date="2026-09-24" mealType="lunch" readOnly />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("with Potatoes & veg")).toBeInTheDocument();

    rerender(<SideChip meal={{ ...schnitzel, done: true }} date="2026-09-24" mealType="lunch" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    // Nothing to say about a past meal that had no side.
    rerender(<SideChip meal={mockLunch} date="2026-09-24" mealType="lunch" readOnly />);
    expect(screen.queryByText(/with /)).not.toBeInTheDocument();
  });

  it("is not offered on breakfast or snacks", () => {
    const { container } = render(
      <SideChip meal={mockLunch} date="2026-09-24" mealType="breakfast" />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("OwnDishNote", () => {
  it("says it is their dish, or which of their dishes a swap replaces", () => {
    const { rerender } = render(<OwnDishNote meal={schnitzel} />);
    expect(screen.getByText("Your dish")).toBeInTheDocument();
    rerender(<OwnDishNote meal={{ ...schnitzel, tuneLevel: 1, insteadOf: "Beef burger" }} />);
    expect(screen.getByText("A lighter take on your Beef burger")).toBeInTheDocument();
  });

  it("says nothing about a planned meal", () => {
    const { container } = render(<OwnDishNote meal={mockLunch} />);
    expect(container).toBeEmptyDOMElement();
  });
});
