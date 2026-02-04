import { useEffect } from "react";
import { Hop, TrendingUp } from "lucide-react";
import { useEngagementStore } from "@/stores/engagementStore";
import { cn } from "@/lib/utils";

interface HealthyCoinsProps {
  variant?: "default" | "compact";
  showTrend?: boolean;
  className?: string;
}

export function HealthyCoins({
  variant = "default",
  showTrend = false,
  className,
}: HealthyCoinsProps) {
  const { stats, fetchStats } = useEngagementStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const xp = stats?.xp || 0;
  const level = stats?.level || 1;

  // Format XP with commas for readability
  const formatXP = (value: number) => {
    return value.toLocaleString();
  };

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full hover:shadow-md transition-all cursor-pointer group",
          className
        )}
        title={`Level ${level} • ${formatXP(xp)} Healthy Coins`}
      >
        <Hop className="w-4 h-4 text-yellow-600 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold text-yellow-700">
          {formatXP(xp)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg hover:shadow-md transition-all cursor-pointer group",
        className
      )}
      title={`Level ${level} • ${formatXP(xp)} Healthy Coins`}
    >
      <div className="flex items-center gap-1.5">
        <Hop className="w-5 h-5 text-yellow-600 group-hover:scale-110 transition-transform" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-yellow-600 leading-none">
            Healthy Coins
          </span>
          <span className="text-sm font-bold text-yellow-700 leading-tight">
            {formatXP(xp)}
          </span>
        </div>
      </div>
      {showTrend && (
        <div className="flex items-center gap-0.5 text-green-600">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-semibold">Lv {level}</span>
        </div>
      )}
    </div>
  );
}
