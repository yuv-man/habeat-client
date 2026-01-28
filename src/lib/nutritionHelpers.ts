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
  if (!meal.macros || meal.calories === 0) return 50; // Default score if no data

  const { protein, carbs, fat } = meal.macros;

  // Calculate macro calories
  const proteinCalories = protein * 4;
  const carbsCalories = carbs * 4;
  const fatCalories = fat * 9;
  const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;

  if (totalMacroCalories === 0) return 50;

  // Calculate macro percentages
  const proteinPct = (proteinCalories / meal.calories) * 100;
  const carbsPct = (carbsCalories / meal.calories) * 100;
  const fatPct = (fatCalories / meal.calories) * 100;

  let score = 0;
  let factors = 0;

  // 1. Protein score (ideal: 20-30% of calories) - 30 points
  factors++;
  if (proteinPct >= 20 && proteinPct <= 30) {
    score += 30; // Perfect range
  } else if (proteinPct >= 15 && proteinPct < 20) {
    score += 25; // Good, slightly low
  } else if (proteinPct > 30 && proteinPct <= 35) {
    score += 25; // Good, slightly high
  } else if (proteinPct >= 10 && proteinPct < 15) {
    score += 15; // Acceptable, low
  } else if (proteinPct > 35 && proteinPct <= 40) {
    score += 15; // Acceptable, high
  } else {
    score += Math.max(0, 10 - Math.abs(proteinPct - 25) * 0.5); // Penalty for being far from ideal
  }

  // 2. Carbs score (ideal: 45-65% of calories) - 30 points
  factors++;
  if (carbsPct >= 45 && carbsPct <= 65) {
    score += 30; // Perfect range
  } else if (carbsPct >= 40 && carbsPct < 45) {
    score += 25; // Good, slightly low
  } else if (carbsPct > 65 && carbsPct <= 70) {
    score += 25; // Good, slightly high
  } else if (carbsPct >= 35 && carbsPct < 40) {
    score += 15; // Acceptable, low
  } else if (carbsPct > 70 && carbsPct <= 75) {
    score += 15; // Acceptable, high
  } else {
    score += Math.max(0, 10 - Math.abs(carbsPct - 55) * 0.3); // Penalty for being far from ideal
  }

  // 3. Fat score (ideal: 20-35% of calories) - 25 points
  factors++;
  if (fatPct >= 20 && fatPct <= 35) {
    score += 25; // Perfect range
  } else if (fatPct >= 15 && fatPct < 20) {
    score += 20; // Good, slightly low
  } else if (fatPct > 35 && fatPct <= 40) {
    score += 20; // Good, slightly high
  } else if (fatPct >= 10 && fatPct < 15) {
    score += 12; // Acceptable, low
  } else if (fatPct > 40 && fatPct <= 45) {
    score += 12; // Acceptable, high
  } else {
    score += Math.max(0, 8 - Math.abs(fatPct - 27.5) * 0.4); // Penalty for being far from ideal
  }

  // 4. Calorie appropriateness (ideal: 300-600 for meals, 100-300 for snacks) - 15 points
  factors++;
  const isSnack = meal.calories < 300;
  if (isSnack) {
    if (meal.calories >= 100 && meal.calories <= 300) {
      score += 15; // Perfect snack range
    } else if (meal.calories >= 50 && meal.calories < 100) {
      score += 10; // Small snack
    } else if (meal.calories > 300 && meal.calories <= 400) {
      score += 8; // Large snack
    } else {
      score += Math.max(0, 5 - Math.abs(meal.calories - 200) / 50); // Penalty
    }
  } else {
    if (meal.calories >= 300 && meal.calories <= 600) {
      score += 15; // Perfect meal range
    } else if (meal.calories >= 250 && meal.calories < 300) {
      score += 12; // Small meal
    } else if (meal.calories > 600 && meal.calories <= 700) {
      score += 12; // Large meal
    } else if (meal.calories >= 200 && meal.calories < 250) {
      score += 8; // Very small meal
    } else if (meal.calories > 700 && meal.calories <= 800) {
      score += 8; // Very large meal
    } else {
      score += Math.max(0, 5 - Math.abs(meal.calories - 450) / 100); // Penalty
    }
  }

  // Normalize to 0-100 scale
  const maxScore = factors * 30; // Maximum possible score
  const normalizedScore = Math.round((score / maxScore) * 100);

  return Math.max(0, Math.min(100, normalizedScore));
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
