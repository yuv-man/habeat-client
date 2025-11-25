/**
 * Helper function to get meal image from assets/mealsTypes/webp directory
 * Uses flexible keyword matching to map meal names to images
 * One image can match multiple meals (e.g., vegetable-soup.webp for both "vegetable soup" and "minestrone soup")
 */

// All available webp image files (without extension)
const availableImages = [
  "avocado-chicken-wrap",
  "avocado-toast-with-poached-egg",
  "bagel-with-cream-cheese-and-salmon",
  "baked-salmon-with-asparagus",
  "baked-sweet-potato",
  "barbeque-chicken-wings",
  "beef-and-broccoli-with-noodles",
  "biryani-rice",
  "breakfast-burrito",
  "buddha-salad",
  "burger-with-fries",
  "burrito-bowl",
  "butter-chicken-and-rice",
  "caesar-salad",
  "cereal-with-milk",
  "chia-pudding",
  "chicken-and-quinoa-salad",
  "chicken-breast-and-sweet-potato",
  "chicken-curry",
  "chicken-fajitas",
  "chicken-parmesan",
  "chicken-salad",
  "chinese-dumplings",
  "couscous-salad",
  "crepes-topped-with-strawberries",
  "croissant",
  "duck-leg-with-mush-potatos",
  "falafel-and-hummus",
  "falafel",
  "fish-tacos",
  "fruit-salad",
  "gnocchi-in-mushroom-sauce",
  "gnocchi-with-white-sauce",
  "greek-yogurt-topped-with-granola",
  "grilled-fish-fillet",
  "grilled-salmon-with-veggies",
  "grilled-vegetable-wrap",
  "grilled-vegetables-platter",
  "gulash-soup",
  "lasagna",
  "lentil-soup-with-whole-grain-bread",
  "meat-balls",
  "muffin",
  "mussels-with-fries",
  "nachos",
  "oatmeal-bowl-with-fruits",
  "pad-thai",
  "pancakes-with-berries-and-syrup",
  "pasta",
  "peanut-butter-toast-with-banana",
  "pho-soup",
  "pizza",
  "porridge-with-cinnamon-and-apples",
  "quinoa-salad-with-avocado",
  "ramen-bowl",
  "ravioli-with-sauce",
  "rice-with-curry",
  "risotto",
  "salmon-with-broccoli",
  "schnitzel-and-fries",
  "scrambled-eggs-and-toast",
  "scrambled-eggs-with-spinach",
  "shakshuka",
  "sheperds-pie",
  "shrimp-pasta",
  "shrimps-pad-thai",
  "smoothie-bowl-with-banana-and-kiwi",
  "smoothie",
  "spaghetti-aglio-e-olio",
  "spaghetti-bolognese",
  "spaghetti-in-tomato-sauce",
  "spare-ribs",
  "steak-and-roasted-vegetables",
  "steak-with-mashed-potatoes",
  "stirfried-noodles",
  "stuffed-bell-peppers",
  "sushi-bowl",
  "sushi-rolls",
  "tacos-with-cheese-and-guacamole",
  "teriyaki-salmon-on-a-plate",
  "thai-green-curry",
  "tofu-and-rice-noodles",
  "tomato-soup-and-crusty-bread",
  "tuna-salad-sandwich",
  "turkey-sandwich",
  "turkey-stirfry",
  "vegetable-soup",
  "veggie-burger",
  "veggie-omelette",
  "veggie-stir-fry",
  "vietnamese-spring-rolls",
  "waffles-with-honey",
  "yogurt-parfait-with-granola",
];

// Keyword mappings - maps keywords to image files
// Multiple meals can share the same image
const keywordMappings: { [key: string]: string[] } = {
  // Soups
  soup: [
    "vegetable-soup",
    "tomato-soup-and-crusty-bread",
    "lentil-soup-with-whole-grain-bread",
    "pho-soup",
    "gulash-soup",
  ],
  vegetable: [
    "vegetable-soup",
    "grilled-vegetables-platter",
    "veggie-stir-fry",
  ],
  minestrone: ["vegetable-soup"],
  tomato: ["tomato-soup-and-crusty-bread", "spaghetti-in-tomato-sauce"],
  lentil: ["lentil-soup-with-whole-grain-bread"],
  pho: ["pho-soup"],
  gulash: ["gulash-soup"],

  // Burgers
  burger: ["burger-with-fries", "veggie-burger"],
  hamburger: ["burger-with-fries"],

  // Salads
  salad: [
    "caesar-salad",
    "chicken-salad",
    "chicken-and-quinoa-salad",
    "buddha-salad",
    "couscous-salad",
    "quinoa-salad-with-avocado",
    "fruit-salad",
  ],
  caesar: ["caesar-salad"],
  quinoa: ["chicken-and-quinoa-salad", "quinoa-salad-with-avocado"],
  buddha: ["buddha-salad"],
  couscous: ["couscous-salad"],
  fruit: ["fruit-salad"],

  // Chicken dishes
  chicken: [
    "chicken-breast-and-sweet-potato",
    "chicken-curry",
    "chicken-fajitas",
    "chicken-parmesan",
    "chicken-salad",
    "chicken-and-quinoa-salad",
    "butter-chicken-and-rice",
    "barbeque-chicken-wings",
    "avocado-chicken-wrap",
  ],
  wings: ["barbeque-chicken-wings"],
  curry: [
    "chicken-curry",
    "butter-chicken-and-rice",
    "thai-green-curry",
    "rice-with-curry",
  ],
  fajitas: ["chicken-fajitas"],
  parmesan: ["chicken-parmesan"],
  butter: ["butter-chicken-and-rice"],

  // Salmon/Fish
  salmon: [
    "baked-salmon-with-asparagus",
    "grilled-salmon-with-veggies",
    "salmon-with-broccoli",
    "teriyaki-salmon-on-a-plate",
  ],
  fish: ["grilled-fish-fillet", "fish-tacos"],
  teriyaki: ["teriyaki-salmon-on-a-plate"],

  // Eggs
  egg: [
    "scrambled-eggs-and-toast",
    "scrambled-eggs-with-spinach",
    "veggie-omelette",
    "avocado-toast-with-poached-egg",
  ],
  eggs: ["scrambled-eggs-and-toast", "scrambled-eggs-with-spinach"],
  scrambled: ["scrambled-eggs-and-toast", "scrambled-eggs-with-spinach"],
  omelette: ["veggie-omelette"],
  omelet: ["veggie-omelette"],

  // Breakfast
  oatmeal: ["porridge-with-cinnamon-and-apples", "oatmeal-bowl-with-fruits"],
  porridge: ["porridge-with-cinnamon-and-apples"],
  cereal: ["cereal-with-milk"],
  waffles: ["waffles-with-honey"],
  waffle: ["waffles-with-honey"],
  pancakes: ["pancakes-with-berries-and-syrup"],
  pancake: ["pancakes-with-berries-and-syrup"],
  crepes: ["crepes-topped-with-strawberries"],
  crepe: ["crepes-topped-with-strawberries"],
  muffin: ["muffin"],
  croissant: ["croissant"],
  bagel: ["bagel-with-cream-cheese-and-salmon"],
  toast: [
    "scrambled-eggs-and-toast",
    "peanut-butter-toast-with-banana",
    "avocado-toast-with-poached-egg",
  ],
  avocado: [
    "avocado-toast-with-poached-egg",
    "quinoa-salad-with-avocado",
    "avocado-chicken-wrap",
  ],

  // Pasta
  pasta: [
    "pasta",
    "shrimp-pasta",
    "spaghetti-aglio-e-olio",
    "spaghetti-bolognese",
    "spaghetti-in-tomato-sauce",
  ],
  spaghetti: [
    "spaghetti-aglio-e-olio",
    "spaghetti-bolognese",
    "spaghetti-in-tomato-sauce",
  ],
  bolognese: ["spaghetti-bolognese"],
  lasagna: ["lasagna"],
  ravioli: ["ravioli-with-sauce"],
  gnocchi: ["gnocchi-in-mushroom-sauce", "gnocchi-with-white-sauce"],

  // Rice dishes
  rice: [
    "biryani-rice",
    "rice-with-curry",
    "tofu-and-rice-noodles",
    "chicken-fried-rice",
  ],
  biryani: ["biryani-rice"],
  risotto: ["risotto"],
  fried: ["chicken-fried-rice"],

  // Asian dishes
  pad: ["pad-thai", "shrimps-pad-thai"],
  thai: ["pad-thai", "shrimps-pad-thai", "thai-green-curry"],
  noodles: [
    "tofu-and-rice-noodles",
    "beef-and-broccoli-with-noodles",
    "stirfried-noodles",
  ],
  stir: ["stirfried-noodles", "veggie-stir-fry", "turkey-stirfry"],
  ramen: ["ramen-bowl"],
  sushi: ["sushi-bowl", "sushi-rolls"],
  dumplings: ["chinese-dumplings"],
  spring: ["vietnamese-spring-rolls"],

  // Mexican
  burrito: ["breakfast-burrito", "burrito-bowl"],
  tacos: ["fish-tacos", "tacos-with-cheese-and-guacamole"],
  taco: ["fish-tacos", "tacos-with-cheese-and-guacamole"],
  nachos: ["nachos"],

  // Meat dishes
  steak: ["steak-with-mashed-potatoes", "steak-and-roasted-vegetables"],
  meatballs: ["meat-balls"],
  meat: ["meat-balls", "spare-ribs"],
  ribs: ["spare-ribs"],
  duck: ["duck-leg-with-mush-potatos"],
  turkey: ["turkey-sandwich", "turkey-stirfry"],
  schnitzel: ["schnitzel-and-fries"],

  // Vegetarian
  veggie: [
    "veggie-burger",
    "veggie-omelette",
    "veggie-stir-fry",
    "grilled-vegetable-wrap",
  ],
  vegetarian: ["veggie-burger", "veggie-omelette", "veggie-stir-fry"],
  falafel: ["falafel", "falafel-and-hummus"],
  tofu: ["tofu-and-rice-noodles"],

  // Other dishes
  pizza: ["pizza"],
  shakshuka: ["shakshuka"],
  shepherds: ["sheperds-pie"],
  pie: ["sheperds-pie"],
  peppers: ["stuffed-bell-peppers"],
  mussels: ["mussels-with-fries"],

  // Sides
  sweet: ["baked-sweet-potato", "chicken-breast-and-sweet-potato"],
  potato: [
    "baked-sweet-potato",
    "chicken-breast-and-sweet-potato",
    "steak-with-mashed-potatoes",
    "duck-leg-with-mush-potatos",
  ],
  fries: ["burger-with-fries", "mussels-with-fries", "schnitzel-and-fries"],

  // Smoothies & Yogurt
  smoothie: ["smoothie", "smoothie-bowl-with-banana-and-kiwi"],
  yogurt: ["greek-yogurt-topped-with-granola", "yogurt-parfait-with-granola"],
  granola: ["greek-yogurt-topped-with-granola", "yogurt-parfait-with-granola"],
  chia: ["chia-pudding"],
  pudding: ["chia-pudding"],

  // Sandwiches & Wraps
  sandwich: ["tuna-salad-sandwich", "turkey-sandwich"],
  wrap: ["avocado-chicken-wrap", "grilled-vegetable-wrap"],

  // Shrimp
  shrimp: ["shrimp-pasta", "shrimps-pad-thai"],
  shrimps: ["shrimps-pad-thai"],
};

/**
 * Extract keywords from meal name
 */
const extractKeywords = (mealName: string): string[] => {
  const normalized = mealName.toLowerCase().trim();
  const words = normalized.split(/[\s-]+/).filter((word) => word.length > 2);
  return words;
};

/**
 * Find best matching image based on keywords
 */
const findBestMatch = (keywords: string[]): string | null => {
  const imageScores: { [key: string]: number } = {};

  // Score each image based on keyword matches
  keywords.forEach((keyword) => {
    const matchingImages = keywordMappings[keyword];
    if (matchingImages) {
      matchingImages.forEach((image) => {
        imageScores[image] = (imageScores[image] || 0) + 1;
      });
    }
  });

  // Also check for direct matches in image names
  keywords.forEach((keyword) => {
    availableImages.forEach((image) => {
      if (image.includes(keyword) || keyword.includes(image.split("-")[0])) {
        imageScores[image] = (imageScores[image] || 0) + 2; // Higher score for direct matches
      }
    });
  });

  // Find image with highest score
  let bestMatch: string | null = null;
  let highestScore = 0;

  Object.entries(imageScores).forEach(([image, score]) => {
    if (score > highestScore) {
      highestScore = score;
      bestMatch = image;
    }
  });

  return bestMatch;
};

/**
 * Get meal image path from assets/mealsTypes/webp
 * Uses flexible keyword matching - one image can match multiple meals
 * @param mealName - The name of the meal
 * @param fallbackIcon - Fallback icon URL if no match found
 * @returns Path to the webp image or fallback
 */
export const getMealImage = (
  mealName: string,
  fallbackIcon?: string
): string => {
  if (!mealName) {
    return fallbackIcon || "https://via.placeholder.com/80";
  }

  // Extract keywords from meal name
  const keywords = extractKeywords(mealName);

  if (keywords.length === 0) {
    return fallbackIcon || "https://via.placeholder.com/80";
  }

  // Find best matching image
  const matchedImage = findBestMatch(keywords);

  if (matchedImage) {
    // Return path that Vite can resolve
    // Using @ alias which resolves to src directory
    return `/src/assets/mealsTypes/webp/${matchedImage}.webp`;
  }

  // Fallback to meal icon or placeholder
  return fallbackIcon || "https://via.placeholder.com/80";
};

// Preload all meal images using Vite's glob import
// This creates a mapping of all available images at build time
const mealImageModules = import.meta.glob(
  "/src/assets/mealsTypes/webp/*.webp",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

/**
 * Get meal image using Vite's asset handling
 * Returns a path that Vite will resolve correctly
 * @param mealName - The name of the meal
 * @param fallbackIcon - Fallback icon URL if no match found
 * @returns Path to the webp image or fallback
 */
export const getMealImageVite = (
  mealName: string,
  fallbackIcon?: string
): string => {
  if (!mealName) {
    return fallbackIcon || "https://via.placeholder.com/80";
  }

  // Extract keywords from meal name
  const keywords = extractKeywords(mealName);

  if (keywords.length === 0) {
    return fallbackIcon || "https://via.placeholder.com/80";
  }

  // Find best matching image
  const matchedImage = findBestMatch(keywords);

  if (matchedImage) {
    // Try to get the image from the glob import
    const imagePath = `/src/assets/mealsTypes/webp/${matchedImage}.webp`;
    const importedImage = mealImageModules[imagePath];

    if (importedImage) {
      return importedImage;
    }

    // Fallback to direct path (Vite will handle it)
    return imagePath;
  }

  // Fallback to meal icon or placeholder
  return fallbackIcon || "https://via.placeholder.com/80";
};
