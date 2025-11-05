import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MealProgress from "../helper/Meals/MealProgress";
import { Calendar, Target, Edit3, Sparkles, ShoppingBag } from "lucide-react";
import CircularProgress from "../helper/CircleProgress";
import ProgressBar from "../helper/ProgressBar";
import calorieIcon from "@/assets/fire.svg";
import workoutIcon from "@/assets/workout.svg";
import breakfastIcon from "@/assets/breakfast.svg";
import lunchIcon from "@/assets/noodles.svg";
import dinnerIcon from "@/assets/salad-try.svg";
import snackIcon from "@/assets/snack.svg";
import waterIcon from "@/assets/water.svg";
import mealPlanIcon from "@/assets/add_plan.svg";
import "@/styles/weeklyScreen.css";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IDailyPlan, IMeal } from "@/types/interfaces";
import Loader from "@/components/helper/loader"
import MealPlanCell from "../helper/Meals/MealPlanCell";
import SnacksPlanCell from "../helper/Meals/SnacksPlanCell";
import WorkoutPlanCell from "../helper/workouts/WorkoutPlanCell";

const WeeklyOverview = () => {
  const [selectedMeal, setSelectedMeal] = useState<{date: Date, meal: IMeal} | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMealEditModalOpen, setIsMealEditModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMealProgressChanged, setIsMealProgressChanged] = useState(0);
  const navigate = useNavigate();
  const { user, plan, loading, generateMealPlan } = useAuthStore();
  // Helper function to get week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDates = getWeekDates(currentWeek);

  // Mock weekly data
  const weeklyData = {
    targetCalories: 14000,
    consumedCalories: 9800,
    macros: {
      protein: { target: 350, consumed: 280 },
      carbs: { target: 1050, consumed: 890 },
      fat: { target: 490, consumed: 410 }
    },
    days: weekDates.map((date, index) => ({
      date,
      calories: {
        target: 2000,
        consumed: Math.floor(Math.random() * 500 + 1500),
        breakfast: Math.floor(Math.random() * 200 + 300),
        lunch: Math.floor(Math.random() * 200 + 400),
        dinner: Math.floor(Math.random() * 200 + 500),
        snacks: Math.floor(Math.random() * 100 + 100)
      },
      meals: {
        breakfast: { name: 'Overnight Oatmeal with Mixed Berries and Honey-Roasted Almonds', calories: 320, protein: 12, carbs: 45, fat: 8, prepTime: 10 },
        lunch: { name: 'Mediterranean Quinoa Bowl with Grilled Chicken, Cherry Tomatoes, and Feta Cheese', calories: 450, protein: 35, carbs: 15, fat: 22, prepTime: 15 },
        dinner: { name: 'Grilled Salmon', calories: 580, protein: 42, carbs: 0, fat: 38, prepTime: 20 },
        snacks: { name: 'Mixed Nuts & Fruit', calories: 180, protein: 6, carbs: 22, fat: 12, prepTime: 5 }
      },
      water: Math.floor(Math.random() * 4 + 4),
      workout: Math.floor(Math.random() * 4 + 4),
      completed: index < 3 // First 3 days are completed
    }))
  };

 

  const weeklyMealsData = plan ? plan.weeklyPlan : [];

  const weeklyProgress = (weeklyData.consumedCalories / weeklyData.targetCalories) * 100;

  const handleMealClick = (date: Date, meal: IMeal) => {
    // Check if the day is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    if (!isEditMode) return;
    if (clickedDate < today) return; // Prevent editing past days

    setSelectedMeal({
      date: date,
      meal: meal as IMeal
    });
    setIsMealEditModalOpen(true);
  };

  const generatePlan = async() => {
    try {
      setIsGenerating(true);
      await generateMealPlan(user, 'en');
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const editPlan = () => {
    setIsEditMode(prevState => {
      if(prevState) {
        console.log('Editing plan...');
      }
      return !prevState;
    });
  };

  const swapMeal = (type: string) => {
    console.log('Swapping meal...');
  };

  const mealComplete = (date: Date, meal: IMeal) => {
    // Find the day in the plan and update its meal's done status
    setIsMealProgressChanged(prevState => prevState + 1);
    const updatedPlan = {...plan};
    const dayPlan = updatedPlan.weeklyPlan.find(day => 
      new Date(day.date).toDateString() === date.toDateString()
    );
    if (dayPlan) {
      // Update the specific meal's done status
      Object.values(dayPlan.meals).flat().forEach(m => {
        if (m._id === meal._id) {
          m.done = !m.done;
        }
      });
    }
    
    // Update the plan in the store
    useAuthStore.setState({ plan: updatedPlan });
  };  

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="weekly-header">
        <div className="mb-4">
          <p className="text-black text-sm font-bold text-center">
            {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {' '}
            {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Weekly Progress Section */}
        <div className="flex items-center flex-row justify-center gap-10">
          <CircularProgress
            size={180}
            progress={weeklyProgress}
            value={`${(weeklyData.targetCalories - weeklyData.consumedCalories).toLocaleString()}`}
            label="KCAL LEFT"
            color="var(--calories)"
            icon={calorieIcon}
          />
          <div className="flex items-center justify-center flex-col mr-4 w-1/3">
            <ProgressBar
              icon=""
              label="Protein"
              current={weeklyData.macros.protein.consumed}
              goal={weeklyData.macros.protein.target}
              color="var(--protein)"
              unit="g"
              dashboard={true}
            />
            <ProgressBar
              icon=""
              label="Carbs"
              current={weeklyData.macros.carbs.consumed}
              goal={weeklyData.macros.carbs.target}
              color="var(--carbs)"
              unit="g"
              dashboard={true}
            />
            <ProgressBar
              icon=""
              label="Fat"
              current={weeklyData.macros.fat.consumed}
              goal={weeklyData.macros.fat.target}
              color="var(--fats)"
              unit="g"
              dashboard={true}
            />
          </div>
        </div>
      </div>
      {loading && <Loader />}
      {/* Main Content */}
      <div className="p-6 space-y-6 pt-0">
        {/* Weekly Grid */}
        <Card>
          <div className="weekly-plan-header">
            <div className="flex justify-between items-center">
              <div className="weekly-plan-title">
                <Calendar className="h-5 w-5" />
                Week's Meal Plan
              </div>
              <div className="flex gap-2">
                <Button 
                  disabled={isGenerating}
                  onClick={generatePlan} 
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                    isGenerating 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm font-medium text-gray-900">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">AI Generate</span>
                    </>
                  )}
                </Button>
                
                <Button 
                  disabled={isGenerating}
                  onClick={editPlan} 
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
                    isEditMode 
                    ? 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700' 
                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-900'
                  }`}
                >
                  <Edit3 className={`h-4 w-4 ${isEditMode ? 'text-green-600' : 'text-gray-600'}`} />
                  <span className="text-sm font-medium">{isEditMode ? 'Editing...' : 'Edit'}</span>
                </Button>

                <Button 
                  disabled={isGenerating}
                  onClick={() => navigate('/shopping-list')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <ShoppingBag className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Shopping List</span>
                </Button>
              </div>
            </div>
          </div>
          {plan ? <CardContent className="p-6">
            <div className="grid grid-cols-8 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {/* Header Row - Empty cell + Days */}
              <div className="bg-gray-50 p-4"></div>
              {plan?.weeklyPlan.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <div key={index} 
                    className={`text-center p-4 border-l border-b ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric' })}
                    </div>
                  </div>
                );
              })}

              {/* Progress Row */}
              <div className={`grid-cell`}>
                <div className="text-xs font-medium text-gray-600">Daily Progress</div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <MealProgress 
                    key={index} 
                    dayPlan={day} 
                    isToday={isToday}
                    isMealProgressChanged={isMealProgressChanged}
                  />
                );
              })}

              {/* Breakfast Row */}
              <div className="grid-cell">
                <div className="flex flex-col items-center gap-2">
                  <img src={breakfastIcon} alt="Breakfast" className="h-8 w-8" />
                  <span className="text-xs font-medium text-gray-600">Breakfast</span>
                </div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <MealPlanCell
                    key={index}
                    meal={day.meals.breakfast}
                    isEditMode={isEditMode}
                    isToday={isToday}
                    date={new Date(day.date)}
                    onClick={() => handleMealClick(new Date(day.date), day.meals.breakfast)}
                    onMealComplete={() => mealComplete(new Date(day.date), day.meals.breakfast)}
                  />
                );
              })}

              {/* Lunch Row */}
              <div className="grid-cell">
                <div className="flex flex-col items-center gap-2">
                  <img src={lunchIcon} alt="Lunch" className="h-8 w-8" />
                  <span className="text-xs font-medium text-gray-600">Lunch</span>
                </div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <MealPlanCell
                    key={index}
                    meal={day.meals.lunch}
                    isEditMode={isEditMode}
                    isToday={isToday}
                    date={new Date(day.date)}
                    onClick={() => handleMealClick(new Date(day.date), day.meals.lunch)}
                    onMealComplete={() => mealComplete(new Date(day.date), day.meals.lunch)}
                  />
                );
              })}

              {/* Dinner Row */}
              <div className="grid-cell">
                <div className="flex flex-col items-center gap-2">
                  <img src={dinnerIcon} alt="Dinner" className="h-8 w-8" />
                  <span className="text-xs font-medium text-gray-600">Dinner</span>
                </div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <MealPlanCell
                    key={index}
                    meal={day.meals.dinner}
                    isEditMode={isEditMode}
                    isToday={isToday}
                    date={new Date(day.date)}
                    onClick={() => handleMealClick(new Date(day.date), day.meals.dinner)}
                    onMealComplete={() => mealComplete(new Date(day.date), day.meals.dinner)}
                  />
                );
              })}

              {/* Snacks Row */}
              <div className="grid-cell">
                <div className="flex flex-col items-center gap-2">
                  <img src={snackIcon} alt="Snacks" className="h-8 w-8" />
                  <span className="text-xs font-medium text-gray-600">Snacks</span>
                </div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <SnacksPlanCell
                    key={index}
                    snacks={day.meals.snacks}
                    isEditMode={isEditMode}
                    isToday={isToday}
                    date={new Date(day.date)}
                    onClick={(snack) => handleMealClick(new Date(day.date), day.meals.snacks[0])}
                  />
                );
              })}

              {/* Water Row */}
              <div className="grid-cell">
                <div className="flex flex-col items-center gap-2">
                  <img src={waterIcon} alt="Water" className="h-8 w-8" />
                  <span className="text-xs font-medium text-gray-600">Water</span>
                </div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();
                return (
                  <div key={index} className={`grid-cell border-l text-center ${isToday ? 'today' : ''}`}>
                    <span className="meal-name-text">{day.waterIntake} glasses</span>
                  </div>
                );
              })}

              {/* Workout Row */}
              <div className="grid-cell">
                <div className="flex flex-col items-center gap-2">
                  <img src={workoutIcon} alt="workout" className="h-8 w-8" />
                  <span className="text-xs font-medium text-gray-600">Workout</span>
                </div>
              </div>
              {weeklyMealsData.map((day, index) => {
                const isToday = new Date(day.date).toDateString() === new Date().toDateString();;
                return (
                    <WorkoutPlanCell
                        key={index}
                        workouts={day.workouts}
                        isEditMode={isEditMode}
                        isToday={isToday}
                        date={new Date(day.date)}
                    />
                );
              })}
                          </div>
          </CardContent> : <CardContent className="p-6">
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No plan generated yet</p>
            </div>
          </CardContent>}
        </Card>

        {/* Selected Meal Modal Placeholder */}
        {selectedMeal && (
          <div className="fixed inset-0 flex items-start justify-start z-50" onClick={() => setIsMealEditModalOpen(false)}>
            <Card 
              className="mt-20 ml-20 shadow-lg w-64"
              onClick={e => e.stopPropagation()}
            >
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Edit Meal</span>
                  <Button 
                    variant="ghost" 
                    className="h-auto p-1 hover:bg-transparent"
                    onClick={() => setSelectedMeal(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
                <p className="text-xs text-gray-500">{selectedMeal.meal.name}</p>
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
                  onClick={() => swapMeal('manual')}
                >
                    <div>
                        <img src={mealPlanIcon} alt="meal plan" className="w-4 h-4 mr-2" />
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
      </div>
    </div>
  );
};

export default WeeklyOverview; 