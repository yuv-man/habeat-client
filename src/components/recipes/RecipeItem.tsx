import { useNavigate } from "react-router-dom";
import { Heart, Leaf, Package, FileText } from "lucide-react";
import { IRecipe } from "@/types/interfaces";
import { getMealImageVite } from "@/lib/mealImageHelper";

interface RecipeItemProps {
  recipe: IRecipe;
  showFavoriteIcon?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

const RecipeItem = ({
  recipe,
  showFavoriteIcon = true,
  isFavorite = false,
  onFavoriteToggle,
}: RecipeItemProps) => {
  const navigate = useNavigate();

  const getMealTypeLabel = (category: string) => {
    const typeMap: { [key: string]: string } = {
      breakfast: "Breakfast",
      lunch: "Lunch",
      dinner: "Dinner",
      snack: "Snack",
      snacks: "Snack",
      main: "Dinner",
    };
    return typeMap[category?.toLowerCase()] || "Meal";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Image Section */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {/* Meal Image */}
        <img
          src={getMealImageVite(recipe.mealName)}
          alt={recipe.mealName}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Show emoji fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector(".emoji-fallback")) {
              const fallback = document.createElement("div");
              fallback.className =
                "emoji-fallback text-6xl absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200";
              fallback.textContent = "🍽️";
              parent.appendChild(fallback);
            }
          }}
        />

        {/* Favorite Icon - Light green outline */}
        {showFavoriteIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
            className="absolute top-2 right-2 p-1.5"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite
                  ? "text-green-400 fill-green-400"
                  : "text-green-400 stroke-2"
              }`}
            />
          </button>
        )}

        {/* Meal Type Badge - Light blue rounded shape, bottom left */}
        {recipe.category && (
          <div className="absolute bottom-2 left-2">
            <span className="bg-blue-400 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
              {getMealTypeLabel(recipe.category)}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3">
        <h3 className="font-bold text-gray-900 text-sm mb-3 line-clamp-2">
          {recipe.mealName}
        </h3>

        {/* Nutritional Info */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <Leaf className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>{recipe.macros.calories} kcal</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <Package className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>{recipe.macros.protein} g protein</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <FileText className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span>{recipe.macros.carbs} g carbs</span>
          </div>
        </div>

        {/* View Recipe Button - Light green background */}
        <button
          onClick={() => navigate(`/recipes/${recipe.mealId}`)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipeItem;
