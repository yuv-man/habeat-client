import { useState } from "react";
import {
  Smile, Frown, Meh, Zap, Moon, Heart, AlertCircle, Flame,
  Briefcase, Users, Activity, DollarSign, Bed, Utensils, Dumbbell, Cloud, MessageCircle, MoreHorizontal,
  X,
} from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, MoodTrigger, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MoodEntryFormProps {
  className?: string;
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  onComplete?: (entry: IMoodEntry) => void;
  onCancel?: () => void;
}

const MOOD_OPTIONS: { value: MoodCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "happy", label: "Happy", icon: <Smile className="w-6 h-6" />, color: "text-yellow-500 bg-yellow-50 border-yellow-200" },
  { value: "calm", label: "Calm", icon: <Heart className="w-6 h-6" />, color: "text-blue-500 bg-blue-50 border-blue-200" },
  { value: "energetic", label: "Energetic", icon: <Zap className="w-6 h-6" />, color: "text-orange-500 bg-orange-50 border-orange-200" },
  { value: "neutral", label: "Neutral", icon: <Meh className="w-6 h-6" />, color: "text-gray-500 bg-gray-50 border-gray-200" },
  { value: "tired", label: "Tired", icon: <Moon className="w-6 h-6" />, color: "text-indigo-500 bg-indigo-50 border-indigo-200" },
  { value: "stressed", label: "Stressed", icon: <Flame className="w-6 h-6" />, color: "text-red-500 bg-red-50 border-red-200" },
  { value: "anxious", label: "Anxious", icon: <AlertCircle className="w-6 h-6" />, color: "text-purple-500 bg-purple-50 border-purple-200" },
  { value: "sad", label: "Sad", icon: <Frown className="w-6 h-6" />, color: "text-cyan-500 bg-cyan-50 border-cyan-200" },
  { value: "angry", label: "Angry", icon: <Flame className="w-6 h-6" />, color: "text-rose-500 bg-rose-50 border-rose-200" },
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
  onComplete,
  onCancel,
}: MoodEntryFormProps) {
  const { logMood, loading } = useCBTStore();
  const [step, setStep] = useState(1);
  const [moodCategory, setMoodCategory] = useState<MoodCategory | null>(null);
  const [moodLevel, setMoodLevel] = useState<MoodLevel>(3);
  const [energyLevel, setEnergyLevel] = useState<MoodLevel>(3);
  const [stressLevel, setStressLevel] = useState<MoodLevel>(3);
  const [triggers, setTriggers] = useState<MoodTrigger[]>([]);
  const [notes, setNotes] = useState("");

  const toggleTrigger = (trigger: MoodTrigger) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleSubmit = async () => {
    if (!moodCategory) return;

    const now = new Date();
    const entry = {
      date: now.toISOString().split("T")[0],
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
              moodCategory === mood.value && "ring-2 ring-offset-1 ring-blue-500"
            )}
          >
            {mood.icon}
            <span className="text-xs font-medium">{mood.label}</span>
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

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep(3)} className="flex-1">
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
        <Button onClick={handleSubmit} disabled={loading} className="flex-1">
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
