import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import WaterCard from "./WaterCard";

// Mock the assets
vi.mock("@/assets/add_circle.svg", () => ({ default: "add-circle.svg" }));
vi.mock("@/assets/water.svg", () => ({ default: "water.svg" }));

describe("WaterCard", () => {
  const defaultProps = {
    current: 4,
    goal: 8,
    onAddGlass: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders water title", () => {
    render(<WaterCard {...defaultProps} />);
    expect(screen.getByText("Water")).toBeInTheDocument();
  });

  it("displays daily goal", () => {
    render(<WaterCard {...defaultProps} />);
    expect(screen.getByText("8 daily glasses")).toBeInTheDocument();
  });

  it("calls onAddGlass when add button is clicked", () => {
    render(<WaterCard {...defaultProps} />);

    const addButton = screen.getByAltText("add circle");
    fireEvent.click(addButton.parentElement!);

    expect(defaultProps.onAddGlass).toHaveBeenCalledTimes(1);
  });

  it("shows progress towards goal", () => {
    render(<WaterCard {...defaultProps} />);
    // Progress bar should be rendered
    expect(screen.getByText(/4/)).toBeInTheDocument();
  });

  it("handles zero progress", () => {
    render(<WaterCard current={0} goal={8} onAddGlass={vi.fn()} />);
    expect(screen.getByText("8 daily glasses")).toBeInTheDocument();
  });

  it("handles goal reached", () => {
    render(<WaterCard current={8} goal={8} onAddGlass={vi.fn()} />);
    expect(screen.getByText("8 daily glasses")).toBeInTheDocument();
  });
});
