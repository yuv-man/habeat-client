import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Goal } from "@/components/goals/Goals";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import {
  getCachedData,
  setCachedData,
  DEFAULT_TTL,
} from "@/lib/cache";

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null; // Timestamp of last successful fetch
}

interface GoalsActions {
  fetchGoals: (userId: string) => Promise<void>;
  createGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateProgress: (
    goalId: string,
    value: number,
    date?: string
  ) => Promise<void>;
  markAchieved: (goalId: string) => Promise<void>;
  updateMilestone: (
    goalId: string,
    milestoneId: string,
    completed: boolean
  ) => Promise<void>;
  setGoals: (goals: Goal[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type GoalsStore = GoalsState & GoalsActions;

// Custom storage with TTL support for goals data
const createGoalsStorage = () => {
  return {
    getItem: (name: string): string | null => {
      try {
        const cached = getCachedData<GoalsState>(
          name,
          { ttl: DEFAULT_TTL.GOALS }
        );
        if (cached) {
          return JSON.stringify(cached);
        }
        return null;
      } catch (error) {
        console.error("Error reading goals cache:", error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        const state: GoalsState = JSON.parse(value);
        setCachedData(
          name,
          {
            ...state,
            lastFetchTime: Date.now(),
          },
          DEFAULT_TTL.GOALS
        );
      } catch (error) {
        console.error("Error setting goals cache:", error);
      }
    },
    removeItem: (name: string): void => {
      try {
        localStorage.removeItem(`cache_${name}`);
      } catch (error) {
        console.error("Error removing goals cache:", error);
      }
    },
  };
};

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      // State
      goals: [],
      loading: false,
      error: null,
      lastFetchTime: null,

      // Actions
      setGoals: (goals) => set({ goals }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchGoals: async (userId: string) => {
        if (config.testFrontend) {
          // Use mock data in test mode
          return;
        }

        const { goals: cachedGoals, lastFetchTime } = get();

        // Cache-first strategy: Use cached data if available and valid
        if (
          cachedGoals.length > 0 &&
          lastFetchTime &&
          Date.now() - lastFetchTime < DEFAULT_TTL.GOALS
        ) {
          // Cache is valid, use it immediately
          set({ loading: false, error: null });
          
          // Refresh in background if cache is getting stale (> 5 minutes old)
          if (Date.now() - lastFetchTime > 5 * 60 * 1000) {
            // Background refresh - don't set loading state
            userAPI
              .getGoals(userId)
              .then((response) => {
                const apiGoals = response.data || [];
                const mappedGoals: Goal[] = apiGoals.map((g: any) => ({
                  id: g._id || g.id,
                  title: g.title || "",
                  description: g.description || "",
                  current: g.current || 0,
                  target: g.target || 0,
                  unit: g.unit || "",
                  icon: g.icon || "workout",
                  status: g.achieved ? "achieved" : g.status || "in_progress",
                  startDate: g.startDate,
                  milestones: g.milestones,
                  progressHistory: g.progressHistory,
                }));
                set({
                  goals: mappedGoals,
                  lastFetchTime: Date.now(),
                });
              })
              .catch((error) => {
                // Silently fail background refresh - keep using cache
                console.warn("Background refresh failed, using cache:", error);
              });
          }
          return;
        }

        // No valid cache or force refresh - fetch from API
        try {
          set({ loading: true, error: null });
          const response = await userAPI.getGoals(userId);
          // API returns { success: true, data: [...goals] }
          const apiGoals = response.data || [];
          // Map API goals to component Goal format
          const mappedGoals: Goal[] = apiGoals.map((g: any) => ({
            id: g._id || g.id,
            title: g.title || "",
            description: g.description || "",
            current: g.current || 0,
            target: g.target || 0,
            unit: g.unit || "",
            icon: g.icon || "workout",
            status: g.achieved ? "achieved" : g.status || "in_progress",
            startDate: g.startDate,
            milestones: g.milestones,
            progressHistory: g.progressHistory,
          }));
          set({
            goals: mappedGoals,
            loading: false,
            lastFetchTime: Date.now(),
          });
        } catch (error: any) {
          // On error, try to use stale cache if available
          if (cachedGoals.length > 0) {
            console.warn("API fetch failed, using stale cache:", error);
            set({
              loading: false,
              error: null, // Don't show error if we have cache
            });
          } else {
            set({
              error: error.message || "Failed to fetch goals",
              loading: false,
            });
          }
        }
      },

      createGoal: async (goalData: Omit<Goal, "id">) => {
        const newGoal: Goal = {
          ...goalData,
          id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        if (config.testFrontend) {
          // Update local state in test mode
          set({ goals: [...get().goals, newGoal] });
          return;
        }

        try {
          // Send goal data to API (backend expects 'title')
          const apiGoalData = {
            title: goalData.title,
            description: goalData.description,
            target: goalData.target,
            current: goalData.current,
            unit: goalData.unit,
            achieved: goalData.status === "achieved",
            icon: goalData.icon,
            startDate: goalData.startDate,
            milestones: goalData.milestones,
            progressHistory: goalData.progressHistory,
          };
          const response = await userAPI.createGoal(apiGoalData);
          // Map API response back to frontend Goal format
          const apiGoal = response.data;
          const createdGoal: Goal = {
            id: apiGoal._id || newGoal.id,
            title: apiGoal.title || goalData.title,
            description: apiGoal.description || goalData.description,
            current: apiGoal.current || goalData.current,
            target: apiGoal.target || goalData.target,
            unit: apiGoal.unit || goalData.unit,
            icon: (apiGoal.icon as Goal["icon"]) || goalData.icon,
            status: apiGoal.achieved ? "achieved" : "in_progress",
            startDate: apiGoal.startDate || goalData.startDate,
            milestones: apiGoal.milestones || goalData.milestones,
            progressHistory:
              apiGoal.progressHistory || goalData.progressHistory,
          };
          set({ goals: [...get().goals, createdGoal] });
        } catch (error: any) {
          set({ error: error.message || "Failed to create goal" });
        }
      },

      updateGoal: async (goalId: string, updates: Partial<Goal>) => {
        if (config.testFrontend) {
          // Update local state in test mode
          const { goals } = get();
          set({
            goals: goals.map((goal) =>
              goal.id === goalId ? { ...goal, ...updates } : goal
            ),
          });
          return;
        }

        try {
          // Transform status to achieved for API
          const apiUpdates: Record<string, unknown> = { ...updates };
          if (updates.status !== undefined) {
            apiUpdates.achieved = updates.status === "achieved";
            delete apiUpdates.status;
          }
          await userAPI.updateGoal(goalId, apiUpdates);
          const { goals } = get();
          set({
            goals: goals.map((goal) =>
              goal.id === goalId ? { ...goal, ...updates } : goal
            ),
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to update goal" });
        }
      },

      deleteGoal: async (goalId: string) => {
        if (config.testFrontend) {
          // Update local state in test mode
          const { goals } = get();
          set({ goals: goals.filter((goal) => goal.id !== goalId) });
          return;
        }

        try {
          await userAPI.deleteGoal(goalId);
          const { goals } = get();
          set({ goals: goals.filter((goal) => goal.id !== goalId) });
        } catch (error: any) {
          set({ error: error.message || "Failed to delete goal" });
        }
      },

      updateProgress: async (goalId: string, value: number, date?: string) => {
        if (config.testFrontend) {
          // Update local state in test mode
          const { goals } = get();
          set({
            goals: goals.map((goal) =>
              goal.id === goalId ? { ...goal, current: value } : goal
            ),
          });
          return;
        }

        try {
          const response = await userAPI.addGoalProgress(goalId, value, date);
          const apiGoal = response.data;
          const { goals } = get();
          set({
            goals: goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    current: apiGoal.current || value,
                    progressHistory:
                      apiGoal.progressHistory || goal.progressHistory,
                  }
                : goal
            ),
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to update goal progress" });
        }
      },

      markAchieved: async (goalId: string) => {
        const { goals } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return;

        const newStatus: Goal["status"] =
          goal.status === "achieved" ? "in_progress" : "achieved";

        if (config.testFrontend) {
          // Update local state in test mode
          set({
            goals: goals.map((g) =>
              g.id === goalId ? { ...g, status: newStatus } : g
            ),
          });
          return;
        }

        try {
          await userAPI.updateGoal(goalId, {
            achieved: newStatus === "achieved",
          });
          set({
            goals: goals.map((g) =>
              g.id === goalId ? { ...g, status: newStatus } : g
            ),
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to mark goal as achieved" });
        }
      },

      // Update a milestone
      updateMilestone: async (
        goalId: string,
        milestoneId: string,
        completed: boolean
      ) => {
        // Helper function to calculate progress from milestones
        const calculateProgress = (milestones: any[]) => {
          if (!milestones || milestones.length === 0) return 0;
          const completedCount = milestones.filter((m) => m.completed).length;
          return Math.round((completedCount / milestones.length) * 100);
        };

        const { goals } = get();
        const goal = goals.find((g) => g.id === goalId);
        if (!goal) return;

        // Store original state for rollback
        const originalGoals = [...goals];

        // Optimistically update UI immediately
        const updatedMilestones = goal.milestones?.map((m) =>
          m.id === milestoneId ? { ...m, completed } : m
        ) || [];
        const newProgress = calculateProgress(updatedMilestones);
        
        set({
          goals: goals.map((g) => {
            if (g.id === goalId) {
              return {
                ...g,
                milestones: updatedMilestones,
                current: newProgress,
                status: newProgress === 100 ? "achieved" : g.status,
              };
            }
            return g;
          }),
        });

        if (config.testFrontend) {
          return;
        }

        // Update backend in background
        try {
          const response = await userAPI.updateMilestone(
            goalId,
            milestoneId,
            completed
          );
          const apiGoal = response.data;
          const { goals: currentGoals } = get();
          // Sync with server response
          set({
            goals: currentGoals.map((g) => {
              if (g.id === goalId) {
                const serverMilestones = apiGoal.milestones || g.milestones || [];
                const serverProgress = calculateProgress(serverMilestones);
                return {
                  ...g,
                  milestones: serverMilestones,
                  current: serverProgress,
                  status: serverProgress === 100 ? "achieved" : g.status,
                };
              }
              return g;
            }),
          });
        } catch (error: any) {
          // Rollback on error
          set({ goals: originalGoals });
          set({ error: error.message || "Failed to update milestone" });
          throw error;
        }
      },
    }),
    {
      name: "goals-storage",
      storage: createJSONStorage(() => createGoalsStorage()),
      partialize: (state) => ({
        goals: state.goals,
        lastFetchTime: state.lastFetchTime,
      }),
    }
  )
);
