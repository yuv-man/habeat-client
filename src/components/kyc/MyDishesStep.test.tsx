import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import MyDishesStep from "./MyDishesStep";
import { KYCData, CustomInputs, commonDishes } from "./types";

const kycData = (myDishes: string[] = []): KYCData =>
  ({
    dietType: "",
    dietaryRestrictions: [],
    weight: "60",
    height: "165",
    age: "28",
    gender: "female",
    workoutFrequency: 4,
    allergies: [],
    dislikes: [],
    foodPreferences: [],
    myDishes,
  }) as KYCData;

const customInputs: CustomInputs = { dish: "", allergy: "", dislike: "", foodPreference: "" };

describe("MyDishesStep", () => {
  const onToggleOption = vi.fn();
  const onAddCustomItem = vi.fn();
  const onSubmit = vi.fn();

  const props = {
    kycData: kycData(),
    customInputs,
    setCustomInputs: vi.fn(),
    loading: false,
    error: "",
    onSubmit,
    onToggleOption,
    onAddCustomItem,
    onBack: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it("offers everyday dishes to tap", () => {
    render(<MyDishesStep {...props} />);
    expect(screen.getByText(commonDishes[0])).toBeInTheDocument();
  });

  it("adds a dish the user taps to their own list", () => {
    render(<MyDishesStep {...props} />);
    fireEvent.click(screen.getByText("Shakshuka"));
    expect(onToggleOption).toHaveBeenCalledWith("myDishes", "Shakshuka");
  });

  it("shows which dishes are already chosen", () => {
    render(<MyDishesStep {...props} kycData={kycData(["Shakshuka"])} />);
    expect(screen.getByText("Shakshuka")).toHaveAttribute("aria-pressed", "true");
  });

  it("takes a dish that is not on the list", () => {
    render(<MyDishesStep {...props} customInputs={{ ...customInputs, dish: "Mum's chicken soup" }} />);
    // i18n is not initialised in tests, so components render translation keys.
    fireEvent.keyPress(screen.getByPlaceholderText("myDishes.placeholder"), {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });
    expect(onAddCustomItem).toHaveBeenCalledWith("myDishes", "dish");
  });

  it("lets someone move on without naming a dish", () => {
    render(<MyDishesStep {...props} />);
    const button = screen.getByText("myDishes.skip");
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows a typed dish so it can be removed again", () => {
    render(<MyDishesStep {...props} kycData={kycData(["Mum's chicken soup"])} />);
    fireEvent.click(screen.getByText(/Mum's chicken soup/));
    expect(onToggleOption).toHaveBeenCalledWith("myDishes", "Mum's chicken soup");
  });
});
