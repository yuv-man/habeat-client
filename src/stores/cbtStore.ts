import { create } from "zustand";
import { persist } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { cbtAPI } from "../services/api";
import {
  IMoodEntry,
  IThoughtEntry,
  ICBTExerciseCompletion,
  IMealMoodCorrelation,
  ICBTEngagementStats,
  IEmotionalEatingInsight,
  MoodLevel,
  MoodCategory,
  MoodTrigger,
  CBTExerciseType,
} from "../types/interfaces";

interface CBTState {
  // Mood tracking
  todayMoodEntries: IMoodEntry[];
  moodHistory: IMoodEntry[];

  // Thought journaling
  thoughtEntries: IThoughtEntry[];

  // Exercise tracking
  exerciseCompletions: ICBTExerciseCompletion[];

  // Meal-mood correlations
  mealMoodCorrelations: IMealMoodCorrelation[];

  // Emotional eating insights
  emotionalEatingInsight: IEmotionalEatingInsight | null;

  // Stats
  cbtStats: ICBTEngagementStats | null;

  // UI state
  loading: boolean;
  error: string | null;
  lastFetchTime: number | null;

  // Pending mood entry (for meal linking)
  pendingMealMoodLink: {
    mealId: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snacks";
    mealName: string;
    phase: "before" | "after";
  } | null;

  // Quick mood check-in modal state
  showMoodCheckIn: boolean;
}

interface CBTActions {
  // Mood actions
  logMood: (entry: Omit<IMoodEntry, "_id" | "userId" | "createdAt" | "updatedAt">) => Promise<IMoodEntry | null>;
  fetchTodayMoods: () => Promise<void>;
  fetchMoodHistory: (startDate: string, endDate: string) => Promise<void>;

  // Thought actions
  logThought: (entry: Omit<IThoughtEntry, "_id" | "userId" | "createdAt" | "updatedAt">) => Promise<IThoughtEntry | null>;
  fetchThoughts: (limit?: number) => Promise<void>;
  updateThought: (id: string, updates: Partial<IThoughtEntry>) => Promise<void>;

  // Exercise actions
  completeExercise: (completion: Omit<ICBTExerciseCompletion, "_id" | "userId" | "createdAt">) => Promise<ICBTExerciseCompletion | null>;
  fetchExerciseHistory: (limit?: number) => Promise<void>;

  // Meal-Mood correlation actions
  linkMoodToMeal: (correlation: Omit<IMealMoodCorrelation, "_id" | "userId" | "createdAt">) => Promise<void>;
  fetchMealMoodCorrelations: (limit?: number) => Promise<void>;
  fetchEmotionalEatingInsight: (period: "week" | "month") => Promise<void>;

  // Meal mood link flow
  startMealMoodLink: (mealId: string, mealType: "breakfast" | "lunch" | "dinner" | "snacks", mealName: string, phase: "before" | "after") => void;
  completeMealMoodLink: () => void;
  cancelMealMoodLink: () => void;

  // Stats
  fetchCBTStats: () => Promise<void>;

  // UI actions
  showMoodCheckInModal: () => void;
  hideMoodCheckInModal: () => void;

  // Utility
  clearError: () => void;
  resetStore: () => void;
}

type CBTStore = CBTState & CBTActions;

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

const initialState: CBTState = {
  todayMoodEntries: [],
  moodHistory: [],
  thoughtEntries: [],
  exerciseCompletions: [],
  mealMoodCorrelations: [],
  emotionalEatingInsight: null,
  cbtStats: null,
  loading: false,
  error: null,
  lastFetchTime: null,
  pendingMealMoodLink: null,
  showMoodCheckIn: false,
};

export const useCBTStore = create<CBTStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Mood Actions
      logMood: async (entry) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.logMood(entry);
          const newMood = response.data;

          // Add to today's moods
          set((state) => ({
            todayMoodEntries: [...state.todayMoodEntries, newMood],
            loading: false,
          }));

          return newMood;
        } catch (error: any) {
          set({
            error: error.message || "Failed to log mood",
            loading: false,
          });
          return null;
        }
      },

      fetchTodayMoods: async () => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getTodayMoods();
          set({
            todayMoodEntries: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch today's moods",
            loading: false,
          });
        }
      },

      fetchMoodHistory: async (startDate, endDate) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getMoodHistory(startDate, endDate);
          set({
            moodHistory: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch mood history",
            loading: false,
          });
        }
      },

      // Thought Actions
      logThought: async (entry) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.logThought(entry);
          const newThought = response.data;

          set((state) => ({
            thoughtEntries: [newThought, ...state.thoughtEntries],
            loading: false,
          }));

          return newThought;
        } catch (error: any) {
          set({
            error: error.message || "Failed to log thought",
            loading: false,
          });
          return null;
        }
      },

      fetchThoughts: async (limit = 20) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getThoughts(limit);
          const raw = response.data;
          const thoughtEntries = Array.isArray(raw) ? raw : (raw?.thoughts && Array.isArray(raw.thoughts) ? raw.thoughts : []);
          set({
            thoughtEntries,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch thoughts",
            loading: false,
          });
        }
      },

      updateThought: async (id, updates) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.updateThought(id, updates);
          const updatedThought = response.data;

          set((state) => {
            const entries = Array.isArray(state.thoughtEntries) ? state.thoughtEntries : [];
            return {
              thoughtEntries: entries.map((t) =>
                t._id === id ? updatedThought : t
              ),
              loading: false,
            };
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to update thought",
            loading: false,
          });
        }
      },

      // Exercise Actions
      completeExercise: async (completion) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.completeExercise(completion);
          const newCompletion = response.data;

          set((state) => ({
            exerciseCompletions: [newCompletion, ...state.exerciseCompletions],
            loading: false,
          }));

          return newCompletion;
        } catch (error: any) {
          set({
            error: error.message || "Failed to complete exercise",
            loading: false,
          });
          return null;
        }
      },

      fetchExerciseHistory: async (limit = 20) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getExerciseHistory(limit);
          set({
            exerciseCompletions: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch exercise history",
            loading: false,
          });
        }
      },

      // Meal-Mood Correlation Actions
      linkMoodToMeal: async (correlation) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.linkMoodToMeal(correlation);
          const newCorrelation = response.data;

          set((state) => ({
            mealMoodCorrelations: [newCorrelation, ...state.mealMoodCorrelations],
            loading: false,
            pendingMealMoodLink: null,
          }));
        } catch (error: any) {
          set({
            error: error.message || "Failed to link mood to meal",
            loading: false,
          });
        }
      },

      fetchMealMoodCorrelations: async (limit = 20) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getMealMoodHistory(limit);
          set({
            mealMoodCorrelations: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch meal-mood correlations",
            loading: false,
          });
        }
      },

      fetchEmotionalEatingInsight: async (period) => {
        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getEmotionalEatingInsights(period);
          set({
            emotionalEatingInsight: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch emotional eating insights",
            loading: false,
          });
        }
      },

      // Meal Mood Link Flow
      startMealMoodLink: (mealId, mealType, mealName, phase) => {
        set({
          pendingMealMoodLink: { mealId, mealType, mealName, phase },
          showMoodCheckIn: true,
        });
      },

      completeMealMoodLink: () => {
        set({
          pendingMealMoodLink: null,
          showMoodCheckIn: false,
        });
      },

      cancelMealMoodLink: () => {
        set({
          pendingMealMoodLink: null,
          showMoodCheckIn: false,
        });
      },

      // Stats
      fetchCBTStats: async () => {
        const { lastFetchTime, cbtStats } = get();
        const now = Date.now();

        // Return cached data if still valid
        if (cbtStats && lastFetchTime && now - lastFetchTime < CACHE_TTL) {
          return;
        }

        set({ loading: true, error: null });

        try {
          const response = await cbtAPI.getCBTStats();
          set({
            cbtStats: response.data,
            loading: false,
            lastFetchTime: now,
          });
        } catch (error: any) {
          set({
            error: error.message || "Failed to fetch CBT stats",
            loading: false,
          });
        }
      },

      // UI Actions
      showMoodCheckInModal: () => {
        set({ showMoodCheckIn: true });
      },

      hideMoodCheckInModal: () => {
        set({ showMoodCheckIn: false });
      },

      // Utility
      clearError: () => {
        set({ error: null });
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: "habeat-cbt",
      partialize: (state) => {
        const thoughtEntries = Array.isArray(state.thoughtEntries)
          ? state.thoughtEntries.slice(0, 10)
          : [];
        const exerciseCompletions = Array.isArray(state.exerciseCompletions)
          ? state.exerciseCompletions.slice(0, 10)
          : [];
        const todayMoodEntries = Array.isArray(state.todayMoodEntries)
          ? state.todayMoodEntries
          : [];
        return {
          todayMoodEntries,
          thoughtEntries,
          exerciseCompletions,
          cbtStats: state.cbtStats,
          lastFetchTime: state.lastFetchTime,
        };
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<CBTState> | undefined;
        if (!p) return current;
        return {
          ...current,
          todayMoodEntries: Array.isArray(p.todayMoodEntries) ? p.todayMoodEntries : [],
          thoughtEntries: Array.isArray(p.thoughtEntries) ? p.thoughtEntries : [],
          exerciseCompletions: Array.isArray(p.exerciseCompletions) ? p.exerciseCompletions : [],
          cbtStats: p.cbtStats ?? current.cbtStats,
          lastFetchTime: p.lastFetchTime ?? current.lastFetchTime,
        };
      },
    }
  )
);

// Selectors for optimized re-renders
export const useTodayMoods = () => useCBTStore((state) => state.todayMoodEntries);
export const useMoodHistory = () => useCBTStore((state) => state.moodHistory);
export const useThoughtEntries = () => useCBTStore((state) => state.thoughtEntries);
export const useExerciseCompletions = () => useCBTStore((state) => state.exerciseCompletions);
export const useMealMoodCorrelations = () => useCBTStore((state) => state.mealMoodCorrelations);
export const useEmotionalEatingInsight = () => useCBTStore((state) => state.emotionalEatingInsight);
export const useCBTStats = () => useCBTStore((state) => state.cbtStats);
export const useCBTLoading = () => useCBTStore((state) => state.loading);
export const useCBTError = () => useCBTStore((state) => state.error);

// Meal mood link selectors
export const usePendingMealMoodLink = () => useCBTStore((state) => state.pendingMealMoodLink);
export const useShowMoodCheckIn = () => useCBTStore((state) => state.showMoodCheckIn);

// Computed selectors
export const useTodayMoodCount = () => useCBTStore((state) => state.todayMoodEntries.length);
export const useLatestMood = () => useCBTStore((state) => state.todayMoodEntries[state.todayMoodEntries.length - 1] ?? null);

export const useMoodCheckInState = () =>
  useCBTStore(
    (state) => ({
      show: state.showMoodCheckIn,
      pendingLink: state.pendingMealMoodLink,
    }),
    shallow
  );
