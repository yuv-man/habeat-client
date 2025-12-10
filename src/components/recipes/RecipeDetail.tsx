import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  Flame,
  ShoppingCart,
  Check,
} from "lucide-react";
import { IMeal } from "@/types/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { getMealImageVite } from "@/lib/mealImageHelper";
import { useNavigate } from "react-router-dom";

interface RecipeDetailProps {
  meal: IMeal;
  onBack: () => void;
}

// Parse ingredient string format: "ingredient_name|portion|unit"
const parseIngredient = (ingredient: string) => {
  const parts = ingredient.split("|");
  if (parts.length >= 3) {
    return {
      name: parts[0].replace(/_/g, " "),
      amount: parts[1],
      unit: parts[2],
    };
  }
  // Fallback for simple ingredient strings
  return {
    name: ingredient,
    amount: "",
    unit: "",
  };
};

// Generate mock instructions based on meal name
const generateInstructions = (mealName: string): string[] => {
  const name = mealName.toLowerCase();

  if (name.includes("salad")) {
    return [
      "Wash and prepare all vegetables. Pat dry with a clean towel.",
      "If using protein (chicken, fish, etc.), season with salt, pepper, and your preferred spices.",
      "Cook the protein until golden and cooked through. Let it rest for a few minutes.",
      "Chop all vegetables into bite-sized pieces and place in a large bowl.",
      "Slice the cooked protein and add to the bowl with vegetables.",
      "Drizzle with olive oil and lemon juice, then toss gently to combine.",
      "Season with salt and pepper to taste. Serve immediately.",
    ];
  }

  if (name.includes("smoothie") || name.includes("shake")) {
    return [
      "Gather all ingredients and add them to a blender.",
      "Blend on high speed until smooth and creamy, about 30-60 seconds.",
      "Taste and adjust sweetness if needed.",
      "Pour into a glass and serve immediately.",
    ];
  }

  if (name.includes("soup")) {
    return [
      "Heat olive oil in a large pot over medium heat.",
      "Add onions and garlic, sauté until fragrant and translucent.",
      "Add vegetables and cook for 5-7 minutes until slightly softened.",
      "Pour in broth and bring to a boil, then reduce heat and simmer.",
      "Cook for 20-25 minutes until all vegetables are tender.",
      "Season with salt, pepper, and herbs to taste. Serve hot.",
    ];
  }

  if (
    name.includes("chicken") ||
    name.includes("fish") ||
    name.includes("salmon")
  ) {
    return [
      "Preheat oven to 375°F (190°C). Butterfly each protein piece by slicing horizontally through the thickest part, being careful not to cut all the way through.",
      "In a medium bowl, combine chopped spinach, feta cheese, cream cheese, minced garlic, and oregano. Season with salt and pepper.",
      "Spoon the filling mixture into the center of each protein piece. Fold over to enclose the filling and secure with toothpicks if necessary.",
      "Heat olive oil in an oven-safe skillet over medium-high heat. Sear the protein for 2-3 minutes per side until golden brown.",
      "Pour chicken broth into the skillet, then transfer the skillet to the preheated oven. Bake for 20-25 minutes, or until the protein is cooked through (internal temperature 165°F/74°C).",
      "Remove from oven, let rest for a few minutes before serving. Enjoy!",
    ];
  }

  if (name.includes("oatmeal") || name.includes("porridge")) {
    return [
      "Bring water or milk to a boil in a medium saucepan.",
      "Add oats and reduce heat to medium-low.",
      "Cook for 5-7 minutes, stirring occasionally, until creamy.",
      "Remove from heat and add your toppings.",
      "Serve warm and enjoy!",
    ];
  }

  if (
    name.includes("egg") ||
    name.includes("scrambled") ||
    name.includes("omelet")
  ) {
    return [
      "Crack eggs into a bowl and whisk until well combined.",
      "Heat butter in a non-stick pan over medium-low heat.",
      "Pour in eggs and let them set slightly at the edges.",
      "Gently push eggs from edges to center, letting uncooked egg flow to the pan.",
      "Continue until eggs are just set but still moist.",
      "Season with salt and pepper, add any fillings, and serve immediately.",
    ];
  }

  // Default instructions
  return [
    "Gather and prepare all ingredients. Wash and chop vegetables as needed.",
    "If using protein, season well with salt, pepper, and your preferred spices.",
    "Cook the main protein or component according to your preferred method until done.",
    "Prepare any sides or accompaniments while the main dish cooks.",
    "Combine all components, adjusting seasoning to taste.",
    "Plate beautifully and serve while hot. Enjoy your meal!",
  ];
};

const RecipeDetail = ({ meal, onBack }: RecipeDetailProps) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isMealFavorite, toggleFavoriteMeal } = useFavoritesStore();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  const isFavorite = isMealFavorite(meal._id);
  const instructions = generateInstructions(meal.name);
  const ingredients = meal.ingredients || [];

  const handleFavorite = async () => {
    if (user?._id) {
      await toggleFavoriteMeal(user._id, meal._id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meal.name,
          text: `Check out this recipe: ${meal.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    }
  };

  const handleAddToShoppingList = () => {
    navigate("/shopping-list");
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

  // Generate a note based on the meal
  const getRecipeNote = () => {
    const name = meal.name.toLowerCase();
    if (name.includes("chicken")) {
      return "This recipe is fantastic for a quick weeknight dinner. I like to add a pinch of red pepper flakes for an extra kick!";
    }
    if (name.includes("salad")) {
      return "For best results, use fresh seasonal vegetables. You can also add nuts or seeds for extra crunch!";
    }
    if (name.includes("smoothie")) {
      return "Pro tip: Freeze your fruits beforehand for an extra thick and creamy smoothie!";
    }
    return "Feel free to adjust seasonings and portions to your taste. This recipe works great for meal prep!";
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image with Overlay */}
      <div className="relative h-72 sm:h-80">
        <img
          src={getMealImageVite(meal.name, meal.icon)}
          alt={meal.name}
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
            {meal.name}
          </h1>
        </div>
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
                <p className="font-bold text-gray-900">{meal.calories} kcal</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold text-sm">P</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Protein</p>
                <p className="font-bold text-gray-900">
                  {meal.macros.protein}g
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">F</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fats</p>
                <p className="font-bold text-gray-900">{meal.macros.fat}g</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">C</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Carbs</p>
                <p className="font-bold text-gray-900">{meal.macros.carbs}g</p>
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
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => {
                const parsed = parseIngredient(ingredient);
                const isChecked = checkedIngredients.has(index);

                return (
                  <button
                    key={index}
                    onClick={() => toggleIngredient(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                      isChecked ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${
                        isChecked
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isChecked && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span
                      className={`flex-1 text-left ${
                        isChecked
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {parsed.amount && parsed.unit ? (
                        <>
                          <span className="font-medium">
                            {parsed.amount} {parsed.unit}
                          </span>{" "}
                          <span className="capitalize">{parsed.name}</span>
                        </>
                      ) : (
                        <span className="capitalize">{parsed.name}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Instructions Section */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Instructions</h2>
          <div className="space-y-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed pt-1 flex-1">
                  {instruction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <h3 className="text-lg font-bold text-green-800 mb-2">Notes</h3>
          <p className="text-green-700 leading-relaxed">{getRecipeNote()}</p>
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 flex items-center gap-3">
        <button
          onClick={handleAddToShoppingList}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Supermarket List
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
