import { describe, it, expect, vi, beforeEach } from "vitest";

const { capture, identify, optOut, optIn } = vi.hoisted(() => ({
  capture: vi.fn(),
  identify: vi.fn(),
  optOut: vi.fn(),
  optIn: vi.fn(),
}));
vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture,
    identify,
    reset: vi.fn(),
    opt_out_capturing: optOut,
    opt_in_capturing: optIn,
  },
}));

describe("analytics outside production", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_project");
  });

  it("never sends from a non-production build, even with a valid key", async () => {
    // Tests run as a development build: the guard must hold here.
    const analytics = await import("./analytics");
    analytics.trackEvent("meal_help_resolved", { outcome: "accepted" });
    analytics.identifyUser("user_1");
    expect(capture).not.toHaveBeenCalled();
    expect(identify).not.toHaveBeenCalled();
  });

  it("sends when explicitly enabled", async () => {
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
    const analytics = await import("./analytics");
    analytics.trackEvent("meal_help_resolved", { outcome: "accepted" });
    expect(capture).toHaveBeenCalledWith("meal_help_resolved", { outcome: "accepted" });
  });
});

describe("noteReturn", () => {
  const DAY = 86_400_000;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // The global setup stubs localStorage with no-ops; this needs a real one.
    const store = new Map<string, string>();
    vi.mocked(localStorage.getItem).mockImplementation((k: string) => store.get(k) ?? null);
    vi.mocked(localStorage.setItem).mockImplementation((k: string, v: string) => void store.set(k, v));
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_project");
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
  });

  it("reports a return after three or more days away, once", async () => {
    const { noteReturn } = await import("./analytics");
    const start = Date.UTC(2026, 9, 1);
    noteReturn(start);
    noteReturn(start + 4 * DAY);
    noteReturn(start + 4 * DAY + 1000);
    expect(capture).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith("returned_after_inactivity", { days_inactive: 4 });
  });

  it("stays quiet for a normal next-day visit and the very first visit", async () => {
    const { noteReturn } = await import("./analytics");
    const start = Date.UTC(2026, 9, 1);
    noteReturn(start);
    noteReturn(start + DAY);
    expect(capture).not.toHaveBeenCalled();
  });
});

describe("test accounts", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("VITE_POSTHOG_KEY", "phc_test_project");
    vi.stubEnv("VITE_ANALYTICS_ENABLED", "true");
  });

  it("sends nothing for an @example.com account, pageviews included", async () => {
    const analytics = await import("./analytics");
    analytics.identifyUser("user_qa", { email: "qa1@example.com" });
    analytics.trackEvent("meal_swapped");
    expect(identify).not.toHaveBeenCalled();
    expect(capture).not.toHaveBeenCalled();
    expect(optOut).toHaveBeenCalled();
  });

  it("sends again after a real user signs in on the same browser", async () => {
    const analytics = await import("./analytics");
    analytics.identifyUser("user_qa", { email: "qa1@example.com" });
    analytics.resetAnalyticsUser();
    analytics.identifyUser("user_1", { email: "jo@gmail.com" });
    analytics.trackEvent("meal_swapped");
    expect(optIn).toHaveBeenCalled();
    expect(identify).toHaveBeenCalledWith("user_1", { email: "jo@gmail.com" });
    expect(capture).toHaveBeenCalledWith("meal_swapped", {});
  });
});
