import { useState, useRef } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useCBTStore, useTodayMoods } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import feeling type images
import happyImg from "@/assets/feelingsTypes/happy.webp";
import calmImg from "@/assets/feelingsTypes/calm.webp";
import energeticImg from "@/assets/feelingsTypes/energetic.webp";
import neutralImg from "@/assets/feelingsTypes/neutral.webp";
import tiredImg from "@/assets/feelingsTypes/tired.webp";
import stressedImg from "@/assets/feelingsTypes/stressed.webp";
import anxiousImg from "@/assets/feelingsTypes/anxious.webp";
import sadImg from "@/assets/feelingsTypes/sad.webp";

interface MoodTrackerProps {
  className?: string;
  compact?: boolean;
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  onMoodLogged?: (entry: IMoodEntry) => void;
}

// Minimum time between mood logs (in milliseconds) - 5 minutes
const MIN_TIME_BETWEEN_LOGS = 5 * 60 * 1000;

// Mood images map for easy access
export const MOOD_IMAGES: Record<MoodCategory, string> = {
  happy: happyImg,
  calm: calmImg,
  energetic: energeticImg,
  neutral: neutralImg,
  tired: tiredImg,
  stressed: stressedImg,
  anxious: anxiousImg,
  sad: sadImg,
  angry: stressedImg, // Using stressed image for angry as fallback
};

const MOOD_OPTIONS: { value: MoodCategory; label: string; image: string; color: string; bgColor: string }[] = [
  { value: "happy", label: "Happy", image: happyImg, color: "border-yellow-300", bgColor: "bg-yellow-50 hover:bg-yellow-100" },
  { value: "calm", label: "Calm", image: calmImg, color: "border-blue-300", bgColor: "bg-blue-50 hover:bg-blue-100" },
  { value: "energetic", label: "Energetic", image: energeticImg, color: "border-orange-300", bgColor: "bg-orange-50 hover:bg-orange-100" },
  { value: "neutral", label: "Neutral", image: neutralImg, color: "border-gray-300", bgColor: "bg-gray-50 hover:bg-gray-100" },
  { value: "tired", label: "Tired", image: tiredImg, color: "border-indigo-300", bgColor: "bg-indigo-50 hover:bg-indigo-100" },
  { value: "stressed", label: "Stressed", image: stressedImg, color: "border-red-300", bgColor: "bg-red-50 hover:bg-red-100" },
  { value: "anxious", label: "Anxious", image: anxiousImg, color: "border-purple-300", bgColor: "bg-purple-50 hover:bg-purple-100" },
  { value: "sad", label: "Sad", image: sadImg, color: "border-cyan-300", bgColor: "bg-cyan-50 hover:bg-cyan-100" },
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
  const { logMood, loading, fetchCBTStats } = useCBTStore();
  const todayMoods = useTodayMoods();
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<MoodLevel>(3);
  const [submitted, setSubmitted] = useState(false);
  const [showAllMoods, setShowAllMoods] = useState(false);
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);
  const lastLogTimeRef = useRef<number>(0);

  // Check if user can log a mood (prevent duplicates within 5 minutes)
  const canLogMood = () => {
    const now = Date.now();
    const lastMood = todayMoods[todayMoods.length - 1];

    if (lastMood) {
      const lastMoodTime = new Date(`${lastMood.date}T${lastMood.time}`).getTime();
      const timeSinceLastLog = now - lastMoodTime;

      if (timeSinceLastLog < MIN_TIME_BETWEEN_LOGS) {
        const remainingMinutes = Math.ceil((MIN_TIME_BETWEEN_LOGS - timeSinceLastLog) / 60000);
        return { canLog: false, message: `Wait ${remainingMinutes} min before logging again` };
      }
    }

    // Also check against our local tracking
    if (lastLogTimeRef.current && now - lastLogTimeRef.current < MIN_TIME_BETWEEN_LOGS) {
      const remainingMinutes = Math.ceil((MIN_TIME_BETWEEN_LOGS - (now - lastLogTimeRef.current)) / 60000);
      return { canLog: false, message: `Wait ${remainingMinutes} min before logging again` };
    }

    return { canLog: true, message: null };
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;

    const { canLog, message } = canLogMood();
    if (!canLog) {
      setCooldownMessage(message);
      setTimeout(() => setCooldownMessage(null), 3000);
      return;
    }

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
      lastLogTimeRef.current = Date.now();
      setSubmitted(true);
      onMoodLogged?.(result);

      // Show toast notification
      const moodOption = MOOD_OPTIONS.find(m => m.value === selectedCategory);
      toast.success(`Mood logged: ${moodOption?.label || selectedCategory}`, {
        description: `Intensity: ${selectedLevel}/5`,
        duration: 3000,
      });

      // Refresh CBT stats to update streaks
      fetchCBTStats();

      // Reset after a delay
      setTimeout(() => {
        setSelectedCategory(null);
        setSelectedLevel(3);
        setSubmitted(false);
      }, 2000);
    }
  };

  const handleQuickLog = async (mood: typeof MOOD_OPTIONS[0]) => {
    const { canLog, message } = canLogMood();
    if (!canLog) {
      setCooldownMessage(message);
      setTimeout(() => setCooldownMessage(null), 3000);
      return;
    }

    setSelectedCategory(mood.value);
    const now = new Date();
    const result = await logMood({
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].slice(0, 5),
      moodLevel: 3,
      moodCategory: mood.value,
      linkedMealId,
      linkedMealType,
    });

    if (result) {
      lastLogTimeRef.current = Date.now();
      setSubmitted(true);
      onMoodLogged?.(result);

      // Show toast notification
      toast.success(`Mood logged: ${mood.label}`, {
        description: "Keep tracking to build your streak!",
        duration: 3000,
      });

      // Refresh CBT stats to update streaks
      fetchCBTStats();

      setTimeout(() => {
        setSubmitted(false);
        setSelectedCategory(null);
      }, 2000);
    }
  };

  if (submitted) {
    const selectedMood = selectedCategory && MOOD_OPTIONS.find(m => m.value === selectedCategory);
    return (
      <div className={cn("p-4 rounded-xl bg-green-50 border border-green-200", className)}>
        <div className="flex items-center justify-center gap-3 text-green-600">
          {selectedMood && (
            <img
              src={selectedMood.image}
              alt={selectedMood.label}
              className="w-10 h-10 object-contain"
            />
          )}
          <div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span className="font-medium">Mood logged!</span>
            </div>
            <p className="text-xs text-green-500 capitalize">{selectedCategory}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cooldownMessage) {
    return (
      <div className={cn("p-4 rounded-xl bg-amber-50 border border-amber-200", className)}>
        <div className="flex items-center justify-center gap-2 text-amber-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium text-sm">{cooldownMessage}</span>
        </div>
      </div>
    );
  }

  // Show the primary 5 moods, and toggle to show all 9
  const visibleMoods = showAllMoods ? MOOD_OPTIONS : MOOD_OPTIONS.slice(0, 5);

  if (compact) {
    return (
      <div className={cn("p-3 rounded-xl bg-white border border-gray-200 shadow-sm", className)}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">How are you feeling?</p>
          <button
            onClick={() => setShowAllMoods(!showAllMoods)}
            className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-0.5"
          >
            {showAllMoods ? "Less" : "More"}
            {showAllMoods ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
        <div className={cn(
          "grid gap-2",
          showAllMoods ? "grid-cols-4" : "grid-cols-5"
        )}>
          {visibleMoods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleQuickLog(mood)}
              disabled={loading}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                mood.bgColor,
                mood.color,
                selectedCategory === mood.value && "ring-2 ring-offset-1 ring-purple-400 scale-105"
              )}
              title={mood.label}
            >
              <img
                src={mood.image}
                alt={mood.label}
                className="w-8 h-8 object-contain"
              />
              <span className="text-[10px] font-medium text-gray-700 truncate w-full text-center">{mood.label}</span>
            </button>
          ))}
        </div>
        {todayMoods.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-3 text-center">
            {todayMoods.length} mood{todayMoods.length !== 1 ? 's' : ''} logged today
          </p>
        )}
      </div>
    );
  }

  const selectedMood = selectedCategory && MOOD_OPTIONS.find(m => m.value === selectedCategory);

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-gray-200 shadow-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">How are you feeling?</h3>
        {todayMoods.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {todayMoods.length} today
          </span>
        )}
      </div>

      {/* Mood Category Selection */}
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-3">Select your mood</p>
        <div className="grid grid-cols-4 gap-3">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setSelectedCategory(mood.value)}
              disabled={loading}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                mood.bgColor,
                mood.color,
                selectedCategory === mood.value && "ring-2 ring-offset-2 ring-purple-400 scale-105 shadow-md"
              )}
            >
              <img
                src={mood.image}
                alt={mood.label}
                className="w-12 h-12 object-contain"
              />
              <span className="text-xs font-medium text-gray-700">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Level Slider */}
      {selectedCategory && (
        <div className="mb-4 animate-in slide-in-from-top-2">
          <p className="text-sm text-gray-500 mb-2">How intense is this feeling?</p>
          <div className="flex justify-between gap-2">
            {MOOD_LEVEL_OPTIONS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={cn(
                  "flex-1 flex flex-col items-center py-2 rounded-lg border transition-all text-sm font-medium",
                  selectedLevel === level.value
                    ? "bg-purple-500 text-white border-purple-500"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                )}
              >
                <span>{level.emoji}</span>
                <span className="text-[10px] mt-0.5">{level.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      {selectedCategory && selectedMood && (
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center gap-2"
        >
          {loading ? (
            "Logging..."
          ) : (
            <>
              <img src={selectedMood.image} alt={selectedMood.label} className="w-5 h-5 object-contain" />
              Log {selectedCategory}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
