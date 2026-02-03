export type SubscriptionTier = "free" | "plus" | "premium";

export type FeatureKey =
  | "starInspiredPlanLimited"
  | "mealsPerWeekBasic"
  | "streakCounter"
  | "allStarInspiredPlans"
  | "fullWeeklyPlanning"
  | "groceryList"
  | "streakContinuation"
  | "blendedPlans"
  | "personalizedPortions"
  | "weeklyInsights";

export interface TierDefinition {
  id: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
}

export const TIERS: TierDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "1 Star-Inspired Plan (limited)",
      "3\u20135 meals/week",
      "Streak counter (visible \uD83D\uDD25)",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 9.99,
    features: [
      "All Star-Inspired Plans",
      "Full weekly planning",
      "Grocery list",
      "Streak continuation",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 14.99,
    features: ["Blended plans", "Personalized portions", "Weekly insights"],
  },
];

const TIER_FEATURES: Record<FeatureKey, SubscriptionTier> = {
  starInspiredPlanLimited: "free",
  mealsPerWeekBasic: "free",
  streakCounter: "free",
  allStarInspiredPlans: "plus",
  fullWeeklyPlanning: "plus",
  groceryList: "plus",
  streakContinuation: "plus",
  blendedPlans: "premium",
  personalizedPortions: "premium",
  weeklyInsights: "premium",
};

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  premium: 2,
};

/**
 * Check if a user's subscription tier grants access to a feature.
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: FeatureKey
): boolean {
  const requiredTier = TIER_FEATURES[feature];
  return TIER_RANK[userTier] >= TIER_RANK[requiredTier];
}

/**
 * Get the minimum tier required for a given feature.
 */
export function getRequiredTier(feature: FeatureKey): SubscriptionTier {
  return TIER_FEATURES[feature];
}

/**
 * Feature descriptions for upgrade prompts
 */
export const FEATURE_DESCRIPTIONS: Record<FeatureKey, string> = {
  starInspiredPlanLimited: "Access limited star-inspired meal plans",
  mealsPerWeekBasic: "Plan 3-5 meals per week",
  streakCounter: "Track your meal logging streak",
  allStarInspiredPlans: "Access all star-inspired meal plans",
  fullWeeklyPlanning: "Plan your entire week of meals",
  groceryList: "Generate smart grocery lists from your meal plan",
  streakContinuation: "Use streak freeze to maintain your streak",
  blendedPlans: "Create custom blended meal plans",
  personalizedPortions: "Get personalized portion recommendations",
  weeklyInsights: "Receive detailed weekly nutrition insights",
};

/**
 * Check if user is in development or admin mode (everything unlocked)
 */
export function isDevOrAdmin(): boolean {
  // Check if in development mode
  const isDev =
    import.meta.env.MODE === "development" ||
    import.meta.env.VITE_MODE === "development";

  // Check if test frontend mode is enabled
  const isTestMode = import.meta.env.VITE_TEST_FRONTEND === "true";

  // Check if admin flag is set (you can add admin check from user object here)
  // const isAdmin = user?.role === "admin"; // Add this when you have admin role

  return isDev || isTestMode;
}

/**
 * Check if user has access to a feature, considering dev/admin bypass
 */
export function hasFeatureAccessWithBypass(
  userTier: SubscriptionTier,
  feature: FeatureKey
): boolean {
  // Dev/Admin bypass - everything is unlocked
  if (isDevOrAdmin()) {
    return true;
  }

  // Normal feature access check
  return hasFeatureAccess(userTier, feature);
}

/**
 * Get count of plans user has generated
 * This should be called with actual plan count from backend
 */
export function canGenerateNewPlan(
  userTier: SubscriptionTier,
  currentPlanCount: number
): { canGenerate: boolean; reason?: string; requiresUpgrade: boolean } {
  // Dev/Admin bypass
  if (isDevOrAdmin()) {
    return { canGenerate: true, requiresUpgrade: false };
  }

  // Free users can only have 1 plan
  if (userTier === "free" && currentPlanCount >= 1) {
    return {
      canGenerate: false,
      reason:
        "Free users can only have 1 active plan. Upgrade to Plus for unlimited plans.",
      requiresUpgrade: true,
    };
  }

  // Plus and Premium users have unlimited plans
  return { canGenerate: true, requiresUpgrade: false };
}

/**
 * Check if user should see upgrade prompt after 5-day streak
 */
export function shouldShowStreakUpgradePrompt(
  userTier: SubscriptionTier,
  currentStreak: number,
  hasSeenStreakPrompt: boolean
): boolean {
  // Dev/Admin bypass
  if (isDevOrAdmin()) {
    return false;
  }

  // Only show for free users
  if (userTier !== "free") {
    return false;
  }

  // Show if streak is 5 or more and hasn't been seen
  return currentStreak >= 5 && !hasSeenStreakPrompt;
}
