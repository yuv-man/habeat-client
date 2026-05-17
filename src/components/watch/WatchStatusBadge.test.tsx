import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import WatchStatusBadge from "./WatchStatusBadge";
import { WatchSnapshot } from "@/services/watch/types";

vi.mock("@/stores/watchStore", () => ({
  useWatchStore: vi.fn(),
}));

import { useWatchStore } from "@/stores/watchStore";

const baseSnapshot: WatchSnapshot = {
  heartRate: 75,
  stressLevel: "low",
  sleepQuality: "good",
  sleepHours: 8,
  capturedAt: new Date(),
};

describe("WatchStatusBadge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when status is not granted", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: baseSnapshot, status: "idle" } as any);
    const { container } = render(<WatchStatusBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when snapshot is null", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: null, status: "granted" } as any);
    const { container } = render(<WatchStatusBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when all signals are normal", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: baseSnapshot, status: "granted" } as any);
    const { container } = render(<WatchStatusBadge />);
    expect(container.firstChild).toBeNull();
  });

  it("shows elevated stress badge when stress level is high", () => {
    const highStress: WatchSnapshot = { ...baseSnapshot, stressLevel: "high", heartRate: 82 };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: highStress, status: "granted" } as any);
    render(<WatchStatusBadge />);
    expect(screen.getByText("Elevated stress · 82bpm")).toBeInTheDocument();
  });

  it("shows elevated stress badge when sleep quality is poor", () => {
    const poorSleep: WatchSnapshot = { ...baseSnapshot, sleepQuality: "poor" };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: poorSleep, status: "granted" } as any);
    render(<WatchStatusBadge />);
    expect(screen.getByText(/Elevated stress/)).toBeInTheDocument();
  });

  it("shows moderate stress badge when stress level is moderate", () => {
    const moderate: WatchSnapshot = { ...baseSnapshot, stressLevel: "moderate", heartRate: 70 };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: moderate, status: "granted" } as any);
    render(<WatchStatusBadge />);
    expect(screen.getByText("Moderate stress · 70bpm")).toBeInTheDocument();
  });

  it("shows low sleep badge when only sleep is fair", () => {
    const fairSleep: WatchSnapshot = { ...baseSnapshot, sleepQuality: "fair", sleepHours: 6.5 };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: fairSleep, status: "granted" } as any);
    render(<WatchStatusBadge />);
    expect(screen.getByText("Low sleep · 6.5h")).toBeInTheDocument();
  });

  it("shows heart rate in badge when present", () => {
    const highStress: WatchSnapshot = { ...baseSnapshot, stressLevel: "high", heartRate: 95 };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: highStress, status: "granted" } as any);
    render(<WatchStatusBadge />);
    expect(screen.getByText("Elevated stress · 95bpm")).toBeInTheDocument();
  });

  it("omits bpm when heart rate is absent", () => {
    const noHR: WatchSnapshot = { ...baseSnapshot, stressLevel: "high", heartRate: undefined };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: noHR, status: "granted" } as any);
    render(<WatchStatusBadge />);
    expect(screen.getByText("Elevated stress")).toBeInTheDocument();
  });
});
