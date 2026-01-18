import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Star, Utensils, Droplets, Dumbbell, X } from "lucide-react";
import { userAPI } from "../../services/api";
import { IDailySummary } from "../../types/interfaces";
import { cn } from "../../lib/utils";

interface DailySummaryCardProps {
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function DailySummaryCard({ className, onDismiss, showDismiss = true }: DailySummaryCardProps) {
  const [summary, setSummary] = useState<IDailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getDailySummary();
        setSummary(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className={cn("p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg animate-pulse", className)}>
        <div className="space-y-3">
          <div className="h-6 bg-white/20 rounded w-1/2" />
          <div className="h-16 bg-white/20 rounded" />
          <div className="h-4 bg-white/20 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendText = (change: number) => {
    if (change > 0) return `+${change} from yesterday`;
    if (change < 0) return `${change} from yesterday`;
    return "Same as yesterday";
  };

  return (
    <div className={cn(
      "relative p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg text-white overflow-hidden",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Dismiss button */}
      {showDismiss && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-white/80 mb-1">Today's Summary</h3>

        {/* Health Score */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn("text-5xl font-bold", getScoreColor(summary.healthScore))}>
            {summary.healthScore}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/70">Health Score</span>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(summary.healthScoreChange)}
              <span className="text-white/80">{getTrendText(summary.healthScoreChange)}</span>
            </div>
          </div>
        </div>

        {/* Insight */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl">{summary.emoji}</span>
            <p className="text-sm leading-relaxed">{summary.insight}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Utensils className="w-4 h-4 mx-auto mb-1 text-white/70" />
            <p className="text-lg font-semibold">{summary.stats.mealsCompleted}/{summary.stats.mealsTotal}</p>
            <p className="text-[10px] text-white/60">Meals</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-white/70" />
            <p className="text-lg font-semibold">{summary.stats.waterPercent}%</p>
            <p className="text-[10px] text-white/60">Water</p>
          </div>
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Star className="w-4 h-4 mx-auto mb-1 text-white/70" />
            <p className="text-lg font-semibold">{summary.stats.caloriesPercent}%</p>
            <p className="text-[10px] text-white/60">Calories</p>
          </div>
        </div>
      </div>
    </div>
  );
}
