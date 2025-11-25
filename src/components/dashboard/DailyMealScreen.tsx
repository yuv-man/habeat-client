import { useState, useEffect } from "react";
import "@/styles/dailyScreen.css";
import {
  GlassWater,
  Flame,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { IDailyProgress, WorkoutData } from "@/types/interfaces";
import Loader from "../helper/loader";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import { mockDailyProgress } from "@/mocks/dailyProgressMock";
import MealCard from "./MealCard";
import { useProgressStore } from "@/stores/progressStore";
import { getWorkoutImageVite } from "@/lib/workoutImageHelper";
import FastingClock from "./FastingClock";

const DailyMealScreen = () => {
  const [currentDate] = useState(new Date());
  const { user, plan, loading, setLoading } = useAuthStore();
  const { todayProgress, fetchTodayProgress, setTodayProgress } =
    useProgressStore();
  const [dailyProgress, setDailyProgress] = useState<IDailyProgress | null>(
    null
  );

  useEffect(() => {
    if (plan && user?._id) {
      getTodayProgress();
    }
  }, [plan, currentDate, user?._id]);

  // Sync progress store with local state
  useEffect(() => {
    if (todayProgress) {
      setDailyProgress(todayProgress);
    }
  }, [todayProgress]);

  const getTodayProgress = async () => {
    if (user?._id) {
      if (config.testFrontend) {
        const mock = mockDailyProgress as IDailyProgress;
        setDailyProgress(mock);
        setTodayProgress(mock);
        return;
      }
      try {
        setLoading(true);
        await fetchTodayProgress(user._id);
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Get meal times (default times if not available)
  const getMealTime = (mealType: string) => {
    const times: { [key: string]: string } = {
      breakfast: "08:00 AM",
      lunch: "12:30 PM",
      dinner: "07:00 PM",
      snacks: "03:00 PM",
    };
    return times[mealType] || "12:00 PM";
  };

  const addWaterGlass = async () => {
    if (user?._id) {
      try {
        const response = await userAPI.addWaterGlass(
          user._id,
          currentDate.toISOString(),
          1
        );
        setDailyProgress((prevState) => ({
          ...prevState,
          water: {
            ...prevState.water,
            consumed: response.data.water.consumed,
          },
        }));
      } catch (error) {
        console.error("Failed to add water glass:", error);
      }
    }
  };

  const handleDeleteWorkout = async (workoutIndex: number) => {
    if (!user?._id || !dailyProgress) return;

    const workout = dailyProgress.workouts[workoutIndex];
    if (!workout) return;

    try {
      const workoutData: WorkoutData = {
        name: workout.name,
        category: workout.category,
        caloriesBurned: workout.caloriesBurned.toString(),
        duration: workout.duration.toString(),
      };

      if (config.testFrontend) {
        // Update local state in test mode
        const updatedWorkouts = dailyProgress.workouts.filter(
          (_, idx) => idx !== workoutIndex
        );
        setDailyProgress({
          ...dailyProgress,
          workouts: updatedWorkouts,
        });
        return;
      }

      await userAPI.deleteWorkout(
        user._id,
        currentDate.toISOString(),
        workoutData
      );

      // Update local state
      const updatedWorkouts = dailyProgress.workouts.filter(
        (_, idx) => idx !== workoutIndex
      );
      setDailyProgress({
        ...dailyProgress,
        workouts: updatedWorkouts,
      });
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
        caloriesBurned: workout.caloriesBurned.toString(),
        duration: workout.duration.toString(),
        done: newDoneState,
      };

      if (config.testFrontend) {
        // Update local state in test mode
        const updatedWorkouts = [...dailyProgress.workouts];
        updatedWorkouts[workoutIndex] = { ...workout, done: newDoneState };
        setDailyProgress({
          ...dailyProgress,
          workouts: updatedWorkouts,
        });
        return;
      }

      await userAPI.completeWorkout(
        user._id,
        currentDate.toISOString(),
        workoutData
      );

      // Update local state
      const updatedWorkouts = [...dailyProgress.workouts];
      updatedWorkouts[workoutIndex] = { ...workout, done: newDoneState };
      setDailyProgress({
        ...dailyProgress,
        workouts: updatedWorkouts,
      });
    } catch (error) {
      console.error("Failed to complete workout:", error);
    }
  };

  const handleChangeWorkout = (workoutIndex: number) => {
    // TODO: Implement workout swap/change functionality
    console.log("Change workout at index:", workoutIndex);
  };

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <Loader />
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
              {/* Calories */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Calories</span>
                  <span className="text-gray-700 font-medium">
                    {dailyProgress.caloriesConsumed} /{" "}
                    {dailyProgress.caloriesGoal} kcal
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-orange-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (dailyProgress.caloriesConsumed /
                          dailyProgress.caloriesGoal) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Proteins */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Proteins</span>
                  <span className="text-gray-700 font-medium">
                    {dailyProgress.protein.consumed} /{" "}
                    {dailyProgress.protein.goal} g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-400 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (dailyProgress.protein.consumed /
                          dailyProgress.protein.goal) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Fats</span>
                  <span className="text-gray-700 font-medium">
                    {dailyProgress.fat.consumed} / {dailyProgress.fat.goal} g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (dailyProgress.fat.consumed / dailyProgress.fat.goal) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Carbs</span>
                  <span className="text-gray-700 font-medium">
                    {dailyProgress.carbs.consumed} / {dailyProgress.carbs.goal}{" "}
                    g
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (dailyProgress.carbs.consumed /
                          dailyProgress.carbs.goal) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
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
                  onSwap={() => {
                    // TODO: Implement meal swap functionality
                    console.log("Swap breakfast meal");
                  }}
                  onViewRecipe={() => {
                    // TODO: Navigate to recipe detail
                    console.log("View breakfast recipe");
                  }}
                />
              )}

              {/* Lunch */}
              {dailyProgress.meals.lunch && (
                <MealCard
                  meal={dailyProgress.meals.lunch}
                  mealType="lunch"
                  mealTime={getMealTime("lunch")}
                  onSwap={() => {
                    // TODO: Implement meal swap functionality
                    console.log("Swap lunch meal");
                  }}
                  onViewRecipe={() => {
                    // TODO: Navigate to recipe detail
                    console.log("View lunch recipe");
                  }}
                />
              )}

              {/* Dinner */}
              {dailyProgress.meals.dinner && (
                <MealCard
                  meal={dailyProgress.meals.dinner}
                  mealType="dinner"
                  mealTime={getMealTime("dinner")}
                  onSwap={() => {
                    // TODO: Implement meal swap functionality
                    console.log("Swap dinner meal");
                  }}
                  onViewRecipe={() => {
                    // TODO: Navigate to recipe detail
                    console.log("View dinner recipe");
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
                    isSnack={true}
                    onSwap={() => {
                      // TODO: Implement meal swap functionality
                      console.log("Swap snack meal");
                    }}
                    onViewRecipe={() => {
                      // TODO: Navigate to recipe detail
                      console.log("View snack recipe");
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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                            const fallback = document.createElement("div");
                            fallback.className =
                              "emoji-fallback text-lg absolute inset-0 flex items-center justify-center";
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
                        onClick={() => handleDeleteWorkout(index)}
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
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label={
                          workout.done
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            workout.done ?? false
                              ? "fill-green-500 text-green-500"
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
  );
};

export default DailyMealScreen;
