import { CardContent } from "@/components/ui/card";
import { mealTypes } from "@/lib/paths";
import "@/styles/dailyScreen.css";
import MealItemCard from "./MealItemCard";
import { MealData } from "@/types/interfaces";
import { Button } from "@/components/ui/button";
import addCircle from "@/assets/add_circle.svg";
import { Plus, Sparkles } from "lucide-react";
import MealModal from "@/components/modals/MealModal";
import { useState } from "react";

interface MealCardProps {
  mealType: string;
  mealData: MealData;
  caloriesRange: {
    min: number;
    max: number;
  };
  onMealCompleted: (meal: MealData) => void;
}

const   MealCard = ({ mealType, mealData, caloriesRange, onMealCompleted }: MealCardProps) => {
  const mealIcons = {
    breakfast: mealTypes.breakfast.icon,
    lunch: mealTypes.lunch.icon,
    dinner: mealTypes.dinner.icon,
    snacks: mealTypes.snacks.icon
  };

  const hasMeal = mealData && (mealType === 'snacks' ? mealData.items?.length > 0 : mealData.name !== 'No meal planned');
  const [showSnackActions, setShowSnackActions] = useState(false);
  // Calculate total calories for snacks (can have multiple items)
  const getTotalCalories = () => {
    if (mealType === 'snacks' && mealData && mealData.items && mealData.items.length > 0) {
      return mealData.items.reduce((total, item) => total + item.calories, 0);
    }
    return mealData?.calories;
  };

  const addSnack = () => {
    setShowSnackActions(!showSnackActions);
  }

  // Calculate total macros for snacks
  const getTotalMacros = () => {
    if (mealType === 'snacks' && mealData.items && mealData.items.length > 0) {
      return mealData.items.reduce(
        (total, item) => ({
          protein: total.protein + item.macros.protein,
          carbs: total.carbs + item.macros.carbs,
          fat: total.fat + item.macros.fat,
        }),
        { protein: 0, carbs: 0, fat: 0 }
      );
    }
    return mealData.macros;
  };

  const totalCalories = getTotalCalories();

  return (
    <div className="mealCard">
      <div className="pb-3 flex justify-between items-center p-2">
                <div className="flex items-center gap-3">
          <img src={mealIcons[mealType]} alt={mealType} className="w-10 h-10" />
          <div className="flex flex-col text-md font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <span className="capitalize text-gray-800">{mealType}</span>
              {hasMeal && (
                <span className="text-sm font-medium text-calories">
                  {totalCalories} cal
                </span>
              )}
            </div>
            <div className="text-xs text-gray-300">
              {caloriesRange.min}-{caloriesRange.max} Kcal
            </div>
          </div>
        </div>
          {mealType === 'snacks' && 
          <div className="relative">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors duration-200" onClick={addSnack}>
            <img src={addCircle} alt="add circle" className="w-6 h-6" />
          </div>
          <div className={`absolute top-full right-0 mt-1 transition-all duration-200 z-50 ${
              showSnackActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-2 min-w-[120px]">
              <Button 
                size="sm" 
                variant="ghost"
                className="w-full justify-start text-xs h-8 px-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                onClick={() => setShowSnackActions(!showSnackActions)}
              >
                <Sparkles className="h-3 w-3 mr-2 text-yellow-500" />
                Add Snack
              </Button>
              <MealModal onMealAdd={addSnack}>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Manually
                </Button>
              </MealModal>
            </div>
          </div>
          </div>}
      </div>
      
      <CardContent className="space-y-4 p-0">
        {/* Compact Meal Display - Only show when meal exists */}
        {hasMeal && (
          <div>
            {mealType === 'snacks' && mealData?.items?.length > 0 ? (
              <>
                {/* Individual Snack Items */}
                <div>
                  {mealData.items.map((item, index) => (
                    <MealItemCard key={index} item={{ ...item, done: mealData.done }} mealType={mealType} onComplete={(_e, newState) => {onMealCompleted({...item, done: newState} as MealData) }}/>
                  ))}
                </div>
              </>
            ) : (
              <>
                <MealItemCard item={mealData} mealType={mealType} onComplete={(_e, newState) => {onMealCompleted({...mealData, done: newState} as MealData)}} />
              </>
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default MealCard;
