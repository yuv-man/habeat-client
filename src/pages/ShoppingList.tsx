import React, { useState, useEffect } from "react";
import { Search, ShoppingBag as ShoppingBagIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IMeal, IPlan } from "@/types/interfaces";
import BottomNav from "@/components/ui/BottomNav";
import NavBar from "@/components/ui/navbar";
import MobileHeader from "@/components/ui/MobileHeader";
import { userAPI } from "@/services/api";
import { mockShoppingIngredients } from "@/mocks/shoppingListMock";
import config from "@/services/config";
import ShoppingBag from "@/components/shopping/ShoppingBag";
import { IngredientInput, aggregateIngredients } from "@/lib/shoppingHelpers";

const ShoppingList = () => {
  const navigate = useNavigate();
  const { user, plan, loading, token } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only redirect if not loading, no user, AND no token
    if (!loading && !user && !token) {
      navigate("/register");
    }
  }, [user, loading, token, navigate]);

  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);

  useEffect(() => {
    if (config.testFrontend || !plan) {
      // Use mock data in test mode or if no plan
      setIngredients(mockShoppingIngredients);
      setIsLoading(false);
    } else if (plan) {
      const extractedIngredients = getIngredientsFromPlan(plan);
      setIngredients(extractedIngredients);
      setIsLoading(false);
    }
  }, [plan]);

  interface IngredientInfo {
    name: string;
    portion: number;
    unit: string;
  }

  interface AggregatedIngredient {
    name: string;
    totalPortion: number;
    unit: string;
  }

  const parseIngredient = (ingredient: string): IngredientInfo | null => {
    const parts = ingredient.split("|");
    if (parts.length !== 3) return null;

    return {
      name: parts[0],
      portion: parseFloat(parts[1]),
      unit: parts[2],
    };
  };

  const getIngredientsFromPlan = (plan: IPlan): IngredientInput[] => {
    const weeklyPlanArray = Object.values(plan.weeklyPlan);
    const ingredientsWithSources = weeklyPlanArray.reduce<
      { ingredient: string }[]
    >((acc, day) => {
      const collectFromMeal = (meal: IMeal | undefined) => {
        if (!meal?.ingredients) return [];
        return meal.ingredients.map((ingredient) => ({ ingredient }));
      };

      const breakfastIngredients = collectFromMeal(day.meals.breakfast);
      const lunchIngredients = collectFromMeal(day.meals.lunch);
      const dinnerIngredients = collectFromMeal(day.meals.dinner);
      const snackIngredients =
        day.meals.snacks?.reduce((snackAcc, snack) => {
          return [...snackAcc, ...collectFromMeal(snack)];
        }, [] as { ingredient: string }[]) || [];

      return [
        ...acc,
        ...breakfastIngredients,
        ...lunchIngredients,
        ...dinnerIngredients,
        ...snackIngredients,
      ];
    }, []);

    const aggregatedIngredients = ingredientsWithSources.reduce<
      Record<string, AggregatedIngredient>
    >((acc, { ingredient }) => {
      const parsed = parseIngredient(ingredient);
      if (!parsed) return acc;

      if (!acc[parsed.name]) {
        acc[parsed.name] = {
          name: parsed.name,
          totalPortion: parsed.portion,
          unit: parsed.unit,
        };
      } else {
        if (acc[parsed.name].unit === parsed.unit) {
          acc[parsed.name].totalPortion += parsed.portion;
        }
      }

      return acc;
    }, {});

    // Convert to IngredientInput array
    return Object.values(aggregatedIngredients).map(
      ({ name, totalPortion, unit }) => ({
        name: name.split("_").join(" "),
        amount: `${totalPortion} ${unit}`,
      })
    );
  };

  const toggleItem = (categoryIndex: number, itemId: string) => {
    // This will be handled by ShoppingBag component's internal state
    // or we can manage it here if needed
    console.log("Toggle item:", categoryIndex, itemId);
  };

  // Filter ingredients by search query
  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <div>Redirecting...</div>;
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shopping list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 pt-14 md:pt-16">
      <MobileHeader />
      <NavBar />
      <div className="px-4 py-6">
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Shopping List</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            />
          </div>
        </div>

        {/* Shopping Categories */}
        <ShoppingBag
          ingredients={filteredIngredients}
          onItemToggle={toggleItem}
        />

        {/* Floating Action Button */}
        <button className="fixed bottom-24 right-6 md:bottom-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-40">
          <ShoppingBagIcon className="w-6 h-6" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ShoppingList;
