import React, { useState } from "react";
import {
  Heart,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { IMeal } from "@/types/interfaces";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useProgressStore } from "@/stores/progressStore";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { getMealImageVite } from "@/lib/mealImageHelper";

interface MealCardProps {
  meal: IMeal;
  mealType: string;
  mealTime: string;
  onSwap?: () => void;
  onViewRecipe?: () => void;
  isSnack?: boolean;
}

const MealCard = ({
  meal,
  mealType,
  mealTime,
  onSwap,
  onViewRecipe,
  isSnack = false,
}: MealCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isMealFavorite, toggleFavoriteMeal } = useFavoritesStore();
  const { completeMeal, todayProgress } = useProgressStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const isFavorite = isMealFavorite(meal._id);
  const isCompleted = meal.done || false;

  const handleFavorite = async () => {
    if (user?._id) {
      await toggleFavoriteMeal(user._id, meal._id);
    }
  };

  const handleComplete = async () => {
    if (user?._id && todayProgress) {
      const date = todayProgress.date;
      await completeMeal(user._id, date, mealType, meal._id);
    }
  };

  const handleViewRecipe = () => {
    if (onViewRecipe) {
      onViewRecipe();
    } else {
      // Navigate to recipe detail page if available
      navigate(`/recipes/${meal._id}`);
    }
  };

  const handleSwap = () => {
    if (onSwap) {
      onSwap();
    }
  };

  if (isSnack) {
    // Simple snack card - no fold, no recipe, compact vertical size
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-2.5 mb-2 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm">{meal.name}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{mealTime}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                <span>{meal.calories} kcal</span>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only Favorite and Swap for snacks */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFavorite}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 stroke-2"
                }`}
              />
            </button>

            <button
              onClick={handleSwap}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Swap snack"
            >
              <RefreshCw className="w-4 h-4 text-gray-400 stroke-2" />
            </button>

            <button
              onClick={handleComplete}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={
                isCompleted ? "Mark as incomplete" : "Mark as complete"
              }
            >
              <CheckCircle2
                className={`w-4 h-4 ${
                  isCompleted
                    ? "fill-green-500 text-green-500"
                    : "text-gray-400 stroke-2"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Meal Info Section */}
      <div className="flex items-start gap-3 mb-3">
        {/* Meal Image */}
        <img
          src={getMealImageVite(meal.name, meal.icon)}
          alt={meal.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />

        {/* Meal Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base mb-1">
            {meal.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{mealTime}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{meal.calories} kcal</span>
            </div>
          </div>
        </div>

        {/* Done Button - Always Visible */}
        <button
          onClick={handleComplete}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        >
          <CheckCircle2
            className={`w-5 h-5 ${
              isCompleted
                ? "fill-green-500 text-green-500"
                : "text-gray-400 stroke-2"
            }`}
          />
        </button>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-3 mt-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Additional Info */}
          <div className="space-y-2">
            {meal.prepTime > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Prep time: {meal.prepTime} min</span>
              </div>
            )}
            {meal.macros && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Protein: {meal.macros.protein}g</span>
                <span>•</span>
                <span>Carbs: {meal.macros.carbs}g</span>
                <span>•</span>
                <span>Fat: {meal.macros.fat}g</span>
              </div>
            )}
          </div>

          {/* Action Buttons - Inside Fold */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={handleFavorite}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 stroke-2"
                }`}
              />
            </button>

            <button
              onClick={handleViewRecipe}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="View recipe"
            >
              <BookOpen className="w-5 h-5 text-gray-400 stroke-2" />
            </button>

            <button
              onClick={handleSwap}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Swap meal"
            >
              <RefreshCw className="w-5 h-5 text-gray-400 stroke-2" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-3 pt-3 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={isExpanded ? "Collapse" : "Expand"}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>Show less</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>Show more</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MealCard;
