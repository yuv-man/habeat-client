import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The server nests every CBT payload one level deeper than the envelope —
 * `{ success, data: { insight } }`, not `{ success, data }`. The page-level
 * tests all mock the store, so a client that unwrapped only as far as `data`
 * type-checked, passed, and shipped: the Emotional Eating page received an
 * object with none of the fields it reads and quietly fell back to its
 * example patterns and a zero score. These tests pin the unwrapping itself.
 */

const get = vi.fn();

vi.mock("axios", () => {
  const instance = {
    get,
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: () => instance,
      isAxiosError: () => false,
    },
  };
});

const { cbtAPI } = await import("./api");

beforeEach(() => {
  get.mockReset();
});

describe("cbtAPI response unwrapping", () => {
  it("returns the insight itself, not the object wrapping it", async () => {
    const insight = { mindfulEatingScore: 72, patterns: [{ key: "late-night" }] };
    get.mockResolvedValue({ data: { success: true, data: { insight } } });

    const result = await cbtAPI.getEmotionalEatingInsights("week");

    expect(result.data).toEqual(insight);
    expect(result.data?.mindfulEatingScore).toBe(72);
  });

  it("returns meal-mood correlations as an array", async () => {
    const correlations = [{ _id: "a" }, { _id: "b" }];
    get.mockResolvedValue({ data: { success: true, data: { correlations } } });

    const result = await cbtAPI.getMealMoodHistory(20);

    expect(result.data).toEqual(correlations);
  });
});
