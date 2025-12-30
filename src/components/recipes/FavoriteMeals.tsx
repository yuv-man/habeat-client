import { useNavigate } from "react-router-dom";
import { Home, Calendar, Heart, ShoppingBag, Target } from "lucide-react";
import { IRecipe } from "@/types/interfaces";
import RecipeItem from "./RecipeItem";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const FavoriteMeals = ({ recipes }: { recipes: IRecipe[] }) => {
  const navigate = useNavigate();
  const { user, updateFavorite } = useAuthStore();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 text-start">
          Favorite Meals
        </h1>
      </div>

      {/* Meal Cards Grid */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {recipes.map((recipe: IRecipe) => {
            // Handle both id and _id for compatibility
            const recipeId = recipe.mealId;
            // Check if meal is in user.favoriteMeals
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
                      if (isFavorite) {
                        toast.success("Removed from favorites", {
                          duration: 2000,
                        });
                      } else {
                        toast.success("❤️ Added to favorites!", {
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

        {recipes.length === 0 && (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No favorite recipes yet
            </h3>
            <p className="text-gray-500 text-sm">
              Start adding recipes to your favorites to see them here
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate("/daily-tracker")}
            className="flex flex-col items-center gap-1 py-2 px-3 transition text-gray-600 hover:text-gray-900"
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Today</span>
          </button>
          <button
            onClick={() => navigate("/weekly-overview")}
            className="flex flex-col items-center gap-1 py-2 px-3 transition text-gray-600 hover:text-gray-900"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs font-medium">Plan</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 px-3 transition text-green-500">
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium">Favorites</span>
          </button>
          <button
            onClick={() => navigate("/shopping-list")}
            className="flex flex-col items-center gap-1 py-2 px-3 transition text-gray-600 hover:text-gray-900"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs font-medium">Shop</span>
          </button>
          <button
            onClick={() => navigate("/goals")}
            className="flex flex-col items-center gap-1 py-2 px-3 transition text-gray-600 hover:text-gray-900"
          >
            <Target className="w-6 h-6" />
            <span className="text-xs font-medium">Goals</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default FavoriteMeals;
