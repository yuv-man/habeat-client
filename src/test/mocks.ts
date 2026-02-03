import { vi } from "vitest";
import { IUser, IPlan, IMeal, IDailyPlan } from "@/types/interfaces";

// ============================================
// MOCK USER DATA
// ============================================
export const mockUser: IUser = {
  _id: "test_user_123",
  name: "John Doe",
  email: "john@example.com",
  password: "",
  height: 175,
  weight: 75,
  gender: "male",
  age: 30,
  subscriptionTier: "free",
  path: "healthy",
  bmr: 1800,
  tdee: 2400,
  idealWeight: 70,
  allergies: ["peanuts"],
  dietaryRestrictions: ["vegetarian"],
  favoriteMeals: ["Pizza", "Pasta"],
  dislikes: ["fish"],
  foodPreferences: [],
};

export const mockUserWithNoPlan: IUser = {
  ...mockUser,
  _id: "test_user_no_plan",
};

// ============================================
// MOCK MEAL DATA
// ============================================
export const mockBreakfast: IMeal = {
  _id: "meal_breakfast_1",
  icon: "breakfast",
  name: "Oatmeal with Berries",
  calories: 350,
  macros: { protein: 12, carbs: 55, fat: 8 },
  category: "breakfast",
  prepTime: 15,
  done: false,
};

export const mockLunch: IMeal = {
  _id: "meal_lunch_1",
  icon: "lunch",
  name: "Grilled Chicken Salad",
  calories: 520,
  macros: { protein: 45, carbs: 30, fat: 15 },
  category: "lunch",
  prepTime: 25,
  done: false,
};

export const mockDinner: IMeal = {
  _id: "meal_dinner_1",
  icon: "dinner",
  name: "Baked Salmon with Vegetables",
  calories: 580,
  macros: { protein: 50, carbs: 20, fat: 25 },
  category: "dinner",
  prepTime: 35,
  done: true,
};

export const mockSnack: IMeal = {
  _id: "meal_snack_1",
  icon: "snack",
  name: "Protein Bar",
  calories: 200,
  macros: { protein: 20, carbs: 15, fat: 8 },
  category: "snacks",
  prepTime: 0,
  done: false,
};

// ============================================
// MOCK DAILY PLAN
// ============================================
export const mockDailyPlan: IDailyPlan = {
  day: "monday",
  date: "Dec 7",
  meals: {
    breakfast: mockBreakfast,
    lunch: mockLunch,
    dinner: mockDinner,
    snacks: [mockSnack],
  },
  totalCalories: 1650,
  totalProtein: 127,
  totalCarbs: 120,
  totalFat: 56,
  waterIntake: 6,
  workouts: [
    {
      name: "Strength Training",
      duration: 45,
      caloriesBurned: 300,
    },
  ],
  netCalories: 1350,
};

// ============================================
// MOCK WEEKLY PLAN
// ============================================
export const mockWeeklyPlan: Record<string, IDailyPlan> = {
  "2024-12-02": { ...mockDailyPlan, day: "monday", date: "Dec 2" },
  "2024-12-03": { ...mockDailyPlan, day: "tuesday", date: "Dec 3" },
  "2024-12-04": { ...mockDailyPlan, day: "wednesday", date: "Dec 4" },
  "2024-12-05": { ...mockDailyPlan, day: "thursday", date: "Dec 5" },
  "2024-12-06": { ...mockDailyPlan, day: "friday", date: "Dec 6" },
  "2024-12-07": { ...mockDailyPlan, day: "saturday", date: "Dec 7" },
  "2024-12-08": { ...mockDailyPlan, day: "sunday", date: "Dec 8" },
};

// ============================================
// MOCK PLAN
// ============================================
export const mockPlan: IPlan = {
  _id: "plan_123",
  userId: "test_user_123",
  title: "Weekly Meal Plan",
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
  weeklyPlan: mockWeeklyPlan,
  language: "en",
  generatedAt: new Date("2024-12-01"),
  createdAt: new Date("2024-12-01"),
  updatedAt: new Date("2024-12-01"),
};

// ============================================
// MOCK API RESPONSES
// ============================================
export const mockLoginResponse = {
  data: {
    token: "mock_jwt_token_12345",
  },
  status: "success",
};

export const mockSignupResponse = {
  data: {
    user: mockUser,
    plan: mockPlan,
    token: "mock_jwt_token_12345",
  },
  status: "success",
};

export const mockFetchUserResponse = {
  data: {
    user: mockUser,
    plan: mockPlan,
  },
};

// ============================================
// MOCK AUTH STORE
// ============================================
export const createMockAuthStore = (
  overrides?: Partial<{
    user: IUser | null;
    plan: IPlan | null;
    token: string | null;
    loading: boolean;
  }>
) => ({
  user: mockUser,
  plan: mockPlan,
  token: "mock_token",
  loading: false,
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  updateProfile: vi.fn(),
  setUser: vi.fn(),
  setPlan: vi.fn(),
  setLoading: vi.fn(),
  setToken: vi.fn(),
  fetchUser: vi.fn(),
  oauthSignin: vi.fn(),
  oauthSignup: vi.fn(),
  handleOAuthCallback: vi.fn(),
  guestSignin: vi.fn(),
  generateMealPlan: vi.fn(),
  updateMealInPlan: vi.fn(),
  updateFavorite: vi.fn(),
  ...overrides,
});

// ============================================
// MOCK NAVIGATION
// ============================================
export const mockNavigate = vi.fn();

export const mockUseNavigate = () => mockNavigate;

// ============================================
// TEST UTILITIES
// ============================================
export const resetAllMocks = () => {
  vi.clearAllMocks();
  mockNavigate.mockReset();
};
