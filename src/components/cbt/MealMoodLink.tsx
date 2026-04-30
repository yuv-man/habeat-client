import { useState } from "react";
import { Heart, ChevronDown, Utensils, ArrowRight, Check, Leaf } from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, IMealMoodCorrelation, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MOOD_IMAGES } from "./MoodTracker";

interface MealMoodLinkProps {
  mealId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  mealName: string;
  isCompleted: boolean;
  className?: string;
  onMoodLinked?: (correlation: IMealMoodCorrelation) => void;
}

const QUICK_MOODS: { value: MoodCategory; label: string }[] = [
  { value: "happy", label: "Happy" },
  { value: "calm", label: "Calm" },
  { value: "neutral", label: "Neutral" },
  { value: "stressed", label: "Stressed" },
  { value: "sad", label: "Sad" },
];

const HUNGER_LEVELS = [
  { value: 1, label: "Not hungry" },
  { value: 2, label: "Slightly hungry" },
  { value: 3, label: "Moderately hungry" },
  { value: 4, label: "Very hungry" },
  { value: 5, label: "Extremely hungry" },
];

const EMOTIONAL_CATEGORIES = ["stressed", "anxious", "sad", "angry"];

function calcClientScore(
  moodCategory: MoodCategory | null,
  hungerLevel: MoodLevel | null,
  mealType: string
): number {
  let score = 0;
  if (hungerLevel === 1) score += 0.40;
  else if (hungerLevel === 2) score += 0.25;
  else if (hungerLevel === 3) score += 0.10;

  const cat = moodCategory ?? "";
  if (EMOTIONAL_CATEGORIES.includes(cat)) score += 0.25;
  else if (cat === "tired") score += 0.15;

  const hour = new Date().getHours();
  if (mealType === "snacks" && hour >= 21) score += 0.10;

  return Math.min(1.0, score);
}

function getNudgeMessage(
  moodCategory: MoodCategory | null,
  hungerLevel: MoodLevel | null,
  mealType: string
): string {
  const isLowHunger = (hungerLevel ?? 5) <= 2;
  const cat = moodCategory ?? "";
  const hour = new Date().getHours();

  if (isLowHunger && (cat === "stressed" || cat === "anxious")) {
    return `Feeling ${cat} with low hunger? Sometimes our body asks for comfort through food. A few deep breaths can help you check in with what you really need.`;
  }
  if (mealType === "snacks" && hour >= 21 && cat === "tired") {
    return "Late-night snacking is super common, especially when tired. No judgment — just a moment to pause and see how you're feeling.";
  }
  if (cat === "sad" || cat === "anxious") {
    return "Emotions and appetite are closely linked. Taking 30 seconds before eating can help you enjoy it more mindfully.";
  }
  return "Your hunger seems low right now. Checking in with yourself before eating can help you enjoy your meal more mindfully.";
}

export function MealMoodLink({
  mealId,
  mealType,
  mealName,
  isCompleted,
  className,
  onMoodLinked,
}: MealMoodLinkProps) {
  const { linkMoodToMeal, loading } = useCBTStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [phase, setPhase] = useState<"before" | "after">("before");
  const [moodBefore, setMoodBefore] = useState<MoodCategory | null>(null);
  const [hungerLevel, setHungerLevel] = useState<MoodLevel | null>(null);
  const [moodAfter, setMoodAfter] = useState<MoodCategory | null>(null);
  const [satisfaction, setSatisfaction] = useState<MoodLevel | null>(null);
  const [isEmotionalEating, setIsEmotionalEating] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const showNudge =
    !nudgeDismissed &&
    phase === "before" &&
    (moodBefore !== null || hungerLevel !== null) &&
    calcClientScore(moodBefore, hungerLevel, mealType) > 0.6;

  const handleLink = async () => {
    const now = new Date();
    const moodEntryBefore: Omit<IMoodEntry, "_id" | "userId" | "createdAt" | "updatedAt"> | undefined =
      moodBefore
        ? {
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().split(" ")[0].slice(0, 5),
            moodLevel: 3,
            moodCategory: moodBefore,
            linkedMealId: mealId,
            linkedMealType: mealType,
          }
        : undefined;

    const moodEntryAfter: Omit<IMoodEntry, "_id" | "userId" | "createdAt" | "updatedAt"> | undefined =
      moodAfter
        ? {
            date: now.toISOString().split("T")[0],
            time: now.toTimeString().split(" ")[0].slice(0, 5),
            moodLevel: 3,
            moodCategory: moodAfter,
            linkedMealId: mealId,
            linkedMealType: mealType,
          }
        : undefined;

    const correlation = {
      mealId,
      mealName,
      mealType,
      date: now.toISOString().split("T")[0],
      moodBefore: moodEntryBefore as IMoodEntry | undefined,
      moodAfter: moodEntryAfter as IMoodEntry | undefined,
      wasEmotionalEating: isEmotionalEating,
      hungerLevelBefore: hungerLevel || undefined,
      satisfactionAfter: satisfaction || undefined,
    };

    await linkMoodToMeal(correlation);
    setIsLinked(true);
    onMoodLinked?.(correlation as IMealMoodCorrelation);
  };

  if (isLinked) {
    return (
      <div className={cn("p-3 rounded-lg bg-green-500 border border-green-600", className)}>
        <div className="flex items-center gap-2 text-white">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Mood linked to {mealName}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-gray-200 bg-white overflow-hidden", className)}>
      {/* Header - toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">
            Link mood to {mealName}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-4 border-t border-gray-100 animate-in slide-in-from-top-2">
          {/* Phase selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setPhase("before")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                phase === "before"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Before eating
            </button>
            <button
              onClick={() => setPhase("after")}
              className={cn(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                phase === "after"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              After eating
            </button>
          </div>

          {phase === "before" ? (
            <div className="space-y-4">
              {/* Mood before */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">
                  How are you feeling?
                </label>
                <div className="flex gap-2">
                  {QUICK_MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setMoodBefore(mood.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border transition-all",
                        moodBefore === mood.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <img
                        src={MOOD_IMAGES[mood.value]}
                        alt={mood.label}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-xs text-gray-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hunger level */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">
                  Hunger level
                </label>
                <div className="flex gap-1">
                  {HUNGER_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setHungerLevel(level.value as MoodLevel)}
                      title={level.label}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        hungerLevel === level.value
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {level.value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mindfulness nudge */}
              {showNudge && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <Leaf className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-purple-700 leading-relaxed">
                      {getNudgeMessage(moodBefore, hungerLevel, mealType)}
                    </p>
                  </div>
                  <button
                    onClick={() => setNudgeDismissed(true)}
                    className="text-xs text-purple-400 hover:text-purple-600 flex-shrink-0 mt-0.5"
                  >
                    Got it
                  </button>
                </div>
              )}

              {/* Emotional eating check */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmotionalEating}
                  onChange={(e) => setIsEmotionalEating(e.target.checked)}
                  className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">
                  I'm eating because of emotions, not hunger
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mood after */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">
                  How do you feel now?
                </label>
                <div className="flex gap-2">
                  {QUICK_MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setMoodAfter(mood.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border transition-all",
                        moodAfter === mood.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <img
                        src={MOOD_IMAGES[mood.value]}
                        alt={mood.label}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-xs text-gray-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Satisfaction level */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-2 block">
                  Satisfaction level
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSatisfaction(level as MoodLevel)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
                        satisfaction === level
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <Button
            onClick={handleLink}
            disabled={loading || (!moodBefore && !moodAfter)}
            className="w-full"
            size="sm"
          >
            {loading ? "Saving..." : "Save Mood Link"}
          </Button>
        </div>
      )}
    </div>
  );
}
