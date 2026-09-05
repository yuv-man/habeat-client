/**
 * How much cooking the user is up for.
 *
 * Collected in onboarding and editable in the profile. The server turns it
 * into a prep-time ceiling and a technique instruction for the meal generator
 * (see habeat-server/src/constants/cookingLevel.ts) — a plan full of dishes
 * the user won't make is a plan they don't follow.
 *
 * Labels live in the i18n bundles, keyed by id, so the copy can be translated:
 * `onboarding:cooking.levels.<id>` and `settings:cookingLevel.levels.<id>`.
 */
export type CookingLevel = "beginner" | "home-cook" | "confident";

export interface CookingLevelOption {
  id: CookingLevel;
  emoji: string;
  /** Ceiling the server applies, shown to the user so the choice is concrete. */
  maxPrepMinutes: number;
}

export const COOKING_LEVEL_OPTIONS: CookingLevelOption[] = [
  { id: "beginner", emoji: "🥣", maxPrepMinutes: 20 },
  { id: "home-cook", emoji: "🍳", maxPrepMinutes: 40 },
  { id: "confident", emoji: "👨‍🍳", maxPrepMinutes: 75 },
];

export const isCookingLevel = (value: unknown): value is CookingLevel =>
  COOKING_LEVEL_OPTIONS.some((option) => option.id === value);
