import { useState } from "react";
import { Heart, ChevronDown, Utensils, ArrowRight, Check } from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, IMealMoodCorrelation, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MealMoodLinkProps {
  mealId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  mealName: string;
  isCompleted: boolean;
  className?: string;
  onMoodLinked?: (correlation: IMealMoodCorrelation) => void;
}

const QUICK_MOODS: { value: MoodCategory; label: string; emoji: string }[] = [
  { value: "happy", label: "Happy", emoji: "😊" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "stressed", label: "Stressed", emoji: "😰" },
  { value: "sad", label: "Sad", emoji: "😢" },
];

const HUNGER_LEVELS = [
  { value: 1, label: "Not hungry" },
  { value: 2, label: "Slightly hungry" },
  { value: 3, label: "Moderately hungry" },
  { value: 4, label: "Very hungry" },
  { value: 5, label: "Extremely hungry" },
];

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
      <div className={cn("p-3 rounded-lg bg-green-50 border border-green-200", className)}>
        <div className="flex items-center gap-2 text-green-600">
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
                      <span className="text-xl">{mood.emoji}</span>
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
                      <span className="text-xl">{mood.emoji}</span>
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
