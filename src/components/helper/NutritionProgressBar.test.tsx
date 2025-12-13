import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import NutritionProgressBar from "./NutritionProgressBar";

describe("NutritionProgressBar", () => {
  const defaultProps = {
    label: "Calories",
    consumed: 1500,
    goal: 2000,
    unit: "kcal",
    color: "orange" as const,
  };

  it("renders label correctly", () => {
    render(<NutritionProgressBar {...defaultProps} />);
    expect(screen.getByText("Calories")).toBeInTheDocument();
  });

  it("renders consumed / goal with unit", () => {
    render(<NutritionProgressBar {...defaultProps} />);
    expect(screen.getByText("1500 / 2000 kcal")).toBeInTheDocument();
  });

  it("displays percentage badge", () => {
    render(<NutritionProgressBar {...defaultProps} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("calculates correct percentage width", () => {
    const { container } = render(<NutritionProgressBar {...defaultProps} />);
    const progressBar = container.querySelector(".bg-orange-500");
    expect(progressBar).toHaveStyle({ width: "75%" });
  });

  it("caps bar at 100% but shows actual percentage when consumed exceeds goal", () => {
    const { container } = render(
      <NutritionProgressBar {...defaultProps} consumed={2500} goal={2000} />
    );
    // Bar should be capped at 100%
    const progressBar = container.querySelector(".bg-orange-500");
    expect(progressBar).toHaveStyle({ width: "100%" });
    // But percentage should show actual value (125%)
    expect(screen.getByText("125%")).toBeInTheDocument();
  });

  it("shows percentage in red when over 100%", () => {
    render(
      <NutritionProgressBar {...defaultProps} consumed={2500} goal={2000} />
    );
    const percentageBadge = screen.getByText("125%");
    expect(percentageBadge).toHaveClass("text-red-600");
  });

  it("shows percentage in gray when under 100%", () => {
    render(<NutritionProgressBar {...defaultProps} />);
    const percentageBadge = screen.getByText("75%");
    expect(percentageBadge).toHaveClass("text-gray-600");
  });

  it("handles zero goal without crashing", () => {
    const { container } = render(
      <NutritionProgressBar {...defaultProps} consumed={0} goal={0} />
    );
    const progressBar = container.querySelector(".bg-orange-500");
    expect(progressBar).toHaveStyle({ width: "0%" });
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("can hide percentage badge", () => {
    render(<NutritionProgressBar {...defaultProps} showPercentage={false} />);
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  it("renders different colors correctly", () => {
    const colors = [
      "orange",
      "purple",
      "blue",
      "red",
      "green",
      "teal",
    ] as const;

    colors.forEach((color) => {
      const { container } = render(
        <NutritionProgressBar {...defaultProps} color={color} />
      );
      const colorClass = `bg-${color}-${color === "purple" ? "400" : "500"}`;
      expect(container.querySelector(`.${colorClass}`)).toBeInTheDocument();
    });
  });

  it("renders protein progress correctly", () => {
    render(
      <NutritionProgressBar
        label="Proteins"
        consumed={75}
        goal={150}
        unit="g"
        color="purple"
      />
    );
    expect(screen.getByText("Proteins")).toBeInTheDocument();
    expect(screen.getByText("75 / 150 g")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("renders fat progress correctly", () => {
    render(
      <NutritionProgressBar
        label="Fats"
        consumed={30}
        goal={65}
        unit="g"
        color="blue"
      />
    );
    expect(screen.getByText("Fats")).toBeInTheDocument();
    expect(screen.getByText("30 / 65 g")).toBeInTheDocument();
    expect(screen.getByText("46%")).toBeInTheDocument();
  });

  it("renders carbs progress correctly", () => {
    render(
      <NutritionProgressBar
        label="Carbs"
        consumed={150}
        goal={220}
        unit="g"
        color="red"
      />
    );
    expect(screen.getByText("Carbs")).toBeInTheDocument();
    expect(screen.getByText("150 / 220 g")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
  });
});
