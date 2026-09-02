import { useState } from "react";
import {
  Briefcase,
  Users,
  Activity,
  DollarSign,
  Bed,
  Utensils,
  Dumbbell,
  Cloud,
  MessageCircle,
  MoreHorizontal,
  X,
} from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, MoodTrigger, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWatchStore } from "@/stores/watchStore";
import { toLocalDateString } from "@/lib/dateUtils";
import { calcEmotionalEatingScore, NUDGE_THRESHOLD } from "@/lib/mindfulEating";

interface MoodEntryFormProps {
  className?: string;
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  /** Needed to file a meal-mood correlation alongside the mood entry. Without
   *  it the form can still log the mood, just not the eating episode. */
  linkedMealName?: string;
  onComplete?: (entry: IMoodEntry) => void;
  onCancel?: () => void;
}

const HUNGER_LABELS = [
  "Not hungry",
  "Slightly hungry",
  "Moderately hungry",
  "Very hungry",
  "Extremely hungry",
];

const MOOD_OPTIONS: { value: MoodCategory; label: string; emoji: string; color: string }[] = [
  { value: "happy",    label: "Happy",    emoji: "😄", color: "bg-yellow-50 border-yellow-200" },
  { value: "calm",     label: "Calm",     emoji: "😌", color: "bg-blue-50 border-blue-200" },
  { value: "energetic",label: "Energetic",emoji: "😁", color: "bg-orange-50 border-orange-200" },
  { value: "neutral",  label: "Neutral",  emoji: "😐", color: "bg-gray-50 border-gray-200" },
  { value: "tired",    label: "Tired",    emoji: "😴", color: "bg-indigo-50 border-indigo-200" },
  { value: "stressed", label: "Stressed", emoji: "😤", color: "bg-red-50 border-red-200" },
  { value: "anxious",  label: "Anxious",  emoji: "😰", color: "bg-purple-50 border-purple-200" },
  { value: "sad",      label: "Sad",      emoji: "😢", color: "bg-cyan-50 border-cyan-200" },
  { value: "angry",    label: "Angry",    emoji: "😡", color: "bg-rose-50 border-rose-200" },
];

const TRIGGER_OPTIONS: { value: MoodTrigger; label: string; icon: React.ReactNode }[] = [
  { value: "work", label: "Work", icon: <Briefcase className="w-4 h-4" /> },
  { value: "relationships", label: "Relationships", icon: <Users className="w-4 h-4" /> },
  { value: "health", label: "Health", icon: <Activity className="w-4 h-4" /> },
  { value: "finances", label: "Finances", icon: <DollarSign className="w-4 h-4" /> },
  { value: "sleep", label: "Sleep", icon: <Bed className="w-4 h-4" /> },
  { value: "food", label: "Food", icon: <Utensils className="w-4 h-4" /> },
  { value: "exercise", label: "Exercise", icon: <Dumbbell className="w-4 h-4" /> },
  { value: "weather", label: "Weather", icon: <Cloud className="w-4 h-4" /> },
  { value: "social", label: "Social", icon: <MessageCircle className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <MoreHorizontal className="w-4 h-4" /> },
];

export function MoodEntryForm({
  className,
  linkedMealId,
  linkedMealType,
  linkedMealName,
  onComplete,
  onCancel,
}: MoodEntryFormProps) {
  const { logMood, linkMoodToMeal, loading } = useCBTStore();
  const watchSnapshot = useWatchStore((s) => s.snapshot);
  const [step, setStep] = useState(1);
  const [moodCategory, setMoodCategory] = useState<MoodCategory | null>(null);
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [energyLevel, setEnergyLevel] = useState<MoodLevel>(3);
  const [stressLevel, setStressLevel] = useState<MoodLevel>(3);
  const [triggers, setTriggers] = useState<MoodTrigger[]>([]);
  const [notes, setNotes] = useState("");
  /** Asked only when a meal is attached. The insights screen tells users their
   *  Mindful Eating Score weighs "hunger level before eating" — but nothing in
   *  the live UI ever asked, so the heaviest input to that score was always
   *  absent on this path. */
  const [hungerLevel, setHungerLevel] = useState<MoodLevel | null>(null);
  const isMealLinked = Boolean(linkedMealId);

  const toggleTrigger = (trigger: MoodTrigger) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const emotionalScore = calcEmotionalEatingScore(
    moodCategory,
    hungerLevel,
    linkedMealType ?? "",
    watchSnapshot
  );

  const handleSubmit = async () => {
    if (!moodCategory) return;

    const now = new Date();
    // Local rather than UTC — an evening check-in west of Greenwich was landing
    // on tomorrow's date, which quietly emptied the day it belonged to.
    const today = toLocalDateString(now);

    const entry = {
      date: today,
      time: now.toTimeString().split(" ")[0].slice(0, 5),
      moodLevel,
      moodCategory,
      energyLevel,
      stressLevel,
      triggers: triggers.length > 0 ? triggers : undefined,
      notes: notes.trim() || undefined,
      linkedMealId,
      linkedMealType,
    };

    const result = await logMood(entry);

    // A mood attached to a meal is an eating episode, and only a correlation
    // record carries it into the emotional-eating insights. Logging the mood
    // alone left that half of the picture blank.
    if (result && linkedMealId && linkedMealType) {
      linkMoodToMeal({
        mealId: linkedMealId,
        mealName: linkedMealName ?? linkedMealType,
        mealType: linkedMealType,
        date: today,
        wasEmotionalEating: emotionalScore > NUDGE_THRESHOLD,
        hungerLevelBefore: hungerLevel ?? undefined,
        moodBefore: result,
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
      }).catch(() => {
        // The mood itself is already saved; failing to also file the
        // correlation isn't worth blocking the modal from closing.
      });
    }

    if (result) {
      onComplete?.(result);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">How are you feeling?</h3>
      <div className="grid grid-cols-3 gap-2">
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.value}
            onClick={() => {
              setMoodCategory(mood.value);
              setStep(2);
            }}
            className={cn(
              "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all hover:scale-105",
              mood.color,
              moodCategory === mood.value && "ring-2 ring-offset-1 ring-emerald-500"
            )}
          >
            <span className="text-3xl leading-none">{mood.emoji}</span>
            <span className="text-xs font-medium text-gray-700">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-800">Rate your levels</h3>

      {/* Mood Intensity */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Mood Intensity</label>
        <div className="flex justify-between gap-2">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setMoodLevel(level)}
              className={cn(
                "flex-1 py-2 rounded-lg border transition-all text-sm font-medium",
                moodLevel === level
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Energy Level */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Energy Level</label>
        <div className="flex justify-between gap-2">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setEnergyLevel(level)}
              className={cn(
                "flex-1 py-2 rounded-lg border transition-all text-sm font-medium",
                energyLevel === level
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Stress Level */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Stress Level</label>
        <div className="flex justify-between gap-2">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setStressLevel(level)}
              className={cn(
                "flex-1 py-2 rounded-lg border transition-all text-sm font-medium",
                stressLevel === level
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Hunger — only when there's a meal to attach it to. Asking a plain
          mood check-in how hungry it is would be a non-sequitur. */}
      {isMealLinked && (
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">
            How hungry are you?{" "}
            <span className="font-normal text-gray-400">— optional</span>
          </label>
          <div className="flex justify-between gap-2">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <button
                key={level}
                onClick={() =>
                  setHungerLevel(hungerLevel === level ? null : level)
                }
                title={HUNGER_LABELS[level - 1]}
                aria-label={HUNGER_LABELS[level - 1]}
                className={cn(
                  "flex-1 py-2 rounded-lg border transition-all text-sm font-medium",
                  hungerLevel === level
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                )}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">
            {hungerLevel
              ? HUNGER_LABELS[hungerLevel - 1]
              : "1 = not hungry · 5 = extremely hungry"}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1 bg-blue-500 text-white  hover:bg-blue-600 hover:text-white">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">What's affecting your mood?</h3>

      <p className="text-sm text-gray-500">Select any triggers (optional)</p>
      <div className="flex flex-wrap gap-2">
        {TRIGGER_OPTIONS.map((trigger) => (
          <button
            key={trigger.value}
            onClick={() => toggleTrigger(trigger.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm",
              triggers.includes(trigger.value)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            )}
          >
            {trigger.icon}
            {trigger.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">Notes (optional)</label>
        <Textarea
          placeholder="Any thoughts you'd like to capture..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={loading} className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white">
          {loading ? "Saving..." : "Log Mood"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-gray-200 shadow-sm relative", className)}>
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Progress indicator */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              s <= step ? "bg-blue-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
