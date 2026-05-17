import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@/test/test-utils";
import WatchDataCard from "./WatchDataCard";
import { WatchSnapshot } from "@/services/watch/types";

const mockSnapshot: WatchSnapshot = {
  heartRate: 72,
  restingHeartRate: 65,
  stressLevel: "low",
  sleepHours: 7.5,
  sleepQuality: "good",
  stepCount: 8000,
  capturedAt: new Date(),
};

vi.mock("@/stores/watchStore", () => ({
  useWatchStore: vi.fn(),
}));

import { useWatchStore } from "@/stores/watchStore";

describe("WatchDataCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when status is not granted", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "idle" } as any);
    const { container } = render(<WatchDataCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when snapshot is null", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: null, status: "granted" } as any);
    const { container } = render(<WatchDataCard />);
    expect(container.firstChild).toBeNull();
  });

  it("renders card when status is granted and snapshot exists", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("Your body right now")).toBeInTheDocument();
  });

  it("displays heart rate in bpm", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("72 bpm")).toBeInTheDocument();
  });

  it("displays em dash when heart rate is missing", () => {
    const noHR: WatchSnapshot = { ...mockSnapshot, heartRate: undefined };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: noHR, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("displays HRV label as Normal for low stress", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("Normal")).toBeInTheDocument();
  });

  it("displays HRV label as Low for moderate stress", () => {
    const moderateStress: WatchSnapshot = { ...mockSnapshot, stressLevel: "moderate" };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: moderateStress, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("Low")).toBeInTheDocument();
  });

  it("displays HRV label as Very low for high stress", () => {
    const highStress: WatchSnapshot = { ...mockSnapshot, stressLevel: "high" };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: highStress, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("Very low")).toBeInTheDocument();
  });

  it("displays sleep hours", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("7.5h")).toBeInTheDocument();
  });

  it("formats step count with k suffix for thousands", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("8.0k")).toBeInTheDocument();
  });

  it("shows raw step count below 1000", () => {
    const lowSteps: WatchSnapshot = { ...mockSnapshot, stepCount: 500 };
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: lowSteps, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(screen.getByText("500")).toBeInTheDocument();
  });

  it("renders mindful eating score note", () => {
    vi.mocked(useWatchStore).mockReturnValue({ snapshot: mockSnapshot, status: "granted" } as any);
    render(<WatchDataCard />);
    expect(
      screen.getByText("These signals are factored into your mindful eating score today.")
    ).toBeInTheDocument();
  });
});
