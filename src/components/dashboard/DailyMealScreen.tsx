import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/dailyScreen.css";
import {
  GlassWater,
  Flame,
  Trash2,
  Check,
  RefreshCw,
  CalendarDays,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { IDailyProgress, WorkoutData } from "@/types/interfaces";
import Loader from "../helper/loader";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import { mockDailyProgress } from "@/mocks/dailyProgressMock";
import MealCard from "./MealCard";
import { useProgressStore } from "@/stores/progressStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { getWorkoutImageVite } from "@/lib/workoutImageHelper";
import FastingClock from "./FastingClock";
import NutritionProgressBar from "@/components/helper/NutritionProgressBar";
import { Button } from "@/components/ui/button";

const DailyMealScreen = () => {
  const navigate = useNavigate();
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

  // Track if we've already fetched to prevent duplicate calls
  const hasFetchedRef = useRef(false);

  // Fetch progress and favorites only once when user is available
  useEffect(() => {
    if (!userId || hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchTodayProgress(userId);
    fetchFavorites(userId);
  }, [userId, fetchTodayProgress, fetchFavorites]);

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

    // Format time to 12-hour format with AM/PM
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

    try {
      const newDoneState = !(workout.done ?? false);
      const workoutData: WorkoutData = {
        name: workout.name,
        category: workout.category,
        caloriesBurned: workout.caloriesBurned,
        duration: workout.duration,
        done: newDoneState,
      };

      const updatedWorkouts = [...dailyProgress.workouts];
      updatedWorkouts[workoutIndex] = { ...workout, done: newDoneState };
      const updatedProgress = {
        ...dailyProgress,
        workouts: updatedWorkouts,
      };

      if (config.testFrontend) {
        // Update store in test mode
        setTodayProgress(updatedProgress);
        if (newDoneState) {
          toast.success("💪 Well done! Keep crushing it!", {
            duration: 3000,
          });
        }
        return;
      }

      await userAPI.completeWorkout(
        user._id,
        currentDate.toISOString(),
        workoutData
      );

      // Update store (which syncs to local state)
      setTodayProgress(updatedProgress);

      // Show encouraging toast when workout is completed
      if (newDoneState) {
        toast.success("💪 Well done! Keep crushing it!", {
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to complete workout:", error);
    }
  };

  const handleChangeWorkout = (workoutIndex: number) => {
    // TODO: Implement workout swap/change functionality
    console.log("Change workout at index:", workoutIndex);
  };

  // Get last date from plan for expired message
  const getExpiredDateInfo = () => {
    if (!plan?.weeklyPlan) return null;
    const dates = Object.keys(plan.weeklyPlan).sort();
    if (dates.length === 0) return null;
    const lastDate = dates[dates.length - 1];
    return new Date(lastDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Delete Workout Confirmation Modal */}
      {workoutToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Workout
              </h3>
              <button
                onClick={() => setWorkoutToDelete(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {workoutToDelete.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setWorkoutToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteWorkout(workoutToDelete);
                  setWorkoutToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        {loading ? (
          <Loader />
        ) : isPlanExpired ? (
          <div className="min-h-screen flex items-center justify-center flex-col gap-6 p-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
              <CalendarDays className="w-8 h-8 text-amber-600" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800">
                Your meal plan has expired
              </p>
              <p className="text-gray-500 mt-2">
                Your previous plan ended on {getExpiredDateInfo()}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Generate a new plan to continue tracking your meals
              </p>
            </div>
            <Button
              onClick={() => navigate("/weekly-overview")}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              size="lg"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate New Plan</span>
            </Button>
          </div>
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
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Daily Tracker
            </h1>

            {/* Fasting Clock */}
            {user?.fastingHours && user?.fastingStartTime && (
              <FastingClock
                fastingHours={user.fastingHours}
                fastingStartTime={user.fastingStartTime}
              />
            )}

            {/* Daily Nutrition Progress */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Daily Nutrition Progress
              </h2>
              <div className="space-y-4">
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
                {dailyProgress.workouts.length > 0 ? (
                  dailyProgress.workouts.map((workout, index) => (
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
                          onClick={() => handleChangeWorkout(index)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          aria-label="Change workout"
                        >
                          <RefreshCw className="w-4 h-4 text-gray-400 hover:text-blue-500 transition-colors" />
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
                  ))
                ) : (
                  <div className="py-3 text-sm text-gray-500 text-center">
                    No workouts planned for today
                  </div>
                )}
              </div>
            </div>

            {/* Water Intake */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Water Intake
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from({ length: 8 }).map((_, index) => (
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
                ))}
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
