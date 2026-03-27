import { forwardRef } from "react";
import { Calendar, TrendingUp, Droplets, Utensils } from "lucide-react";
import ShareableCard from "./ShareableCard";

interface WeeklySummaryCardProps {
  daysTracked: number;
  consistencyScore: number;
  avgCalories?: number;
  avgWaterGlasses?: number;
  calorieGoalHitDays?: number;
  waterGoalHitDays?: number;
  userName?: string;
  weekStart?: Date;
  weekEnd?: Date;
}

const WeeklySummaryCard = forwardRef<HTMLDivElement, WeeklySummaryCardProps>(
  (
    {
      daysTracked,
      consistencyScore,
      avgCalories,
      avgWaterGlasses,
      calorieGoalHitDays,
      waterGoalHitDays,
      userName,
      weekStart,
      weekEnd,
    },
    ref
  ) => {
    const getGradient = (score: number) => {
      if (score >= 80) return "from-emerald-500 to-green-600";
      if (score >= 60) return "from-teal-500 to-cyan-600";
      if (score >= 40) return "from-blue-500 to-indigo-600";
      return "from-slate-500 to-slate-600";
    };

    const getScoreEmoji = (score: number) => {
      if (score >= 90) return "";
      if (score >= 80) return "";
      if (score >= 70) return "";
      if (score >= 50) return "";
      return "";
    };

    const formatWeekRange = () => {
      if (!weekStart || !weekEnd) return "This Week";
      const start = new Date(weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const end = new Date(weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${start} - ${end}`;
    };

    return (
      <ShareableCard ref={ref} gradient={getGradient(consistencyScore)}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            {userName && (
              <p className="text-sm font-medium text-white/80">{userName}'s</p>
            )}
            <h3 className="text-xl font-bold text-white">Weekly Summary</h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm text-white/90">
            <Calendar className="h-4 w-4" />
            {formatWeekRange()}
          </div>
        </div>

        {/* Main consistency score */}
        <div className="mb-5 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-white/10 blur-lg" />
            <div className="relative flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
              <span className="text-3xl">{getScoreEmoji(consistencyScore)}</span>
              <span className="text-3xl font-bold text-white">{consistencyScore}%</span>
              <span className="text-xs text-white/70">Consistency</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Days tracked */}
          <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-white/70" />
              <span className="text-xs text-white/70">Days Tracked</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-white">
              {daysTracked}
              <span className="text-base font-normal text-white/60">/7</span>
            </p>
          </div>

          {/* Calorie goal hits */}
          {calorieGoalHitDays !== undefined && (
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-white/70" />
                <span className="text-xs text-white/70">Goal Hit</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-white">
                {calorieGoalHitDays}
                <span className="text-base font-normal text-white/60"> days</span>
              </p>
            </div>
          )}

          {/* Avg calories */}
          {avgCalories !== undefined && (
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Utensils className="h-4 w-4 text-white/70" />
                <span className="text-xs text-white/70">Avg Calories</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">{avgCalories}</p>
            </div>
          )}

          {/* Avg water */}
          {avgWaterGlasses !== undefined && (
            <div className="rounded-xl bg-white/15 p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-white/70" />
                <span className="text-xs text-white/70">Avg Water</span>
              </div>
              <p className="mt-1 text-xl font-bold text-white">
                {avgWaterGlasses}
                <span className="text-base font-normal text-white/60"> glasses</span>
              </p>
            </div>
          )}
        </div>
      </ShareableCard>
    );
  }
);

WeeklySummaryCard.displayName = "WeeklySummaryCard";

export default WeeklySummaryCard;
