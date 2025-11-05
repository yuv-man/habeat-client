import { useState, useEffect } from "react";
import "@/styles/mealItemCard.css";
import checkCircle from "@/assets/check_circle_green.svg";
import uncheckedIcon from "@/assets/empty_check.svg";
import removeIcon from "@/assets/close.svg";
import FireIcon from "@/assets/fire.svg?react";
import FavoriteIcon from "@/assets/favorite-full.svg?react";
import UnFavoriteIcon from "@/assets/favorite-empty.svg?react";
import ChangePortionIcon from "@/assets/swap.svg?react";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";
import MealModal from "@/components/modals/MealModal";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";

interface MealItemCardProps {
  item: {
    _id: string;
    name: string;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
    };
    done: boolean;
  };
  mealType: string;
  onComplete: (e: React.MouseEvent, isCompleted: boolean) => void;
}

const MealItemCard = ({ item, mealType, onComplete}: MealItemCardProps) => {
  const { user, updateFavorite } = useAuthStore();
  const [isCompleted, setIsCompleted] = useState(item.done);
  const [isFavorite, setIsFavorite] = useState(user.favoriteMeals.includes(item._id));
  const [showActions, setShowActions] = useState(false);

  // Update favorite state when user changes
  useEffect(() => {
    if (user) {
      setIsFavorite(user.favoriteMeals.includes(item._id));
    }
  }, [user, item._id]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowActions(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const favoriteClicked = async () => {
    try {
      const newFavoriteState = !isFavorite;
      await updateFavorite(user._id, item._id, newFavoriteState);
      setIsFavorite(newFavoriteState); // Only update state after successful API call
    } catch (error) {
      console.error('Failed to update favorite:', error);
      // State remains unchanged if the API call fails
    }
  };

  const onCompleteClicked = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isCompleted;
    setIsCompleted(newState);
    onComplete(e, newState);
  };

  const onSurpriseMe = (itemId: string) => {
    console.log(itemId);
  };

  const onRemoveItem = (itemId: string) => {
    console.log(itemId);
  };

  const onMealAdd = (meal: { name: string; calories: string; type: string }) => {
    console.log(meal);
  };

  return (
    <div className="mealItemCard">
      <div className="flex justify-between">
        <div className="mealItemCardHeader">
          <div className="mealItemCardHeaderText">{item.name}</div>
          <div onClick={(e: React.MouseEvent) => onCompleteClicked(e)} className="mealItemCardHeaderCheck">
            {isCompleted ? <img src={checkCircle} alt="check circle" className="w-4 h-4" /> : <img src={uncheckedIcon} alt="check circle" className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex flex-row gap-2 justify-between items-center">
          <div className="add-to-favourites" onClick={favoriteClicked}>
            {isFavorite ? <FavoriteIcon className="w-4 h-4" /> : <UnFavoriteIcon className="w-4 h-4" />}
          </div>
          <div className="relative">
            <div className="change-portion" onClick={() => setShowActions(!showActions)}>
              <ChangePortionIcon className="w-4 h-4 text-red-500" />
            </div>
            {/* Action Buttons aligned with change button */}
            <div className={`absolute top-full right-0 mt-1 transition-all duration-200 z-50 ${
              showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}>
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-2 min-w-[120px]">
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="w-full justify-start text-xs h-8 px-2 hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  onClick={() => onSurpriseMe(item._id)}
                >
                  <Sparkles className="h-3 w-3 mr-2 text-yellow-500" />
                  Surprise Me
                </Button>
                <MealModal onMealAdd={onMealAdd}>
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
          </div>
          {mealType === 'snacks' && <div className="mealItemCardRemove">
            <img src={removeIcon} alt="remove" className="w-4 h-4" />
          </div>}
        </div>
      </div>

      {/* Snack Calories */}
      <div className="mealItemCardCalories flex flex-row gap-1">
        <FireIcon className="w-4 h-4" />
        {item.calories} cal
      </div>

      {/* Snack Macros */}
      <div className="flex gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>Carbs: {item.macros.carbs}g</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>Protein: {item.macros.protein}g</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span>Fat: {item.macros.fat}g</span>
        </div>
      </div>
    </div>
  );
};

export default MealItemCard;