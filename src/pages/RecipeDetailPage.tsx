import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import RecipeDetail from "@/components/recipes/RecipeDetail";
import { IMeal } from "@/types/interfaces";
import { userAPI } from "@/services/api";

const RecipeDetailPage = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { user, plan, loading, token } = useAuthStore();
  const [recipe, setRecipe] = useState<IMeal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if not loading, no user, AND no token
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeId || !plan) {
        setIsLoading(false);
        return;
      }

      // Try to find meal in the plan
      const weeklyPlan = plan.weeklyPlan;
      let foundMeal: IMeal | null = null;

      for (const dateKey of Object.keys(weeklyPlan)) {
        const dailyPlan = weeklyPlan[dateKey];
        const { breakfast, lunch, dinner, snacks } = dailyPlan.meals;

        if (breakfast._id === recipeId) {
          foundMeal = breakfast;
          break;
        }
        if (lunch._id === recipeId) {
          foundMeal = lunch;
          break;
        }
        if (dinner._id === recipeId) {
          foundMeal = dinner;
          break;
        }
        const snack = snacks.find((s) => s._id === recipeId);
        if (snack) {
          foundMeal = snack;
          break;
        }
      }

      setRecipe(foundMeal);
      setIsLoading(false);
    };

    loadRecipe();
  }, [recipeId, plan]);

  // Show loading if still loading OR if we have a token but no user yet
  if (loading || (token && !user) || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Recipe not found</p>
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

  return <RecipeDetail meal={recipe} onBack={() => navigate(-1)} />;
};

export default RecipeDetailPage;
