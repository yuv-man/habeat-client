import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ChevronDown, Check, Leaf, Waves } from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, IMealMoodCorrelation, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MOOD_IMAGES } from "./MoodTracker";
import { useWatchStore } from "@/stores/watchStore";
import { toLocalDateString } from "@/lib/dateUtils";
import { getNudgeMessage, shouldNudge } from "@/lib/mindfulEating";

interface MealMoodLinkProps {
  mealId: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snacks";
  mealName: string;
  className?: string;
  /** Opens expanded. Used where the meal itself is the reason to check in —
   *  a snack logged at 11pm shouldn't need a second tap to ask about. */
  defaultExpanded?: boolean;
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

export function MealMoodLink({
  mealId,
  mealType,
  mealName,
  className,
  defaultExpanded = false,
  onMoodLinked,
}: MealMoodLinkProps) {
  const navigate = useNavigate();
  const { linkMoodToMeal, loading } = useCBTStore();
  const watchSnapshot = useWatchStore((s) => s.snapshot);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
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
    shouldNudge(moodBefore, hungerLevel, mealType, watchSnapshot);

  const handleLink = async () => {
    const now = new Date();
    // Local, not UTC. `toISOString()` rolls to the next day after 19:00 in
    // UTC-5 and after 16:00 in UTC-8, so the previous version filed exactly the
    // late-evening snacks this feature exists to notice under tomorrow's date.
    const today = toLocalDateString(now);

    const moodEntryBefore: Omit<IMoodEntry, "_id" | "userId" | "createdAt" | "updatedAt"> | undefined =
      moodBefore
        ? {
            date: today,
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
            date: today,
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
      date: today,
      moodBefore: moodEntryBefore as IMoodEntry | undefined,
      moodAfter: moodEntryAfter as IMoodEntry | undefined,
      wasEmotionalEating: isEmotionalEating,
      hungerLevelBefore: hungerLevel || undefined,
      satisfactionAfter: satisfaction || undefined,
      biometrics: watchSnapshot
        ? {
            heartRate: watchSnapshot.heartRate,
            restingHeartRate: watchSnapshot.restingHeartRate,
            stressLevel: watchSnapshot.stressLevel,
            sleepHours: watchSnapshot.sleepHours,
            sleepQuality: watchSnapshot.sleepQuality,
            stepCount: watchSnapshot.stepCount,
          }
        : undefined,
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
                      <span className="text-2xl leading-none">{MOOD_IMAGES[mood.value]}</span>
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
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-start gap-3">
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

                  {/* The app has an exercise built for precisely this moment —
                      it was previously only findable by browsing to it. */}
                  <button
                    onClick={() =>
                      navigate("/mindfulness?tab=exercises&exercise=urge-surfing")
                    }
                    className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-purple-200 text-xs font-semibold text-purple-700 hover:bg-purple-100/60 transition-colors"
                  >
                    <Waves className="w-3.5 h-3.5" />
                    Ride it out — 5 min
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
                      <span className="text-2xl leading-none">{MOOD_IMAGES[mood.value]}</span>
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
