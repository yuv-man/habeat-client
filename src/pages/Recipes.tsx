import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, BookOpen, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "@/styles/recipes.css";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import { IRecipe } from "@/types/interfaces";
import FavoriteMeals from "@/components/recipes/FavoriteMeals";
import RecipeItem from "@/components/recipes/RecipeItem";
import { toast } from "sonner";
import config from "@/services/config";
import { mockRecipes } from "@/mocks/recipesMock";

const Recipes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const {
    user,
    updateFavorite,
    favoriteMealsData,
    favoriteMealsLoaded,
    fetchFavoriteMeals,
  } = useAuthStore();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);

  // Fetch favorite meals only if not already loaded
  useEffect(() => {
    if (!user?._id) return;

    if (config.testFrontend) {
      setRecipes(mockRecipes);
      return;
    }

    // Only fetch if not already loaded
    if (!favoriteMealsLoaded) {
      fetchFavoriteMeals(user._id);
    }
  }, [user?._id, favoriteMealsLoaded, fetchFavoriteMeals]);

  const categories = [
    { id: "all", label: "All Recipes", count: recipes.length },
    { id: "breakfast", label: "Breakfast", count: 12 },
    { id: "lunch", label: "Lunch", count: 18 },
    { id: "dinner", label: "Dinner", count: 24 },
    { id: "snacks", label: "Snacks", count: 15 },
  ];

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.mealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags?.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      recipe.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert favorite meals to recipe format for display
  const favoriteMealsAsRecipes: IRecipe[] = favoriteMealsData.map((meal) => ({
    _id: meal._id,
    mealId: meal._id, // Recipe references the meal
    mealName: meal.name,
    category: meal.category || "meal",
    cookTime: meal.prepTime || 0,
    servings: 1,
    difficulty: "easy",
    tags: [],
    // Convert string ingredients to IRecipeIngredient format
    ingredients: (meal.ingredients || []).map((ing, idx) => ({
      name: typeof ing === "string" ? ing : "",
      amount: "",
      unit: "Other",
      _id: `ing-${idx}`,
    })),
    instructions: [],
    macros: {
      calories: meal.calories || 0,
      protein: meal.macros?.protein || 0,
      carbs: meal.macros?.carbs || 0,
      fat: meal.macros?.fat || 0,
    },
  }));

  // Show FavoriteMeals component on mobile, full recipes page on desktop
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
    return (
      <DashboardLayout showNavBar={false}>
        <FavoriteMeals recipes={favoriteMealsAsRecipes} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout showNavBar={true}>
      {/* Header */}
      <div className="recipes-header">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Recipes</h1>
            <p className="opacity-90">Discover healthy and delicious meals</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm">
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search recipes, ingredients, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-black placeholder:text-black/70"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="text-xs"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-6">
            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => {
                // Use mealId for key and favorites
                const mealId = recipe.mealId;
                // Check if meal is in user.favoriteMeals
                const isFavorite =
                  user?.favoriteMeals?.includes(mealId) || false;
                return (
                  <RecipeItem
                    key={mealId}
                    recipe={recipe}
                    isFavorite={isFavorite}
                    onFavoriteToggle={async () => {
                      if (user?._id && mealId) {
                        try {
                          await updateFavorite(user._id, mealId, !isFavorite);
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

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or browse different categories
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <div className="fixed bottom-20 right-6 md:bottom-6">
          <Button className="rounded-full h-12 w-12" size="sm">
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Recipes;
