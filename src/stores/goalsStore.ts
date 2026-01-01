import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Goal } from "@/components/goals/Goals";
import { userAPI } from "@/services/api";
import config from "@/services/config";

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
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

export const useGoalsStore = create<GoalsStore>()(
  persist(
    (set, get) => ({
      // State
      goals: [],
      loading: false,
      error: null,

      // Actions
      setGoals: (goals) => set({ goals }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      fetchGoals: async (userId: string) => {
        if (config.testFrontend) {
          // Use mock data in test mode
          return;
        }

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
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch goals",
            loading: false,
          });
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
        if (config.testFrontend) {
          const { goals } = get();
          set({
            goals: goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    milestones: goal.milestones?.map((m) =>
                      m.id === milestoneId ? { ...m, completed } : m
                    ),
                  }
                : goal
            ),
          });
          return;
        }

        try {
          const response = await userAPI.updateMilestone(
            goalId,
            milestoneId,
            completed
          );
          const apiGoal = response.data;
          const { goals } = get();
          set({
            goals: goals.map((goal) =>
              goal.id === goalId
                ? {
                    ...goal,
                    milestones: apiGoal.milestones || goal.milestones,
                  }
                : goal
            ),
          });
        } catch (error: any) {
          set({ error: error.message || "Failed to update milestone" });
        }
      },
    }),
    {
      name: "goals-storage",
      partialize: (state) => ({
        goals: state.goals,
      }),
    }
  )
);
