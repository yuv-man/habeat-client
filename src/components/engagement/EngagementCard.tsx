import { useEffect } from "react";
import { ChevronRight, Flame, Target, TrendingUp, Award, Calendar, CheckCircle2, BarChart3 } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";

interface EngagementCardProps {
  className?: string;
  onViewDetails?: () => void;
}

export function EngagementCard({ className, onViewDetails }: EngagementCardProps) {
  // Use individual selectors to avoid object creation on every render
  const stats = useEngagementStore((state) => state.stats);
  const loading = useEngagementStore((state) => state.loading);

  useEffect(() => {
    useEngagementStore.getState().fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className={cn("p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse", className)}>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 bg-gray-200 rounded-lg" />
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const habitScore = stats.habitScore ?? 0;
  const weeklyConsistency = stats.weeklyConsistency ?? 0;
  const weeklyGoalsHit = stats.weeklyGoalsHit ?? 0;

  // Get habit score color
  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: "bg-green-50", text: "text-green-600", border: "border-green-200", gradient: "from-green-400 to-emerald-500" };
    if (score >= 40) return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-400 to-orange-500" };
    return { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", gradient: "from-red-400 to-rose-500" };
  };

  const scoreColors = getScoreColor(habitScore);

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Long-Term Progress</h3>
          </div>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">Your habit-building journey and consistency metrics</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Main Metrics Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Habit Score */}
          <div className={cn("p-4 rounded-xl border-2", scoreColors.bg, scoreColors.border)}>
            <div className="flex items-center gap-2 mb-2">
              <Target className={cn("w-5 h-5", scoreColors.text)} />
              <span className="text-sm font-semibold text-gray-700">Habit Score</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className={cn("text-4xl font-bold", scoreColors.text)}>{habitScore}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", scoreColors.gradient)}
                style={{ width: `${habitScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {habitScore >= 70 
                ? "Excellent consistency!" 
                : habitScore >= 40 
                ? "Building strong habits" 
                : "Keep going!"}
            </p>
          </div>

          {/* Streak */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Flame className={cn("w-5 h-5", stats.streak >= 7 ? "text-orange-500 animate-pulse" : "text-orange-400")} />
              <span className="text-sm font-semibold text-gray-700">Current Streak</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold text-gray-800">{stats.streak}</span>
              <span className="text-sm text-gray-600">days</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">Best: {stats.longestStreak} days</p>
              {stats.streak >= 7 && (
                <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  {Math.floor(stats.streak / 7)}w
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            This Week
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Weekly Consistency */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-600">Consistency</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{weeklyConsistency}%</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyConsistency}%` }}
                />
              </div>
            </div>

            {/* Weekly Goals Hit */}
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-gray-600">Goals Hit</span>
                </div>
                <span className="text-lg font-bold text-green-600">{weeklyGoalsHit}/7</span>
              </div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(weeklyGoalsHit / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="pt-4 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.totalDaysTracked}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total Days</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.totalMealsLogged}</p>
              <p className="text-xs text-gray-500 mt-0.5">Meals Logged</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.badges.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Achievements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
