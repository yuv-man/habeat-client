import { forwardRef } from "react";
import { Target, TrendingUp, Award } from "lucide-react";
import ShareableCard from "./ShareableCard";

interface HabitScoreCardProps {
  habitScore: number;
  previousScore?: number;
  totalDaysTracked?: number;
  totalMealsLogged?: number;
  userName?: string;
}

const HabitScoreCard = forwardRef<HTMLDivElement, HabitScoreCardProps>(
  ({ habitScore, previousScore, totalDaysTracked, totalMealsLogged, userName }, ref) => {
    const getGradient = (score: number) => {
      if (score >= 80) return "from-violet-500 via-purple-500 to-fuchsia-500";
      if (score >= 60) return "from-indigo-500 to-purple-600";
      if (score >= 40) return "from-blue-500 to-indigo-600";
      return "from-slate-500 to-slate-600";
    };

    const getScoreLevel = (score: number) => {
      if (score >= 90) return { label: "Elite", emoji: "" };
      if (score >= 80) return { label: "Champion", emoji: "" };
      if (score >= 70) return { label: "Master", emoji: "" };
      if (score >= 60) return { label: "Advanced", emoji: "" };
      if (score >= 50) return { label: "Intermediate", emoji: "" };
      if (score >= 30) return { label: "Rising", emoji: "" };
      return { label: "Beginner", emoji: "" };
    };

    const scoreChange = previousScore !== undefined ? habitScore - previousScore : null;
    const { label, emoji } = getScoreLevel(habitScore);

    return (
      <ShareableCard ref={ref} gradient={getGradient(habitScore)}>
        {/* Header */}
        {userName && (
          <p className="mb-2 text-center text-sm font-medium text-white/80">
            {userName}'s Habit Score
          </p>
        )}

        {/* Main score display */}
        <div className="flex flex-col items-center">
          {/* Score circle */}
          <div className="relative mb-4">
            <div className="absolute -inset-4 rounded-full bg-white/10 blur-xl" />

            {/* Score ring */}
            <div className="relative">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                />
                {/* Score arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(habitScore / 100) * 283} 283`}
                  className="drop-shadow-lg"
                />
              </svg>

              {/* Score number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white drop-shadow-md">
                  {habitScore}
                </span>
                <span className="text-sm text-white/70">/ 100</span>
              </div>
            </div>
          </div>

          {/* Level badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
            <span className="text-2xl">{emoji}</span>
            <span className="font-semibold text-white">{label}</span>
          </div>

          {/* Score change indicator */}
          {scoreChange !== null && scoreChange !== 0 && (
            <div
              className={`mb-3 flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                scoreChange > 0
                  ? "bg-green-500/30 text-green-200"
                  : "bg-red-500/30 text-red-200"
              }`}
            >
              <TrendingUp className={`h-4 w-4 ${scoreChange < 0 ? "rotate-180" : ""}`} />
              <span>{scoreChange > 0 ? "+" : ""}{scoreChange} from last week</span>
            </div>
          )}

          {/* Stats row */}
          {(totalDaysTracked !== undefined || totalMealsLogged !== undefined) && (
            <div className="mt-2 flex items-center gap-4">
              {totalDaysTracked !== undefined && (
                <div className="flex items-center gap-1.5 text-white/70">
                  <Target className="h-4 w-4" />
                  <span className="text-sm">{totalDaysTracked} days tracked</span>
                </div>
              )}
              {totalMealsLogged !== undefined && (
                <div className="flex items-center gap-1.5 text-white/70">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">{totalMealsLogged} meals logged</span>
                </div>
              )}
            </div>
          )}
        </div>
      </ShareableCard>
    );
  }
);

HabitScoreCard.displayName = "HabitScoreCard";

export default HabitScoreCard;
