// Mock data generators for recipe instructions and notes
// These can be replaced with actual data from the backend when available

/**
 * Generate mock instructions based on meal name
 */
export const generateInstructions = (mealName: string): string[] => {
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

/**
 * Generate a recipe note based on the meal name
 */
export const getRecipeNote = (mealName: string): string => {
  const name = mealName.toLowerCase();

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
