export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  // Note: password is only used during signup/login, never stored in state
  password?: string;
  height: number;
  weight: number;
  gender: string;
  age: number;
  isPremium: boolean;
  path: string;
  bmr: number;
  tdee: number;
  idealWeight: number;
  allergies: string[];
  dietaryRestrictions: string[];
  favoriteMeals?: string[]; // Array of meal IDs that user has liked
  foodPreferences: string[];
  dislikes?: string[];
  profilePicture?: string; // Base64 encoded profile picture or URL
  fastingHours?: number; // For 8-16 fasting diet type
  fastingStartTime?: string; // Time when fasting starts (e.g., "20:00")
}

export interface IMeal {
  _id: string;
  icon?: string;
  name: string;
  // Format: "ingredient_name|portion|unit" (e.g., "chicken_breast|200|g")
  ingredients?: string[];
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  category: string;
  usageCount?: number;
  prepTime: number;
  done: boolean;
}

export interface IDailyPlan {
  day:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  date: string;
  meals: {
    breakfast: IMeal;
    lunch: IMeal;
    dinner: IMeal;
    snacks: IMeal[];
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  waterIntake: number; // in glasses
  workouts: {
    name: string;
    duration: number;
    caloriesBurned: number;
    date?: string;
    time?: string;
  }[]; // number of workouts completed
  netCalories: number;
}

export interface IPlanData {
  userData: IUser;
  weeklyPlan: { [date: string]: IDailyPlan };
}

export interface IPlan {
  _id: string;
  userId: string;
  title: string;
  userMetrics: {
    bmr: number;
    tdee: number;
    targetCalories: number;
    idealWeight: number;
    weightRange: string;
    dailyMacros: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  userData: {
    age: number;
    gender: "male" | "female";
    height: number;
    weight: number;
    activityLevel: string;
    path: string;
    targetWeight?: number;
    allergies?: string[];
    dietaryRestrictions?: string[];
  };
  weeklyPlan: { [date: string]: IDailyPlan };
  language: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgress {
  userId: string;
  date: Date;
  caloriesConsumed: number;
  caloriesGoal: number;
  waterGlasses: number;
  waterGoal: number;
  workoutsCompleted: number;
  workoutsGoal: number;
  mealsCompleted: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: number; // number of snacks completed
  };
  exerciseMinutes: number;
  weight?: number; // optional daily weight tracking
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDailyProgress {
  date: string;
  planId: string;
  userId: string;
  water: {
    consumed: number;
    goal: number;
  };
  caloriesConsumed: number;
  caloriesGoal: number;
  protein: {
    consumed: number;
    goal: number;
  };
  carbs: {
    consumed: number;
    goal: number;
  };
  fat: {
    consumed: number;
    goal: number;
  };
  workouts: {
    name: string;
    category: string;
    duration: number;
    caloriesBurned: number;
    done: boolean;
    date?: string;
    time?: string;
  }[];
  meals: {
    breakfast: IMeal;
    lunch: IMeal;
    dinner: IMeal;
    snacks: IMeal[];
  };
  messages: string;
  stats: {
    calories: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    water: {
      consumed: number;
      goal: number;
      percentage: number;
    };
    macros: {
      protein: {
        consumed: number;
        goal: number;
        percentage: number;
      };
      carbs: {
        consumed: number;
        goal: number;
        percentage: number;
      };
      fat: {
        consumed: number;
        goal: number;
        percentage: number;
      };
    };
    workouts: {
      name: string;
      category: string;
      duration: number;
      caloriesBurned: number;
      done: boolean;
      date?: string;
      time?: string;
    }[];
    meals: {
      mealsCompleted: number;
      mealsGoal: number;
      percentage: number;
    };
    messages: string;
    weight: number;
  };
}

export interface MealItem {
  _id: string;
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface MealData {
  _id: string;
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  done: boolean;
  items?: MealItem[]; // For snacks that can have multiple items
}

export interface WorkoutData {
  name: string;
  caloriesBurned: number;
  duration: number;
  category: string;
  done?: boolean;
  date?: string;
  time?: string;
}

export interface IRecipeIngredient {
  name: string;
  amount: string; // e.g., "170", "40"
  unit?: string; // e.g., "g", "ml", "cup"
  _id?: string;
}

export interface IRecipeInstruction {
  step: number;
  instruction: string;
  time?: number; // in minutes
  temperature?: number | null;
  _id?: string;
}

export interface IRecipe {
  _id?: string;
  mealId: string;
  mealName: string;
  category: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: string; // "easy", "medium", "hard"
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  ingredients: IRecipeIngredient[];
  instructions: IRecipeInstruction[];
  equipment?: string[];
  tags?: string[];
  dietaryInfo?: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    isGlutenFree?: boolean;
    isDairyFree?: boolean;
    isKeto?: boolean;
    isLowCarb?: boolean;
  };
  language?: string;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealTimes {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
}

export interface AuthState {
  user: IUser | null;
  loading: boolean;
  token: string | null;
  plan: IPlan | null;
  mealTimes: MealTimes;
  favoriteMealsData: IMeal[];
  favoriteMealsLoaded: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: IUser) => Promise<void>;
  logout: () => void;
  updateProfile: (id: string, data: Partial<IUser>) => Promise<void>;
  setUser: (user: IUser | null) => void;
  setPlan: (plan: IPlan | null) => void;
  setLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  setMealTimes: (mealTimes: Partial<MealTimes>) => void;
  fetchUser: (token: string, onSuccess?: () => void) => Promise<void>;
  oauthSignin: (provider: string, userId?: string) => Promise<void>;
  oauthSignup: (provider: string, userId?: string) => Promise<void>;
  handleOAuthCallback: (
    provider: string,
    action: "signin" | "signup",
    userId?: string,
    accessToken?: string
  ) => Promise<void>;
  guestSignin: (userData: IUser) => void;
  generateMealPlan: (
    userData: IUser,
    planName: string,
    language: string
  ) => Promise<void>;
  updateMealInPlan: (userId: string, date: Date, meal: IMeal) => Promise<void>;
  updateFavorite: (
    userId: string,
    mealId: string,
    isFavorite: boolean
  ) => Promise<void>;
  fetchFavoriteMeals: (userId: string, forceRefresh?: boolean) => Promise<void>;
  setFavoriteMealsData: (meals: IMeal[]) => void;
}

export interface IngredientInput {
  name: string;
  amount: string;
  category: string;
  done: boolean;
}

export interface IGoal {
  _id?: string;
  userId?: string;
  title?: string;
  description?: string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  achieved?: boolean;
  status?: "achieved" | "in_progress";
  icon?: string;
  startDate?: string;
  milestones?: any[];
  progressHistory?: any[];
}

export interface IAnalyticsData {
  period: "week" | "month";
  startDate: string;
  endDate: string;
  daysTracked: number;
  totalDays: number;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    workoutsCompleted: number;
    workoutsTotal: number;
    caloriesBurned: number;
  };
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  goalPercentages: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  dailyData: Array<{
    date: string;
    dateKey: string;
    calories: number;
    caloriesGoal: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    workoutsCompleted: number;
    workoutsTotal: number;
  }>;
}
