import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { PatternProgressList } from "./PatternProgressList";
import { IPatternProgress } from "@/types/interfaces";

const pattern = (over: Partial<IPatternProgress> = {}): IPatternProgress => ({
  patternId: "P09",
  name: "Skipping lunch",
  emoji: "🥪",
  trend: "steady",
  trendLabel: "About the same as when we started",
  isFocus: false,
  evidence: "Lunch was skipped on 4 of 7 days it was planned.",
  tips: ["Block 15 minutes for lunch in your calendar — treat it like a meeting."],
  since: null,
  ...over,
});

describe("PatternProgressList", () => {
  it("renders nothing when there is nothing to show", () => {
    const { container } = render(<PatternProgressList progress={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows which way each pattern is moving, in words not numbers", () => {
    render(
      <PatternProgressList
        progress={[
          pattern({ trend: "improving", trendLabel: "Happening less than when we started" }),
          pattern({
            patternId: "P04",
            name: "Late-night eating",
            trend: "resolved",
            trendLabel: "Hasn't shown up lately",
            evidence: null,
            tips: [],
          }),
        ]}
      />,
    );

    expect(screen.getByText("Easing")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Hasn't shown up lately")).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("folds tips away except on the pattern being worked on", () => {
    const tip = "Block 15 minutes for lunch in your calendar — treat it like a meeting.";
    const { unmount } = render(<PatternProgressList progress={[pattern()]} />);
    expect(screen.queryByText(tip)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /things to try/i }));
    expect(screen.getByText(tip)).toBeInTheDocument();
    unmount();

    render(<PatternProgressList progress={[pattern({ isFocus: true })]} />);
    expect(screen.getByText(tip)).toBeInTheDocument();
    expect(screen.getByText("Working on it")).toBeInTheDocument();
  });
});
