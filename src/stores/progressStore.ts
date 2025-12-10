import { create } from "zustand";
import { IDailyProgress } from "@/types/interfaces";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import { mockDailyProgress } from "@/mocks/dailyProgressMock";

interface ProgressState {
  todayProgress: IDailyProgress | null;
  progressHistory: IDailyProgress[];
  loading: boolean;
  error: string | null;
}

interface ProgressActions {
  fetchTodayProgress: (userId: string) => Promise<void>;
  fetchProgressHistory: (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  updateDailyProgress: (
    userId: string,
    date: string,
    progress: Partial<IDailyProgress>
  ) => Promise<void>;
  completeMeal: (
    userId: string,
    date: string,
    mealType: string,
    mealId: string
  ) => Promise<void>;
  addWaterGlass: (userId: string, date: string) => Promise<void>;
  setTodayProgress: (progress: IDailyProgress | null) => void;
  setProgressHistory: (history: IDailyProgress[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ProgressStore = ProgressState & ProgressActions;

export const useProgressStore = create<ProgressStore>((set, get) => ({
  // State
  todayProgress: null,
  progressHistory: [],
  loading: false,
  error: null,

  // Actions
  setTodayProgress: (progress) => set({ todayProgress: progress }),
  setProgressHistory: (history) => set({ progressHistory: history }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchTodayProgress: async (userId: string) => {
    if (config.testFrontend) {
      // Use mock data in test mode
      set({ todayProgress: mockDailyProgress as IDailyProgress });
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = await userAPI.getTodayProgress(userId);
      set({
        todayProgress: response.data.progress,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch today's progress",
        loading: false,
      });
    }
  },

  fetchProgressHistory: async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    if (config.testFrontend) {
      // Use mock data in test mode
      return;
    }

    try {
      set({ loading: true, error: null });
      const response = await userAPI.getProgressHistory(
        userId,
        startDate,
        endDate
      );
      set({
        progressHistory: response.data.history || [],
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch progress history",
        loading: false,
      });
    }
  },

  updateDailyProgress: async (
    userId: string,
    date: string,
    progress: Partial<IDailyProgress>
  ) => {
    if (config.testFrontend) {
      // Update local state in test mode
      const { todayProgress } = get();
      if (todayProgress) {
        set({
          todayProgress: { ...todayProgress, ...progress } as IDailyProgress,
        });
      }
      return;
    }

    try {
      await userAPI.updateDailyProgress(userId, date, progress);
      const { todayProgress } = get();
      if (todayProgress) {
        set({
          todayProgress: { ...todayProgress, ...progress } as IDailyProgress,
        });
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to update daily progress" });
    }
  },

  completeMeal: async (
    userId: string,
    date: string,
    mealType: string,
    mealId: string
  ) => {
    if (config.testFrontend) {
      // Update local state in test mode
      const { todayProgress } = get();
      if (
        todayProgress &&
        todayProgress.meals[mealType as keyof typeof todayProgress.meals]
      ) {
        const meal = todayProgress.meals[
          mealType as keyof typeof todayProgress.meals
        ] as any;
        if (meal && meal._id === mealId) {
          meal.done = true;
          set({ todayProgress: { ...todayProgress } });
        }
      }
      return;
    }

    try {
      await userAPI.completeMeal(userId, date, mealType, mealId);
      const { todayProgress } = get();
      if (
        todayProgress &&
        todayProgress.meals[mealType as keyof typeof todayProgress.meals]
      ) {
        const meal = todayProgress.meals[
          mealType as keyof typeof todayProgress.meals
        ] as any;
        if (meal && meal._id === mealId) {
          meal.done = true;
          set({ todayProgress: { ...todayProgress } });
        }
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to complete meal" });
    }
  },

  addWaterGlass: async (userId: string, date: string) => {
    if (config.testFrontend) {
      // Update local state in test mode
      const { todayProgress } = get();
      if (
        todayProgress &&
        todayProgress.water.consumed < todayProgress.water.goal
      ) {
        set({
          todayProgress: {
            ...todayProgress,
            water: {
              ...todayProgress.water,
              consumed: todayProgress.water.consumed + 1,
            },
          },
        });
      }
      return;
    }

    try {
      const response = await userAPI.addWaterGlass(userId, date, 1);
      const progress = response.data.progress;
      const { todayProgress } = get();
      if (todayProgress) {
        set({
          todayProgress: {
            ...todayProgress,
            water: {
              ...todayProgress.water,
              consumed:
                progress.water?.consumed || todayProgress.water.consumed + 1,
            },
          },
        });
      }
    } catch (error: any) {
      set({ error: error.message || "Failed to add water glass" });
    }
  },
}));
