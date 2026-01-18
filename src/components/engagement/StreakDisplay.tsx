import { useEffect } from "react";
import { Flame, Shield } from "lucide-react";
import { useEngagementStore } from "../../stores/engagementStore";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface StreakDisplayProps {
  className?: string;
  showFreeze?: boolean;
  compact?: boolean;
}

export function StreakDisplay({ className, showFreeze = false, compact = false }: StreakDisplayProps) {
  // Use individual selectors to avoid object creation on every render
  const stats = useEngagementStore((state) => state.stats);
  const loading = useEngagementStore((state) => state.loading);
  const fetchStats = useEngagementStore((state) => state.fetchStats);
  const useStreakFreeze = useEngagementStore((state) => state.useStreakFreeze);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
      </div>
    );
  }

  if (!stats) return null;

  const { streak, longestStreak, streakFreezeAvailable } = stats;

  const handleUseFreeze = async () => {
    const result = await useStreakFreeze();
    if (result.success) {
      // Show success toast - will be handled by parent component
    }
  };

  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (streak >= 30) return "text-orange-500";
    if (streak >= 14) return "text-amber-500";
    if (streak >= 7) return "text-yellow-500";
    return "text-gray-400";
  };

  const getFlameAnimation = () => {
    if (streak >= 7) return "animate-pulse";
    return "";
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1 cursor-default", className)}>
              <Flame className={cn("w-5 h-5", getFlameColor(), getFlameAnimation())} />
              <span className="font-bold text-gray-700">{streak}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{streak} day streak</p>
            <p className="text-xs text-gray-400">Best: {longestStreak} days</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl", className)}>
      <div className={cn("relative", getFlameAnimation())}>
        <Flame className={cn("w-10 h-10", getFlameColor())} />
        {streak >= 7 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold text-white">{Math.floor(streak / 7)}w</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-800">{streak}</span>
          <span className="text-sm text-gray-500">day streak</span>
        </div>
        <p className="text-xs text-gray-400">
          Best: {longestStreak} days
        </p>
      </div>

      {showFreeze && streakFreezeAvailable && streak > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUseFreeze}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Shield className="w-4 h-4" />
                <span className="text-xs">Freeze</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Protect your streak for 1 day</p>
              <p className="text-xs text-gray-400">Available once per month</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
