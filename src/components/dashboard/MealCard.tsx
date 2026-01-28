import { useState, memo } from "react";
import {
  Heart,
  Check,
  BookOpen,
  RefreshCw,
  Clock,
  Flame,
  ChevronUp,
  ChevronDown,
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
import HealthIcon from "@/assets/icons/healthy.svg";
import {
  calculateMealHealthScore,
  getHealthScoreColor,
} from "@/lib/nutritionHelpers";

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
    !isSnack && mealStatus === "current",
  );
  // State to track if title is expanded (to show full text)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);

  // Get meal ID with fallback for compatibility
  const mealId = meal._id || (meal as any).id || "";

  // Check if meal is in user.favoriteMeals array
  const isFavorite = user?.favoriteMeals?.includes(mealId) || false;
  const isCompleted = meal.done || false;

  // Calculate health score
  const healthScore = calculateMealHealthScore(meal);
  const healthScoreStyle = getHealthScoreColor(healthScore);

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
      ? "bg-white border-2 border-green-200 rounded-lg pl-2 p-5 shadow-md"
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
              title={
                isTitleExpanded
                  ? "Click to collapse"
                  : "Click to see full title"
              }
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
    <div className={`${cardClasses} relative`}>
      {/* Meal Info Section */}
      <div className={`flex items-start gap-3`}>
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
            title={
              isTitleExpanded ? "Click to collapse" : "Click to see full title"
            }
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

        {/* Chevron Button - Right side of card, fixed position */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-14 right-4 p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 z-10"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Prep Time and Health Score - Compact Row */}
          <div className="flex items-center gap-2">
            {/* Prep Time */}
            {!isSnack && meal.prepTime > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Prep {meal.prepTime}m
                </span>
              </div>
            )}
            {/* Health Score */}
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${healthScoreStyle.bg} ${healthScoreStyle.border}`}
            >
              <img
                src={HealthIcon}
                alt="Health score"
                className="w-4 h-4 flex-shrink-0"
              />
              <span
                className={`text-xs font-semibold ${healthScoreStyle.text} whitespace-nowrap`}
              >
                Health Score: {healthScore}
              </span>
            </div>
          </div>
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
          </div>

          {/* Action Buttons - Inside Expand */}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            {/* Done Button and Swap Button - Same Line */}
            {!isPast && (
              <div className="flex items-center gap-3">
                {/* Bold Done Button */}
                <button
                  onClick={handleComplete}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all duration-200 font-bold text-base flex items-center justify-center gap-2 ${
                    isCompleted
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                  aria-label={
                    isCompleted ? "Mark as incomplete" : "Mark as complete"
                  }
                >
                  <Check
                    className={`w-5 h-5 transition-all duration-200 ${
                      isCompleted ? "stroke-[3]" : "stroke-2"
                    }`}
                  />
                  <span>{isCompleted ? "Completed" : "Mark as Done"}</span>
                </button>
                {/* I'm Tired Button - Quick meal swap */}
                {!isSnack && (
                  <TiredButton
                    meal={meal}
                    mealType={mealType as "breakfast" | "lunch" | "dinner"}
                    date={date}
                    onMealChange={handleMealChange}
                  />
                )}
              </div>
            )}

            {/* Other Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleViewRecipe}
                className="px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
                aria-label="View recipe"
              >
                <BookOpen className="w-4 h-4 text-gray-600 stroke-2" />
                <span className="text-sm text-gray-700 font-medium">
                  Recipe
                </span>
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
        </div>
      )}
    </div>
  );
};

export default memo(MealCard);
