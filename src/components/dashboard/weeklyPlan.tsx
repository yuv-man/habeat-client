import React, { useState } from "react";
import {
  GlassWater,
  Sparkles,
  Target,
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  CalendarDays,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { IDailyPlan, IMeal, IPlan, WorkoutData } from "@/types/interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loader from "@/components/helper/loader";
import { userAPI } from "@/services/api";
import mealPlanIcon from "@/assets/add_plan.svg";
import WeeklyPlanTable from "./WeeklyPlanTable";
import WorkoutModal from "@/components/modals/WorkoutModal";
import ChangeMealModal from "@/components/modals/ChangeMealModal";
import AddSnackModal from "@/components/modals/AddSnackModal";
import { formatMealName } from "@/lib/formatters";

// Components
const MacroCard = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) => (
  <div className="flex-1">
    <div className={`text-3xl font-bold ${color}`}>{value}</div>
    <div className="text-gray-600 text-sm">
      {label} {unit}
    </div>
  </div>
);

const MacroSummary = ({
  macros,
}: {
  macros: { calories: number; protein: number; carbs: number; fat: number };
}) => (
  <div className="grid grid-cols-4 gap-3 mb-6">
    <MacroCard
      label="Calories"
      value={macros.calories}
      unit="kcal"
      color="text-orange-500"
    />
    <MacroCard
      label="Protein"
      value={macros.protein}
      unit="g"
      color="text-teal-500"
    />
    <MacroCard
      label="Carbs"
      value={macros.carbs}
      unit="g"
      color="text-blue-500"
    />
    <MacroCard
      label="Fats"
      value={macros.fat}
      unit="g"
      color="text-purple-500"
    />
  </div>
);

const MealItem = ({
  meal,
  mealType,
  date,
  snackIndex,
  onMealChange,
  onDelete,
  isSnack = false,
}: {
  meal: IMeal;
  mealType: string;
  date: string; // Date in YYYY-MM-DD format
  snackIndex?: number; // Index of snack (for snacks only)
  onMealChange: (newMeal: IMeal) => void;
  onDelete?: () => void;
  isSnack?: boolean;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
    <div className="flex-1 min-w-0">
      <div className="text-gray-600 text-sm capitalize">{mealType}</div>
      <div className="font-medium text-gray-900 break-words line-clamp-2">
        {formatMealName(meal.name)}
      </div>
      <div className="flex items-center gap-3 text-gray-500 text-xs mt-0.5">
        <span>{meal.calories} kcal</span>
        {!isSnack && meal.prepTime > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {meal.prepTime} min
          </span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      <ChangeMealModal
        currentMeal={meal}
        mealType={mealType}
        date={date}
        snackIndex={isSnack ? snackIndex : undefined}
        onMealChange={onMealChange}
      >
        <button
          className="text-green-500 hover:bg-green-50 p-2 rounded transition flex-shrink-0"
          aria-label="Swap meal"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </ChangeMealModal>
      {isSnack && onDelete && (
        <button
          onClick={onDelete}
          className="text-red-500 hover:bg-red-50 p-2 rounded transition flex-shrink-0"
          aria-label="Delete snack"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  </div>
);

const ExerciseItem = ({
  workout,
  onDelete,
}: {
  workout: { name: string; duration: number; caloriesBurned: number };
  onDelete?: () => void;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
    <div className="flex-1">
      <div className="text-gray-600 text-sm">Workout</div>
      <div className="font-medium text-gray-900">{workout.name}</div>
      <div className="text-gray-500 text-xs">
        {workout.duration} min • {workout.caloriesBurned} kcal
      </div>
    </div>
    {onDelete && (
      <button
        onClick={onDelete}
        className="text-red-500 hover:bg-red-50 p-2 rounded transition flex-shrink-0"
        aria-label="Delete workout"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    )}
  </div>
);

const WaterIntake = ({ goal }: { goal: number }) => (
  <div className="py-4 border-b border-gray-200">
    <div className="flex items-center gap-2 mb-2">
      <GlassWater className="w-5 h-5 text-blue-500" />
      <span className="text-gray-900 font-medium">Water Target</span>
    </div>
    <div className="flex flex-wrap gap-1">
      {Array.from({ length: goal }).map((_, index) => (
        <div
          key={index}
          className="w-7 h-7 rounded-md border border-blue-200 bg-blue-50 flex items-center justify-center"
        >
          <GlassWater className="w-4 h-4 text-blue-400" />
        </div>
      ))}
    </div>
    <p className="text-xs text-gray-500 mt-1">{goal} glasses daily target</p>
  </div>
);

const DayCard = ({
  date,
  dayName,
  isActive,
  onClick,
}: {
  date: string;
  dayName: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition ${
      isActive
        ? "bg-green-500 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    <span className="font-semibold">{dayName}</span>
    <span className="text-xs">{date}</span>
  </button>
);

const DayContent = ({
  dayData,
  onMealChange,
  onDeleteSnack,
  onAddSnack,
  onDeleteWorkout,
  onAddWorkout,
  date,
}: {
  dayData: IDailyPlan;
  onMealChange: (mealType: string, newMeal: IMeal) => void;
  onDeleteSnack: (snackId: string) => void;
  onAddSnack: () => void;
  onDeleteWorkout: (workout: WorkoutData) => void;
  onAddWorkout: (workout: WorkoutData) => void;
  date: Date;
}) => {
  // Format date to YYYY-MM-DD for API calls
  const dateStr = date.toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <MealItem
        meal={dayData.meals.breakfast}
        mealType="breakfast"
        date={dateStr}
        onMealChange={(newMeal) => onMealChange("breakfast", newMeal)}
      />
      <MealItem
        meal={dayData.meals.lunch}
        mealType="lunch"
        date={dateStr}
        onMealChange={(newMeal) => onMealChange("lunch", newMeal)}
      />
      <MealItem
        meal={dayData.meals.dinner}
        mealType="dinner"
        date={dateStr}
        onMealChange={(newMeal) => onMealChange("dinner", newMeal)}
      />
      {dayData.meals.snacks.map((snack, idx) => (
        <MealItem
          key={snack._id || idx}
          meal={snack}
          mealType="snack"
          date={dateStr}
          snackIndex={idx}
          isSnack={true}
          onMealChange={(newMeal) => onMealChange("snacks", newMeal)}
          onDelete={() => onDeleteSnack(snack._id || idx.toString())}
        />
      ))}
      <button
        onClick={onAddSnack}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition"
      >
        <Plus className="w-4 h-4" />
        <span>Add Snack</span>
      </button>
      {(() => {
        const actualWorkouts = dayData.workouts.filter(
          (w) => !w.name?.toLowerCase().includes("rest")
        );
        const hasOnlyRestDay =
          dayData.workouts.length > 0 && actualWorkouts.length === 0;

        if (hasOnlyRestDay || dayData.workouts.length === 0) {
          return (
            <div className="py-3 border-b border-gray-200 text-gray-500 text-sm text-center">
              Rest Day
            </div>
          );
        }

        return actualWorkouts.map((workout, idx) => (
          <ExerciseItem
            key={idx}
            workout={workout}
            onDelete={() => onDeleteWorkout(workout as WorkoutData)}
          />
        ));
      })()}
      <WorkoutModal onWorkoutAdd={onAddWorkout}>
        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition">
          <Plus className="w-4 h-4" />
          <span>Add Workout</span>
        </button>
      </WorkoutModal>
      <WaterIntake goal={8} />
    </div>
  );
};

// Main Component
export default function WeeklyMealPlan() {
  const { user, plan, loading, generateMealPlan } = useAuthStore();
  const weeklyPlan = plan?.weeklyPlan || {};

  // Get sorted dates from the weeklyPlan object
  const dates = Object.keys(weeklyPlan).sort();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<{
    date: Date;
    meal: IMeal;
    mealType: string;
  } | null>(null);
  const [isMealEditModalOpen, setIsMealEditModalOpen] = useState(false);

  // Add Snack Modal state
  const [showAddSnackModal, setShowAddSnackModal] = useState(false);
  const [addSnackDate, setAddSnackDate] = useState<string>("");
  const [isAddingSnack, setIsAddingSnack] = useState(false);

  // Check if plan is expired (all dates are in the past)
  const isPlanExpired = React.useMemo(() => {
    if (dates.length === 0) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get the last (most recent) date in the plan
    const lastDateStr = dates[dates.length - 1];
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0, 0, 0, 0);

    // Plan is expired if the last date is before today
    return lastDate < today;
  }, [dates]);

  React.useEffect(() => {
    if (dates.length > 0 && (!selectedDate || !weeklyPlan[selectedDate])) {
      // Try to find today's date in the plan
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Check if today exists in the plan dates
      const todayInPlan = dates.find((d) => d === todayStr);

      if (todayInPlan) {
        setSelectedDate(todayInPlan);
      } else {
        // Fallback to first date if today is not in the plan
        setSelectedDate(dates[0]);
      }
    }
  }, [dates.length, selectedDate, weeklyPlan]);

  const currentDay = selectedDate ? weeklyPlan[selectedDate] : null;

  // Helper function to get day name from date string
  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Helper function to format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleMealChange = (date: string, mealType: string, newMeal: IMeal) => {
    if (!weeklyPlan || !user || !plan) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mealDate = new Date(date);
    mealDate.setHours(0, 0, 0, 0);

    if (mealDate < today) return; // Prevent editing past days

    // Update weeklyPlan
    const updatedWeeklyPlan = { ...weeklyPlan };
    if (updatedWeeklyPlan[date]) {
      if (mealType === "snacks") {
        // For snacks, replace the first one or add if empty
        updatedWeeklyPlan[date] = {
          ...updatedWeeklyPlan[date],
          meals: {
            ...updatedWeeklyPlan[date].meals,
            snacks: [newMeal, ...updatedWeeklyPlan[date].meals.snacks.slice(1)],
          },
        };
      } else {
        updatedWeeklyPlan[date] = {
          ...updatedWeeklyPlan[date],
          meals: {
            ...updatedWeeklyPlan[date].meals,
            [mealType]: newMeal,
          },
        };
      }
      // Update the plan in auth store
      useAuthStore.getState().setPlan({
        ...plan,
        weeklyPlan: updatedWeeklyPlan,
      });
    }
  };

  const handleDeleteSnack = async (snackId: string, date?: string) => {
    const targetDate = date || selectedDate;
    if (!targetDate || !plan || !user) return;

    const dateKey = targetDate;
    const updatedPlan = { ...plan };
    const dayPlan = updatedPlan?.weeklyPlan[dateKey];

    if (dayPlan) {
      // Store original snacks for rollback
      const originalSnacks = [...dayPlan.meals.snacks];

      // Remove snack from array (optimistic update)
      dayPlan.meals.snacks = dayPlan.meals.snacks.filter(
        (s) => (s._id || "") !== snackId
      );

      // Update the plan in the store
      useAuthStore.setState({ plan: updatedPlan });

      try {
        // Call API to delete snack
        await userAPI.deleteSnack(plan._id, dateKey, snackId);
      } catch (error) {
        console.error("Failed to delete snack:", error);
        // Rollback on error
        dayPlan.meals.snacks = originalSnacks;
        useAuthStore.setState({ plan: updatedPlan });
      }
    }
  };

  const handleAddSnack = (date?: string) => {
    const targetDate = date || selectedDate;
    if (!targetDate || !user || !plan) return;
    setAddSnackDate(targetDate);
    setShowAddSnackModal(true);
  };

  const handleConfirmAddSnack = async (snackName: string) => {
    if (!snackName.trim() || !addSnackDate || !plan) return;

    setIsAddingSnack(true);
    try {
      // Call API to add snack
      const response = await userAPI.addSnack(
        plan._id,
        addSnackDate,
        snackName.trim()
      );

      // Update local state with the returned plan
      if (response.data?.plan) {
        useAuthStore.setState({ plan: response.data.plan });
      }

      // Close modal and reset
      setShowAddSnackModal(false);
      setAddSnackDate("");
    } catch (error) {
      console.error("Failed to add snack:", error);
    } finally {
      setIsAddingSnack(false);
    }
  };

  const handleDeleteWorkout = async (workout: WorkoutData) => {
    if (!selectedDate || !currentDay || !user || !plan?.weeklyPlan) return;

    const date = new Date(selectedDate);
    const dateKey = date.toISOString().split("T")[0];
    const updatedPlan: IPlan = { ...plan };
    const dayPlan = updatedPlan.weeklyPlan[dateKey];

    if (dayPlan && dayPlan.workouts.find((w) => w.name === workout.name)) {
      // Remove workout from array
      dayPlan.workouts = dayPlan.workouts.filter(
        (w) => w.name !== workout.name
      );

      // Update the plan in the store
      useAuthStore.setState({ plan: updatedPlan });

      // Call API to delete workout
      try {
        // Convert workout to WorkoutData format
        const workoutData: WorkoutData = {
          name: workout.name,
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          category: "cardio", // Default category
          done: false,
        };
        await userAPI.deleteWorkout(user._id!, dateKey, workoutData);
      } catch (error) {
        console.error("Failed to delete workout:", error);
      }
    }
  };

  const handleAddWorkout = async (workout: WorkoutData) => {
    if (!selectedDate || !currentDay || !user || !plan?.weeklyPlan) return;

    const date = new Date(selectedDate);
    const dateKey = date.toISOString().split("T")[0];

    // Use ISO format "YYYY-MM-DD"
    const formattedDate = dateKey;

    const updatedPlan: IPlan = { ...plan };
    const dayPlan = updatedPlan.weeklyPlan[dateKey];

    if (dayPlan) {
      // Convert WorkoutData to workout format with date and time
      const newWorkout = {
        name: workout.name,
        duration: workout.duration || 30,
        caloriesBurned: workout.caloriesBurned || 150,
        category: workout.category,
        date: formattedDate,
        time: workout.time || "12:00",
      };

      // Add workout to array
      dayPlan.workouts = [...dayPlan.workouts, newWorkout];

      // Update the plan in the store
      useAuthStore.setState({ plan: updatedPlan });

      // Call API to add workout - include date
      const workoutWithDate: WorkoutData = {
        ...workout,
        date: formattedDate,
      };

      try {
        await userAPI.addWorkout(user._id!, workoutWithDate);
      } catch (error) {
        console.error("Failed to add workout:", error);
        // Revert on error
        dayPlan.workouts = dayPlan.workouts.filter(
          (w) => w.name !== newWorkout.name
        );
        useAuthStore.setState({ plan: updatedPlan });
      }
    }
  };

  const generatePlan = async () => {
    if (!user) return;
    try {
      setIsGenerating(true);
      await generateMealPlan(user, "My Plan", "en");
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const swapMeal = (type: string) => {
    console.log("Swapping meal...", type);
    setIsMealEditModalOpen(false);
    setSelectedMeal(null);
  };

  if (loading) {
    return <Loader />;
  }

  // Show expired plan message
  if (isPlanExpired) {
    const lastDate = dates[dates.length - 1];
    const formattedLastDate = new Date(lastDate).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Weekly Plan</h1>
          </div>
          <div className="text-center py-12 space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <CalendarDays className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-800">
                Your meal plan has expired
              </p>
              <p className="text-gray-500 mt-2">
                Your previous plan ended on {formattedLastDate}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Generate a new plan to get fresh meals for this week
              </p>
            </div>
            <Button
              disabled={isGenerating}
              onClick={generatePlan}
              className="flex items-center gap-2 mx-auto bg-green-500 text-white hover:bg-green-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Generating New Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate New Plan</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentDay || dates.length === 0) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Weekly Plan</h1>
            <div className="flex gap-2">
              <Button
                disabled={isGenerating}
                onClick={generatePlan}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>AI Generate</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">No meal plan available</p>
            <p className="text-sm text-gray-400 mt-2">
              Click "AI Generate" to create your meal plan
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen md:pb-0">
      <div className="max-w-full mx-auto px-4 py-6 pt-6 md:max-w-7xl">
        {/* Macro Summary - Show target values from plan */}
        <MacroSummary
          macros={{
            calories:
              plan?.userMetrics?.targetCalories ||
              currentDay?.totalCalories ||
              0,
            protein:
              plan?.userMetrics?.dailyMacros?.protein ||
              currentDay?.totalProtein ||
              0,
            carbs:
              plan?.userMetrics?.dailyMacros?.carbs ||
              currentDay?.totalCarbs ||
              0,
            fat:
              plan?.userMetrics?.dailyMacros?.fat || currentDay?.totalFat || 0,
          }}
        />

        {/* Generate AI Button */}
        <button
          onClick={generatePlan}
          disabled={isGenerating}
          className="w-full bg-green-500 text-white hover:bg-green-600 font-semibold py-3 px-4 rounded-lg mb-8 transition disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate AI Meal Plan"}
        </button>

        {/* Desktop Table View */}
        <WeeklyPlanTable
          weeklyPlan={weeklyPlan}
          dates={dates}
          onMealChange={handleMealChange}
          onDeleteSnack={(date, snackId) => handleDeleteSnack(snackId, date)}
          onAddSnack={(date) => handleAddSnack(date)}
          onDeleteWorkout={(date, workout) => {
            const prevSelected = selectedDate;
            setSelectedDate(date);
            setTimeout(() => {
              handleDeleteWorkout(workout as WorkoutData);
              setSelectedDate(prevSelected);
            }, 0);
          }}
          onAddWorkout={(date, workout) => {
            const prevSelected = selectedDate;
            setSelectedDate(date);
            setTimeout(() => {
              handleAddWorkout(workout);
              setSelectedDate(prevSelected);
            }, 0);
          }}
          getDayName={getDayName}
          formatDate={formatDate}
        />

        {/* Mobile View */}
        <div className="md:hidden">
          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {dates.map((date) => {
              const day = weeklyPlan[date];
              return (
                <DayCard
                  key={date}
                  dayName={
                    day.day.charAt(0).toUpperCase() + day.day.slice(1, 3)
                  }
                  date={day.date}
                  isActive={selectedDate === date}
                  onClick={() => setSelectedDate(date)}
                />
              );
            })}
          </div>

          {/* Selected Day Content */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {getDayName(selectedDate)}
            </h2>
            {currentDay && (
              <DayContent
                dayData={currentDay}
                onMealChange={(mealType, newMeal) =>
                  handleMealChange(selectedDate, mealType, newMeal)
                }
                onDeleteSnack={handleDeleteSnack}
                onAddSnack={() => handleAddSnack(selectedDate)}
                onDeleteWorkout={handleDeleteWorkout}
                onAddWorkout={handleAddWorkout}
                date={new Date(selectedDate)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Meal Edit Modal */}
      {selectedMeal && isMealEditModalOpen && (
        <div
          className="fixed inset-0 flex items-start justify-start z-50 bg-black/50"
          onClick={() => {
            setIsMealEditModalOpen(false);
            setSelectedMeal(null);
          }}
        >
          <Card
            className="mt-20 ml-20 shadow-lg w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Edit Meal</span>
                <Button
                  variant="ghost"
                  className="h-auto p-1 hover:bg-transparent"
                  onClick={() => {
                    setIsMealEditModalOpen(false);
                    setSelectedMeal(null);
                  }}
                >
                  ✕
                </Button>
              </CardTitle>
              <p className="text-xs text-gray-500 break-words">
                {formatMealName(selectedMeal.meal.name)}
              </p>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-sm"
              >
                <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                Swap with AI suggestion
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                onClick={() => swapMeal("manual")}
              >
                <div>
                  <img
                    src={mealPlanIcon}
                    alt="meal plan"
                    className="w-4 h-4 mr-2"
                  />
                </div>
                Swap manually
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start text-sm"
              >
                <Target className="h-4 w-4 mr-2 text-purple-500" />
                Swap from favorites
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Snack Modal */}
      <AddSnackModal
        isOpen={showAddSnackModal}
        onClose={() => {
          setShowAddSnackModal(false);
          setAddSnackDate("");
        }}
        onAdd={handleConfirmAddSnack}
        date={addSnackDate}
        loading={isAddingSnack}
      />
    </div>
  );
}
