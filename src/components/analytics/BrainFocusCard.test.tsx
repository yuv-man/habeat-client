import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { BrainFocusCard, BrainFocusPending } from "./BrainFocusCard";
import { IBrainFocus } from "@/types/interfaces";

const focus = (over: Partial<IBrainFocus> = {}): IBrainFocus => ({
  patternId: "P04",
  patternName: "Late-night eating",
  category: "timing",
  emoji: "🌙",
  stage: "awareness",
  stageLabel: "Getting to know it",
  stageIndex: 1,
  stageCount: 5,
  whatWeAreDoing:
    "We're not cutting anything out. Your dinners are built to be more filling.",
  goingWellIf: "You notice what tends to happen before a late meal.",
  evidence: ["5 meals or snacks were logged after 21:00, across 4 nights."],
  status: "active",
  improving: false,
  startedAt: null,
  confidence: "medium",
  ...over,
});

describe("BrainFocusCard", () => {
  it("leads with the habit being worked on", () => {
    render(<BrainFocusCard focus={focus()} />);

    expect(screen.getByText("What we're working on")).toBeInTheDocument();
    expect(screen.getByText("Late-night eating")).toBeInTheDocument();
  });

  it("shows the evidence before the plan", () => {
    // A claim about someone's life has to be answerable before it is acted on.
    const { container } = render(<BrainFocusCard focus={focus()} />);

    const text = container.textContent ?? "";
    expect(text.indexOf("What we noticed")).toBeGreaterThan(-1);
    expect(text.indexOf("What we noticed")).toBeLessThan(text.indexOf("So this week"));
  });

  it("quotes the evidence verbatim so the user can check it", () => {
    render(<BrainFocusCard focus={focus()} />);
    expect(
      screen.getByText(/5 meals or snacks were logged after 21:00/),
    ).toBeInTheDocument();
  });

  it("says what is being done and how the user will know", () => {
    render(<BrainFocusCard focus={focus()} />);

    expect(screen.getByText(/dinners are built to be more filling/)).toBeInTheDocument();
    expect(screen.getByText("Going well if")).toBeInTheDocument();
    expect(
      screen.getByText(/what tends to happen before a late meal/),
    ).toBeInTheDocument();
  });

  it("never shows the planner's own phrasing", () => {
    // `mealStrategy` and `successMetric` are written at a model. Leaking them
    // into the UI reads like being handed someone else's memo.
    const { container } = render(<BrainFocusCard focus={focus()} />);
    expect(container.textContent).not.toMatch(/Prioritize|Do not aggressively/i);
  });

  it("shows stage progress as discrete rungs, not a percentage", () => {
    render(<BrainFocusCard focus={focus({ stageIndex: 3, stageCount: 5 })} />);
    expect(screen.getByLabelText("Step 3 of 5")).toBeInTheDocument();
  });

  it("uses the plain-language stage label, never the internal vocabulary", () => {
    // "replacement" is precise about what the engine is doing, and also the
    // kind of word that makes someone feel like a case being managed.
    const { container } = render(
      <BrainFocusCard
        focus={focus({ stage: "replacement", stageLabel: "Trying something new" })}
      />,
    );

    expect(container.textContent).toContain("Trying something new");
    expect(container.textContent).not.toContain("replacement");
  });

  it("flags a pattern that is easing", () => {
    render(<BrainFocusCard focus={focus({ improving: true })} />);
    expect(screen.getByText("Easing")).toBeInTheDocument();
  });

  it("admits when the reading is still early", () => {
    render(<BrainFocusCard focus={focus({ confidence: "low" })} />);
    expect(screen.getByText(/early read/i)).toBeInTheDocument();
  });

  it("does not caveat a confident reading", () => {
    render(<BrainFocusCard focus={focus({ confidence: "high" })} />);
    expect(screen.queryByText(/early read/i)).not.toBeInTheDocument();
  });

  it("renders without evidence rather than showing an empty block", () => {
    render(<BrainFocusCard focus={focus({ evidence: [] })} />);
    expect(screen.queryByText("What we noticed")).not.toBeInTheDocument();
    expect(screen.getByText("Late-night eating")).toBeInTheDocument();
  });
});

describe("BrainFocusPending", () => {
  it("says it is still learning rather than showing a finding", () => {
    render(<BrainFocusPending />);

    expect(screen.getByText("Still getting to know you")).toBeInTheDocument();
    expect(screen.getByText(/one habit at a time/i)).toBeInTheDocument();
  });
});
