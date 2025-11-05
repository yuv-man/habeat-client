import { useState, useEffect, useCallback } from "react";
import "@/styles/dailyScreen.css";
import { Droplets } from "lucide-react";
import CircularProgress from "../helper/CircleProgress";
import ProgressBar from "../helper/ProgressBar";
import MealCard from "../helper/Meals/MealCard";
import WaterCard from "../helper/WaterCard";
import WorkoutCard from "../helper/workouts/WorkoutCard";
import calorieIcon from "@/assets/fire.svg";
import workout from "@/assets/gym.svg";
import { calculateMealCalorieRanges, calculateProgress } from "@/lib/nutritionHelpers";
import { useAuthStore } from "@/stores/authStore";
import { IDailyProgress, IMeal, MealData, WorkoutData } from "@/types/interfaces";
import Loader from "../helper/loader";
import { userAPI } from "@/services/api";
import { onWorkoutCompleted } from "./helperFunctions";

const DailyMealScreen = () => {
  const [currentDate] = useState(new Date());
  const { user, plan, loading, setLoading } = useAuthStore();
  const [dailyProgress, setDailyProgress] = useState<IDailyProgress | null>(null);
  const [isMealProgressChanged, setIsMealProgressChanged] = useState(0);
  
  useEffect(() => {
    if (plan) {
      getTodayProgress();
    }
  }, [plan, currentDate]);

  const getTodayProgress = async () => {
    if (user?._id) {
      try {
        setLoading(true);
        const response = await userAPI.getTodayProgress(user._id);
        setDailyProgress(response.data.progress);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const workoutsCompleted = dailyProgress ? dailyProgress.workouts.filter(workout => workout.done).length : 0;
  const caloriesProgress = dailyProgress ? calculateProgress(dailyProgress.caloriesConsumed, dailyProgress.caloriesGoal) : 0;
  // Calculate calorie ranges for each meal type using helper
  const caloriesRange = dailyProgress ? calculateMealCalorieRanges(dailyProgress.caloriesGoal) : {
    breakfast: { min: 0, max: 0 },
    lunch: { min: 0, max: 0 },
    dinner: { min: 0, max: 0 },
    snacks: { min: 0, max: 0 }
  };

  const addWaterGlass = async () => {
    if (user?._id) {
      try {
        const response = await userAPI.addWaterGlass(user._id, currentDate.toISOString(), 1);
        setDailyProgress(prevState => ({
          ...prevState,
          water: {
            ...prevState.water,
            consumed: response.data.water.consumed
          }
        }));
      } catch (error) {
        console.error('Failed to add water glass:', error);
      }
    }
  };

  const handleWorkoutAdd = async (workout: WorkoutData) => {
    if (user?._id) {
      try {
        const response = await userAPI.addWorkout(user._id, currentDate.toISOString(), workout);
        if (response.data.success) {
        setDailyProgress(prevState => ({
            ...prevState,
            workouts: [...prevState.workouts, response.data.progress.workouts]
          }));
        }
      } catch (error) {
        console.error('Failed to add workout:', error);
      }
    }
  };

  const handleWorkoutComplete = async (workout: WorkoutData) => {
    const dailyDate = new Date(currentDate.toISOString());
    dailyDate.setHours(0, 0, 0, 0);
    if (user?._id) {
        try {
          const updatedWorkout = {
            ...workout,
            done: !workout.done
          }
          const response = await userAPI.completeWorkout(user._id, dailyDate.toISOString(), updatedWorkout);
          if (response.data.success) {
              setDailyProgress(prevState => ({
                ...prevState,
                workouts: response.data.progress.workouts
              }));
          }
        } catch (error) {
          console.error('Failed to complete workout:', error);
        }
      
    }
  };

  const handleMealAdd = (meal: { name: string; calories: string; type: string }) => {
    // TODO: API call to add meal
    console.log('Added meal:', meal);
  };

  const surpriseMe = (mealType: string) => {
    // TODO: AI generates new suggestion
    console.log('AI surprise for:', mealType);
  };

  const handleMealComplete = async (meal: MealData, mealType: string) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      const willBeCompleted = meal.done;
      const updatedMeal = plan?.weeklyPlan.find(day => day.date === date.toISOString())?.meals[mealType];
      try {
        await userAPI.updateMealInPlan(user._id, date, {...updatedMeal, done: willBeCompleted});
        setIsMealProgressChanged(prevState => prevState + 1);
        if (dailyProgress) {
          // If completing meal, add calories; if uncompleting, subtract calories
          const caloriesChange = willBeCompleted ? meal.calories : -meal.calories;
          setDailyProgress(prevState => ({
            ...prevState,
            caloriesConsumed: prevState.caloriesConsumed + caloriesChange
          }));
        }
      } catch (error) {
        console.error('Error updating meal in plan:', error);
      }
    };

  return (
    <div className="min-h-screen">
      {loading ? <Loader /> : !dailyProgress ? (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6">
          <p className="text-xl font-semibold text-gray-700 text-center">No Daily Progress Available</p>
          <p className="text-gray-500 text-center">Your daily progress information will appear here once available.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="daily-header">
        <div className="mb-4">
          <p className="text-black text-sm font-bold text-center">
            {currentDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Daily Progress */}
        <div className="flex items-center flex-row justify-center gap-10">
          <CircularProgress
            size={180}
            progress={caloriesProgress}
            value={`${parseInt(dailyProgress?.caloriesGoal.toString()) - parseInt(dailyProgress?.caloriesConsumed.toString())}`}
            label="KCAL LEFT"
            color="var(--calories)"
            icon={calorieIcon}
            isChanged={isMealProgressChanged}
          />
          <div className="flex items-center justify-center flex-col mr-4 w-1/3">
            <ProgressBar
              icon={<Droplets className="h-5 w-5 text-blue-600" />}
              label="Water"
              current={dailyProgress?.water.consumed}
              goal={dailyProgress?.water.goal}
              color="var(--water)"
              unit="glasses"
              dashboard={true}
            />
            <ProgressBar
              icon={<img src={workout} className="h-5 w-5" />}
              label="Workout"
              current={workoutsCompleted}
              goal={dailyProgress?.workouts.length}
              color="var(--workout)"
              unit="workouts"
              dashboard={true}
            />
          </div>
        </div>
      </div>
      {loading && <Loader />}

      {/* Main Content */}
      <div className="px-6 space-y-2">
        <p className="text-gray-900 text-md font-semibold">
          Meals Plan
        </p>
        {/* Meal Sections */}
        <div className="flex flex-col">
          <MealCard
            mealType="breakfast"
            mealData={dailyProgress?.meals.breakfast}
            caloriesRange={caloriesRange.breakfast}
            onMealCompleted={(meal) => handleMealComplete(meal, 'breakfast')}
          />
          <MealCard
            mealType="lunch"
            caloriesRange={caloriesRange.lunch}
            mealData={dailyProgress?.meals.lunch}
            onMealCompleted={(meal) => handleMealComplete(meal, 'lunch')}
          />
          <MealCard
            mealType="dinner"
            caloriesRange={caloriesRange.dinner}
            mealData={dailyProgress?.meals.dinner}
            onMealCompleted={(meal) => handleMealComplete(meal, 'dinner')}
          />
          <MealCard
            mealType="snacks"
            mealData={dailyProgress?.meals.snacks[0]}
            caloriesRange={caloriesRange.snacks}
            onMealCompleted={(meal) => handleMealComplete(meal, 'snacks')}
          />
        </div>

        {/* Water & Workout Section */}
        <div className="flex flex-col">
          <WaterCard
            current={dailyProgress?.water.consumed}
            goal={dailyProgress?.water.goal}
            onAddGlass={addWaterGlass}
          />
          <WorkoutCard
            current={workoutsCompleted}
            goal={dailyProgress?.workouts.length}
            date={currentDate.toISOString()}
            onWorkoutAdd={handleWorkoutAdd}
            onWorkoutCompleted={handleWorkoutComplete}
            workouts={dailyProgress?.workouts.map(w => ({
              ...w,
              caloriesBurned: w.caloriesBurned.toString(),
              duration: w.duration.toString()
            }))}
          />
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default DailyMealScreen; 