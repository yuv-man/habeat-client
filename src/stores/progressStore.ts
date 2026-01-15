import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { IDailyProgress } from "@/types/interfaces";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import { mockDailyProgress } from "@/mocks/dailyProgressMock";
import {
  getCachedDataSync,
  setCachedDataSync,
  removeCachedDataSync,
  DEFAULT_TTL,
} from "@/lib/cache";

interface ProgressState {
  todayProgress: IDailyProgress | null;
  progressHistory: IDailyProgress[];
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null; // Timestamp of last successful fetch
  cachedDate: string | null; // Date string for which we have cached data
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

// Helper to get today's date string (YYYY-MM-DD)
const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Custom storage with TTL support for progress data
const createProgressStorage = () => {
  return {
    getItem: (name: string): string | null => {
      try {
        const cached = getCachedDataSync<ProgressState>(
          name,
          { ttl: DEFAULT_TTL.PROGRESS }
        );
        if (cached) {
          // Check if cached data is for today
          const today = getTodayDateString();
          if (cached.cachedDate === today && cached.todayProgress) {
            return JSON.stringify(cached);
          }
        }
        // Return null if cache expired or not for today
        return null;
      } catch (error) {
        console.error("Error reading progress cache:", error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        const state: ProgressState = JSON.parse(value);
        const today = getTodayDateString();
        setCachedDataSync(
          name,
          {
            ...state,
            cachedDate: today,
            lastFetchTime: Date.now(),
          },
          DEFAULT_TTL.PROGRESS
        );
      } catch (error) {
        console.error("Error setting progress cache:", error);
      }
    },
    removeItem: (name: string): void => {
      removeCachedDataSync(name);
    },
  };
};

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // State
      todayProgress: null,
      progressHistory: [],
      loading: false,
      error: null,
      lastFetchTime: null,
      cachedDate: null,

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

        const today = getTodayDateString();
        const { todayProgress, cachedDate, lastFetchTime } = get();

        // Cache-first strategy: Use cached data if available and valid
        if (
          todayProgress &&
          cachedDate === today &&
          lastFetchTime &&
          Date.now() - lastFetchTime < DEFAULT_TTL.PROGRESS
        ) {
          // Cache is valid, use it immediately
          set({ loading: false, error: null });
          
          // Refresh in background if cache is getting stale (> 1 minute old)
          if (Date.now() - lastFetchTime > 60 * 1000) {
            // Background refresh - don't set loading state
            userAPI
              .getTodayProgress(userId)
              .then((response) => {
                const currentState = get();
                // Only update if still on the same date
                if (currentState.cachedDate === today) {
                  set({
                    todayProgress: response.progress,
                    lastFetchTime: Date.now(),
                  });
                }
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
          const response = await userAPI.getTodayProgress(userId);
          set({
            todayProgress: response.progress,
            loading: false,
            lastFetchTime: Date.now(),
            cachedDate: today,
          });
        } catch (error: any) {
          // On error, try to use stale cache if available
          if (todayProgress && cachedDate === today) {
            console.warn("API fetch failed, using stale cache:", error);
            set({
              loading: false,
              error: null, // Don't show error if we have cache
            });
          } else {
            set({
              error: error.message || "Failed to fetch today's progress",
              loading: false,
            });
          }
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
    const { todayProgress } = get();
    if (!todayProgress) return;

    const mealData =
      todayProgress.meals[mealType as keyof typeof todayProgress.meals];
    if (!mealData) return;

    // Store original state for rollback (deep copy)
    const originalProgress = JSON.parse(JSON.stringify(todayProgress));

    // Helper to update nutrition values
    const updateNutrition = (meal: any, isCompleting: boolean) => {
      const multiplier = isCompleting ? 1 : -1;
      const calories = meal.calories || 0;
      const protein = meal.macros?.protein || 0;
      const fat = meal.macros?.fat || 0;
      const carbs = meal.macros?.carbs || 0;

      return {
        caloriesConsumed: Math.max(0, todayProgress.caloriesConsumed + (calories * multiplier)),
        protein: {
          ...todayProgress.protein,
          consumed: Math.max(0, todayProgress.protein.consumed + (protein * multiplier)),
        },
        fat: {
          ...todayProgress.fat,
          consumed: Math.max(0, todayProgress.fat.consumed + (fat * multiplier)),
        },
        carbs: {
          ...todayProgress.carbs,
          consumed: Math.max(0, todayProgress.carbs.consumed + (carbs * multiplier)),
        },
      };
    };

    // Optimistically update UI immediately
    if (mealType === "snacks" && Array.isArray(mealData)) {
      const snackIndex = mealData.findIndex(
        (snack: any) => snack._id === mealId
      );
      if (snackIndex !== -1) {
        const snack = mealData[snackIndex];
        const isCompleting = !snack.done;
        const nutritionUpdates = updateNutrition(snack, isCompleting);
        
        const updatedSnacks = [...mealData];
        updatedSnacks[snackIndex] = {
          ...updatedSnacks[snackIndex],
          done: isCompleting,
        };
        set({
          todayProgress: {
            ...todayProgress,
            ...nutritionUpdates,
            meals: {
              ...todayProgress.meals,
              snacks: updatedSnacks,
            },
          },
        });
      }
    } else {
      // Single meal (breakfast, lunch, dinner)
      const meal = mealData as any;
      if (meal && meal._id === mealId) {
        const isCompleting = !meal.done;
        const nutritionUpdates = updateNutrition(meal, isCompleting);
        
        set({
          todayProgress: {
            ...todayProgress,
            ...nutritionUpdates,
            meals: {
              ...todayProgress.meals,
              [mealType]: { ...meal, done: isCompleting },
            },
          },
        });
      }
    }

    if (config.testFrontend) {
      return;
    }

    // Update backend in background
    try {
      await userAPI.completeMeal(userId, date, mealType, mealId);
    } catch (error: any) {
      // Rollback on error
      set({ todayProgress: originalProgress });
      set({ error: error.message || "Failed to complete meal" });
      throw error;
    }
  },

  addWaterGlass: async (userId: string, date: string) => {
    const { todayProgress } = get();
    if (!todayProgress) return;

    // Store original state for rollback
    const originalProgress = { ...todayProgress };
    const originalWaterConsumed = todayProgress.water.consumed;

    // Optimistically update UI immediately
    if (todayProgress.water.consumed < todayProgress.water.goal) {
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

    if (config.testFrontend) {
      return;
    }

    // Update backend in background
    try {
      const response = await userAPI.addWaterGlass(userId, date, 1);
      const progress = response.data.progress;
      const { todayProgress: currentProgress } = get();
      if (currentProgress) {
        // Sync with server response
        set({
          todayProgress: {
            ...currentProgress,
            water: {
              ...currentProgress.water,
              consumed:
                progress.water?.consumed || currentProgress.water.consumed,
            },
          },
        });
      }
    } catch (error: any) {
      // Rollback on error
      set({ todayProgress: originalProgress });
      set({ error: error.message || "Failed to add water glass" });
      throw error;
    }
  },
    }),
    {
      name: "progress-storage",
      storage: createJSONStorage(() => createProgressStorage()),
      partialize: (state) => ({
        todayProgress: state.todayProgress,
        progressHistory: state.progressHistory,
        lastFetchTime: state.lastFetchTime,
        cachedDate: state.cachedDate,
      }),
    }
  )
);
