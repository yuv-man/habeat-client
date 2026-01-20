import { useState, memo } from "react";
import {
  Heart,
  Check,
  BookOpen,
  RefreshCw,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { IMeal } from "@/types/interfaces";
import { useProgressStore } from "@/stores/progressStore";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { getMealImageVite } from "@/lib/mealImageHelper";
import ChangeMealModal from "@/components/modals/ChangeMealModal";
import TiredButton from "@/components/dashboard/TiredButton";
import { formatMealName } from "@/lib/formatters";

type MealStatus = "past" | "current" | "future";

interface MealCardProps {
  meal: IMeal;
  mealType: string;
  mealTime: string;
  date: string; // Date in YYYY-MM-DD format for API calls
  snackIndex?: number; // Index of snack (for snacks only)
  onMealChange?: (newMeal: IMeal) => void;
  onViewRecipe?: () => void;
  isSnack?: boolean;
  mealStatus?: MealStatus; // Status: past, current, or future
}

const MealCard = ({
  meal,
  mealType,
  mealTime,
  date,
  snackIndex,
  onMealChange,
  onViewRecipe,
  isSnack = false,
  mealStatus = "current",
}: MealCardProps) => {
  const navigate = useNavigate();
  const displayName = formatMealName(meal.name);
  const { user, updateFavorite } = useAuthStore();
  const { completeMeal, todayProgress } = useProgressStore();
  // Auto-expand if current meal (but never for snacks), otherwise start collapsed
  const [isExpanded, setIsExpanded] = useState(
    !isSnack && mealStatus === "current"
  );
  // State to track if title is expanded (to show full text)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  // Get meal ID with fallback for compatibility
  const mealId = meal._id || (meal as any).id || "";

  // Check if meal is in user.favoriteMeals array
  const isFavorite = user?.favoriteMeals?.includes(mealId) || false;
  const isCompleted = meal.done || false;

  const handleFavorite = async () => {
    if (user?._id && mealId) {
      const wasAlreadyFavorite = isFavorite;
      try {
        await updateFavorite(user._id, mealId, !wasAlreadyFavorite);

        if (wasAlreadyFavorite) {
          toast.success("Removed from favorites", {
            duration: 2000,
          });
        } else {
          toast.success("❤️ Added to favorites!", {
            duration: 2000,
          });
        }
      } catch (error) {
        toast.error("Failed to update favorite");
      }
    }
  };

  const handleComplete = async () => {
    if (user?._id && todayProgress && mealId) {
      const date = todayProgress.date;
      try {
        await completeMeal(user._id, date, mealType, mealId);
      } catch (error) {
        // Error handling is done in the store with rollback
        toast.error("Failed to update meal. Please try again.");
      }
    }
  };

  const handleViewRecipe = () => {
    if (onViewRecipe) {
      onViewRecipe();
    } else {
      // Navigate to recipe detail page if available
      navigate(`/recipes/${mealId}`);
    }
  };

  const handleMealChange = (newMeal: IMeal) => {
    if (onMealChange) {
      onMealChange(newMeal);
      toast.success(`Meal changed to ${formatMealName(newMeal.name)}`, {
        duration: 2000,
      });
    }
  };

  // Determine card styling based on status
  // Snacks can NEVER be current - override mealStatus for snacks
  const isPast = mealStatus === "past";
  const isCurrent = !isSnack && mealStatus === "current";

  // Card classes based on status - make cards bigger
  const cardClasses = isPast
    ? "bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm opacity-75"
    : isCurrent
    ? "bg-white border-2 border-green-200 rounded-lg p-5 shadow-md"
    : "bg-white border border-gray-200 rounded-lg p-4 shadow-sm opacity-90";

  if (isSnack) {
    // Simple snack card - no fold, no recipe, compact vertical size
    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              onClick={() => setIsTitleExpanded(!isTitleExpanded)}
              className={`font-medium break-words cursor-pointer transition-colors hover:text-gray-900 ${
                isTitleExpanded ? "" : "line-clamp-2"
              } ${
                isPast
                  ? "text-gray-500 text-xs"
                  : isCurrent
                  ? "text-gray-900 text-sm"
                  : "text-gray-700 text-xs"
              }`}
              title={isTitleExpanded ? "Click to collapse" : "Click to see full title"}
            >
              {displayName}
            </h3>
            <div
              className={`flex items-center gap-2 mt-0.5 ${
                isPast
                  ? "text-xs text-gray-400"
                  : isCurrent
                  ? "text-xs text-gray-600"
                  : "text-xs text-gray-500"
              }`}
            >
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

            <ChangeMealModal
              currentMeal={meal}
              mealType={mealType}
              date={date}
              snackIndex={isSnack ? snackIndex : undefined}
              onMealChange={handleMealChange}
            >
              <button
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Swap snack"
              >
                <RefreshCw className="w-4 h-4 text-gray-400 stroke-2" />
              </button>
            </ChangeMealModal>

            <button
              onClick={handleComplete}
              className={`p-0.5 rounded-full transition-all duration-200 ${
                isCompleted
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 scale-110 shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              aria-label={
                isCompleted ? "Mark as incomplete" : "Mark as complete"
              }
            >
              <Check
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  isCompleted
                    ? "text-white stroke-[3]"
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
    <div className={cardClasses}>
      {/* Meal Info Section */}
      <div className={`flex items-start gap-3 ${isCurrent ? "mb-3" : "mb-2"}`}>
        {/* Meal Image - Make bigger */}
        <img
          src={getMealImageVite(meal.name, meal.icon)}
          alt={displayName}
          className={`rounded-lg object-cover flex-shrink-0 ${
            isPast ? "w-16 h-16" : isCurrent ? "w-20 h-20" : "w-[72px] h-[72px]"
          }`}
        />

        {/* Meal Details */}
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => setIsTitleExpanded(!isTitleExpanded)}
            className={`font-bold break-words cursor-pointer transition-colors hover:text-gray-900 mb-1 ${
              isTitleExpanded ? "" : "line-clamp-2"
            } ${
              isPast
                ? "text-gray-500 text-sm"
                : isCurrent
                ? "text-gray-900 text-base"
                : "text-gray-700 text-sm"
            }`}
            title={isTitleExpanded ? "Click to collapse" : "Click to see full title"}
          >
            {displayName}
          </h3>
          <div
            className={`flex items-center gap-2 ${
              isPast
                ? "text-xs text-gray-400"
                : isCurrent
                ? "text-sm text-gray-600"
                : "text-xs text-gray-500"
            }`}
          >
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

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 stroke-2"
              }`}
            />
          </button>

          {/* Done Button */}
          <button
            onClick={handleComplete}
            className={`p-1 rounded-full transition-all duration-200 ${
              isCompleted
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 scale-110 shadow-sm"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            <Check
              className={`w-4 h-4 transition-all duration-200 ${
                isCompleted ? "text-white stroke-[3]" : "text-gray-400 stroke-2"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {!isSnack && meal.prepTime > 0 && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                Preparation time:{" "}
                <span className="font-medium">{meal.prepTime} minutes</span>
              </span>
            </div>
          )}
          {/* Nutrition Details */}
          <div className="space-y-3">
            {meal.macros && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Protein: {meal.macros.protein}g</span>
                <span>•</span>
                <span>Carbs: {meal.macros.carbs}g</span>
                <span>•</span>
                <span>Fat: {meal.macros.fat}g</span>
              </div>
            )}

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  Ingredients:
                </span>
                <div className="flex flex-wrap gap-2">
                  {meal.ingredients.slice(0, 5).map((ingredient, idx) => {
                    const parts = ingredient.split("|");
                    const name = parts[0]?.replace(/_/g, " ") || ingredient;
                    return (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-white rounded-full text-gray-600 border border-gray-200"
                      >
                        {name}
                      </span>
                    );
                  })}
                  {meal.ingredients.length > 5 && (
                    <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-500 border border-gray-200">
                      +{meal.ingredients.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Inside Expand */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
            {/* I'm Tired Button - Quick meal swap */}
            {!isSnack && !isPast && (
              <TiredButton
                meal={meal}
                mealType={mealType as "breakfast" | "lunch" | "dinner"}
                date={date}
                onMealChange={handleMealChange}
              />
            )}
            <button
              onClick={handleViewRecipe}
              className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
              aria-label="View recipe"
            >
              <BookOpen className="w-4 h-4 text-gray-600 stroke-2" />
              <span className="text-sm text-gray-700 font-medium">Recipe</span>
            </button>

            {!isPast && (
              <ChangeMealModal
                currentMeal={meal}
                mealType={mealType}
                date={date}
                snackIndex={isSnack ? snackIndex : undefined}
                onMealChange={handleMealChange}
              >
                <button
                  className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
                  aria-label="Swap meal"
                >
                  <RefreshCw className="w-4 h-4 text-gray-600 stroke-2" />
                  <span className="text-sm text-gray-700 font-medium">
                    Swap
                  </span>
                </button>
              </ChangeMealModal>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button - Show for all meals (expandable option) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full mt-3 pt-3 border-t border-gray-200 flex items-center justify-center gap-2 transition-colors ${
          isPast
            ? "text-xs text-gray-400 hover:text-gray-500"
            : "text-sm text-gray-600 hover:text-gray-900"
        }`}
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

export default memo(MealCard);
