import { useEffect } from "react";
import { Flame } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";

interface EngagementBannerProps {
  caloriesConsumed: number;
  caloriesGoal: number;
  className?: string;
}

export function EngagementBanner({
  caloriesConsumed,
  caloriesGoal,
  className,
}: EngagementBannerProps) {
  // Use individual selectors to avoid object creation on every render
  const stats = useEngagementStore((state) => state.stats);
  const loading = useEngagementStore((state) => state.loading);
  const fetchStats = useEngagementStore((state) => state.fetchStats);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Calculate calories progress percentage
  const caloriesPercentage = caloriesGoal > 0 
    ? Math.min(100, (caloriesConsumed / caloriesGoal) * 100)
    : 0;

  // Calculate ring circumference (2 * π * radius)
  const radius = 20; // Compact ring radius
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (caloriesPercentage / 100) * circumference;

  if (loading && !stats) {
    return (
      <div className={cn("flex items-center justify-between py-2 px-4 bg-white rounded-lg shadow-sm animate-pulse", className)}>
        <div className="h-5 bg-gray-200 rounded w-20" />
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    );
  }

  const streak = stats?.streak || 0;

  return (
    <div className={cn("flex items-center justify-between py-2 px-4 bg-white rounded-lg shadow-sm", className)}>
      {/* Streak Display - "Day X 🔥" format */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-gray-900">Day {streak}</span>
        <Flame className="w-4 h-4 text-orange-500" />
      </div>

      {/* Calories Ring */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-10 h-10">
          {/* Background ring */}
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="2.5"
            />
            {/* Progress ring - green color */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
        </div>
        <div className="text-sm font-semibold text-gray-900">
          {caloriesConsumed}/{caloriesGoal} <span className="text-gray-500 font-normal">kcal</span>
        </div>
      </div>
    </div>
  );
}
