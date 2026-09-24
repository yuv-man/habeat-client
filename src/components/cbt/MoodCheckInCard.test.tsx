import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { MoodCheckInCard, moodIndexOf } from "./MoodCheckInCard";

const REFLECTION_HEADING = "What shaped your eating today?";

describe("MoodCheckInCard", () => {
  const base = {
    firstName: "Test",
    onSelect: vi.fn(),
    onReflectionChange: vi.fn(),
    reflection: null,
  };

  it("offers the moods", () => {
    render(<MoodCheckInCard {...base} selectedIndex={null} />);
    expect(screen.getByLabelText("Calm")).toBeInTheDocument();
  });

  it("does not ask about eating before a mood is logged", () => {
    render(<MoodCheckInCard {...base} selectedIndex={null} showReflection />);
    expect(screen.queryByText(REFLECTION_HEADING)).toBeNull();
  });

  it("does not ask about eating when nothing has been eaten", () => {
    // The reported case: someone logs "calm" first thing in the morning. The
    // mood is saved and the card stops there.
    render(<MoodCheckInCard {...base} selectedIndex={1} showReflection={false} />);
    expect(screen.queryByText(REFLECTION_HEADING)).toBeNull();
  });

  it("stays quiet when the caller forgets to say", () => {
    // Absent prop must cost the reflection, never surface an unanswerable
    // question.
    render(<MoodCheckInCard {...base} selectedIndex={1} />);
    expect(screen.queryByText(REFLECTION_HEADING)).toBeNull();
  });

  it("asks once a mood is logged and there is eating to look back on", () => {
    render(<MoodCheckInCard {...base} selectedIndex={1} showReflection />);
    expect(screen.getByText(REFLECTION_HEADING)).toBeInTheDocument();
    expect(screen.getByText("Helped")).toBeInTheDocument();
    expect(screen.getByText("Got in the way")).toBeInTheDocument();
  });

  it("keeps Done off until something is picked", () => {
    render(<MoodCheckInCard {...base} selectedIndex={1} showReflection onReflectionClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Done" })).toBeDisabled();
  });

  it("closes with the answers on Done, says it's noted, and goes away", () => {
    const onReflectionClose = vi.fn();
    const answered = { easedBy: ["had-time" as const], hinderedBy: [] };
    const { rerender } = render(
      <MoodCheckInCard
        {...base}
        selectedIndex={1}
        showReflection
        reflection={answered}
        onReflectionClose={onReflectionClose}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onReflectionClose).toHaveBeenCalledWith(
      expect.objectContaining({ easedBy: ["had-time"], hinderedBy: [] })
    );

    // The screen marks it closed; the question is gone and the thanks shows.
    rerender(
      <MoodCheckInCard
        {...base}
        selectedIndex={1}
        showReflection
        reflection={{ ...answered, closedAt: "2026-09-23T12:00:00Z" }}
        onReflectionClose={onReflectionClose}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent("Noted — thanks");
  });

  it("closes without answers on Skip", () => {
    const onReflectionClose = vi.fn();
    render(<MoodCheckInCard {...base} selectedIndex={1} showReflection onReflectionClose={onReflectionClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onReflectionClose).toHaveBeenCalledWith(null);
  });

  it("does not come back once closed for the day", () => {
    render(
      <MoodCheckInCard
        {...base}
        selectedIndex={1}
        showReflection
        reflection={{ easedBy: [], hinderedBy: ["stress"], closedAt: "2026-09-23T12:00:00Z" }}
      />
    );
    expect(screen.queryByText(REFLECTION_HEADING)).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("stays quiet without a change handler to save through", () => {
    render(
      <MoodCheckInCard
        firstName="Test"
        onSelect={vi.fn()}
        selectedIndex={1}
        showReflection
      />
    );
    expect(screen.queryByText(REFLECTION_HEADING)).toBeNull();
  });
});

describe("moodIndexOf", () => {
  it("round-trips a logged mood back to its position", () => {
    const i = moodIndexOf("calm");
    expect(i).not.toBeNull();
    render(
      <MoodCheckInCard
        firstName="Test"
        onSelect={vi.fn()}
        selectedIndex={i}
      />
    );
    expect(screen.getByLabelText("Calm")).toHaveAttribute("aria-checked", "true");
  });

  it("returns null for a mood the card doesn't show", () => {
    // "angry" exists in MoodCategory but not in this card's row.
    expect(moodIndexOf("angry")).toBeNull();
  });
});
