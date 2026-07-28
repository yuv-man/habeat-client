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
 * Factors considered:
 * - Macro balance (protein, carbs, fat ratios)
 * - Calorie appropriateness
 * - Overall nutritional quality
 */
export const calculateMealHealthScore = (meal: IMeal): number => {
  if (!meal.macros || meal.calories === 0) return 50;

  const { protein, carbs, fat } = meal.macros;
  const proteinCal = protein * 4;
  const carbsCal   = carbs * 4;
  const fatCal     = fat * 9;
  const totalMacroCal = proteinCal + carbsCal + fatCal;

  if (totalMacroCal === 0) return 50;

  // Divide by totalMacroCal (not meal.calories) so percentages always sum to 100%
  // regardless of small AI rounding differences.
  const proteinPct = (proteinCal / totalMacroCal) * 100;
  const carbsPct   = (carbsCal   / totalMacroCal) * 100;
  const fatPct     = (fatCal     / totalMacroCal) * 100;

  let score = 0;

  // 1. Protein — 35 pts
  // Wide acceptable band so fruit smoothie bowls, oatmeal and rice dishes aren't
  // destroyed just for having natural carb-dominant ratios.
  // Ideal 15-35% | Good 8-40% | Acceptable 5-50%
  if (proteinPct >= 15 && proteinPct <= 35) {
    score += 35;
  } else if (proteinPct >= 8 && proteinPct < 15) {
    score += 27; // low-protein whole foods (oatmeal, grain bowls, fruit)
  } else if (proteinPct > 35 && proteinPct <= 45) {
    score += 28; // high-protein — still very healthy
  } else if (proteinPct >= 5 && proteinPct < 8) {
    score += 18; // very low — typical for pure-fruit meals
  } else if (proteinPct > 45) {
    score += 18; // very high protein
  } else {
    score += 8;  // near-zero protein
  }

  // 2. Carbs — 35 pts
  // Extend the "good" ceiling to 75% so fruit/grain meals score fairly.
  // Ideal 40-65% | Good 30-75% | Acceptable 20-85%
  if (carbsPct >= 40 && carbsPct <= 65) {
    score += 35;
  } else if ((carbsPct >= 30 && carbsPct < 40) || (carbsPct > 65 && carbsPct <= 75)) {
    score += 27;
  } else if ((carbsPct >= 20 && carbsPct < 30) || (carbsPct > 75 && carbsPct <= 85)) {
    score += 18; // high-carb fruit meals are nutritionally sound
  } else if (carbsPct > 85) {
    score += 10; // very high carb (minimal fat+protein)
  } else {
    score += 10; // very low carb
  }

  // 3. Fat — 30 pts
  // Allow low fat for fruit/grain meals; allow moderately high fat for nuts/avocado dishes.
  // Ideal 20-40% | Good 10-50% | Acceptable 5-60%
  if (fatPct >= 20 && fatPct <= 40) {
    score += 30;
  } else if ((fatPct >= 10 && fatPct < 20) || (fatPct > 40 && fatPct <= 50)) {
    score += 22;
  } else if ((fatPct >= 5 && fatPct < 10) || (fatPct > 50 && fatPct <= 60)) {
    score += 14;
  } else {
    score += 6;
  }

  // Max = 35 + 35 + 30 = 100 — no normalisation needed, score IS the 0-100 value.
  return Math.max(0, Math.min(100, Math.round(score)));
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
