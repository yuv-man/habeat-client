import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronDown, ChevronUp } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { IRecipe } from "@/types/interfaces";
import RecipeItem from "@/components/recipes/RecipeItem";
import MealLoader from "@/components/helper/MealLoader";
import { toast } from "sonner";

interface FavoriteMealsSectionProps {
  className?: string;
  maxVisible?: number;
}

const FavoriteMealsSection = ({
  className = "",
  maxVisible = 4,
}: FavoriteMealsSectionProps) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    user,
    favoriteMealsData,
    favoriteMealsLoaded,
    fetchFavoriteMeals,
    updateFavorite,
  } = useAuthStore();

  useEffect(() => {
    if (user?._id && !favoriteMealsLoaded) {
      fetchFavoriteMeals(user._id);
    }
  }, [user?._id, favoriteMealsLoaded, fetchFavoriteMeals]);

  // Convert favorite meals to recipe format
  const favoriteMealsAsRecipes: IRecipe[] = favoriteMealsData.map((meal) => ({
    _id: meal._id,
    mealId: meal._id,
    mealName: meal.name,
    category: meal.category || "meal",
    cookTime: meal.prepTime || 0,
    servings: 1,
    difficulty: "easy",
    tags: [],
    ingredients: (meal.ingredients || []).map((ing, idx) => {
      if (typeof ing === "string") {
        return { name: ing, amount: "", unit: "Other", _id: `ing-${idx}` };
      } else if (Array.isArray(ing)) {
        return {
          name: ing[0] || "",
          amount: ing[1] || "",
          unit: ing[2] || "Other",
          _id: `ing-${idx}`,
        };
      }
      return { name: "", amount: "", unit: "Other", _id: `ing-${idx}` };
    }),
    instructions: [],
    macros: {
      calories: meal.calories || 0,
      protein: meal.macros?.protein || 0,
      carbs: meal.macros?.carbs || 0,
      fat: meal.macros?.fat || 0,
    },
  }));

  const visibleMeals = isExpanded
    ? favoriteMealsAsRecipes
    : favoriteMealsAsRecipes.slice(0, maxVisible);
  const hasMore = favoriteMealsAsRecipes.length > maxVisible;

  if (!favoriteMealsLoaded) {
    return null; // Don't show loading state, just hide until loaded
  }

  if (favoriteMealsAsRecipes.length === 0) {
    return null; // Don't show section if no favorites
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <h3 className="font-semibold text-gray-900 text-sm">Favorite Meals</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {favoriteMealsAsRecipes.length}
          </span>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {visibleMeals.map((recipe: IRecipe) => {
            const recipeId = recipe.mealId;
            const isFavorite = user?.favoriteMeals?.includes(recipeId) || false;
            return (
              <RecipeItem
                key={recipeId}
                recipe={recipe}
                isFavorite={isFavorite}
                onFavoriteToggle={async () => {
                  if (user?._id && recipeId) {
                    try {
                      await updateFavorite(user._id, recipeId, !isFavorite);
                      await fetchFavoriteMeals(user._id);
                      if (isFavorite) {
                        toast.success("Removed from favorites", {
                          duration: 2000,
                        });
                      }
                    } catch (error) {
                      console.error("Failed to update favorite:", error);
                      toast.error("Failed to update favorite");
                    }
                  }
                }}
              />
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 transition"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show {favoriteMealsAsRecipes.length - maxVisible} More{" "}
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FavoriteMealsSection;
