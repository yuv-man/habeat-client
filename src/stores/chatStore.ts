import { create } from "zustand";
import { userAPI } from "@/services/api";
import { useAuthStore } from "./authStore";

export interface ChatProposedAction {
  type: "meal_swap" | "workout_change" | "add_snack" | "none";
  payload: Record<string, unknown>;
  status: "pending" | "accepted" | "rejected";
  messageId?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  proposedAction?: ChatProposedAction;
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  hasPendingAction: boolean;
}

interface ChatActions {
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (
    message: string,
    context?: { currentScreen?: string; selectedDate?: string }
  ) => Promise<void>;
  acceptAction: (messageId: string) => Promise<void>;
  rejectAction: (messageId: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  clearChat: () => Promise<void>;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>()((set, get) => ({
  // State
  messages: [],
  isOpen: false,
  isLoading: false,
  error: null,
  hasPendingAction: false,

  // Actions
  setMessages: (messages) => {
    const hasPending = messages.some(
      (m) => m.proposedAction?.status === "pending"
    );
    set({ messages, hasPendingAction: hasPending });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchHistory: async () => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });
      const response = await userAPI.getChatHistory(userId);

      if (response.success && response.data?.messages) {
        const messages: ChatMessage[] = response.data.messages.map(
          (m: {
            _id: string;
            role: "user" | "assistant";
            content: string;
            timestamp: string;
            proposedAction?: ChatProposedAction;
          }) => ({
            id: m._id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            proposedAction: m.proposedAction,
          })
        );

        const hasPending = messages.some(
          (m) => m.proposedAction?.status === "pending"
        );

        set({
          messages,
          hasPendingAction: hasPending,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch chat",
        isLoading: false,
      });
    }
  },

  sendMessage: async (message, context) => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    // Add user message optimistically
    const tempUserMessage: ChatMessage = {
      id: `temp_user_${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await userAPI.sendChatMessage(userId, message, context);

      if (response.success && response.data) {
        const { response: aiResponse, proposedAction, messageId } = response.data;

        // Create assistant message
        const assistantMessage: ChatMessage = {
          id: messageId || `assistant_${Date.now()}`,
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString(),
          proposedAction: proposedAction
            ? {
                ...proposedAction,
                messageId,
              }
            : undefined,
        };

        const hasPending = proposedAction?.status === "pending";

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isLoading: false,
          hasPendingAction: hasPending || state.hasPendingAction,
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isLoading: false,
      });
    }
  },

  acceptAction: async (messageId) => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });

      const response = await userAPI.acceptChatAction(userId, messageId);

      if (response.success) {
        // Update the message status locally
        set((state) => {
          const updatedMessages = state.messages.map((m) => {
            if (m.id === messageId && m.proposedAction) {
              return {
                ...m,
                proposedAction: {
                  ...m.proposedAction,
                  status: "accepted" as const,
                },
              };
            }
            return m;
          });

          // Add confirmation message if provided
          if (response.data?.message) {
            const confirmMessage: ChatMessage = {
              id: `confirm_${Date.now()}`,
              role: "assistant",
              content: `Done! ${response.data.message}`,
              timestamp: new Date().toISOString(),
            };
            updatedMessages.push(confirmMessage);
          }

          const hasPending = updatedMessages.some(
            (m) => m.proposedAction?.status === "pending"
          );

          return {
            messages: updatedMessages,
            isLoading: false,
            hasPendingAction: hasPending,
          };
        });

        // Update the plan in auth store if returned
        if (response.data?.plan) {
          useAuthStore.getState().setPlan(response.data.plan);
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to accept action",
        isLoading: false,
      });
    }
  },

  rejectAction: async (messageId) => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });

      const response = await userAPI.rejectChatAction(userId, messageId);

      if (response.success) {
        // Update the message status locally
        set((state) => {
          const updatedMessages = state.messages.map((m) => {
            if (m.id === messageId && m.proposedAction) {
              return {
                ...m,
                proposedAction: {
                  ...m.proposedAction,
                  status: "rejected" as const,
                },
              };
            }
            return m;
          });

          const hasPending = updatedMessages.some(
            (m) => m.proposedAction?.status === "pending"
          );

          return {
            messages: updatedMessages,
            isLoading: false,
            hasPendingAction: hasPending,
          };
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to reject action",
        isLoading: false,
      });
    }
  },

  clearChat: async () => {
    const userId = useAuthStore.getState().user?._id;
    if (!userId) return;

    try {
      set({ isLoading: true, error: null });
      await userAPI.clearChatHistory(userId);
      set({
        messages: [],
        isLoading: false,
        hasPendingAction: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to clear chat",
        isLoading: false,
      });
    }
  },
}));
