import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, Users, ShoppingCart, Check, Plus, Minus, Heart, Share2, BookOpen } from 'lucide-react';

// Mock data for demonstration
const mockRecipe = {
  id: 1,
  name: "Mediterranean Quinoa Bowl",
  image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=300&fit=crop",
  prepTime: 15,
  cookTime: 20,
  servings: 4,
  difficulty: "Easy",
  description: "A nutritious and colorful quinoa bowl packed with Mediterranean flavors, fresh vegetables, and a tangy lemon dressing.",
  ingredients: [
    { id: 1, name: "Quinoa", amount: "1", unit: "cup", category: "grains" },
    { id: 2, name: "Cherry tomatoes", amount: "2", unit: "cups", category: "vegetables" },
    { id: 3, name: "Cucumber", amount: "1", unit: "large", category: "vegetables" },
    { id: 4, name: "Red onion", amount: "1/2", unit: "medium", category: "vegetables" },
    { id: 5, name: "Feta cheese", amount: "1/2", unit: "cup", category: "dairy" },
    { id: 6, name: "Kalamata olives", amount: "1/3", unit: "cup", category: "pantry" },
    { id: 7, name: "Fresh parsley", amount: "1/4", unit: "cup", category: "herbs" },
    { id: 8, name: "Olive oil", amount: "3", unit: "tbsp", category: "pantry" },
    { id: 9, name: "Lemon juice", amount: "2", unit: "tbsp", category: "pantry" },
    { id: 10, name: "Garlic", amount: "2", unit: "cloves", category: "vegetables" }
  ],
  instructions: [
    "Rinse quinoa and cook according to package instructions. Let cool.",
    "Dice cucumber, halve cherry tomatoes, and thinly slice red onion.",
    "Whisk together olive oil, lemon juice, minced garlic, salt, and pepper.",
    "Combine cooled quinoa with vegetables, feta, and olives.",
    "Drizzle with dressing and toss gently.",
    "Garnish with fresh parsley and serve immediately."
  ],
  nutrition: {
    calories: 320,
    protein: 12,
    carbs: 45,
    fat: 14,
    fiber: 6,
    sugar: 8
  },
  tags: ["Vegetarian", "Mediterranean", "High Fiber", "Gluten-Free"]
};


const RecipeDetail = ({ recipeId, onBack }) => {
  const [recipe, setRecipe] = useState(mockRecipe);
  const [servings, setServings] = useState(4);
  const [isFavorited, setIsFavorited] = useState(false);

  const adjustServings = (newServings) => {
    if (newServings < 1) return;
    setServings(newServings);
  };

  const getAdjustedAmount = (originalAmount, originalServings) => {
    const ratio = servings / originalServings;
    const numAmount = parseFloat(originalAmount);
    if (isNaN(numAmount)) return originalAmount;
    return (numAmount * ratio).toFixed(numAmount % 1 === 0 ? 0 : 1);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="relative">
        <img 
          src={recipe.image} 
          alt={recipe.name}
          className="w-full h-64 object-cover rounded-lg"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => setIsFavorited(!isFavorited)}
            className={`p-2 rounded-full backdrop-blur-sm ${
              isFavorited ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
          <button className="p-2 rounded-full bg-white/80 text-gray-600 backdrop-blur-sm">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h1>
        <p className="text-gray-600 mb-4">{recipe.description}</p>

        {/* Recipe Stats */}
        <div className="flex flex-wrap gap-6 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{recipe.prepTime + recipe.cookTime} mins</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <ChefHat className="w-5 h-5" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {recipe.tags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              {tag}
            </span>
          ))}
        </div>

        {/* Nutrition Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-3">Nutrition (per serving)</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{recipe.nutrition.calories}</div>
              <div className="text-sm text-gray-600">Calories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{recipe.nutrition.protein}g</div>
              <div className="text-sm text-gray-600">Protein</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{recipe.nutrition.carbs}g</div>
              <div className="text-sm text-gray-600">Carbs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{recipe.nutrition.fat}g</div>
              <div className="text-sm text-gray-600">Fat</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{recipe.nutrition.fiber}g</div>
              <div className="text-sm text-gray-600">Fiber</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{recipe.nutrition.sugar}g</div>
              <div className="text-sm text-gray-600">Sugar</div>
            </div>
          </div>
        </div>

        {/* Servings Adjuster */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Ingredients</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Servings:</span>
            <button 
              onClick={() => adjustServings(servings - 1)}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-semibold text-lg min-w-[2rem] text-center">{servings}</span>
            <button 
              onClick={() => adjustServings(servings + 1)}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white border rounded-lg mb-6">
          {recipe.ingredients.map(ingredient => (
            <div key={ingredient.id} className="flex justify-between items-center p-4 border-b last:border-b-0">
              <span className="text-gray-800">{ingredient.name}</span>
              <span className="font-medium text-green-600">
                {getAdjustedAmount(ingredient.amount, recipe.servings)} {ingredient.unit}
              </span>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Instructions
          </h3>
          <div className="space-y-4">
            {recipe.instructions.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
