import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { XpProgressBar } from "./XpProgressBar";
import { StreakDisplay } from "./StreakDisplay";
import { cn } from "../../lib/utils";

interface EngagementCardProps {
  className?: string;
  onViewDetails?: () => void;
}

export function EngagementCard({ className, onViewDetails }: EngagementCardProps) {
  // Use individual selectors to avoid object creation on every render
  const stats = useEngagementStore((state) => state.stats);
  const loading = useEngagementStore((state) => state.loading);
  const fetchStats = useEngagementStore((state) => state.fetchStats);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className={cn("p-4 bg-white rounded-xl shadow-sm animate-pulse", className)}>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={cn("p-4 bg-white rounded-xl shadow-sm space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Your Progress</h3>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* XP Progress */}
      <XpProgressBar />

      {/* Streak */}
      <StreakDisplay showFreeze />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.totalMealsLogged}</p>
          <p className="text-xs text-gray-500">Meals Logged</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.badges.length}</p>
          <p className="text-xs text-gray-500">Badges Earned</p>
        </div>
      </div>
    </div>
  );
}
