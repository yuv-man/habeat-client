import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockAccept, mockSetPlan, mockFetchToday } = vi.hoisted(() => ({
  mockAccept: vi.fn(),
  mockSetPlan: vi.fn(),
  mockFetchToday: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/services/api", () => ({
  userAPI: { acceptChatAction: mockAccept },
}));
vi.mock("./authStore", () => ({
  useAuthStore: {
    getState: () => ({ user: { _id: "user_1" }, setPlan: mockSetPlan }),
  },
}));
vi.mock("./progressStore", () => ({
  useProgressStore: { getState: () => ({ fetchTodayProgress: mockFetchToday }) },
}));

import { useChatStore } from "./chatStore";

describe("chatStore.acceptAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useChatStore.setState({
      messages: [
        {
          id: "msg_1",
          role: "assistant",
          content: "Try this",
          timestamp: new Date().toISOString(),
          proposedAction: { type: "meal_swap", payload: {}, status: "pending" },
        },
      ],
    } as Partial<ReturnType<typeof useChatStore.getState>>);
  });

  it("re-reads today's progress after the swap is applied", async () => {
    // The server rewrites the day's progress when it applies a chat swap; the
    // client used to update only the plan, so Today showed the old meal.
    const plan = { _id: "plan_1" };
    mockAccept.mockResolvedValue({ success: true, data: { plan, message: "Swapped" } });

    await useChatStore.getState().acceptAction("msg_1");

    expect(mockSetPlan).toHaveBeenCalledWith(plan);
    expect(mockFetchToday).toHaveBeenCalledWith("user_1", true);
    expect(useChatStore.getState().messages[0].proposedAction?.status).toBe("accepted");
  });

  it("does not refresh when the server refuses the action", async () => {
    mockAccept.mockResolvedValue({ success: false });

    await useChatStore.getState().acceptAction("msg_1");

    expect(mockFetchToday).not.toHaveBeenCalled();
  });
});
