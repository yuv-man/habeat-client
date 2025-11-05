import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Clock, 
  Users, 
  Heart, 
  Star,
  Filter,
  BookOpen,
  Camera,
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mealTypes } from "@/lib/paths";
import "@/styles/recipes.css";
import NavBar from "@/components/ui/navbar";
import { userAPI } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { IRecipe } from "@/types/interfaces";


const Recipes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuthStore();
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  
  useEffect(() => {
    const fetchFavorites = async () => {
      const { data } = await userAPI.getFavoritesByUserId(user._id);
      setRecipes(data);
    };
    fetchFavorites();
  }, []);

    // Mock recipes data
    const mockRecipes: IRecipe[] = [
    {
      id: '1',
      name: 'Grilled Chicken Salad',
      description: 'Fresh mixed greens with grilled chicken breast, perfect for weight loss',
      image: '🥗',
      cookTime: 15,
      servings: 2,
      calories: 320,
      difficulty: 'Easy',
      tags: ['High Protein', 'Low Carb', 'Gluten Free'],
      rating: 4.8,
      ingredients: [
        '200g chicken breast',
        '100g mixed greens',
        '1 cucumber',
        '1 tomato',
        '2 tbsp olive oil',
        '1 tbsp lemon juice'
      ],
      instructions: [
        'Season and grill chicken breast until cooked through',
        'Dice cucumber and tomato',
        'Mix olive oil and lemon juice for dressing',
        'Combine all ingredients and serve'
      ],
      macros: { protein: 35, carbs: 8, fat: 12, fiber: 4 }
    },
    {
      id: '2',
      name: 'Quinoa Power Bowl',
      description: 'Nutrient-dense bowl with quinoa, roasted vegetables, and tahini dressing',
      image: '🍲',
      cookTime: 25,
      servings: 2,
      calories: 450,
      difficulty: 'Medium',
      tags: ['Vegan', 'High Fiber', 'Complete Protein'],
      rating: 4.6,
      ingredients: [
        '1 cup quinoa',
        '1 sweet potato',
        '1 zucchini',
        '1 red bell pepper',
        '2 tbsp tahini',
        '1 tbsp maple syrup'
      ],
      instructions: [
        'Cook quinoa according to package instructions',
        'Roast vegetables at 400°F for 20 minutes',
        'Mix tahini and maple syrup for dressing',
        'Assemble bowl and drizzle with dressing'
      ],
      macros: { protein: 16, carbs: 65, fat: 14, fiber: 12 }
    },
    {
      id: '3',
      name: 'Keto Avocado Smoothie',
      description: 'Creamy low-carb smoothie perfect for breakfast or post-workout',
      image: '🥤',
      cookTime: 5,
      servings: 1,
      calories: 280,
      difficulty: 'Easy',
      tags: ['Keto', 'Low Carb', 'Quick'],
      rating: 4.9,
      ingredients: [
        '1 ripe avocado',
        '1 cup unsweetened almond milk',
        '1 tbsp MCT oil',
        '1 tsp vanilla extract',
        '1 packet stevia',
        'Ice cubes'
      ],
      instructions: [
        'Add all ingredients to blender',
        'Blend until smooth and creamy',
        'Add ice if desired consistency',
        'Serve immediately'
      ],
      macros: { protein: 6, carbs: 4, fat: 26, fiber: 10 }
    },
    {
      id: '4',
      name: 'Protein Pancakes',
      description: 'Fluffy high-protein pancakes perfect for muscle building',
      image: '🥞',
      cookTime: 10,
      servings: 2,
      calories: 380,
      difficulty: 'Easy',
      tags: ['High Protein', 'Post-Workout', 'Gluten Free'],
      rating: 4.7,
      ingredients: [
        '2 eggs',
        '1 banana',
        '30g protein powder',
        '1 tbsp almond flour',
        '1 tsp baking powder',
        'Cinnamon to taste'
      ],
      instructions: [
        'Mash banana and mix with eggs',
        'Add protein powder and almond flour',
        'Cook pancakes in non-stick pan',
        'Serve with fresh berries'
      ],
      macros: { protein: 28, carbs: 22, fat: 8, fiber: 4 }
    }
  ];

  const categories = [
    { id: 'all', label: 'All Recipes', count: recipes.length },
    { id: 'breakfast', label: 'Breakfast', count: 12 },
    { id: 'lunch', label: 'Lunch', count: 18 },
    { id: 'dinner', label: 'Dinner', count: 24 },
    { id: 'snacks', label: 'Snacks', count: 15 },
  ];

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <NavBar />
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
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-6">
            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-primary flex items-center justify-center text-6xl">
                    {recipe.image}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{recipe.name}</CardTitle>
                        <CardDescription className="text-sm">{recipe.description}</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {recipe.cookTime}m
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {recipe.servings} servings
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {recipe.rating}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Tags */}
                      {recipe.tags && <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>}

                      {/* Nutrition Info */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">{recipe.calories}</div>
                          <div className="text-xs text-muted-foreground">Calories</div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold">{recipe.macros.protein}g</div>
                          <div className="text-xs text-muted-foreground">Protein</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button className="flex-1" size="sm">
                          View Recipe
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
                <p className="text-muted-foreground">Try adjusting your search or browse different categories</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <Button className="rounded-full h-12 w-12" size="sm">
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Recipes;