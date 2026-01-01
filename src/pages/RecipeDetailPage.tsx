import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import RecipeDetail from "@/components/recipes/RecipeDetail";
import MealLoader from "@/components/helper/MealLoader";
import { IRecipe } from "@/types/interfaces";
import { userAPI } from "@/services/api";
import { ArrowLeft } from "lucide-react";

const recipeLoadingMessages = [
  "📖 Opening the cookbook...",
  "👨‍🍳 Our AI chef is writing your recipe...",
  "🥘 Crafting cooking instructions...",
  "📝 Detailing the steps...",
  "✨ Adding the finishing touches...",
];

const RecipeDetailPage = () => {
  // mealId comes from the URL - we fetch the recipe by meal ID
  const { recipeId: mealId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();
  const [recipe, setRecipe] = useState<IRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect if not loading, no user, AND no token
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!mealId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch recipe from backend using meal ID
        // First time: AI generates the recipe (takes time)
        // Subsequent times: Returns from DB (instant)
        const response = await userAPI.getRecipeByMealId(
          mealId,
          user?._id || ""
        );
        if (response.data) {
          setRecipe(response.data);
        } else {
          setError("Recipe not found");
        }
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        setError("Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadRecipe();
    }
  }, [mealId, user]);

  // Show loading if still loading OR if we have a token but no user yet
  if (loading || (token && !user) || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Back button during loading */}
        <div className="p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        {/* Loader centered */}
        <div className="flex-1 flex items-center justify-center">
          <MealLoader customMessages={recipeLoadingMessages} interval={2000} />
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            {error || "Recipe not found"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-green-500 hover:text-green-600 font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return <RecipeDetail recipe={recipe} onBack={() => navigate(-1)} />;
};

export default RecipeDetailPage;
