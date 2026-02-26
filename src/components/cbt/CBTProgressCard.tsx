import { useEffect } from "react";
import { Brain, Heart, Dumbbell, Utensils, Flame, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCBTStore, useCBTStats, useTodayMoods } from "@/stores/cbtStore";
import { cn } from "@/lib/utils";

interface CBTProgressCardProps {
  className?: string;
  compact?: boolean;
}

export function CBTProgressCard({ className, compact = false }: CBTProgressCardProps) {
  const navigate = useNavigate();
  const loading = useCBTStore((s) => s.loading);
  const cbtStats = useCBTStats();
  const todayMoods = useTodayMoods();

  useEffect(() => {
    useCBTStore.getState().fetchCBTStats();
    useCBTStore.getState().fetchTodayMoods();
  }, []);

  const stats = [
    {
      icon: <Heart className="w-4 h-4" />,
      label: "Moods Today",
      value: todayMoods.length,
      target: 3,
      color: "text-red-500 bg-red-50",
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: "Thoughts",
      value: cbtStats?.thoughtEntriesLogged || 0,
      color: "text-purple-500 bg-purple-50",
    },
    {
      icon: <Dumbbell className="w-4 h-4" />,
      label: "Exercises",
      value: cbtStats?.exercisesCompleted || 0,
      color: "text-blue-500 bg-blue-50",
    },
    {
      icon: <Utensils className="w-4 h-4" />,
      label: "Meal Links",
      value: cbtStats?.mealMoodCorrelationsLogged || 0,
      color: "text-orange-500 bg-orange-50",
    },
  ];

  const moodStreak = cbtStats?.moodCheckStreak || 0;
  const cbtStreak = cbtStats?.cbtActivityStreak || 0;

  if (compact) {
    return (
      <button
        onClick={() => navigate("/mindfulness")}
        className={cn(
          "w-full p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 hover:shadow-md transition-all text-left group",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500 rounded-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Mindfulness</p>
              <p className="text-xs text-purple-500">
                {todayMoods.length} mood{todayMoods.length !== 1 ? "s" : ""} logged today
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-gray-200 shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Mindfulness</h3>
            <p className="text-xs text-gray-500">Your CBT progress</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/mindfulness")}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Streaks */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-orange-600 font-medium">Mood Streak</span>
          </div>
          <p className="text-xl font-bold text-orange-700 mt-1">{moodStreak} days</p>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-purple-600 font-medium">CBT Streak</span>
          </div>
          <p className="text-xl font-bold text-purple-700 mt-1">{cbtStreak} days</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center p-2 rounded-lg bg-gray-50"
          >
            <div className={cn("p-1.5 rounded-lg mb-1", stat.color)}>
              {stat.icon}
            </div>
            <span className="text-lg font-bold text-gray-800">
              {stat.value}
              {stat.target && (
                <span className="text-xs font-normal text-gray-400">/{stat.target}</span>
              )}
            </span>
            <span className="text-xs text-gray-500 text-center">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Emotional eating awareness */}
      {cbtStats?.emotionalEatingAwareness !== undefined && cbtStats.emotionalEatingAwareness > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Emotional Eating Awareness</span>
            <span className="text-xs font-medium text-gray-700">
              {cbtStats.emotionalEatingAwareness}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, cbtStats.emotionalEatingAwareness)}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick action */}
      <button
        onClick={() => navigate("/mindfulness")}
        className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-indigo-700 transition-all"
      >
        Open Mindfulness Hub
      </button>
    </div>
  );
}
