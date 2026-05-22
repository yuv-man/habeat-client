import type { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import type { IUser } from "@/types/interfaces";
import {
  type FeatureKey,
  type SubscriptionTier,
  FEATURE_DESCRIPTIONS,
  getRequiredTier,
  hasFeatureAccess,
  getEffectiveTier,
  isAdminUser,
  AI_MEAL_SUGGESTION_COUNT,
} from "@/lib/subscription";

export { isAdminUser, getEffectiveTier };

export function hasFeatureAccessForUser(
  user: Pick<IUser, "subscriptionTier" | "role"> | null | undefined,
  feature: FeatureKey
): boolean {
  if (!user) {
    return false;
  }
  return hasFeatureAccess(getEffectiveTier(user), feature);
}

export function isSubscriptionApiError(message: string): boolean {
  return /subscription|upgrade your plan|plan limit|limit reached|reached (?:your|the) .*limit|free users can only/i.test(message);
}

export function notifySubscriptionRequired(
  message: string,
  navigate: NavigateFunction
): void {
  toast.error(message, {
    action: {
      label: "View plans",
      onClick: () => navigate("/subscription"),
    },
  });
}

/**
 * Returns true when the user may proceed; otherwise shows upgrade toast and navigates.
 */
export function requireFeatureOrRedirect(
  user: Pick<IUser, "subscriptionTier" | "role"> | null | undefined,
  feature: FeatureKey,
  navigate: NavigateFunction,
  label?: string
): boolean {
  if (hasFeatureAccessForUser(user, feature)) {
    return true;
  }

  const tierName = getRequiredTier(feature);
  const message = label
    ? `${label} requires ${tierName === "premium" ? "Premium" : tierName === "plus" ? "Plus" : "a paid"} plan.`
    : FEATURE_DESCRIPTIONS[feature];

  notifySubscriptionRequired(message, navigate);
  return false;
}

export function handleSubscriptionApiError(
  error: unknown,
  navigate: NavigateFunction,
  fallbackMessage = "This feature requires a subscription."
): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? fallbackMessage);

  if (!isSubscriptionApiError(message)) {
    return false;
  }

  notifySubscriptionRequired(message, navigate);
  return true;
}

export function getAiMealSuggestionLimit(
  user: Pick<IUser, "subscriptionTier" | "role"> | null | undefined
): { max: number; allowed: boolean; message?: string } {
  if (!hasFeatureAccessForUser(user, "aiMealSuggestions")) {
    return {
      max: 0,
      allowed: false,
      message:
        "AI meal suggestions are available on Plus and Premium. Upgrade to get up to 3 suggestions per request.",
    };
  }

  return {
    max: AI_MEAL_SUGGESTION_COUNT,
    allowed: true,
    message: `Plus and Premium include up to ${AI_MEAL_SUGGESTION_COUNT} AI suggestions per request.`,
  };
}

export function canGenerateNewPlanForUser(
  user: Pick<IUser, "subscriptionTier" | "role"> | null | undefined,
  currentPlanCount: number
): { canGenerate: boolean; reason?: string; requiresUpgrade: boolean } {
  if (isAdminUser(user)) {
    return { canGenerate: true, requiresUpgrade: false };
  }

  const tier = getEffectiveTier(user);
  if (tier === "free" && currentPlanCount >= 1) {
    return {
      canGenerate: false,
      reason:
        "Free users can only have 1 active plan. Upgrade to Plus for unlimited plans.",
      requiresUpgrade: true,
    };
  }

  return { canGenerate: true, requiresUpgrade: false };
}

export function shouldShowStreakUpgradePromptForUser(
  user: Pick<IUser, "subscriptionTier" | "role"> | null | undefined,
  currentStreak: number,
  hasSeenStreakPrompt: boolean
): boolean {
  if (isAdminUser(user) || getEffectiveTier(user) !== "free") {
    return false;
  }
  return currentStreak >= 5 && !hasSeenStreakPrompt;
}
