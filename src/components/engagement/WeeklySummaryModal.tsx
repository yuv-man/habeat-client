import { useState } from "react";
import {
  X,
  Calendar,
  TrendingUp,
  Droplets,
  Flame,
  Target,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { IWeeklySummary } from "../../types/interfaces";
import { cn } from "../../lib/utils";

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: IWeeklySummary;
}

function getConsistencyColor(score: number) {
  if (score >= 80) return { bg: "bg-green-100", text: "text-green-600", fill: "fill-green-500" };
  if (score >= 60) return { bg: "bg-emerald-100", text: "text-emerald-600", fill: "fill-emerald-500" };
  if (score >= 40) return { bg: "bg-amber-100", text: "text-amber-600", fill: "fill-amber-500" };
  return { bg: "bg-red-100", text: "text-red-600", fill: "fill-red-500" };
}

function getConsistencyMessage(score: number) {
  if (score >= 80) return "Outstanding week!";
  if (score >= 60) return "Great consistency!";
  if (score >= 40) return "Good effort!";
  return "Keep building!";
}

export function WeeklySummaryModal({ isOpen, onClose, summary }: WeeklySummaryModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const consistencyColors = getConsistencyColor(summary.consistencyScore);

  // Format dates
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-white/80 hover:text-white rounded-full hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(summary.weekStart)} - {formatDate(summary.weekEnd)}</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Your Week in Review</h2>
          <p className="text-white/80 text-sm">{getConsistencyMessage(summary.consistencyScore)}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Consistency Score */}
          <div className="flex items-center gap-4">
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center", consistencyColors.bg)}>
              <div className="text-center">
                <span className={cn("text-2xl font-bold", consistencyColors.text)}>
                  {summary.consistencyScore}%
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800">Consistency Score</h3>
              <p className="text-sm text-gray-500">
                You tracked <span className="font-medium">{summary.daysTracked}/7</span> days this week
              </p>
              {summary.calorieGoalHitDays > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Hit calorie goal {summary.calorieGoalHitDays} days
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-600">Avg Calories</span>
              </div>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {Math.round(summary.avgCalories)}
              </p>
            </div>

            <div className="bg-blue-50 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Water Goal</span>
              </div>
              <p className="text-xl font-bold text-gray-800 mt-1">
                {summary.waterGoalHitDays}/7 days
              </p>
            </div>
          </div>

          {/* Nutrition Averages */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Nutrition Breakdown</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-gray-400 transition-transform", showDetails && "rotate-90")} />
          </button>

          {showDetails && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Protein</span>
                <span className="font-medium">{Math.round(summary.avgProtein)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Carbs</span>
                <span className="font-medium">{Math.round(summary.avgCarbs)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Fat</span>
                <span className="font-medium">{Math.round(summary.avgFat)}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Avg Water</span>
                <span className="font-medium">{Math.round(summary.avgWaterGlasses)} glasses</span>
              </div>
            </div>
          )}

          {/* Achievements */}
          {summary.achievements.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-800">This Week's Achievements</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.achievements.map((achievement, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                  >
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Best Day */}
          {summary.bestDay && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <Sparkles className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Best Day</p>
                <p className="font-medium text-gray-800">{formatDate(summary.bestDay)}</p>
              </div>
            </div>
          )}

          {/* Motivational Message */}
          {summary.motivationalMessage && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-gray-700 italic">"{summary.motivationalMessage}"</p>
            </div>
          )}

          {/* Focus Area */}
          {summary.focusAreaForNextWeek && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-amber-800">Focus for Next Week</h3>
              </div>
              <p className="text-sm text-amber-700">{summary.focusAreaForNextWeek}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Start New Week
          </button>
        </div>
      </div>
    </div>
  );
}
