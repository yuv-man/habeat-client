import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { userAPI } from "../services/api";
import { IChallenge, IChallengeClaimResult } from "../types/interfaces";

interface ChallengeState {
  // Data
  challenges: IChallenge[];
  claimableChallenges: IChallenge[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Claim celebration state
  showClaimCelebration: boolean;
  claimedChallenge: IChallengeClaimResult | null;

  // Actions
  fetchChallenges: () => Promise<void>;
  fetchClaimableChallenges: () => Promise<void>;
  claimReward: (challengeId: string) => Promise<IChallengeClaimResult | null>;
  refreshChallenges: () => Promise<void>;
  dismissClaimCelebration: () => void;
  clearError: () => void;
}

// Cache TTL: 2 minutes (shorter since challenges update more frequently)
const CACHE_TTL = 2 * 60 * 1000;

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      challenges: [],
      claimableChallenges: [],
      loading: false,
      error: null,
      lastFetchTime: null,
      showClaimCelebration: false,
      claimedChallenge: null,

      fetchChallenges: async () => {
        const { lastFetchTime, challenges } = get();
        const now = Date.now();

        // Return cached data if still valid
        if (challenges.length > 0 && lastFetchTime && now - lastFetchTime < CACHE_TTL) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const response = await userAPI.getChallenges();
          set({
            challenges: response.data.challenges,
            loading: false,
            lastFetchTime: now,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch challenges",
            loading: false,
          });
        }
      },

      fetchClaimableChallenges: async () => {
        try {
          const response = await userAPI.getClaimableChallenges();
          set({ claimableChallenges: response.data.challenges });
        } catch (error: any) {
          console.error("Failed to fetch claimable challenges:", error);
        }
      },

      claimReward: async (challengeId: string) => {
        set({ loading: true, error: null });

        try {
          const response = await userAPI.claimChallengeReward(challengeId);
          const result = response.data;

          // Remove from claimable list
          const { claimableChallenges, challenges } = get();
          const updatedClaimable = claimableChallenges.filter(
            (c) => c._id !== challengeId
          );

          // Update the challenge status in the main list
          const updatedChallenges = challenges.map((c) =>
            c._id === challengeId ? { ...c, status: "claimed" as const } : c
          );

          set({
            claimableChallenges: updatedClaimable,
            challenges: updatedChallenges,
            loading: false,
            showClaimCelebration: true,
            claimedChallenge: result,
            lastFetchTime: null, // Force refresh on next fetch
          });

          return result;
        } catch (error: any) {
          set({
            error: error.message || "Failed to claim reward",
            loading: false,
          });
          return null;
        }
      },

      refreshChallenges: async () => {
        set({ loading: true, error: null });

        try {
          const response = await userAPI.refreshChallenges();
          set({
            challenges: response.data.challenges,
            loading: false,
            lastFetchTime: Date.now(),
          });

          // Also refresh claimable
          const claimableResponse = await userAPI.getClaimableChallenges();
          set({ claimableChallenges: claimableResponse.data.challenges });
        } catch (error: any) {
          set({
            error: error.message || "Failed to refresh challenges",
            loading: false,
          });
        }
      },

      dismissClaimCelebration: () => {
        set({
          showClaimCelebration: false,
          claimedChallenge: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "habeat-challenges",
      partialize: (state) => ({
        challenges: state.challenges,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useChallenges = () => useChallengeStore((state) => state.challenges);
export const useActiveChallenges = () =>
  useChallengeStore(
    (state) => state.challenges.filter((c) => c.status === "active"),
    (a, b) => {
      // Custom equality check: compare array lengths and IDs to prevent unnecessary re-renders
      if (a.length !== b.length) return false;
      return a.every((challenge, index) => challenge._id === b[index]?._id);
    }
  );
export const useClaimableChallenges = () =>
  useChallengeStore((state) => state.claimableChallenges);
export const useChallengeLoading = () => useChallengeStore((state) => state.loading);
// Use shallow comparison to prevent infinite loops when returning objects
export const useChallengeClaimCelebration = () =>
  useChallengeStore(
    (state) => ({
      show: state.showClaimCelebration,
      data: state.claimedChallenge,
    }),
    shallow
  );

// Helper to get challenge progress percentage
export const getChallengeProgress = (challenge: IChallenge): number => {
  if (challenge.target === 0) return 0;
  return Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
};

// Helper to get time remaining
export const getChallengeTimeRemaining = (challenge: IChallenge): string => {
  const endDate = new Date(challenge.endDate);
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours % 24}h left`;
  }
  return `${diffHours}h left`;
};

// Helper to get difficulty color
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "easy":
      return "text-green-500";
    case "medium":
      return "text-yellow-500";
    case "hard":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};
