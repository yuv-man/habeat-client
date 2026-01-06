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
  "beef-and-black-bean-fajitas-with-whole-wheat-tortillas",
  "chicken-parmesan",
  "chicken-salad",
  "chicken-noodle-soup",
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
  "beef-and-bean-chili",
  "baked-cod-with-quinoa",
  "whole-wheat-pasta-with-ground-chicken-marinara",
  "whole-wheat-pasta-with-ground-beef-marinara",
  "tuna-salad-on-whole-wheat-bread-with-mixed-greens",
  "chicken-and-vegetable-skewers-couscous",
  "baked-salmon-with-roasted-sweet-potatoes",
  "berry-greek-yogurt-parfait",
  "lean-beef-stir-fry-with-brown-rice",
  "chicken-and-veggie-whole-wheat-wrap",
  "green-power-smoothie",
  "lean-pork-tenderloin-with-roasted-potatoes-and-broccoli",
  "chicken-pad-see-ew",
  "chicken-teriyaki-bowl-with-brown-rice",
  "power-berry-nut-muesli-bowl",
  "whole-wheat-pancakes-with-fruit",
  "black-bean-burger-on-whole-wheat-bun",
  "lemon-herb-chicken-with-brown-rice-and-broccoli",
  "lean-beef-with-quinoa-and-roasted-root-vegetables",
  "leftover-turkey-and-vegetable-stir-fry-with-brown-rice",
  "turkey-and-hummus-wrap-with-side-salad",
  "lean-steak-with-quinoa-and-asparagus",
  "baked-cod-with-sweet-potato-wedges-and-green-beans",
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
    "chicken-noodle-soup",
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
  burger: [
    "burger-with-fries",
    "veggie-burger",
    "black-bean-burger-on-whole-wheat-bun",
  ],
  hamburger: ["burger-with-fries"],
  blackBean: ["black-bean-burger-on-whole-wheat-bun"],

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
  fruit: ["fruit-salad", "whole-wheat-pancakes-with-fruit"],

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
    "chicken-and-vegetable-skewers-couscous",
    "chicken-and-veggie-whole-wheat-wrap",
    "chicken-pad-see-ew",
    "chicken-teriyaki-bowl-with-brown-rice",
    "lemon-herb-chicken-with-brown-rice-and-broccoli",
  ],
  wings: ["barbeque-chicken-wings"],
  curry: [
    "chicken-curry",
    "butter-chicken-and-rice",
    "thai-green-curry",
    "rice-with-curry",
  ],
  fajitas: [
    "chicken-fajitas",
    "beef-and-black-bean-fajitas-with-whole-wheat-tortillas",
  ],
  parmesan: ["chicken-parmesan"],
  butter: ["butter-chicken-and-rice"],

  // Salmon/Fish
  salmon: [
    "baked-salmon-with-asparagus",
    "grilled-salmon-with-veggies",
    "salmon-with-broccoli",
    "teriyaki-salmon-on-a-plate",
    "baked-salmon-with-roasted-sweet-potatoes",
  ],
  fish: [
    "grilled-fish-fillet",
    "fish-tacos",
    "baked-cod-with-quinoa",
    "baked-salmon-with-roasted-sweet-potatoes",
    "baked-cod-with-sweet-potato-wedges-and-green-beans",
  ],
  teriyaki: [
    "teriyaki-salmon-on-a-plate",
    "chicken-teriyaki-bowl-with-brown-rice",
  ],
  cod: [
    "baked-cod-with-quinoa",
    "baked-cod-with-sweet-potato-wedges-and-green-beans",
  ],
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
  pancakes: [
    "pancakes-with-berries-and-syrup",
    "whole-wheat-pancakes-with-fruit",
  ],
  pancake: [
    "pancakes-with-berries-and-syrup",
    "whole-wheat-pancakes-with-fruit",
  ],
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
    "whole-wheat-pasta-with-ground-chicken-marinara",
    "whole-wheat-pasta-with-ground-beef-marinara",
    "lasagna",
    "ravioli-with-sauce",
    "gnocchi-in-mushroom-sauce",
  ],
  spaghetti: [
    "spaghetti-aglio-e-olio",
    "spaghetti-bolognese",
    "spaghetti-in-tomato-sauce",
    "pasta",
  ],
  bolognese: ["spaghetti-bolognese"],
  carbonara: ["pasta", "spaghetti-aglio-e-olio"],
  alfredo: ["pasta", "gnocchi-with-white-sauce"],
  marinara: [
    "whole-wheat-pasta-with-ground-chicken-marinara",
    "whole-wheat-pasta-with-ground-beef-marinara",
    "spaghetti-in-tomato-sauce",
  ],
  penne: ["pasta"],
  fettuccine: ["pasta"],
  linguine: ["pasta", "shrimp-pasta"],
  tagliatelle: ["pasta", "spaghetti-bolognese"],
  rigatoni: ["pasta"],
  macaroni: ["pasta"],
  lasagna: ["lasagna"],
  ravioli: ["ravioli-with-sauce"],
  gnocchi: ["gnocchi-in-mushroom-sauce", "gnocchi-with-white-sauce"],
  aglio: ["spaghetti-aglio-e-olio"],
  olio: ["spaghetti-aglio-e-olio"],

  // Rice dishes
  rice: [
    "biryani-rice",
    "rice-with-curry",
    "tofu-and-rice-noodles",
    "chicken-fried-rice",
    "chicken-teriyaki-bowl-with-brown-rice",
    "lemon-herb-chicken-with-brown-rice-and-broccoli",
    "leftover-turkey-and-vegetable-stir-fry-with-brown-rice",
  ],
  biryani: ["biryani-rice"],
  risotto: ["risotto"],
  fried: ["chicken-fried-rice"],

  // Asian dishes
  pad: ["pad-thai", "shrimps-pad-thai"],
  thai: [
    "pad-thai",
    "shrimps-pad-thai",
    "thai-green-curry",
    "chicken-pad-see-ew",
  ],
  noodles: [
    "tofu-and-rice-noodles",
    "beef-and-broccoli-with-noodles",
    "stirfried-noodles",
    "chicken-pad-see-ew",
  ],
  stir: [
    "stirfried-noodles",
    "veggie-stir-fry",
    "turkey-stirfry",
    "leftover-turkey-and-vegetable-stir-fry-with-brown-rice",
  ],
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
  beef: [
    "beef-and-bean-chili",
    "lean-beef-stir-fry-with-brown-rice",
    "lean-beef-with-quinoa-and-roasted-root-vegetables",
    "beef-and-black-bean-fajitas-with-whole-wheat-tortillas",
  ],
  steak: [
    "steak-with-mashed-potatoes",
    "steak-and-roasted-vegetables",
    "lean-pork-tenderloin-with-roasted-potatoes-and-broccoli",
    "lean-steak-with-quinoa-and-asparagus",
  ],
  meatballs: ["meat-balls"],
  meat: [
    "meat-balls",
    "spare-ribs",
    "beef-and-bean-chili",
    "lean-beef-stir-fry-with-brown-rice",
    "lean-beef-with-quinoa-and-roasted-root-vegetables",
    "lean-pork-tenderloin-with-roasted-potatoes-and-broccoli",
    "beef-and-black-bean-fajitas-with-whole-wheat-tortillas",
    "lean-steak-with-quinoa-and-asparagus",
  ],
  ribs: ["spare-ribs"],
  duck: ["duck-leg-with-mush-potatos"],
  turkey: [
    "turkey-sandwich",
    "turkey-stirfry",
    "leftover-turkey-and-vegetable-stir-fry-with-brown-rice",
    "turkey-and-hummus-wrap-with-side-salad",
  ],
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
    "lean-pork-tenderloin-with-roasted-potatoes-and-broccoli",
  ],
  fries: ["burger-with-fries", "mussels-with-fries", "schnitzel-and-fries"],

  // Smoothies & Yogurt
  smoothie: [
    "smoothie",
    "smoothie-bowl-with-banana-and-kiwi",
    "green-power-smoothie",
    "power-berry-nut-muesli-bowl",
  ],
  yogurt: [
    "greek-yogurt-topped-with-granola",
    "yogurt-parfait-with-granola",
    "power-berry-nut-muesli-bowl",
  ],
  granola: [
    "greek-yogurt-topped-with-granola",
    "yogurt-parfait-with-granola",
    "berry-greek-yogurt-parfait",
    "power-berry-nut-muesli-bowl",
  ],
  chia: ["chia-pudding"],
  pudding: ["chia-pudding"],

  // Sandwiches & Wraps
  sandwich: [
    "tuna-salad-sandwich",
    "turkey-sandwich",
    "tuna-salad-on-whole-wheat-bread-with-mixed-greens",
    "black-bean-burger-on-whole-wheat-bun",
    "turkey-and-hummus-wrap-with-side-salad",
  ],
  wrap: [
    "avocado-chicken-wrap",
    "grilled-vegetable-wrap",
    "chicken-and-veggie-whole-wheat-wrap",
    "turkey-and-hummus-wrap-with-side-salad",
  ],

  // Shrimp
  shrimp: ["shrimp-pasta", "shrimps-pad-thai"],
  shrimps: ["shrimps-pad-thai"],
};

// Common words to ignore in matching (low-value words)
const stopWords = new Set([
  "with",
  "and",
  "the",
  "on",
  "in",
  "a",
  "an",
  "of",
  "for",
  "to",
  "topped",
  "served",
  "side",
  "fresh",
  "homemade",
  "delicious",
  "grilled",
  "baked",
  "fried",
  "roasted",
]);

// High-value specific keywords that should get priority matching
const specificKeywords = new Set([
  "pasta",
  "spaghetti",
  "lasagna",
  "ravioli",
  "gnocchi",
  "risotto",
  "bolognese",
  "carbonara",
  "alfredo",
  "marinara",
  "pizza",
  "burger",
  "tacos",
  "burrito",
  "sushi",
  "ramen",
  "pho",
  "curry",
  "biryani",
  "shakshuka",
  "falafel",
  "hummus",
  "salmon",
  "chicken",
  "beef",
  "steak",
  "turkey",
  "duck",
  "shrimp",
  "tuna",
  "cod",
  "mussels",
  "pancakes",
  "waffles",
  "crepes",
  "oatmeal",
  "porridge",
  "smoothie",
  "salad",
  "soup",
  "sandwich",
  "wrap",
  "omelette",
  "schnitzel",
  "nachos",
  "dumplings",
  "noodles",
  "quinoa",
  "couscous",
  "yogurt",
  "granola",
]);

/**
 * Extract keywords from meal name, filtering out stop words
 */
const extractKeywords = (mealName: string): string[] => {
  const normalized = mealName.toLowerCase().trim();
  const words = normalized
    .split(/[\s\-_,]+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  return words;
};

/**
 * Normalize string for comparison (remove dashes, lowercase)
 */
const normalizeForComparison = (str: string): string => {
  return str.toLowerCase().replace(/[-_\s]+/g, "");
};

/**
 * Check if image name matches the full meal name closely
 */
const getExactMatchScore = (mealName: string, imageName: string): number => {
  const normalizedMeal = normalizeForComparison(mealName);
  const normalizedImage = normalizeForComparison(imageName);

  // Perfect match
  if (normalizedMeal === normalizedImage) {
    return 100;
  }

  // Meal name contains entire image name or vice versa
  if (normalizedMeal.includes(normalizedImage)) {
    return 50 + (normalizedImage.length / normalizedMeal.length) * 30;
  }
  if (normalizedImage.includes(normalizedMeal)) {
    return 50 + (normalizedMeal.length / normalizedImage.length) * 30;
  }

  return 0;
};

/**
 * Find best matching image based on keywords with improved scoring
 */
const findBestMatch = (
  keywords: string[],
  originalMealName: string
): string | null => {
  const imageScores: { [key: string]: number } = {};

  // First, check for exact/close matches with the full meal name
  availableImages.forEach((image) => {
    const exactScore = getExactMatchScore(originalMealName, image);
    if (exactScore > 0) {
      imageScores[image] = exactScore;
    }
  });

  // If we have a very high exact match, return it immediately
  const topExactMatch = Object.entries(imageScores).find(
    ([, score]) => score >= 70
  );
  if (topExactMatch) {
    return topExactMatch[0];
  }

  // Score based on keyword mappings with priority for specific keywords
  keywords.forEach((keyword, index) => {
    const matchingImages = keywordMappings[keyword];
    if (matchingImages) {
      // Earlier keywords in the meal name are often more important
      const positionBonus = Math.max(0, 3 - index);
      // Specific keywords get higher scores
      const specificBonus = specificKeywords.has(keyword) ? 10 : 0;

      matchingImages.forEach((image, imageIndex) => {
        // First image in the mapping is often the most relevant
        const orderBonus = Math.max(0, 3 - imageIndex);
        const score = 5 + positionBonus + specificBonus + orderBonus;
        imageScores[image] = (imageScores[image] || 0) + score;
      });
    }
  });

  // Direct keyword matches in image names (very important!)
  keywords.forEach((keyword) => {
    availableImages.forEach((image) => {
      const imageWords = image.split("-");

      // Check if any word in image exactly matches the keyword
      if (imageWords.some((word) => word === keyword)) {
        // Strong bonus for exact word match
        const bonus = specificKeywords.has(keyword) ? 25 : 15;
        imageScores[image] = (imageScores[image] || 0) + bonus;
      } else if (image.includes(keyword)) {
        // Partial match bonus
        const bonus = specificKeywords.has(keyword) ? 12 : 6;
        imageScores[image] = (imageScores[image] || 0) + bonus;
      }

      // Check if keyword contains image word (for compound matches)
      imageWords.forEach((word) => {
        if (word.length > 3 && keyword.includes(word)) {
          imageScores[image] = (imageScores[image] || 0) + 4;
        }
      });
    });
  });

  // Bonus for matching multiple keywords
  keywords.forEach((keyword) => {
    availableImages.forEach((image) => {
      const matchCount = keywords.filter((k) => image.includes(k)).length;
      if (matchCount > 1) {
        imageScores[image] = (imageScores[image] || 0) + matchCount * 8;
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

  // Find best matching image (pass original name for exact matching)
  const matchedImage = findBestMatch(keywords, mealName);

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

  // Find best matching image (pass original name for exact matching)
  const matchedImage = findBestMatch(keywords, mealName);

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
