// Dynamically import all images from the sportTypes directory (both png and webp)
const workoutImageModulesPng = import.meta.glob(
  "/src/assets/sportTypes/*.png",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

const workoutImageModulesWebp = import.meta.glob(
  "/src/assets/sportTypes/*.webp",
  {
    eager: true,
    import: "default",
  }
) as Record<string, string>;

// Combine both png and webp modules
const workoutImageModules = {
  ...workoutImageModulesPng,
  ...workoutImageModulesWebp,
};

// Extract file names without extension
const availableImages = Object.keys(workoutImageModules)
  .map((path) => {
    const fileName = path.split("/").pop() || "";
    return fileName.replace(/\.(png|webp)$/, "");
  })
  .filter(Boolean) as string[];

// Function to normalize workout name for matching
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();
};

// Function to extract keywords from a workout name
const extractKeywords = (workoutName: string): string[] => {
  const normalized = normalizeName(workoutName);
  const words = normalized.split(/\s+/).filter((word) => word.length > 2);
  return words;
};

// Keyword mappings for flexible matching
const keywordMappings: { [key: string]: string[] } = {
  // Running/Jogging
  run: ["running", "jugging"],
  running: ["running", "jugging"],
  jog: ["running", "jugging"],
  jogging: ["running", "jugging"],
  sprint: ["running"],
  marathon: ["running"],
  track: ["running"],

  // Walking
  walk: ["walking"],
  walking: ["walking"],
  hike: ["walking", "climbing"],
  hiking: ["walking", "climbing"],

  // Cycling
  bike: ["cycling"],
  biking: ["cycling"],
  cycle: ["cycling"],
  cycling: ["cycling"],
  bicycle: ["cycling"],

  // Swimming
  swim: ["swimming"],
  swimming: ["swimming"],
  pool: ["swimming"],
  freestyle: ["swimming"],
  breaststroke: ["swimming"],

  // Yoga
  yoga: ["yoga"],
  meditation: ["yoga"],
  flexibility: ["yoga", "streching"],

  // Strength/Gym
  gym: ["gym"],
  weight: ["gym"],
  weights: ["gym"],
  strength: ["gym"],
  lift: ["gym"],
  lifting: ["gym"],
  workout: ["gym"],
  training: ["gym"],
  muscle: ["gym"],
  bodybuilding: ["gym"],

  // Calisthenics
  calisthenics: ["calistenics"],
  calisthenic: ["calistenics"],
  bodyweight: ["bodyweight", "calistenics"],
  "body weight": ["bodyweight", "calistenics"],
  "bodyweight train": ["bodyweight"],
  "body weight train": ["bodyweight"],
  "body weight training": ["bodyweight"],
  pushup: ["calistenics"],
  pullup: ["calistenics"],
  cardio: ["calistenics"],

  // Pilates
  pilates: ["pilates"],
  core: ["pilates"],

  // Stretching
  stretching: ["streching"],
  stretch: ["streching", "yoga"],

  // Sports
  basketball: ["basketball"],
  boxing: ["boxing"],
  football: ["football"],
  soccer: ["football"],
  tennis: ["tennis"],
  squash: ["squash"],
  paddle: ["squash"],
  volleyball: ["volleyball"],
  "beach-volleyball": ["volleyball"],

  // HIIT
  hiit: ["hiit"],
  hit: ["hiit"],
  "high intensity": ["hiit"],
  "high-intensity": ["hiit"],
  interval: ["hiit"],
  "interval training": ["hiit"],

  // Balance Training
  balance: ["balance"],
  "balance train": ["balance"],
  "balance training": ["balance"],
  "balance exercise": ["balance"],
  stability: ["balance"],

  // Other activities
  climb: ["climbing"],
  climbing: ["climbing"],
  rock: ["climbing"],
  skate: ["skating"],
  skating: ["skating"],
  skateboard: ["skating"],
  surf: ["surfing"],
  surfing: ["surfing"],
  paddleboarding: ["paddleboarding"],
  paddleboard: ["paddleboarding"],
  kayaking: ["kayaking"],
  kayak: ["kayaking"],
  canoe: ["kayaking"],
  canoeing: ["kayaking"],
};

// Function to find the best matching image for a workout name
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
 * Get workout image path from assets/sportTypes
 * Uses flexible keyword matching - one image can match multiple workouts
 * @param workoutName - The name of the workout (e.g., "Morning Run", "Evening Yoga")
 * @param fallbackIcon - Fallback icon URL if no match found
 * @returns Path to the PNG image or fallback
 */
export const getWorkoutImageVite = (
  workoutName: string,
  fallbackIcon?: string
): string => {
  if (!workoutName) {
    return fallbackIcon || "https://via.placeholder.com/80";
  }

  // Extract keywords from workout name
  const keywords = extractKeywords(workoutName);

  if (keywords.length === 0) {
    return fallbackIcon || "https://via.placeholder.com/80";
  }

  // Find best matching image
  const matchedImage = findBestMatch(keywords);

  if (matchedImage) {
    // Try to get the image from the glob import (check both png and webp)
    const imagePathPng = `/src/assets/sportTypes/${matchedImage}.png`;
    const imagePathWebp = `/src/assets/sportTypes/${matchedImage}.webp`;

    const importedImagePng = workoutImageModules[imagePathPng];
    const importedImageWebp = workoutImageModules[imagePathWebp];

    if (importedImageWebp) {
      return importedImageWebp;
    }

    if (importedImagePng) {
      return importedImagePng;
    }

    // Fallback to direct path (Vite will handle it) - try webp first, then png
    if (availableImages.includes(matchedImage)) {
      return imagePathWebp; // Prefer webp
    }
    return imagePathPng;
  }

  // Fallback to workout icon or placeholder
  return fallbackIcon || "https://via.placeholder.com/80";
};
