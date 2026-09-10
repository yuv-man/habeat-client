import { describe, it, expect, vi, beforeEach } from "vitest";

const getBrainFocus = vi.fn();

vi.mock("@/services/api", () => ({
  brainAPI: { getBrainFocus: (...a: any[]) => getBrainFocus(...a) },
}));

const { useBrainStore } = await import("./brainStore");

const focus = {
  patternId: "P04",
  patternName: "Late-night eating",
  stageLabel: "Getting to know it",
} as any;

beforeEach(() => {
  getBrainFocus.mockReset();
  useBrainStore.getState().reset();
});

describe("brainStore", () => {
  it("tells 'not asked yet' apart from 'nothing to work on'", async () => {
    // A screen that only checks `focus` renders its empty state on every first
    // paint, which reads as "you have no patterns" to someone who does.
    expect(useBrainStore.getState().loaded).toBe(false);
    expect(useBrainStore.getState().focus).toBeNull();

    getBrainFocus.mockResolvedValue({ data: null });
    await useBrainStore.getState().fetchFocus();

    expect(useBrainStore.getState().loaded).toBe(true);
    expect(useBrainStore.getState().focus).toBeNull();
  });

  it("stores the focus when the Brain has one", async () => {
    getBrainFocus.mockResolvedValue({ data: focus });
    await useBrainStore.getState().fetchFocus();

    expect(useBrainStore.getState().focus?.patternName).toBe("Late-night eating");
    expect(useBrainStore.getState().loaded).toBe(true);
  });

  it("serves a second caller from cache rather than refetching", async () => {
    getBrainFocus.mockResolvedValue({ data: focus });
    await useBrainStore.getState().fetchFocus();
    await useBrainStore.getState().fetchFocus();

    expect(getBrainFocus).toHaveBeenCalledTimes(1);
  });

  it("refetches when forced", async () => {
    getBrainFocus.mockResolvedValue({ data: focus });
    await useBrainStore.getState().fetchFocus();
    await useBrainStore.getState().fetchFocus(true);

    expect(getBrainFocus).toHaveBeenCalledTimes(2);
  });

  it("does not turn a failure into 'nothing to work on'", async () => {
    getBrainFocus.mockResolvedValue({ data: focus });
    await useBrainStore.getState().fetchFocus();

    getBrainFocus.mockRejectedValue(new Error("network down"));
    await useBrainStore.getState().fetchFocus(true);

    // The last good answer survives; the card does not blink to an empty state.
    expect(useBrainStore.getState().focus?.patternName).toBe("Late-night eating");
    expect(useBrainStore.getState().error).toBe("network down");
  });
});
