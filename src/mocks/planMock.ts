import { IPlan, IDailyPlan, IMeal, IUser } from "@/types/interfaces";

const createMeal = (
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  prepTime: number = 30,
  done: boolean = false
): IMeal => ({
  _id: `meal_${Math.random().toString(36).substr(2, 9)}`,
  icon: "https://via.placeholder.com/150",
  name,
  calories,
  macros: { protein, carbs, fat },
  category: "main",
  prepTime,
  done,
});

const createWorkout = (
  name: string,
  duration: number,
  caloriesBurned: number
) => ({
  name,
  duration,
  caloriesBurned,
});

export const mockPlan: Partial<IPlan> & {
  _id: string;
  userId: string;
  title: string;
  userMetrics: IPlan["userMetrics"];
  userData: IPlan["userData"];
  weeklyPlan: IPlan["weeklyPlan"];
  language: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
} = {
  _id: "mock_plan_123",
  userId: "mock_user_123",
  title: "Weekly Meal Plan - Dec 4-10",
  userMetrics: {
    bmr: 1800,
    tdee: 2400,
    targetCalories: 2100,
    idealWeight: 70,
    weightRange: "65-75 kg",
    dailyMacros: {
      protein: 150,
      carbs: 220,
      fat: 65,
    },
  },
  userData: {
    age: 30,
    gender: "male",
    height: 175,
    weight: 75,
    activityLevel: "moderate",
    path: "healthy",
    targetWeight: 70,
    allergies: [],
    dietaryRestrictions: [],
  },
  weeklyPlan: {
    "2024-12-04": {
      day: "monday",
      date: "Dec 4",
      meals: {
        breakfast: createMeal("Oatmeal with Berries", 350, 12, 55, 8, 15),
        lunch: createMeal("Chicken and Quinoa Salad", 520, 45, 50, 15, 25),
        dinner: createMeal("Baked Salmon with Asparagus", 580, 50, 30, 25, 35),
        snacks: [createMeal("Protein Bar", 200, 20, 15, 8, 0)],
      },
      totalCalories: 1650,
      totalProtein: 127,
      totalCarbs: 150,
      totalFat: 56,
      waterIntake: 8,
      workouts: [createWorkout("Strength Training", 45, 300)],
      netCalories: 1350,
    },
    "2024-12-05": {
      day: "tuesday",
      date: "Dec 5",
      meals: {
        breakfast: createMeal(
          "Scrambled Eggs with Spinach",
          320,
          20,
          8,
          22,
          15
        ),
        lunch: createMeal(
          "Lentil Soup with Whole Grain Bread",
          480,
          25,
          65,
          12,
          30
        ),
        dinner: createMeal(
          "Turkey Stir-fry with Brown Rice",
          620,
          55,
          70,
          15,
          25
        ),
        snacks: [createMeal("Greek Yogurt", 150, 15, 12, 4, 0)],
      },
      totalCalories: 1570,
      totalProtein: 115,
      totalCarbs: 155,
      totalFat: 53,
      waterIntake: 9,
      workouts: [createWorkout("Cardio Run", 30, 250)],
      netCalories: 1320,
    },
    "2024-12-06": {
      day: "wednesday",
      date: "Dec 6",
      meals: {
        breakfast: createMeal("Greek Yogurt with Granola", 380, 20, 50, 12, 10),
        lunch: createMeal("Grilled Vegetable Wrap", 450, 18, 55, 18, 20),
        dinner: createMeal(
          "Beef and Broccoli with Noodles",
          650,
          45,
          75,
          20,
          30
        ),
        snacks: [createMeal("Almonds", 180, 6, 6, 15, 0)],
      },
      totalCalories: 1660,
      totalProtein: 89,
      totalCarbs: 186,
      totalFat: 65,
      waterIntake: 6,
      workouts: [createWorkout("Yoga & Flexibility", 60, 150)],
      netCalories: 1510,
    },
    "2024-12-07": {
      day: "thursday",
      date: "Dec 7",
      meals: {
        breakfast: createMeal(
          "Smoothie with Protein Powder",
          400,
          30,
          45,
          10,
          10
        ),
        lunch: createMeal("Tuna Salad Sandwich", 510, 35, 50, 18, 15),
        dinner: createMeal(
          "Chicken Breast with Sweet Potato",
          560,
          50,
          55,
          15,
          40
        ),
        snacks: [createMeal("Fruit Bowl", 120, 2, 28, 0, 5)],
      },
      totalCalories: 1590,
      totalProtein: 117,
      totalCarbs: 178,
      totalFat: 43,
      waterIntake: 8,
      workouts: [createWorkout("HIIT Session", 20, 200)],
      netCalories: 1390,
    },
    "2024-12-08": {
      day: "friday",
      date: "Dec 8",
      meals: {
        breakfast: createMeal("Avocado Toast with Egg", 420, 18, 40, 22, 15),
        lunch: createMeal("Sushi Bowl", 530, 30, 65, 15, 20),
        dinner: createMeal("Homemade Pizza (Whole Wheat)", 620, 35, 75, 20, 45),
        snacks: [createMeal("Hummus & Veggies", 140, 5, 15, 6, 10)],
      },
      totalCalories: 1710,
      totalProtein: 88,
      totalCarbs: 195,
      totalFat: 63,
      waterIntake: 7,
      workouts: [],
      netCalories: 1710,
    },
    "2024-12-09": {
      day: "saturday",
      date: "Dec 9",
      meals: {
        breakfast: createMeal("Pancakes with Fruit", 480, 15, 70, 15, 25),
        lunch: createMeal("Burger with Sweet Fries", 720, 40, 85, 30, 30),
        dinner: createMeal("Steak with Roasted Veggies", 680, 55, 35, 35, 50),
        snacks: [createMeal("Ice Cream", 250, 5, 35, 10, 0)],
      },
      totalCalories: 2130,
      totalProtein: 115,
      totalCarbs: 225,
      totalFat: 90,
      waterIntake: 8,
      workouts: [createWorkout("Gym Session", 60, 400)],
      netCalories: 1730,
    },
    "2024-12-10": {
      day: "sunday",
      date: "Dec 10",
      meals: {
        breakfast: createMeal("Brunch Burritos", 500, 25, 55, 20, 30),
        lunch: createMeal("Caesar Salad", 420, 20, 30, 25, 15),
        dinner: createMeal("Soup and Salad", 450, 18, 50, 15, 20),
        snacks: [createMeal("Nuts Mix", 200, 8, 10, 15, 0)],
      },
      totalCalories: 1570,
      totalProtein: 71,
      totalCarbs: 145,
      totalFat: 75,
      waterIntake: 7,
      workouts: [createWorkout("Light Walk", 30, 100)],
      netCalories: 1470,
    },
  },
  language: "en",
  generatedAt: new Date("2024-12-01"),
  createdAt: new Date("2024-12-01"),
  updatedAt: new Date("2024-12-01"),
};

export const mockUser: IUser = {
  _id: "mock_user_123",
  name: "Test User",
  email: "test@habeat.com",
  password: "",
  height: 175,
  weight: 75,
  gender: "male",
  age: 30,
  isPremium: false,
  path: "healthy",
  bmr: 1800,
  tdee: 2400,
  idealWeight: 70,
  allergies: [],
  dietaryRestrictions: [],
  favoriteMeals: [],
  foodPreferences: ["Pizza", "Pasta", "Sushi"],
  dislikes: [],
};
