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
  | "weeklyInsights"
  | "photoRecognition"
  | "aiMealSuggestions";

export const AI_MEAL_SUGGESTION_COUNT = 3;

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
      "AI meal suggestions (3 per request)",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 14.99,
    features: [
      "Blended plans",
      "Personalized portions",
      "Weekly insights",
      "Photo meal recognition",
    ],
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
  photoRecognition: "premium",
  aiMealSuggestions: "plus",
};

const TIER_RANK: Record<SubscriptionTier, number> = {
  free: 0,
  plus: 1,
  premium: 2,
};

export function isAdminUser(
  user?: { role?: string } | null
): boolean {
  return user?.role === "admin";
}

/**
 * Admins receive premium-tier access for all feature checks.
 */
export function getEffectiveTier(
  user?: { subscriptionTier?: SubscriptionTier; role?: string } | null
): SubscriptionTier {
  if (isAdminUser(user)) {
    return "premium";
  }
  return user?.subscriptionTier || "free";
}

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
  photoRecognition: "Recognize meals from photos with AI",
  aiMealSuggestions:
    "Get up to 3 AI-powered meal suggestions when swapping meals",
};

/** @deprecated Use hasFeatureAccessForUser from subscriptionAccess.ts */
export function hasFeatureAccessWithBypass(
  userTier: SubscriptionTier,
  feature: FeatureKey,
  user?: { role?: string } | null
): boolean {
  if (isAdminUser(user)) {
    return true;
  }
  return hasFeatureAccess(userTier, feature);
}

/** @deprecated Use canGenerateNewPlanForUser from subscriptionAccess.ts */
export function canGenerateNewPlan(
  userTier: SubscriptionTier,
  currentPlanCount: number,
  user?: { role?: string } | null
): { canGenerate: boolean; reason?: string; requiresUpgrade: boolean } {
  if (isAdminUser(user)) {
    return { canGenerate: true, requiresUpgrade: false };
  }

  if (userTier === "free" && currentPlanCount >= 1) {
    return {
      canGenerate: false,
      reason:
        "Free users can only have 1 active plan. Upgrade to Plus for unlimited plans.",
      requiresUpgrade: true,
    };
  }

  return { canGenerate: true, requiresUpgrade: false };
}

/** @deprecated Use shouldShowStreakUpgradePromptForUser from subscriptionAccess.ts */
export function shouldShowStreakUpgradePrompt(
  userTier: SubscriptionTier,
  currentStreak: number,
  hasSeenStreakPrompt: boolean,
  user?: { role?: string } | null
): boolean {
  if (isAdminUser(user) || userTier !== "free") {
    return false;
  }
  return currentStreak >= 5 && !hasSeenStreakPrompt;
}
