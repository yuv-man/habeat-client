import { useEffect } from "react";
import { Zap } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";

interface XpProgressBarProps {
  className?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function XpProgressBar({ className, showLabel = true, compact = false }: XpProgressBarProps) {
  // Use individual selectors to avoid object creation on every render
  const stats = useEngagementStore((state) => state.stats);
  const loading = useEngagementStore((state) => state.loading);

  useEffect(() => {
    useEngagementStore.getState().fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-2 bg-gray-200 rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const { xp, level, xpProgress } = stats;
  const progressPercentage = xpProgress.required > 0
    ? Math.min(100, (xpProgress.current / xpProgress.required) * 100)
    : 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center gap-1 text-amber-500">
          <Zap className="w-4 h-4 fill-current" />
          <span className="text-sm font-semibold">{xp}</span>
        </div>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">Lv.{level}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold">
              {level}
            </div>
            <span className="font-medium text-gray-700">Level {level}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-600">
            <Zap className="w-4 h-4 fill-current" />
            <span className="font-semibold">{xp} XP</span>
          </div>
        </div>
      )}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{xpProgress.current} / {xpProgress.required} XP</span>
        <span>{Math.round(progressPercentage)}% to Level {level + 1}</span>
      </div>
    </div>
  );
}
