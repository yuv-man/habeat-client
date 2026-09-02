import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/test-utils";
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
    expect(screen.getByText("Made it easier")).toBeInTheDocument();
    expect(screen.getByText("Made it harder")).toBeInTheDocument();
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
