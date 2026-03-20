import { useState, useRef } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Check, Sparkles, Heart } from "lucide-react";
import { useCBTStore, useTodayMoods } from "@/stores/cbtStore";
import { MoodLevel, MoodCategory, IMoodEntry } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const MOOD_OPTIONS: { value: MoodCategory; label: string; image: string; color: string; bgColor: string; gradient: string; glowColor: string }[] = [
  { value: "happy", label: "Happy", image: happyImg, color: "border-yellow-300", bgColor: "bg-yellow-50 hover:bg-yellow-100", gradient: "from-yellow-100 via-amber-50 to-orange-50", glowColor: "shadow-yellow-200" },
  { value: "calm", label: "Calm", image: calmImg, color: "border-blue-300", bgColor: "bg-blue-50 hover:bg-blue-100", gradient: "from-blue-100 via-sky-50 to-cyan-50", glowColor: "shadow-blue-200" },
  { value: "energetic", label: "Energetic", image: energeticImg, color: "border-orange-300", bgColor: "bg-orange-50 hover:bg-orange-100", gradient: "from-orange-100 via-amber-50 to-yellow-50", glowColor: "shadow-orange-200" },
  { value: "neutral", label: "Neutral", image: neutralImg, color: "border-gray-300", bgColor: "bg-gray-50 hover:bg-gray-100", gradient: "from-gray-100 via-slate-50 to-gray-50", glowColor: "shadow-gray-200" },
  { value: "tired", label: "Tired", image: tiredImg, color: "border-indigo-300", bgColor: "bg-indigo-50 hover:bg-indigo-100", gradient: "from-indigo-100 via-violet-50 to-purple-50", glowColor: "shadow-indigo-200" },
  { value: "stressed", label: "Stressed", image: stressedImg, color: "border-red-300", bgColor: "bg-red-50 hover:bg-red-100", gradient: "from-red-100 via-rose-50 to-pink-50", glowColor: "shadow-red-200" },
  { value: "anxious", label: "Anxious", image: anxiousImg, color: "border-purple-300", bgColor: "bg-purple-50 hover:bg-purple-100", gradient: "from-purple-100 via-violet-50 to-fuchsia-50", glowColor: "shadow-purple-200" },
  { value: "sad", label: "Sad", image: sadImg, color: "border-cyan-300", bgColor: "bg-cyan-50 hover:bg-cyan-100", gradient: "from-cyan-100 via-teal-50 to-blue-50", glowColor: "shadow-cyan-200" },
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
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("p-6 rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 shadow-lg shadow-green-100", className)}
      >
        <div className="flex flex-col items-center justify-center gap-3 text-green-600">
          {selectedMood && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50 animate-pulse" />
              <img
                src={selectedMood.image}
                alt={selectedMood.label}
                className="w-16 h-16 object-contain relative z-10"
              />
            </motion.div>
          )}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-lg">Mood logged!</span>
              <Sparkles className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-green-500 capitalize mt-1">Feeling {selectedCategory}</p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (cooldownMessage) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 shadow-md", className)}
      >
        <div className="flex items-center justify-center gap-3 text-amber-600">
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="w-6 h-6" />
          </motion.div>
          <span className="font-medium">{cooldownMessage}</span>
        </div>
      </motion.div>
    );
  }

  // Show the primary 5 moods, and toggle to show all 9
  const visibleMoods = showAllMoods ? MOOD_OPTIONS : MOOD_OPTIONS.slice(0, 5);

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("p-4 rounded-2xl bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/30 border border-purple-100 shadow-lg shadow-purple-100/50", className)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800">How are you feeling?</p>
          </div>
          <button
            onClick={() => setShowAllMoods(!showAllMoods)}
            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-0.5 bg-purple-100 px-2 py-1 rounded-full transition-colors"
          >
            {showAllMoods ? "Less" : "More"}
            {showAllMoods ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
        <div className={cn(
          "grid gap-2",
          showAllMoods ? "grid-cols-4" : "grid-cols-5"
        )}>
          <AnimatePresence mode="popLayout">
            {visibleMoods.map((mood, index) => (
              <motion.button
                key={mood.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickLog(mood)}
                disabled={loading}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all relative overflow-hidden group",
                  `bg-gradient-to-br ${mood.gradient}`,
                  mood.color,
                  selectedCategory === mood.value && `ring-2 ring-offset-1 ring-purple-400 shadow-lg ${mood.glowColor}`
                )}
                title={mood.label}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/30 transition-colors" />
                <motion.img
                  src={mood.image}
                  alt={mood.label}
                  className="w-9 h-9 object-contain relative z-10"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.3 }}
                />
                <span className="text-[10px] font-semibold text-gray-700 truncate w-full text-center relative z-10">{mood.label}</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
        {todayMoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-1.5 mt-4 text-xs text-purple-600 bg-purple-50 py-1.5 px-3 rounded-full mx-auto w-fit"
          >
            <Sparkles className="w-3 h-3" />
            <span className="font-medium">{todayMoods.length} mood{todayMoods.length !== 1 ? 's' : ''} logged today</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  const selectedMood = selectedCategory && MOOD_OPTIONS.find(m => m.value === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-2xl bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/40 border border-purple-100 shadow-xl shadow-purple-100/30 relative overflow-hidden",
        className
      )}
    >
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-200"
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">How are you feeling?</h3>
              <p className="text-xs text-gray-500">Tap to log your current mood</p>
            </div>
          </div>
          {todayMoods.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md"
            >
              <Sparkles className="w-3 h-3" />
              {todayMoods.length} today
            </motion.div>
          )}
        </div>

        {/* Mood Category Selection */}
        <div className="mb-5">
          <div className="grid grid-cols-4 gap-3">
            {MOOD_OPTIONS.map((mood, index) => (
              <motion.button
                key={mood.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(mood.value)}
                disabled={loading}
                className={cn(
                  "flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden group",
                  `bg-gradient-to-br ${mood.gradient}`,
                  mood.color,
                  selectedCategory === mood.value && `ring-2 ring-offset-2 ring-purple-400 shadow-xl ${mood.glowColor} border-purple-300`
                )}
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/40 transition-all duration-300" />

                {/* Selected indicator */}
                {selectedCategory === mood.value && (
                  <motion.div
                    layoutId="selectedMood"
                    className="absolute inset-0 border-2 border-purple-400 rounded-2xl"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}

                <motion.img
                  src={mood.image}
                  alt={mood.label}
                  className="w-14 h-14 object-contain relative z-10 drop-shadow-md"
                  animate={selectedCategory === mood.value ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                />
                <span className={cn(
                  "text-xs font-semibold relative z-10 transition-colors",
                  selectedCategory === mood.value ? "text-purple-700" : "text-gray-700"
                )}>
                  {mood.label}
                </span>

                {/* Selection check mark */}
                <AnimatePresence>
                  {selectedCategory === mood.value && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-1 shadow-md"
                    >
                      <Check className="w-3 h-3" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Mood Level Selection */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                How intense is this feeling?
              </p>
              <div className="flex justify-between gap-2">
                {MOOD_LEVEL_OPTIONS.map((level, index) => (
                  <motion.button
                    key={level.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedLevel(level.value)}
                    className={cn(
                      "flex-1 flex flex-col items-center py-3 rounded-xl border-2 transition-all font-medium relative overflow-hidden",
                      selectedLevel === level.value
                        ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-200"
                        : "bg-white/80 text-gray-600 border-gray-200 hover:border-purple-200 hover:bg-purple-50/50"
                    )}
                  >
                    <span className="text-lg font-bold">{level.emoji}</span>
                    <span className="text-[10px] mt-0.5 opacity-80">{level.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <AnimatePresence>
          {selectedCategory && selectedMood && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-purple-200 flex items-center justify-center gap-3 transition-all"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <img src={selectedMood.image} alt={selectedMood.label} className="w-6 h-6 object-contain" />
                    <span>Log {selectedMood.label}</span>
                    <Sparkles className="w-4 h-4 opacity-70" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
