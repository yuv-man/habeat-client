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
export const calculateMealCalorieRanges = (dailyTargetCalories: number): MealCalorieRanges => {
  return {
    breakfast: {
      min: Math.round(caloriesPercentage.breakfast.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.breakfast.max * dailyTargetCalories)
    },
    lunch: {
      min: Math.round(caloriesPercentage.lunch.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.lunch.max * dailyTargetCalories)
    },
    dinner: {
      min: Math.round(caloriesPercentage.dinner.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.dinner.max * dailyTargetCalories)
    },
    snacks: {
      min: Math.round(caloriesPercentage.snacks.min * dailyTargetCalories),
      max: Math.round(caloriesPercentage.snacks.max * dailyTargetCalories)
    }
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
  consumedCalories: number
): number => {
  const ranges = calculateMealCalorieRanges(dailyTargetCalories);
  const mealRange = ranges[mealType];
  const remainingDaily = dailyTargetCalories - consumedCalories;
  
  // Return the minimum of meal range max or remaining daily calories
  return Math.min(mealRange.max, remainingDaily);
};

export const calculateMealProgress = (meals: {'breakfast': IMeal, 'lunch': IMeal, 'dinner': IMeal, 'snacks': IMeal[]}): number => {
  let consumedCalories = 0;
  if(meals.breakfast.done) {
    consumedCalories += meals.breakfast.calories;
  }
  if(meals.lunch.done) {
    consumedCalories += meals.lunch.calories;
  }
  if(meals.dinner.done) {
    consumedCalories += meals.dinner.calories;
  }
  if(meals.snacks.length > 0) {
    consumedCalories += meals.snacks.reduce((acc, curr) => acc + (curr.done ? curr.calories : 0), 0);
  }
  return consumedCalories;
};
