import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { userAPI } from "../services/api";
import { IEngagementStats, IEngagementResult, IBadge } from "../types/interfaces";

interface EngagementState {
  // Stats
  stats: IEngagementStats | null;
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Celebration state - habit-focused
  showCelebration: boolean;
  celebrationType: "milestone" | "badge" | "streak" | "habitScore" | null;
  celebrationData: {
    habitScore?: number;
    milestone?: {
      type: string;
      message: string;
    };
    badge?: IBadge;
    streak?: number;
  } | null;

  // Actions
  fetchStats: () => Promise<void>;
  handleEngagementResult: (result: IEngagementResult) => void;
  useStreakFreeze: () => Promise<{ success: boolean; message: string }>;
  dismissCelebration: () => void;
  clearError: () => void;
}

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

export const useEngagementStore = create<EngagementState>()(
  persist(
    (set, get) => ({
      stats: null,
      loading: false,
      error: null,
      lastFetchTime: null,
      showCelebration: false,
      celebrationType: null,
      celebrationData: null,

      fetchStats: async () => {
        const { lastFetchTime, stats } = get();
        const now = Date.now();

        // Return cached data if still valid
        if (stats && lastFetchTime && now - lastFetchTime < CACHE_TTL) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const response = await userAPI.getEngagementStats();
          set({
            stats: response.data,
            loading: false,
            lastFetchTime: now,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch engagement stats",
            loading: false,
          });
        }
      },

      handleEngagementResult: (result: IEngagementResult) => {
        const { stats } = get();

        // Update stats with new values (habit-focused)
        if (stats) {
          const updatedStats: IEngagementStats = {
            ...stats,
            habitScore: result.habitScore,
            streak: result.streak,
            badges: [...stats.badges, ...result.newBadges],
            // Legacy fields for backward compatibility
            xp: result.totalXp,
            level: result.level,
            xpProgress: {
              current: result.totalXp - Math.pow(result.level - 1, 2) * 100,
              required: Math.pow(result.level, 2) * 100 - Math.pow(result.level - 1, 2) * 100,
            },
          };
          set({ stats: updatedStats });
        }

        // Determine celebration type (priority: milestone > badge > streak milestone)
        // Habit-focused celebrations - no XP celebrations
        if (result.milestoneReached) {
          set({
            showCelebration: true,
            celebrationType: "milestone",
            celebrationData: {
              habitScore: result.habitScore,
              milestone: result.milestoneReached,
            },
          });
        } else if (result.newBadges.length > 0) {
          set({
            showCelebration: true,
            celebrationType: "badge",
            celebrationData: {
              habitScore: result.habitScore,
              badge: result.newBadges[0],
            },
          });
        } else if (result.streak > 0 && result.streak % 7 === 0) {
          // Celebrate streak milestones (7, 14, 21, etc.)
          set({
            showCelebration: true,
            celebrationType: "streak",
            celebrationData: {
              habitScore: result.habitScore,
              streak: result.streak,
            },
          });
        }
        // No celebration for regular activity - focus on meaningful milestones
      },

      useStreakFreeze: async () => {
        try {
          const response = await userAPI.useStreakFreeze();
          if (response.success) {
            // Update stats to reflect streak freeze used
            const { stats } = get();
            if (stats) {
              set({
                stats: {
                  ...stats,
                  streakFreezeAvailable: false,
                },
              });
            }
          }
          return response;
        } catch (error: any) {
          return { success: false, message: error.message };
        }
      },

      dismissCelebration: () => {
        set({
          showCelebration: false,
          celebrationType: null,
          celebrationData: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "habeat-engagement",
      partialize: (state) => ({
        stats: state.stats,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useEngagementStats = () => useEngagementStore((state) => state.stats);
export const useEngagementLoading = () => useEngagementStore((state) => state.loading);

// Habit-focused selectors
export const useHabitScore = () => useEngagementStore((state) => state.stats?.habitScore ?? 0);
export const useStreak = () => useEngagementStore((state) => state.stats?.streak ?? 0);
export const useWeeklyConsistency = () => useEngagementStore((state) => state.stats?.weeklyConsistency ?? 0);

// Use shallow comparison to prevent infinite loops when returning objects
export const useEngagementCelebration = () =>
  useEngagementStore(
    (state) => ({
      show: state.showCelebration,
      type: state.celebrationType,
      data: state.celebrationData,
    }),
    shallow
  );
