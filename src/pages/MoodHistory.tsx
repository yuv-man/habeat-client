import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, TrendingUp, Heart, Filter } from "lucide-react";
import { useCBTStore, useMoodHistory, useTodayMoods } from "@/stores/cbtStore";
import { IMoodEntry, MoodCategory } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoodTracker } from "@/components/cbt/MoodTracker";
import { MoodHistoryChart } from "@/components/cbt/MoodHistoryChart";
import DashboardLayout from "@/components/layout/DashboardLayout";

const MOOD_COLORS: Record<MoodCategory, string> = {
  happy: "bg-yellow-100 text-yellow-700 border-yellow-200",
  calm: "bg-blue-100 text-blue-700 border-blue-200",
  energetic: "bg-orange-100 text-orange-700 border-orange-200",
  neutral: "bg-gray-100 text-gray-700 border-gray-200",
  tired: "bg-indigo-100 text-indigo-700 border-indigo-200",
  stressed: "bg-red-100 text-red-700 border-red-200",
  anxious: "bg-purple-100 text-purple-700 border-purple-200",
  sad: "bg-cyan-100 text-cyan-700 border-cyan-200",
  angry: "bg-rose-100 text-rose-700 border-rose-200",
};

const MOOD_EMOJIS: Record<MoodCategory, string> = {
  happy: "😊",
  calm: "😌",
  energetic: "⚡",
  neutral: "😐",
  tired: "😴",
  stressed: "😰",
  anxious: "😟",
  sad: "😢",
  angry: "😠",
};

const MoodHistory = () => {
  const navigate = useNavigate();
  const { fetchMoodHistory } = useCBTStore();
  const moodHistory = useMoodHistory();
  const todayMoods = useTodayMoods();
  const [period, setPeriod] = useState<"week" | "month">("week");

  useEffect(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (period === "week" ? 7 : 30));

    fetchMoodHistory(
      startDate.toISOString().split("T")[0],
      now.toISOString().split("T")[0]
    );
  }, [fetchMoodHistory, period]);

  // Combine today's moods with history
  const allMoods = useMemo(() => {
    const combined = [...todayMoods, ...moodHistory];
    // Remove duplicates by _id and sort by date descending
    const unique = combined.reduce((acc, mood) => {
      if (!acc.find((m) => m._id === mood._id)) {
        acc.push(mood);
      }
      return acc;
    }, [] as IMoodEntry[]);
    return unique.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [todayMoods, moodHistory]);

  // Group moods by date
  const groupedMoods = useMemo(() => {
    const groups: Record<string, IMoodEntry[]> = {};
    allMoods.forEach((mood) => {
      const dateKey = mood.date.split("T")[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(mood);
    });
    return groups;
  }, [allMoods]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout hidePlanBanner bgColor="bg-gray-50">
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/mindfulness")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Mood History</h1>
            <p className="text-sm text-gray-500">Track your emotional patterns</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Quick mood log */}
        <MoodTracker compact />

        {/* Period selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod("week")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              period === "week"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-medium transition-colors",
              period === "month"
                ? "bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Last 30 Days
          </button>
        </div>

        {/* Chart */}
        <MoodHistoryChart
          moodEntries={allMoods}
          days={period === "week" ? 7 : 30}
        />

        {/* Mood entries list */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Mood Entries
          </h3>

          {Object.keys(groupedMoods).length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
              <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No mood entries yet</p>
              <p className="text-sm text-gray-400">
                Start tracking your mood to see patterns
              </p>
            </div>
          ) : (
            Object.entries(groupedMoods).map(([date, moods]) => (
              <div key={date} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 px-1">
                  {formatDate(date)}
                </h4>
                <div className="space-y-2">
                  {moods
                    .sort((a, b) => (a.time > b.time ? -1 : 1))
                    .map((mood) => (
                      <div
                        key={mood._id}
                        className="p-3 bg-white rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {MOOD_EMOJIS[mood.moodCategory]}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium border",
                                    MOOD_COLORS[mood.moodCategory]
                                  )}
                                >
                                  {mood.moodCategory}
                                </span>
                                <span className="text-xs text-gray-400">
                                  Level {mood.moodLevel}/5
                                </span>
                              </div>
                              {mood.triggers && mood.triggers.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Triggers: {mood.triggers.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">{mood.time}</span>
                        </div>
                        {mood.notes && (
                          <p className="text-sm text-gray-600 mt-2 pl-10">
                            {mood.notes}
                          </p>
                        )}
                        {mood.linkedMealType && (
                          <p className="text-xs text-orange-500 mt-1 pl-10">
                            Linked to {mood.linkedMealType}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default MoodHistory;
