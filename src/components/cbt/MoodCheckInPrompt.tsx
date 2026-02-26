import { useEffect } from "react";
import { X, Brain } from "lucide-react";
import {
  useCBTStore,
  useShowMoodCheckIn,
  usePendingMealMoodLink,
} from "@/stores/cbtStore";
import { MoodEntryForm } from "./MoodEntryForm";
import { cn } from "@/lib/utils";

interface MoodCheckInPromptProps {
  className?: string;
}

export function MoodCheckInPrompt({ className }: MoodCheckInPromptProps) {
  const show = useShowMoodCheckIn();
  const pendingLink = usePendingMealMoodLink();
  const hideMoodCheckInModal = useCBTStore((s) => s.hideMoodCheckInModal);
  const completeMealMoodLink = useCBTStore((s) => s.completeMealMoodLink);
  const cancelMealMoodLink = useCBTStore((s) => s.cancelMealMoodLink);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) {
        cancelMealMoodLink();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [show, cancelMealMoodLink]);

  if (!show) return null;

  const getTitle = () => {
    if (pendingLink) {
      if (pendingLink.phase === "before") {
        return `How are you feeling before ${pendingLink.mealName}?`;
      }
      return `How do you feel after ${pendingLink.mealName}?`;
    }
    return "Quick Mood Check-In";
  };

  const getSubtitle = () => {
    if (pendingLink) {
      if (pendingLink.phase === "before") {
        return "Track your emotional state before eating";
      }
      return "Did your mood change after the meal?";
    }
    return "Take a moment to reflect on how you're feeling";
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={cancelMealMoodLink}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5">
          <button
            onClick={cancelMealMoodLink}
            className="absolute top-4 right-4 p-1 text-white/80 hover:text-white rounded-full hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{getTitle()}</h2>
              <p className="text-sm text-white/80">{getSubtitle()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <MoodEntryForm
            linkedMealId={pendingLink?.mealId}
            linkedMealType={pendingLink?.mealType}
            onComplete={() => {
              completeMealMoodLink();
            }}
            onCancel={cancelMealMoodLink}
            className="border-0 shadow-none p-0"
          />
        </div>

        {/* Skip option */}
        <div className="px-4 pb-4">
          <button
            onClick={cancelMealMoodLink}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
