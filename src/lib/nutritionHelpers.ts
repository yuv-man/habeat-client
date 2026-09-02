import { caloriesPercentage } from "./paths";
import { IMeal } from "@/types/interfaces";

export interface CalorieRange {
  min: number;
  max: number;
}

export interface MealCalorieRanges {
  breakfast: CalorieRange;
  lunch: CalorieRange;
  dinner: CalorieRange;
  snacks: CalorieRange;
}

/**
 * Calculate calorie ranges for each meal type based on daily target calories
 * @param dailyTargetCalories - The user's daily calorie target
 * @returns Object with calorie ranges for each meal type
 */
export const calculateMealCalorieRanges = (
  dailyTargetCalories: number,
): MealCalorieRanges => {
  return {
    breakfast: {
      min: Math.round(caloriesPercentage.breakfast.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.breakfast.max * dailyTargetCalories),
    },
    lunch: {
      min: Math.round(caloriesPercentage.lunch.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.lunch.max * dailyTargetCalories),
    },
    dinner: {
      min: Math.round(caloriesPercentage.dinner.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.dinner.max * dailyTargetCalories),
    },
    snacks: {
      min: Math.round(caloriesPercentage.snacks.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.snacks.max * dailyTargetCalories),
    },
  };
};

/**
 * Calculate progress percentage for a given value against a goal
 * @param current - Current value
 * @param goal - Target goal value
 * @returns Progress percentage (0-100)
 */
export const calculateProgress = (current: number, goal: number): number => {
  if (goal === 0) return 0;
  return Math.round((current / goal) * 100);
};

/**
 * Calculate remaining calories for a meal type
 * @param mealType - Type of meal (breakfast, lunch, dinner, snacks)
 * @param dailyTargetCalories - Daily calorie target
 * @param consumedCalories - Calories already consumed
 * @returns Remaining calories for the meal type
 */
export const calculateRemainingCaloriesForMeal = (
  mealType: keyof MealCalorieRanges,
  dailyTargetCalories: number,
  consumedCalories: number,
): number => {
  const ranges = calculateMealCalorieRanges(dailyTargetCalories);
  const mealRange = ranges[mealType];
  const remainingDaily = dailyTargetCalories - consumedCalories;

  // Return the minimum of meal range max or remaining daily calories
  return Math.min(mealRange.max, remainingDaily);
};

export const calculateMealProgress = (meals: {
  breakfast: IMeal;
  lunch: IMeal;
  dinner: IMeal;
  snacks: IMeal[];
}): number => {
  let consumedCalories = 0;
  if (meals.breakfast.done) {
    consumedCalories += meals.breakfast.calories;
  }
  if (meals.lunch.done) {
    consumedCalories += meals.lunch.calories;
  }
  if (meals.dinner.done) {
    consumedCalories += meals.dinner.calories;
  }
  if (meals.snacks.length > 0) {
    consumedCalories += meals.snacks.reduce(
      (acc, curr) => acc + (curr.done ? curr.calories : 0),
      0,
    );
  }
  return consumedCalories;
};

/**
 * Calculate health score for a meal based on nutrition (0-100)
 * Uses continuous scoring so only meals genuinely close to nutritional
 * ideals score high. Wide step-function bands caused most AI-generated
 * balanced meals to all land at 100, which was not meaningful.
 *
 * Scoring: each macro is scored by its linear distance from the ideal
 * centre, falling to 0 pts at the outer tolerance edge.
 *   Protein ideal 25% of macro-kcal  (±22 pp tolerance)
 *   Carbs   ideal 50% of macro-kcal  (±28 pp tolerance)
 *   Fat     ideal 25% of macro-kcal  (±22 pp tolerance)
 *
 * Max = 35 + 35 + 30 = 100. Only meals very close to the ideal ratio
 * across ALL three macros approach 100.
 */
export const calculateMealHealthScore = (meal: IMeal): number => {
  if (!meal.macros || meal.calories === 0) return 50;

  const { protein, carbs, fat } = meal.macros;
  const proteinCal = protein * 4;
  const carbsCal   = carbs * 4;
  const fatCal     = fat * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  if (totalMacroCal === 0) return 50;

  const proteinPct = (proteinCal / totalMacroCal) * 100;
  const carbsPct   = (carbsCal   / totalMacroCal) * 100;
  const fatPct     = (fatCal     / totalMacroCal) * 100;

  // Linear score: full points at ideal, 0 at the tolerance edge.
  const linearScore = (actual: number, ideal: number, tolerance: number, max: number): number =>
    Math.round(max * Math.max(0, 1 - Math.abs(actual - ideal) / tolerance));

  const proteinScore = linearScore(proteinPct, 25, 22, 35); // ideal 25%, tolerance ±22pp
  const carbsScore   = linearScore(carbsPct,   50, 28, 35); // ideal 50%, tolerance ±28pp
  const fatScore     = linearScore(fatPct,     25, 22, 30); // ideal 25%, tolerance ±22pp

  return Math.max(0, Math.min(100, proteinScore + carbsScore + fatScore));
};

// Get health score color and label
export const getHealthScoreColor = (score: number) => {
  if (score >= 80)
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
      label: "Excellent",
    };
  if (score >= 65)
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      label: "Good",
    };
  if (score >= 50)
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
      label: "Fair",
    };
  return {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    label: "Needs Improvement",
  };
};
