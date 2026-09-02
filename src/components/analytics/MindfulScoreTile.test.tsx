import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import MindfulScoreTile from "./MindfulScoreTile";

const trend = (...scores: number[]) =>
  scores.map((score, i) => ({ week: `W${i + 1}`, score }));

/** Every coordinate the sparkline emits, so a NaN can't slip through as a
 *  silently-unrendered path. */
const pathCoords = (container: HTMLElement): string[] => {
  const paths = Array.from(container.querySelectorAll("path"));
  return paths.map((p) => p.getAttribute("d") ?? "");
};

describe("MindfulScoreTile", () => {
  const base = {
    score: 72,
    mealsCheckedIn: 12,
    emotionalInstances: 3,
  };

  it("shows the score and its evidence", () => {
    render(<MindfulScoreTile {...base} trend={trend(60, 65, 70, 72)} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText(/12/)).toBeInTheDocument();
    expect(screen.getByText(/meals? you checked in on/)).toBeInTheDocument();
  });

  it("reports the change against the previous week", () => {
    render(<MindfulScoreTile {...base} trend={trend(60, 65)} />);
    expect(screen.getByText("+5 vs last week")).toBeInTheDocument();
  });

  it("reports a decline in words, not colour alone", () => {
    render(<MindfulScoreTile {...base} trend={trend(70, 62)} />);
    expect(screen.getByText("-8 vs last week")).toBeInTheDocument();
  });

  it("says level rather than +0 when nothing moved", () => {
    render(<MindfulScoreTile {...base} trend={trend(70, 70)} />);
    expect(screen.getByText("Level with last week")).toBeInTheDocument();
  });

  it("draws no trend and claims no delta from a single point", () => {
    const { container } = render(<MindfulScoreTile {...base} trend={trend(70)} />);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.queryByText(/vs last week/)).toBeNull();
  });

  it("survives an empty trend", () => {
    const { container } = render(<MindfulScoreTile {...base} trend={[]} />);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByText("72")).toBeInTheDocument();
  });

  it("does not divide by zero on a completely flat trend", () => {
    // min === max, so the naive span is 0. Every coordinate must stay finite.
    const { container } = render(
      <MindfulScoreTile {...base} trend={trend(70, 70, 70, 70)} />
    );
    const ds = pathCoords(container);
    expect(ds.length).toBeGreaterThan(0);
    ds.forEach((d) => {
      expect(d).not.toMatch(/NaN|Infinity/);
    });
  });

  it("keeps every plotted coordinate inside the viewBox", () => {
    const { container } = render(
      <MindfulScoreTile {...base} trend={trend(0, 100, 43, 78)} />
    );
    const svg = container.querySelector("svg")!;
    const [, , vbW, vbH] = svg.getAttribute("viewBox")!.split(" ").map(Number);

    Array.from(svg.querySelectorAll("circle")).forEach((c) => {
      const cx = Number(c.getAttribute("cx"));
      const cy = Number(c.getAttribute("cy"));
      // The mark's own radius counts — a centre inside the box with the dot
      // hanging over the edge is still a clipped dot.
      const r =
        Number(c.getAttribute("r")) + Number(c.getAttribute("stroke-width") ?? 0);

      expect(Number.isFinite(cx)).toBe(true);
      expect(Number.isFinite(cy)).toBe(true);
      expect(cx - r).toBeGreaterThanOrEqual(0);
      expect(cx + r).toBeLessThanOrEqual(vbW);
      expect(cy - r).toBeGreaterThanOrEqual(0);
      expect(cy + r).toBeLessThanOrEqual(vbH);
    });
  });

  it("labels the chart for screen readers instead of relying on the marks", () => {
    render(<MindfulScoreTile {...base} trend={trend(60, 65, 70, 72)} />);
    const chart = screen.getByRole("img");
    expect(chart).toHaveAttribute("aria-label", expect.stringContaining("60, 65, 70, 72"));
  });

  it("gives every point a hover title so values are reachable without a tooltip", () => {
    const { container } = render(
      <MindfulScoreTile {...base} trend={trend(60, 65, 70, 72)} />
    );
    const titles = Array.from(container.querySelectorAll("title")).map((t) => t.textContent);
    expect(titles).toEqual(["W1: 60", "W2: 65", "W3: 70", "W4: 72"]);
  });

  it("says so plainly when no meals were checked in on", () => {
    render(<MindfulScoreTile score={0} trend={[]} mealsCheckedIn={0} emotionalInstances={0} />);
    expect(screen.getByText("No meals checked in on yet this period.")).toBeInTheDocument();
  });
});
