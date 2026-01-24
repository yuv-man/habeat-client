import { useState, useEffect, useRef, useMemo } from "react";
import "@/styles/dailyScreen.css";
import {
  GlassWater,
  Flame,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { IDailyProgress, WorkoutData, IMeal } from "@/types/interfaces";
import MealLoader from "../helper/MealLoader";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import MealCard from "./MealCard";
import { useProgressStore } from "@/stores/progressStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useEngagementStore } from "@/stores/engagementStore";
import { getWorkoutImageVite } from "@/lib/workoutImageHelper";
import { formatTime12Hour, formatDisplayDate } from "@/lib/dateUtils";
import FastingClock from "./FastingClock";
import NutritionProgressBar from "@/components/helper/NutritionProgressBar";
import { NutritionCircularProgressGrid } from "@/components/helper/NutritionCircularProgressGrid";
import { LevelUpCelebration } from "@/components/engagement";
import {
  ChallengesBanner,
  ChallengeClaimCelebration,
} from "@/components/challenges";
import { DeleteWorkoutModal } from "./DeleteWorkoutModal";
import { ExpiredPlanCard } from "./ExpiredPlanCard";

const DailyMealScreen = () => {
  const [currentDate] = useState(new Date());

  // Use selectors to prevent unnecessary re-renders
  const userId = useAuthStore((state) => state.user?._id);
  const user = useAuthStore((state) => state.user);
  const plan = useAuthStore((state) => state.plan);

  const todayProgress = useProgressStore((state) => state.todayProgress);
  const progressLoading = useProgressStore((state) => state.loading);
  const fetchTodayProgress = useProgressStore(
    (state) => state.fetchTodayProgress
  );
  const setTodayProgress = useProgressStore((state) => state.setTodayProgress);
  const addWaterGlassToStore = useProgressStore((state) => state.addWaterGlass);

  // Favorites store
  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  // Engagement store
  const fetchEngagementStats = useEngagementStore((state) => state.fetchStats);
  const engagementStats = useEngagementStore((state) => state.stats);
  const engagementLoading = useEngagementStore((state) => state.loading);

  // Check if plan is expired
  const isPlanExpired = useMemo(() => {
    if (!plan?.weeklyPlan) return false;

    const dates = Object.keys(plan.weeklyPlan).sort();
    if (dates.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the last (most recent) date in the plan
    const lastDateStr = dates[dates.length - 1];
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0, 0, 0, 0);

    // Plan is expired if the last date is before today
    return lastDate < today;
  }, [plan]);

  // Local state for UI updates (synced from store)
  const [dailyProgress, setDailyProgress] = useState<IDailyProgress | null>(
    null
  );

  // Delete confirmation state
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutData | null>(
    null
  );

  // Nutrition progress collapse state
  const [isNutritionExpanded, setIsNutritionExpanded] = useState(false);

  // Track if we've already fetched to prevent duplicate calls
  const hasFetchedRef = useRef(false);

  // Fetch progress, favorites, and engagement only once when user is available
  useEffect(() => {
    if (!userId || hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchTodayProgress(userId);
    fetchFavorites(userId);
    fetchEngagementStats();
  }, [userId, fetchTodayProgress, fetchFavorites, fetchEngagementStats]);

  // Fetch engagement stats on mount if not loaded
  useEffect(() => {
    if (!engagementStats && !engagementLoading) {
      fetchEngagementStats();
    }
  }, [engagementStats, engagementLoading, fetchEngagementStats]);

  // Sync store progress to local state
  useEffect(() => {
    if (todayProgress) {
      setDailyProgress(todayProgress);
    }
  }, [todayProgress]);
  // Use store's loading state
  const loading = progressLoading;

  // Get meal times from store
  const mealTimes = useAuthStore((state) => state.mealTimes);

  // Get meal time and format to 12-hour
  const getMealTime = (mealType: string) => {
    const time = mealTimes[mealType as keyof typeof mealTimes] || "12:00";
    return formatTime12Hour(time);
  };

  // Helper function to determine meal status
  const getMealStatus = (
    meal: IMeal,
    mealType: string
  ): "past" | "current" | "future" => {
    // Snacks can NEVER be current - they're always past or future
    if (mealType === "snacks") {
      if (meal.done) {
        return "past";
      }
      return "future";
    }

    // If meal is completed (eaten), it's past
    if (meal.done) {
      return "past";
    }

    // Use local time (getHours/getMinutes use local timezone)
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight (local time)

    // Get all meal times for comparison (breakfast, lunch, dinner only - snacks excluded)
    const breakfastTime = mealTimes.breakfast
      ? (() => {
          const [h, m] = mealTimes.breakfast.split(":").map(Number);
          return h * 60 + m;
        })()
      : 8 * 60; // 8:00 default
    const lunchTime = mealTimes.lunch
      ? (() => {
          const [h, m] = mealTimes.lunch.split(":").map(Number);
          return h * 60 + m;
        })()
      : 12 * 60 + 30; // 12:30 default
    const dinnerTime = mealTimes.dinner
      ? (() => {
          const [h, m] = mealTimes.dinner.split(":").map(Number);
          return h * 60 + m;
        })()
      : 19 * 60; // 19:00 default

    const midnight = 24 * 60; // 1440 minutes (midnight)

    // Check if previous meals are done (to determine if next meal should be current)
    const breakfastDone = dailyProgress?.meals?.breakfast?.done || false;
    const lunchDone = dailyProgress?.meals?.lunch?.done || false;

    // Helper to check if breakfast is past (done or past its window)
    const breakfastPast = breakfastDone || currentTime >= (lunchTime - 60);
    // Helper to check if lunch is past (done or past its window)
    const lunchPast = lunchDone || currentTime >= (dinnerTime - 60);

    // Determine if meal is current based on new rules:
    // Breakfast: current from breakfast time until done OR until 1 hour before lunch
    // Lunch: current from lunch time until done OR until 1 hour before dinner (or if breakfast is past)
    // Dinner: current from dinner time until done OR until midnight (or if lunch is past)
    if (mealType === "breakfast") {
      // Breakfast is not current before breakfast time
      if (currentTime < breakfastTime) {
        return "future";
      }
      // Breakfast is current until 1 hour before lunch
      const lunchTimeMinusOneHour = lunchTime - 60;
      if (currentTime < lunchTimeMinusOneHour) {
        return "current";
      }
      return "past";
    }

    if (mealType === "lunch") {
      // If breakfast is past, lunch becomes current immediately
      if (breakfastPast) {
        // Lunch is current until 1 hour before dinner
        const dinnerTimeMinusOneHour = dinnerTime - 60;
        if (currentTime < dinnerTimeMinusOneHour) {
          return "current";
        }
        return "past";
      }
      // Normal time-based logic
      if (currentTime < lunchTime) {
        return "future";
      }
      // Lunch is current until 1 hour before dinner
      const dinnerTimeMinusOneHour = dinnerTime - 60;
      if (currentTime < dinnerTimeMinusOneHour) {
        return "current";
      }
      return "past";
    }

    if (mealType === "dinner") {
      // If lunch is past, dinner becomes current immediately
      if (lunchPast) {
        // Dinner is current until midnight
        if (currentTime < midnight) {
          return "current";
        }
        return "past";
      }
      // Normal time-based logic
      if (currentTime < dinnerTime) {
        return "future";
      }
      // Dinner is current until midnight
      if (currentTime < midnight) {
        return "current";
      }
      return "past";
    }

    // Default to future for unknown meal types
    return "future";
  };

  const addWaterGlass = async () => {
    if (user?._id) {
      await addWaterGlassToStore(user._id, currentDate.toISOString());
    }
  };

  const handleDeleteWorkout = async (workout: WorkoutData) => {
    if (!user?._id || !dailyProgress) return;

    try {
      const workoutData: WorkoutData = {
        name: workout.name,
        category: workout.category,
        caloriesBurned: workout.caloriesBurned,
        duration: workout.duration,
      };

      const updatedWorkouts = dailyProgress.workouts.filter(
        (w) => w.name !== workout.name
      );
      const updatedProgress = {
        ...dailyProgress,
        workouts: updatedWorkouts,
      };

      if (config.testFrontend) {
        // Update store in test mode
        setTodayProgress(updatedProgress);
        return;
      }

      await userAPI.deleteWorkout(
        user._id,
        currentDate.toISOString().split("T")[0],
        workoutData
      );

      // Update store (which syncs to local state)
      setTodayProgress(updatedProgress);
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const handleCompleteWorkout = async (workoutIndex: number) => {
    if (!user?._id || !dailyProgress) return;

    const workout = dailyProgress.workouts[workoutIndex];
    if (!workout) return;

    const newDoneState = !(workout.done ?? false);
    const workoutData: WorkoutData = {
      name: workout.name,
      category: workout.category,
      caloriesBurned: workout.caloriesBurned,
      duration: workout.duration,
      done: newDoneState,
    };

    // Store original state for rollback
    const originalProgress = { ...dailyProgress };

    // Optimistically update UI immediately
    const updatedWorkouts = [...dailyProgress.workouts];
    updatedWorkouts[workoutIndex] = { ...workout, done: newDoneState };
    const updatedProgress = {
      ...dailyProgress,
      workouts: updatedWorkouts,
    };

    setTodayProgress(updatedProgress);

    // Show encouraging toast when workout is completed
    if (newDoneState) {
      toast.success("💪 Well done! Keep crushing it!", {
        duration: 3000,
      });
    }

    if (config.testFrontend) {
      return;
    }

    // Update backend in background
    try {
      await userAPI.completeWorkout(
        user._id,
        currentDate.toISOString(),
        workoutData
      );
    } catch (error) {
      console.error("Failed to complete workout:", error);
      // Rollback on error
      setTodayProgress(originalProgress);
      toast.error("Failed to update workout. Please try again.");
    }
  };

  // Get last date from plan for expired message
  const getExpiredDateInfo = () => {
    if (!plan?.weeklyPlan) return null;
    const dates = Object.keys(plan.weeklyPlan).sort();
    if (dates.length === 0) return null;
    const lastDate = dates[dates.length - 1];
    return formatDisplayDate(lastDate);
  };

  return (
    <>
      {/* Level Up Celebration */}
      <LevelUpCelebration />

      {/* Challenge Claim Celebration */}
      <ChallengeClaimCelebration />

      {/* Delete Workout Confirmation Modal */}
      {workoutToDelete && (
        <DeleteWorkoutModal
          workout={workoutToDelete}
          onCancel={() => setWorkoutToDelete(null)}
          onConfirm={(workout) => {
            handleDeleteWorkout(workout);
            setWorkoutToDelete(null);
          }}
        />
      )}

      <div className="min-h-screen bg-white">
        {loading ? (
          <MealLoader />
        ) : isPlanExpired ? (
          <ExpiredPlanCard expiredDate={getExpiredDateInfo()} />
        ) : !dailyProgress ? (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6">
            <p className="text-xl font-semibold text-gray-700 text-center">
              No Daily Progress Available
            </p>
            <p className="text-gray-500 text-center">
              Your daily progress information will appear here once available.
            </p>
          </div>
        ) : (
          <div className="px-4 py-6">
            {/* Title with Streak */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">
                Daily Tracker
              </h1>
              {engagementStats && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-gray-900">
                    Day {engagementStats.streak || 0}
                  </span>
                  <Flame className="w-4 h-4 text-orange-500" />
                </div>
              )}
            </div>

            {/* Daily Challenges Banner */}
            <ChallengesBanner className="mb-2" />

            {/* Fasting Clock */}
            {user?.fastingHours && user?.fastingStartTime && (
              <FastingClock
                fastingHours={user.fastingHours}
                fastingStartTime={user.fastingStartTime}
              />
            )}

            {/* Daily Nutrition Progress */}
            <div className="mb-2 bg-white rounded-lg shadow-sm border border-gray-100">
              <button
                onClick={() => setIsNutritionExpanded(!isNutritionExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-base font-semibold text-gray-900">
                  Daily Nutrition Progress
                </h2>
                {isNutritionExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {isNutritionExpanded ? (
                <div className="px-3 pb-3 space-y-2">
                  <NutritionProgressBar
                    label="Calories"
                    consumed={dailyProgress.caloriesConsumed}
                    goal={dailyProgress.caloriesGoal}
                    unit="kcal"
                    color="orange"
                  />
                  <NutritionProgressBar
                    label="Proteins"
                    consumed={dailyProgress.protein.consumed}
                    goal={dailyProgress.protein.goal}
                    unit="g"
                    color="purple"
                  />
                  <NutritionProgressBar
                    label="Fats"
                    consumed={dailyProgress.fat.consumed}
                    goal={dailyProgress.fat.goal}
                    unit="g"
                    color="blue"
                  />
                  <NutritionProgressBar
                    label="Carbs"
                    consumed={dailyProgress.carbs.consumed}
                    goal={dailyProgress.carbs.goal}
                    unit="g"
                    color="red"
                  />
                </div>
              ) : (
                <div className="px-3 pb-3">
                  <NutritionCircularProgressGrid
                    items={[
                      {
                        label: "Calories",
                        consumed: dailyProgress.caloriesConsumed,
                        goal: dailyProgress.caloriesGoal,
                        color: "#f97316",
                      },
                      {
                        label: "Protein",
                        consumed: dailyProgress.protein.consumed,
                        goal: dailyProgress.protein.goal,
                        unit: "g",
                        color: "#a855f7",
                      },
                      {
                        label: "Fats",
                        consumed: dailyProgress.fat.consumed,
                        goal: dailyProgress.fat.goal,
                        unit: "g",
                        color: "#3b82f6",
                      },
                      {
                        label: "Carbs",
                        consumed: dailyProgress.carbs.consumed,
                        goal: dailyProgress.carbs.goal,
                        unit: "g",
                        color: "#ef4444",
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* Today's Meals */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Today's Meals
              </h2>
              <div className="space-y-0 flex flex-col gap-3">
                {/* Breakfast */}
                {dailyProgress.meals.breakfast && (
                  <MealCard
                    meal={dailyProgress.meals.breakfast}
                    mealType="breakfast"
                    mealTime={getMealTime("breakfast")}
                    date={dailyProgress.date}
                    mealStatus={getMealStatus(
                      dailyProgress.meals.breakfast,
                      "breakfast"
                    )}
                    onMealChange={(newMeal) => {
                      // Update breakfast in progress
                      const updatedProgress = {
                        ...dailyProgress,
                        meals: { ...dailyProgress.meals, breakfast: newMeal },
                      };
                      setTodayProgress(updatedProgress);
                    }}
                  />
                )}

                {/* Lunch */}
                {dailyProgress.meals.lunch && (
                  <MealCard
                    meal={dailyProgress.meals.lunch}
                    mealType="lunch"
                    mealTime={getMealTime("lunch")}
                    date={dailyProgress.date}
                    mealStatus={getMealStatus(
                      dailyProgress.meals.lunch,
                      "lunch"
                    )}
                    onMealChange={(newMeal) => {
                      // Update lunch in progress
                      const updatedProgress = {
                        ...dailyProgress,
                        meals: { ...dailyProgress.meals, lunch: newMeal },
                      };
                      setTodayProgress(updatedProgress);
                    }}
                  />
                )}

                {/* Dinner */}
                {dailyProgress.meals.dinner && (
                  <MealCard
                    meal={dailyProgress.meals.dinner}
                    mealType="dinner"
                    mealTime={getMealTime("dinner")}
                    date={dailyProgress.date}
                    mealStatus={getMealStatus(
                      dailyProgress.meals.dinner,
                      "dinner"
                    )}
                    onMealChange={(newMeal) => {
                      // Update dinner in progress
                      const updatedProgress = {
                        ...dailyProgress,
                        meals: { ...dailyProgress.meals, dinner: newMeal },
                      };
                      setTodayProgress(updatedProgress);
                    }}
                  />
                )}

                {/* Snacks */}
                {dailyProgress.meals.snacks &&
                  dailyProgress.meals.snacks.length > 0 &&
                  dailyProgress.meals.snacks.map((snack, index) => (
                    <MealCard
                      key={snack._id || index}
                      meal={snack}
                      mealType="snacks"
                      mealTime={getMealTime("snacks")}
                      date={dailyProgress.date}
                      snackIndex={index}
                      isSnack={true}
                      onMealChange={(newMeal) => {
                        // Update snack at index
                        const updatedSnacks = [...dailyProgress.meals.snacks];
                        updatedSnacks[index] = newMeal;
                        const updatedProgress = {
                          ...dailyProgress,
                          meals: {
                            ...dailyProgress.meals,
                            snacks: updatedSnacks,
                          },
                        };
                        setTodayProgress(updatedProgress);
                      }}
                    />
                  ))}
              </div>
            </div>

            {/* Today's Workouts */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Today's Workouts
              </h2>
              <div className="space-y-0">
                {(() => {
                  // Filter out rest day entries and check if there are actual workouts
                  const actualWorkouts = dailyProgress.workouts.filter(
                    (w) => !w.name?.toLowerCase().includes("rest")
                  );
                  const hasOnlyRestDay =
                    dailyProgress.workouts.length > 0 &&
                    actualWorkouts.length === 0;

                  if (hasOnlyRestDay) {
                    return (
                      <div className="py-3 text-sm text-gray-500 text-center">
                        Rest Day
                      </div>
                    );
                  }

                  if (actualWorkouts.length === 0) {
                    return (
                      <div className="py-3 text-sm text-gray-500 text-center">
                        No workouts planned for today
                      </div>
                    );
                  }

                  return actualWorkouts.map((workout, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 py-3 border-b border-gray-200"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        <img
                          src={getWorkoutImageVite(workout.name)}
                          alt={workout.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to emoji if image fails
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (
                              parent &&
                              !parent.querySelector(".emoji-fallback")
                            ) {
                              const fallback = document.createElement("span");
                              fallback.className = "emoji-fallback text-xl";
                              fallback.textContent = "💪";
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {workout.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {workout.time && (
                            <span className="text-xs text-gray-500">
                              {workout.time}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {workout.duration} min
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-700">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {workout.caloriesBurned} kcal
                          </span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setWorkoutToDelete(workout)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Delete workout"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                        </button>
                        <button
                          onClick={() => handleCompleteWorkout(index)}
                          className={`p-0.5 rounded-full transition-all duration-200 ${
                            workout.done ?? false
                              ? "bg-gradient-to-br from-emerald-400 to-teal-500 scale-110 shadow-sm"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                          aria-label={
                            workout.done
                              ? "Mark as incomplete"
                              : "Mark as complete"
                          }
                        >
                          <Check
                            className={`w-3.5 h-3.5 transition-all duration-200 ${
                              workout.done ?? false
                                ? "text-white stroke-[3]"
                                : "text-gray-400 stroke-2"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Water Intake */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Water Intake
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from({ length: dailyProgress.water.goal }).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={
                        index < dailyProgress.water.consumed
                          ? undefined
                          : addWaterGlass
                      }
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        index < dailyProgress.water.consumed
                          ? "bg-blue-400 border-blue-400"
                          : "bg-transparent border-gray-300"
                      }`}
                    >
                      <GlassWater
                        className={`w-6 h-6 mx-auto ${
                          index < dailyProgress.water.consumed
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  )
                )}
              </div>
              <p className="text-sm text-gray-600">
                {dailyProgress.water.consumed} of {dailyProgress.water.goal}{" "}
                glasses
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DailyMealScreen;
