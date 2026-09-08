import { useEffect } from "react";
import { X, Brain } from "lucide-react";
import { useCBTStore, useShowMoodCheckIn } from "@/stores/cbtStore";
import { MoodEntryForm } from "./MoodEntryForm";
import { cn } from "@/lib/utils";

interface MoodCheckInPromptProps {
  className?: string;
}

/**
 * The deliberate mood check-in: energy, stress, triggers and a note.
 *
 * It used to double as the meal-mood capture, reached from a "Mood" button on
 * every meal card — three steps and seven taps to answer what the inline
 * `MealCheckIn` now answers in two. Meals no longer come here, so this is only
 * what its name says.
 */
export function MoodCheckInPrompt({ className }: MoodCheckInPromptProps) {
  const show = useShowMoodCheckIn();
  const hideMoodCheckInModal = useCBTStore((s) => s.hideMoodCheckInModal);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) {
        hideMoodCheckInModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [show, hideMoodCheckInModal]);

  if (!show) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={hideMoodCheckInModal}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-5">
          <button
            onClick={hideMoodCheckInModal}
            className="absolute top-4 right-4 p-1 text-white/80 hover:text-white rounded-full hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Mood check-in</h2>
              <p className="text-sm text-white/80">
                Take a moment to reflect on how you're feeling
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <MoodEntryForm
            onComplete={hideMoodCheckInModal}
            onCancel={hideMoodCheckInModal}
            className="border-0 shadow-none p-0"
          />
        </div>
      </div>
    </div>
  );
}
