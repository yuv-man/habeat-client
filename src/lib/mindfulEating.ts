import { MoodCategory, MoodLevel } from "@/types/interfaces";
import { WatchSnapshot } from "@/services/watch/types";

/**
 * The client-side read on whether an eating episode looks emotionally driven.
 *
 * This used to live inside MealMoodLink — a component that was exported but
 * never rendered anywhere, which meant the scoring, the nudge copy and the
 * hunger question it depended on were all unreachable code. Moving it here lets
 * every path that asks about a meal use the same arithmetic.
 *
 * It is a heuristic for deciding whether to *offer a pause*, and nothing more.
 * The server computes the score the user actually sees.
 */

const EMOTIONAL_CATEGORIES: MoodCategory[] = [
  "stressed",
  "anxious",
  "sad",
  "angry",
];

/** The hour after which a snack starts carrying its own signal. */
export const LATE_NIGHT_HOUR = 21;

/** Above this, the app offers a pause. Set so that low hunger alone (0.40)
 *  isn't enough — it takes hunger plus a mood, or hunger plus the body's own
 *  evidence, before we interrupt anyone. */
export const NUDGE_THRESHOLD = 0.6;

export function calcEmotionalEatingScore(
  moodCategory: MoodCategory | null,
  hungerLevel: MoodLevel | null,
  mealType: string,
  snapshot: WatchSnapshot | null = null,
  now: Date = new Date()
): number {
  let score = 0;

  if (hungerLevel === 1) score += 0.4;
  else if (hungerLevel === 2) score += 0.25;
  else if (hungerLevel === 3) score += 0.1;

  const cat = moodCategory ?? ("" as MoodCategory);
  if (EMOTIONAL_CATEGORIES.includes(cat)) score += 0.25;
  else if (cat === "tired") score += 0.15;

  if (mealType === "snacks" && now.getHours() >= LATE_NIGHT_HOUR) score += 0.1;

  if (snapshot) {
    if (snapshot.stressLevel === "high") score += 0.2;
    else if (snapshot.stressLevel === "moderate") score += 0.1;

    if (snapshot.heartRate !== undefined) {
      const elevated =
        snapshot.heartRate > 100 ||
        (snapshot.restingHeartRate !== undefined &&
          snapshot.heartRate > snapshot.restingHeartRate * 1.15);
      if (elevated) score += 0.1;
    }

    if (snapshot.sleepQuality === "poor") score += 0.1;
    else if (snapshot.sleepQuality === "fair") score += 0.05;

    if (snapshot.stepCount !== undefined && snapshot.stepCount < 3000)
      score += 0.05;
  }

  return Math.min(1.0, score);
}

/** Whether the app should offer a pause before this meal. */
export function shouldNudge(
  moodCategory: MoodCategory | null,
  hungerLevel: MoodLevel | null,
  mealType: string,
  snapshot: WatchSnapshot | null = null,
  now: Date = new Date()
): boolean {
  // Nothing answered yet is not the same as answered-and-fine.
  if (moodCategory === null && hungerLevel === null) return false;
  return (
    calcEmotionalEatingScore(moodCategory, hungerLevel, mealType, snapshot, now) >
    NUDGE_THRESHOLD
  );
}

export function getNudgeMessage(
  moodCategory: MoodCategory | null,
  hungerLevel: MoodLevel | null,
  mealType: string,
  now: Date = new Date()
): string {
  const isLowHunger = (hungerLevel ?? 5) <= 2;
  const cat = moodCategory ?? "";
  const hour = now.getHours();

  if (isLowHunger && (cat === "stressed" || cat === "anxious")) {
    return `Feeling ${cat} with low hunger? Sometimes our body asks for comfort through food. A few deep breaths can help you check in with what you really need.`;
  }
  if (mealType === "snacks" && hour >= LATE_NIGHT_HOUR) {
    // Reached whether or not the user named tiredness — the hour is doing the
    // work here, and the previous version only spoke up when "tired" happened
    // to be the selected mood, which is the least likely thing to get tapped
    // at 11pm.
    return cat === "tired"
      ? "Late-night snacking is super common, especially when tired. No judgment — just a moment to pause and see how you're feeling."
      : "Evening eating often runs on something other than hunger — the hour, the quiet, the end of a long day. Worth thirty seconds to notice which one this is.";
  }
  if (cat === "sad" || cat === "anxious") {
    return "Emotions and appetite are closely linked. Taking 30 seconds before eating can help you enjoy it more mindfully.";
  }
  return "Your hunger seems low right now. Checking in with yourself before eating can help you enjoy your meal more mindfully.";
}
