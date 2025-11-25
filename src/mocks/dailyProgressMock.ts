import { IDailyProgress, IMeal } from "@/types/interfaces";

const createMeal = (
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  prepTime: number = 30,
  done: boolean = false,
  icon?: string
): IMeal => ({
  _id: `meal_${Math.random().toString(36).substr(2, 9)}`,
  icon: icon || "https://via.placeholder.com/150",
  name,
  calories,
  macros: { protein, carbs, fat },
  category: "main",
  prepTime,
  done,
});

export const mockDailyProgress: IDailyProgress = {
  date: new Date().toISOString().split("T")[0],
  planId: "mock_plan_123",
  userId: "mock_user_123",
  water: {
    consumed: 3,
    goal: 8,
  },
  caloriesConsumed: 1450,
  caloriesGoal: 2000,
  protein: {
    consumed: 75,
    goal: 100,
  },
  carbs: {
    consumed: 180,
    goal: 250,
  },
  fat: {
    consumed: 50,
    goal: 70,
  },
  workouts: [
    {
      name: "Morning Power Walk",
      category: "cardio",
      duration: 30,
      caloriesBurned: 250,
      done: false,
    },
    {
      name: "Evening Yoga Flow",
      category: "flexibility",
      duration: 45,
      caloriesBurned: 180,
      done: false,
    },
  ],
  meals: {
    breakfast: createMeal(
      "Oatmeal with Berries",
      350,
      12,
      55,
      8,
      15,
      false,
      "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400"
    ),
    lunch: createMeal(
      "Chicken Salad Sandwich",
      480,
      35,
      45,
      15,
      20,
      false,
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
    ),
    dinner: createMeal(
      "Baked Salmon with Asparagus",
      620,
      50,
      30,
      25,
      40,
      false,
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400"
    ),
    snacks: [createMeal("Protein Bar", 200, 20, 15, 8, 0, false)],
  },
  messages: "Great progress today! Keep it up!",
  stats: {
    calories: {
      consumed: 1450,
      goal: 2000,
      percentage: 72.5,
    },
    water: {
      consumed: 3,
      goal: 8,
      percentage: 37.5,
    },
    macros: {
      protein: {
        consumed: 75,
        goal: 100,
        percentage: 75,
      },
      carbs: {
        consumed: 180,
        goal: 250,
        percentage: 72,
      },
      fat: {
        consumed: 50,
        goal: 70,
        percentage: 71.4,
      },
    },
    workouts: [
      {
        name: "Morning Power Walk",
        category: "cardio",
        duration: 30,
        caloriesBurned: 250,
        done: false,
      },
      {
        name: "Evening Yoga Flow",
        category: "flexibility",
        duration: 45,
        caloriesBurned: 180,
        done: false,
      },
    ],
    meals: {
      mealsCompleted: 0,
      mealsGoal: 4,
      percentage: 0,
    },
    messages: "Great progress today! Keep it up!",
    weight: 75,
  },
};
