import { useEffect } from "react";
import { Target, TrendingUp } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";

interface HabitScoreDisplayProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

// Color based on habit score
function getScoreColor(score: number): { bg: string; text: string; gradient: string } {
  if (score >= 70) {
    return {
      bg: "bg-green-100",
      text: "text-green-600",
      gradient: "from-green-400 to-emerald-500",
    };
  } else if (score >= 40) {
    return {
      bg: "bg-amber-100",
      text: "text-amber-600",
      gradient: "from-amber-400 to-orange-500",
    };
  } else {
    return {
      bg: "bg-red-100",
      text: "text-red-600",
      gradient: "from-red-400 to-rose-500",
    };
  }
}

function getScoreMessage(score: number): string {
  if (score >= 80) return "Excellent consistency!";
  if (score >= 60) return "Building strong habits";
  if (score >= 40) return "Keep it going!";
  if (score >= 20) return "Room to grow";
  return "Let's build your habit";
}

export function HabitScoreDisplay({ className, showLabel = true, compact = false }: HabitScoreDisplayProps) {
  const stats = useEngagementStore((state) => state.stats);
  const loading = useEngagementStore((state) => state.loading);
  const fetchStats = useEngagementStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-16 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!stats) return null;

  const habitScore = stats.habitScore ?? 0;
  const weeklyConsistency = stats.weeklyConsistency ?? 0;
  const colors = getScoreColor(habitScore);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", colors.bg)}>
          <span className={cn("text-lg font-bold", colors.text)}>{habitScore}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <Target className={cn("w-3 h-3", colors.text)} />
            <span className="text-xs font-medium text-gray-600">Habit Score</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div
              className={cn("h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r", colors.gradient)}
              style={{ width: `${habitScore}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Circular progress calculation
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDashoffset = circumference - (habitScore / 100) * circumference;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-4">
        {/* Circular Progress */}
        <div className="relative w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="url(#habitScoreGradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="habitScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {habitScore >= 70 ? (
                  <>
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#10b981" />
                  </>
                ) : habitScore >= 40 ? (
                  <>
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#fb7185" />
                  </>
                )}
              </linearGradient>
            </defs>
          </svg>
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", colors.text)}>{habitScore}</span>
            <span className="text-[10px] text-gray-500 -mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Labels */}
        <div className="flex-1">
          {showLabel && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Target className={cn("w-4 h-4", colors.text)} />
                <span className="font-semibold text-gray-800">Habit Score</span>
              </div>
              <p className="text-sm text-gray-500">{getScoreMessage(habitScore)}</p>

              {/* Weekly consistency indicator */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs text-gray-600">
                  This week: <span className="font-medium">{weeklyConsistency}%</span> consistent
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
