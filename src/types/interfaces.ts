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
  subscriptionTier: "free" | "plus" | "premium";
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
    language: string,
    planTemplate?: string
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

// Engagement/Gamification interfaces
export interface IBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  category:
    | "streak"
    | "meals"
    | "nutrition"
    | "milestone"
    | "special"
    | "consistency"
    | "hydration"
    | "cbt"
    | "mindfulness"
    | "emotional_awareness";
}

// Weekly summary for habit tracking
export interface IWeeklySummary {
  weekStart: string;
  weekEnd: string;
  daysTracked: number;
  consistencyScore: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  calorieGoalHitDays: number;
  avgWaterGlasses: number;
  waterGoalHitDays: number;
  achievements: string[];
  bestDay: string | null;
  motivationalMessage: string;
  focusAreaForNextWeek: string;
}

export interface IEngagementStats {
  // Habit-focused stats (primary)
  habitScore: number;
  streak: number;
  longestStreak: number;
  weeklyConsistency: number;
  weeklyGoalsHit: number;
  totalMealsLogged: number;
  totalDaysTracked: number;
  badges: IBadge[];
  streakFreezeAvailable: boolean;
  weeklySummaries?: IWeeklySummary[];
  lastWeeklySummary?: string;
  // Legacy fields (kept for backward compatibility)
  xp: number;
  level: number;
  xpProgress: {
    current: number;
    required: number;
  };
}

export interface IEngagementResult {
  // Habit-focused results (primary)
  habitScore: number;
  streak: number;
  newBadges: IBadge[];
  milestoneReached?: {
    type: string;
    message: string;
  };
  // Legacy fields (kept for backward compatibility)
  xpAwarded: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
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

// Habit-based challenge types
export type HabitChallengeType =
  | "daily_logging" // Log all meals for X days
  | "breakfast_habit" // Log breakfast X days in a row
  | "hydration_habit" // Hit water goal X days
  | "balanced_eating" // Balanced macros X days
  | "protein_focus" // Hit protein goal X days
  | "mindful_eating" // Log meals consistently
  | "meal_consistency" // Don't skip any meals X days
  | "weekly_streak" // Complete full week of tracking
  // CBT/Mindfulness challenge types
  | "mood_tracking" // Log mood X times
  | "mindful_meal" // Complete mindful eating exercise before meals
  | "thought_journal" // Complete X thought records
  | "cbt_exercise" // Complete X CBT exercises
  | "emotional_awareness" // Link mood to X meals
  | "pre_meal_checkin" // Do mood check-in before X meals
  | "mindfulness_streak"; // CBT activity streak for X days

// Legacy challenge types (kept for backward compatibility)
export type ChallengeType =
  | HabitChallengeType
  | "meals_logged"
  | "water_intake"
  | "streak_days"
  | "veggie_meals"
  | "protein_goal"
  | "workout_complete"
  | "balanced_meals"
  | "home_cooking";

export type ChallengeDifficulty = "starter" | "building" | "established";
export type ChallengeStatus = "active" | "completed" | "claimed" | "expired";

export interface IChallenge {
  _id: string;
  userId: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  daysRequired: number; // Duration of the habit challenge
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  completedAt?: string;
  claimedAt?: string;
  // Legacy field (kept for backward compatibility)
  xpReward?: number;
}

export interface IChallengeClaimResult {
  success: boolean;
  challenge: IChallenge;
  badgeAwarded?: IBadge;
  // Legacy field
  xpAwarded?: number;
}

// Reflection types
export interface IDailySummary {
  date: string;
  healthScore: number;
  healthScoreChange: number;
  xpEarned: number;
  insight: string;
  emoji: string;
  stats: {
    caloriesPercent: number;
    proteinPercent: number;
    waterPercent: number;
    mealsCompleted: number;
    mealsTotal: number;
    workoutsCompleted: number;
  };
}

export interface IWeeklyStory {
  period: { start: string; end: string };
  message: string;
  emoji: string;
  suggestion: string;
  highlights: string[];
  stats: {
    avgHealthScore: number;
    healthScoreChange: number;
    totalXpEarned: number;
    daysTracked: number;
    bestDay: string | null;
    streakDays: number;
  };
}

// Notification types
export type NotificationType =
  | "meal_reminder"
  | "streak_warning"
  | "streak_broken"
  | "challenge_complete"
  | "challenge_expiring"
  | "level_up"
  | "badge_earned"
  | "weekly_summary"
  | "daily_summary"
  | "motivational";

export interface INotificationPreferences {
  enabled: boolean;
  mealReminders: {
    enabled: boolean;
    breakfast: { enabled: boolean; time: string };
    lunch: { enabled: boolean; time: string };
    dinner: { enabled: boolean; time: string };
    snacks: { enabled: boolean; time: string };
  };
  streakAlerts: {
    enabled: boolean;
    warningTime: string;
  };
  challengeUpdates: {
    enabled: boolean;
    onComplete: boolean;
    onExpiring: boolean;
  };
  achievements: {
    enabled: boolean;
    levelUp: boolean;
    badgeEarned: boolean;
  };
  weeklySummary: {
    enabled: boolean;
    dayOfWeek: number;
    time: string;
  };
  dailySummary: {
    enabled: boolean;
    time: string;
  };
  motivationalNudges: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "occasional";
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  // CBT reminders
  cbtReminders?: ICBTNotificationPreferences;
}

export interface INotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

// Subscription types
export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "none";

export interface SubscriptionDetails {
  tier: "free" | "plus" | "premium";
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface CreateCheckoutSessionRequest {
  tier: "plus" | "premium";
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
}

export interface CreatePortalSessionRequest {
  returnUrl: string;
}

export interface CreatePortalSessionResponse {
  url: string;
}

export interface ChangeTierRequest {
  tier: "free" | "plus" | "premium";
}

// ============================================
// CBT (Cognitive Behavioral Therapy) Interfaces
// ============================================

// Mood tracking types
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodCategory =
  | "happy"
  | "calm"
  | "anxious"
  | "sad"
  | "angry"
  | "stressed"
  | "tired"
  | "energetic"
  | "neutral";

export type MoodTrigger =
  | "work"
  | "relationships"
  | "health"
  | "finances"
  | "sleep"
  | "food"
  | "exercise"
  | "weather"
  | "social"
  | "other";

export interface IMoodEntry {
  _id?: string;
  userId: string;
  date: string;
  time: string;
  moodLevel: MoodLevel;
  moodCategory: MoodCategory;
  energyLevel?: MoodLevel;
  stressLevel?: MoodLevel;
  notes?: string;
  triggers?: MoodTrigger[];
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  createdAt?: string;
  updatedAt?: string;
}

export interface IMoodSummary {
  date: string;
  avgMoodLevel: number;
  avgEnergyLevel: number;
  avgStressLevel: number;
  dominantMood: MoodCategory;
  moodEntryCount: number;
  mealMoodCorrelations: IMealMoodCorrelation[];
}

// Cognitive distortion types for thought journaling
export type CognitiveDistortionType =
  | "all_or_nothing" // Black and white thinking
  | "overgeneralization" // Seeing single events as patterns
  | "mental_filter" // Focusing on negatives
  | "disqualifying_positive" // Dismissing good things
  | "jumping_to_conclusions" // Mind reading or fortune telling
  | "magnification" // Catastrophizing or minimizing
  | "emotional_reasoning" // Feelings as facts
  | "should_statements" // Rigid rules
  | "labeling" // Assigning negative labels
  | "personalization"; // Blaming self for external events

export interface ICognitiveDistortion {
  type: CognitiveDistortionType;
  name: string;
  description: string;
  example: string;
  reframeQuestion: string;
}

export interface IThoughtEmotion {
  name: string;
  intensity: MoodLevel;
}

export interface IThoughtEntry {
  _id?: string;
  userId: string;
  date: string;
  time: string;
  situation: string;
  automaticThought: string;
  emotions: IThoughtEmotion[];
  cognitiveDistortions?: CognitiveDistortionType[];
  evidence?: {
    supporting: string[];
    contradicting: string[];
  };
  balancedThought?: string;
  outcomeEmotion?: IThoughtEmotion;
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  isEmotionalEating?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// CBT Exercise types
export type CBTExerciseType =
  | "thought_record" // Standard CBT thought record
  | "behavioral_activation" // Activity scheduling
  | "mindful_eating" // Eating awareness
  | "gratitude" // Gratitude journaling
  | "progressive_relaxation" // Muscle relaxation
  | "breathing" // Breathing exercises
  | "cognitive_restructuring" // Challenging thoughts
  | "urge_surfing" // Managing cravings
  | "self_compassion" // Self-kindness exercises
  | "body_scan"; // Body awareness

export type CBTExerciseCategory = "mood" | "eating" | "stress" | "general";
export type CBTExerciseDifficulty = "beginner" | "intermediate" | "advanced";

export interface ICBTExercise {
  id: string;
  type: CBTExerciseType;
  title: string;
  description: string;
  duration: number; // in minutes
  difficulty: CBTExerciseDifficulty;
  category: CBTExerciseCategory;
  instructions: string[];
  benefits: string[];
  icon: string;
}

export interface ICBTExerciseCompletion {
  _id?: string;
  userId: string;
  exerciseId: string;
  exerciseType: CBTExerciseType;
  date: string;
  duration: number; // actual time spent in minutes
  responses?: Record<string, any>; // Exercise-specific responses
  reflection?: string;
  moodBefore?: MoodLevel;
  moodAfter?: MoodLevel;
  linkedMealId?: string;
  createdAt?: string;
}

// Meal-Mood correlation types
export interface IMealMoodCorrelation {
  _id?: string;
  userId: string;
  mealId: string;
  mealName: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  date: string;
  moodBefore?: IMoodEntry;
  moodAfter?: IMoodEntry;
  wasEmotionalEating: boolean;
  hungerLevelBefore?: MoodLevel; // 1=not hungry, 5=very hungry
  satisfactionAfter?: MoodLevel;
  notes?: string;
  createdAt?: string;
}

export interface IEmotionalEatingInsight {
  period: { start: string; end: string };
  totalMeals: number;
  emotionalEatingInstances: number;
  emotionalEatingPercentage: number;
  commonTriggers: { trigger: string; count: number }[];
  commonEmotions: { emotion: string; count: number }[];
  mealTypeBreakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacks: number;
  };
  recommendations: string[];
}

// CBT Engagement Stats (extends main engagement)
export interface ICBTEngagementStats {
  moodEntriesLogged: number;
  thoughtEntriesLogged: number;
  exercisesCompleted: number;
  moodCheckStreak: number;
  cbtActivityStreak: number;
  emotionalEatingAwareness: number; // 0-100 score
  mealMoodCorrelationsLogged: number;
}

// CBT Notification types
export type CBTNotificationType =
  | "mood_checkin"
  | "thought_prompt"
  | "exercise_reminder"
  | "emotional_eating_alert"
  | "cbt_streak_warning";

export type CBTMoodCheckInFrequency =
  | "after_meals"
  | "3_times_daily"
  | "morning_evening";

export type CBTThoughtPromptFrequency =
  | "daily"
  | "when_stressed"
  | "after_emotional_eating";

export type CBTExerciseReminderFrequency = "daily" | "weekly" | "when_stressed";

export interface ICBTNotificationPreferences {
  enabled: boolean;
  moodCheckIn: {
    enabled: boolean;
    frequency: CBTMoodCheckInFrequency;
    times?: string[]; // Specific times if 3_times_daily
  };
  thoughtPrompt: {
    enabled: boolean;
    frequency: CBTThoughtPromptFrequency;
    time?: string;
  };
  exerciseReminder: {
    enabled: boolean;
    frequency: CBTExerciseReminderFrequency;
    preferredTime?: string;
  };
}

// CBT Points system constants
export const CBT_POINTS = {
  MOOD_LOG: 5,
  DETAILED_MOOD_LOG: 10,
  THOUGHT_ENTRY: 15,
  COMPLETE_THOUGHT_RECORD: 25,
  EXERCISE_COMPLETE: 20,
  MEAL_MOOD_LINK: 10,
  EMOTIONAL_EATING_AWARENESS: 15,
  BALANCED_THOUGHT: 20,
} as const;

// CBT Badge definitions
export type CBTBadgeCategory =
  | "cbt"
  | "mindfulness"
  | "emotional_awareness";

export interface ICBTBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: CBTBadgeCategory;
  requirement: {
    type: "mood_entries" | "thought_entries" | "exercises" | "meal_mood_links" | "cbt_streak";
    count: number;
  };
}
