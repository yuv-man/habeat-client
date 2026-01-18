import { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, Flame, Star, Lightbulb, ChevronRight } from "lucide-react";
import { userAPI } from "../../services/api";
import { IWeeklyStory } from "../../types/interfaces";
import { cn } from "../../lib/utils";

interface WeeklyStoryCardProps {
  className?: string;
  onViewDetails?: () => void;
}

export function WeeklyStoryCard({ className, onViewDetails }: WeeklyStoryCardProps) {
  const [story, setStory] = useState<IWeeklyStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getWeeklyStory();
        setStory(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load story");
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, []);

  if (loading) {
    return (
      <div className={cn("p-5 bg-white rounded-xl shadow-sm animate-pulse", className)}>
        <div className="space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return null;
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${startDate.toLocaleDateString("en-US", options)} - ${endDate.toLocaleDateString("en-US", options)}`;
  };

  const getTrendBadge = (change: number) => {
    if (change > 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <TrendingUp className="w-3 h-3" />
          Improving
        </span>
      );
    }
    if (change < -5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          <TrendingDown className="w-3 h-3" />
          Needs attention
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        Steady
      </span>
    );
  };

  return (
    <div className={cn("bg-white rounded-xl shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Weekly Reflection
          </h3>
          {getTrendBadge(story.stats.healthScoreChange)}
        </div>
        <p className="text-xs text-gray-500">{formatDateRange(story.period.start, story.period.end)}</p>
      </div>

      {/* Main Message */}
      <div className="px-5 py-4 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{story.emoji}</span>
          <div>
            <p className="text-lg font-medium text-gray-800 leading-snug">
              {story.message}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-5 py-4 grid grid-cols-3 gap-3 border-b border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xl font-bold text-gray-800">{story.stats.avgHealthScore}</span>
          </div>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xl font-bold text-gray-800">{story.stats.streakDays}</span>
          </div>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xl font-bold text-gray-800">{story.stats.daysTracked}/7</span>
          </div>
          <p className="text-xs text-gray-500">Days Tracked</p>
        </div>
      </div>

      {/* Highlights */}
      {story.highlights.length > 0 && (
        <div className="px-5 py-3 border-b border-gray-100">
          <ul className="space-y-1.5">
            {story.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-purple-500 mt-0.5">*</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestion */}
      <div className="px-5 py-4 bg-amber-50">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">{story.suggestion}</p>
        </div>
      </div>

      {/* View Details Button */}
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full px-5 py-3 flex items-center justify-center gap-1 text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
        >
          View Full Analytics
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
