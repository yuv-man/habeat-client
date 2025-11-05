import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Plus, Share2, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Loader from '@/components/helper/loader';
import ProgressBar from '@/components/helper/ProgressBar';  
import "@/styles/shoppingList.css";
import NavBar from '@/components/ui/navbar';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { IMeal, IPlan } from '@/types/interfaces';
  
const mockShoppingList = [
  {
    category: "Vegetables",
    items: [
      { id: 1, name: "Cherry tomatoes", amount: "4 cups", checked: false, recipe: "Mediterranean Bowl & Greek Salad" },
      { id: 2, name: "Cucumber", amount: "2 large", checked: false, recipe: "Mediterranean Bowl" },
      { id: 3, name: "Red onion", amount: "1 medium", checked: true, recipe: "Mediterranean Bowl" },
      { id: 4, name: "Garlic", amount: "1 bulb", checked: false, recipe: "Multiple recipes" },
      { id: 5, name: "Bell peppers", amount: "3 mixed", checked: false, recipe: "Stir-fry Tuesday" }
    ]
  },
  {
    category: "Grains & Pantry",
    items: [
      { id: 6, name: "Quinoa", amount: "2 cups", checked: false, recipe: "Mediterranean Bowl" },
      { id: 7, name: "Olive oil", amount: "1 bottle", checked: true, recipe: "Multiple recipes" },
      { id: 8, name: "Kalamata olives", amount: "1 jar", checked: false, recipe: "Mediterranean Bowl" },
      { id: 9, name: "Rice", amount: "2 lbs", checked: false, recipe: "Stir-fry Tuesday" }
    ]
  },
  {
    category: "Dairy",
    items: [
      { id: 10, name: "Feta cheese", amount: "8 oz", checked: false, recipe: "Mediterranean Bowl & Greek Salad" },
      { id: 11, name: "Greek yogurt", amount: "32 oz", checked: false, recipe: "Breakfast parfaits" }
    ]
  },
  {
    category: "Herbs & Spices",
    items: [
      { id: 12, name: "Fresh parsley", amount: "1 bunch", checked: false, recipe: "Mediterranean Bowl" },
      { id: 13, name: "Lemons", amount: "3 pieces", checked: false, recipe: "Multiple recipes" }
    ]
  }
];

const ShoppingList = () => {
  const navigate = useNavigate();
  const [shoppingData, setShoppingData] = useState<ShoppingCategory[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user, plan, loading } = useAuthStore();
  const [favorites, setFavorites] = useState([]);
  
  useEffect(() => {
    const total = shoppingData.reduce((acc, category) => 
      acc + category.items.filter(item => item.checked).length, 0
    );
    setCompletedCount(total);
  }, [shoppingData]);

  useEffect(() => {
    if (plan) {
      const ingredients = getIngredientsFromPlan(plan);
      
      // Group ingredients by category (for now just one category)
      const shoppingData: ShoppingCategory[] = [{
        category: "All Ingredients",
        items: ingredients
      }];

      setShoppingData(shoppingData);
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
    recipes: string[];
  }

  const parseIngredient = (ingredient: string): IngredientInfo | null => {
    const parts = ingredient.split('|');
    if (parts.length !== 3) return null;

    return {
      name: parts[0],
      portion: parseFloat(parts[1]),
      unit: parts[2]
    };
  };

  const getIngredientsFromPlan = (plan: IPlan) => {
    // First, collect all ingredients with their meal sources
    const ingredientsWithSources = plan.weeklyPlan.reduce<{ ingredient: string; recipe: string }[]>((acc, day) => {
      const collectFromMeal = (meal: IMeal | undefined, mealType: string) => {
        if (!meal?.ingredients) return [];
        return meal.ingredients.map(ingredient => ({
          ingredient,
          recipe: `${mealType} - ${meal.name}`
        }));
      };

      // Get ingredients from main meals
      const breakfastIngredients = collectFromMeal(day.meals.breakfast, 'Breakfast');
      const lunchIngredients = collectFromMeal(day.meals.lunch, 'Lunch');
      const dinnerIngredients = collectFromMeal(day.meals.dinner, 'Dinner');
      
      // Get ingredients from snacks
      const snackIngredients = day.meals.snacks?.reduce((snackAcc, snack) => {
        return [...snackAcc, ...collectFromMeal(snack, 'Snack')];
      }, [] as { ingredient: string; recipe: string }[]) || [];

      return [...acc, ...breakfastIngredients, ...lunchIngredients, ...dinnerIngredients, ...snackIngredients];
    }, []);

    // Then aggregate ingredients
    const aggregatedIngredients = ingredientsWithSources.reduce<Record<string, AggregatedIngredient>>((acc, { ingredient, recipe }) => {
      const parsed = parseIngredient(ingredient);
      if (!parsed) return acc;

      if (!acc[parsed.name]) {
        acc[parsed.name] = {
          name: parsed.name,
          totalPortion: parsed.portion,
          unit: parsed.unit,
          recipes: [recipe]
        };
      } else {
        // Only add recipe if it's not already listed
        if (!acc[parsed.name].recipes.includes(recipe)) {
          acc[parsed.name].recipes.push(recipe);
        }
        // Only aggregate if units match
        if (acc[parsed.name].unit === parsed.unit) {
          acc[parsed.name].totalPortion += parsed.portion;
        }
      }

      return acc;
    }, {});

    // Convert to array and format for display
    return Object.values(aggregatedIngredients).map(({ name, totalPortion, unit, recipes }) => ({
      id: name,
      name: name.split('_').join(' '), // Convert chicken_breast to "chicken breast" for display
      amount: `${totalPortion} ${unit}`,
      recipe: recipes.length > 1 ? 'Multiple recipes' : recipes[0],
      checked: false
    }));
  }

  
  interface ShoppingItem {
    id: string;
    name: string;
    amount: string;
    recipe: string;
    checked: boolean;
  }

  interface ShoppingCategory {
    category: string;
    items: ShoppingItem[];
  }

  const toggleItem = (categoryIndex: number, itemId: string) => {
    setShoppingData(prev => {
      const newData = [...prev];
      const item = newData[categoryIndex].items.find(item => item.id === itemId);
      if (item) {
        item.checked = !item.checked;
      }
      return newData;
    });
  };

  const totalItems = shoppingData.reduce((acc, category) => acc + category.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <NavBar />
      {/* Header */}
      <div className="shopping-list-header">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Shopping List
          </h1>
          <div className="flex items-center gap-2">
          <div className="text-right">
              <div className="text-sm opacity-90">Week of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          icon=""
          label="Items Collected"
          current={completedCount}
          goal={totalItems}
          color="#F28627"
          unit="items"
          dashboard={false}
        />
      </div>

      {/* Shopping Categories */}
      <div className="p-4">
        {shoppingData.map((category, categoryIndex) => (
          <div key={category.category} className="mb-6">
            <h2 className="font-bold text-lg text-gray-800 mb-3 pb-2 border-b border-gray-200">
              {category.category}
            </h2>
            <div className="space-y-2">
              {category.items.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    item.checked ? 'bg-green-50 opacity-75' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(categoryIndex, item.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      item.checked 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {item.checked && <Check className="w-4 h-4" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>{item.amount}</span>
                      <span className="text-xs italic">{item.recipe}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <button className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
            <Plus className="w-6 h-6" />
          </button>
          <button className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors">
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;