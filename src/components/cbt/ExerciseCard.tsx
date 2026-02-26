import { Clock, Play, Star, Utensils, Brain, Heart, Sparkles } from "lucide-react";
import { ICBTExercise, CBTExerciseCategory } from "@/types/interfaces";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: ICBTExercise;
  onStart: (exercise: ICBTExercise) => void;
  className?: string;
  compact?: boolean;
}

const CATEGORY_STYLES: Record<CBTExerciseCategory, { bg: string; text: string; icon: React.ReactNode }> = {
  mood: { bg: "bg-purple-100", text: "text-purple-600", icon: <Brain className="w-4 h-4" /> },
  eating: { bg: "bg-orange-100", text: "text-orange-600", icon: <Utensils className="w-4 h-4" /> },
  stress: { bg: "bg-red-100", text: "text-red-600", icon: <Heart className="w-4 h-4" /> },
  general: { bg: "bg-blue-100", text: "text-blue-600", icon: <Sparkles className="w-4 h-4" /> },
};

const DIFFICULTY_STYLES = {
  beginner: "bg-green-100 text-green-600",
  intermediate: "bg-yellow-100 text-yellow-600",
  advanced: "bg-red-100 text-red-600",
};

export function ExerciseCard({
  exercise,
  onStart,
  className,
  compact = false,
}: ExerciseCardProps) {
  const categoryStyle = CATEGORY_STYLES[exercise.category];
  const difficultyStyle = DIFFICULTY_STYLES[exercise.difficulty];

  if (compact) {
    return (
      <button
        onClick={() => onStart(exercise)}
        className={cn(
          "w-full p-3 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all text-left group",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg", categoryStyle.bg)}>
            <span className={categoryStyle.text}>{categoryStyle.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm truncate">{exercise.title}</p>
            <p className="text-xs text-gray-500">{exercise.duration} min</p>
          </div>
          <Play className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={cn("p-2 rounded-xl", categoryStyle.bg)}>
          <span className={cn(categoryStyle.text)}>{categoryStyle.icon}</span>
        </div>
        <div className="flex gap-1">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", difficultyStyle)}>
            {exercise.difficulty}
          </span>
        </div>
      </div>

      {/* Title and description */}
      <h3 className="font-semibold text-gray-800 mb-1">{exercise.title}</h3>
      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{exercise.description}</p>

      {/* Benefits */}
      {exercise.benefits.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {exercise.benefits.slice(0, 2).map((benefit, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs"
              >
                <Star className="w-3 h-3" />
                {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          {exercise.duration} min
        </div>
        <button
          onClick={() => onStart(exercise)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Play className="w-4 h-4" />
          Start
        </button>
      </div>
    </div>
  );
}
