import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  Flame,
  Check,
  Home,
  Clock,
  ChefHat,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IRecipe } from "@/types/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { getMealImageVite } from "@/lib/mealImageHelper";
import { getRecipeNote } from "@/mocks/mockRecipeData";

interface RecipeDetailProps {
  recipe: IRecipe;
  onBack: () => void;
}

// Format ingredient name (replace underscores with spaces)
const formatIngredientName = (name: string) => {
  return name?.replace(/_/g, " ") || "";
};

const RecipeDetail = ({ recipe, onBack }: RecipeDetailProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isMealFavorite, toggleFavoriteMeal } = useFavoritesStore();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  // Use mealId for favorites (the recipe references the meal)
  const mealId = recipe.mealId;
  const isFavorite = isMealFavorite(mealId);
  // Instructions and ingredients from backend
  const instructions = recipe.instructions || [];
  const ingredients = recipe.ingredients || [];
  const notes = getRecipeNote(recipe.mealName);

  // Get calories from macros
  const calories = recipe.macros?.calories || 0;

  const handleFavorite = async () => {
    if (user?._id && mealId) {
      await toggleFavoriteMeal(user._id, mealId);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.mealName,
          text: `Check out this recipe: ${recipe.mealName}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    }
  };

  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image with Overlay */}
      <div className="relative h-72 sm:h-80">
        <img
          src={getMealImageVite(recipe.mealName)}
          alt={recipe.mealName}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Header Actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleFavorite}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        </div>

        {/* Title on Image */}
        <div className="absolute bottom-6 left-4 right-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            {recipe.mealName}
          </h1>
        </div>
      </div>

      {/* Prep & Cook Time */}
      <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 border-b border-gray-200">
        {recipe.prepTime !== undefined && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-xs text-gray-500">Prep Time</p>
              <p className="font-semibold text-gray-900">
                {recipe.prepTime} min
              </p>
            </div>
          </div>
        )}
        {recipe.cookTime !== undefined && (
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500">Cook Time</p>
              <p className="font-semibold text-gray-900">
                {recipe.cookTime} min
              </p>
            </div>
          </div>
        )}
        {(recipe.prepTime !== undefined || recipe.cookTime !== undefined) && (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-500 font-bold text-xs">Σ</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-semibold text-gray-900">
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        {/* Nutrition Stats Card */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Nutrition Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Calories</p>
                <p className="font-bold text-gray-900">{calories} kcal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold text-sm">P</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Protein</p>
                <p className="font-bold text-gray-900">
                  {recipe.macros.protein}g
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">F</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fats</p>
                <p className="font-bold text-gray-900">{recipe.macros.fat}g</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">C</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carbs</p>
                <p className="font-bold text-gray-900">
                  {recipe.macros.carbs}g
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        {ingredients.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Ingredients
            </h2>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => {
                const isChecked = checkedIngredients.has(index);
                const name = formatIngredientName(ingredient.name);
                // Combine amount and unit (e.g., "170" + "g" = "170 g")
                const amountWithUnit = ingredient.amount
                  ? `${ingredient.amount}${
                      ingredient.unit ? ` ${ingredient.unit}` : ""
                    }`
                  : "-";

                return (
                  <button
                    key={ingredient._id || index}
                    onClick={() => toggleIngredient(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                      isChecked ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition ${
                        isChecked
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 text-white" />}
                    </div>
                    {/* Two columns: Amount+Unit | Name */}
                    <span
                      className={`w-20 flex-shrink-0 text-left font-medium ${
                        isChecked
                          ? "text-gray-400 line-through"
                          : "text-gray-900"
                      }`}
                    >
                      {amountWithUnit}
                    </span>
                    <span
                      className={`flex-1 text-left capitalize ${
                        isChecked
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions Section */}
        {instructions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Instructions
            </h2>
            <div className="space-y-4">
              {instructions.map((item) => (
                <div key={item._id || item.step} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-700 leading-relaxed">
                      {item.instruction}
                    </p>
                    {item.time && (
                      <p className="text-sm text-gray-500 mt-1">
                        ⏱️ {item.time} min
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-green-800 mb-2">Notes</h3>
          <p className="text-green-600 leading-relaxed">{notes}</p>
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/daily-tracker")}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          Back to Daily Tracker
        </button>

        <button
          onClick={handleFavorite}
          className={`p-3 rounded-xl border-2 transition ${
            isFavorite
              ? "bg-red-50 border-red-200 text-red-500"
              : "border-gray-200 text-gray-400 hover:border-gray-300"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={handleShare}
          className="p-3 rounded-xl border-2 border-gray-200 text-gray-400 hover:border-gray-300 transition"
          aria-label="Share recipe"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;
