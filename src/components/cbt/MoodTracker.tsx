import { useState } from "react";
import { Smile, Frown, Meh, Zap, Moon, Heart, AlertCircle, Flame } from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MoodTrackerProps {
  className?: string;
  compact?: boolean;
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  onMoodLogged?: (entry: IMoodEntry) => void;
}

const MOOD_OPTIONS: { value: MoodCategory; label: string; icon: React.ReactNode; color: string }[] = [
  { value: "happy", label: "Happy", icon: <Smile className="w-6 h-6" />, color: "text-yellow-500 bg-yellow-50 border-yellow-200 hover:bg-yellow-100" },
  { value: "calm", label: "Calm", icon: <Heart className="w-6 h-6" />, color: "text-blue-500 bg-blue-50 border-blue-200 hover:bg-blue-100" },
  { value: "energetic", label: "Energetic", icon: <Zap className="w-6 h-6" />, color: "text-orange-500 bg-orange-50 border-orange-200 hover:bg-orange-100" },
  { value: "neutral", label: "Neutral", icon: <Meh className="w-6 h-6" />, color: "text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100" },
  { value: "tired", label: "Tired", icon: <Moon className="w-6 h-6" />, color: "text-indigo-500 bg-indigo-50 border-indigo-200 hover:bg-indigo-100" },
  { value: "stressed", label: "Stressed", icon: <Flame className="w-6 h-6" />, color: "text-red-500 bg-red-50 border-red-200 hover:bg-red-100" },
  { value: "anxious", label: "Anxious", icon: <AlertCircle className="w-6 h-6" />, color: "text-purple-500 bg-purple-50 border-purple-200 hover:bg-purple-100" },
  { value: "sad", label: "Sad", icon: <Frown className="w-6 h-6" />, color: "text-cyan-500 bg-cyan-50 border-cyan-200 hover:bg-cyan-100" },
];

const MOOD_LEVEL_OPTIONS: { value: MoodLevel; label: string; emoji: string }[] = [
  { value: 1, label: "Very Low", emoji: "1" },
  { value: 2, label: "Low", emoji: "2" },
  { value: 3, label: "Okay", emoji: "3" },
  { value: 4, label: "Good", emoji: "4" },
  { value: 5, label: "Great", emoji: "5" },
];

export function MoodTracker({
  className,
  compact = false,
  linkedMealId,
  linkedMealType,
  onMoodLogged,
}: MoodTrackerProps) {
  const { logMood, loading } = useCBTStore();
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<MoodLevel>(3);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) return;

    const now = new Date();
    const entry = {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].slice(0, 5),
      moodLevel: selectedLevel,
      moodCategory: selectedCategory,
      linkedMealId,
      linkedMealType,
    };

    const result = await logMood(entry);
    if (result) {
      setSubmitted(true);
      onMoodLogged?.(result);
      // Reset after a delay
      setTimeout(() => {
        setSelectedCategory(null);
        setSelectedLevel(3);
        setSubmitted(false);
      }, 2000);
    }
  };

  if (submitted) {
    return (
      <div className={cn("p-4 rounded-xl bg-green-50 border border-green-200", className)}>
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Smile className="w-5 h-5" />
          <span className="font-medium">Mood logged!</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("p-3 rounded-xl bg-white border border-gray-200 shadow-sm", className)}>
        <p className="text-xs text-gray-500 mb-2">How are you feeling?</p>
        <div className="flex flex-wrap gap-1.5">
          {MOOD_OPTIONS.slice(0, 5).map((mood) => (
            <button
              key={mood.value}
              onClick={() => {
                setSelectedCategory(mood.value);
                // Auto-submit in compact mode
                const now = new Date();
                logMood({
                  date: now.toISOString().split("T")[0],
                  time: now.toTimeString().split(" ")[0].slice(0, 5),
                  moodLevel: 3,
                  moodCategory: mood.value,
                  linkedMealId,
                  linkedMealType,
                }).then((result) => {
                  if (result) {
                    setSubmitted(true);
                    onMoodLogged?.(result);
                    setTimeout(() => setSubmitted(false), 2000);
                  }
                });
              }}
              disabled={loading}
              className={cn(
                "p-2 rounded-lg border transition-all",
                mood.color,
                selectedCategory === mood.value && "ring-2 ring-offset-1"
              )}
              title={mood.label}
            >
              {mood.icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-gray-200 shadow-sm", className)}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">How are you feeling?</h3>

      {/* Mood Category Selection */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">Select your mood</p>
        <div className="grid grid-cols-4 gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedCategory(mood.value)}
              disabled={loading}
              className={cn(
                "flex flex-col items-center gap-1 p-3 rounded-xl border transition-all",
                mood.color,
                selectedCategory === mood.value && "ring-2 ring-offset-1 ring-blue-500"
              )}
            >
              {mood.icon}
              <span className="text-xs font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Level Slider */}
      {selectedCategory && (
        <div className="mb-4 animate-in slide-in-from-top-2">
          <p className="text-sm text-gray-500 mb-2">Intensity (1-5)</p>
          <div className="flex justify-between gap-2">
            {MOOD_LEVEL_OPTIONS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={cn(
                  "flex-1 py-2 rounded-lg border transition-all text-sm font-medium",
                  selectedLevel === level.value
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                )}
              >
                {level.emoji}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
            <span>Very Low</span>
            <span>Great</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedCategory && (
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Logging..." : "Log Mood"}
        </Button>
      )}
    </div>
  );
}
