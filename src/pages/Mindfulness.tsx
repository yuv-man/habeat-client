import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, Heart, BookOpen, Dumbbell, Utensils, ChevronRight,
  Flame, TrendingUp, Plus,
} from "lucide-react";
import { useCBTStore, useCBTStats, useTodayMoods, useLatestMood } from "@/stores/cbtStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoodTracker } from "@/components/cbt/MoodTracker";
import { ThoughtJournal } from "@/components/cbt/ThoughtJournal";
import { CBTExercises } from "@/components/cbt/CBTExercises";
import { MoodCheckInPrompt } from "@/components/cbt/MoodCheckInPrompt";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Mindfulness = () => {
  const navigate = useNavigate();
  const cbtStats = useCBTStats();
  const todayMoods = useTodayMoods();
  const latestMood = useLatestMood();
  const [activeTab, setActiveTab] = useState<"overview" | "mood" | "thoughts" | "exercises">("overview");

  useEffect(() => {
    useCBTStore.getState().fetchCBTStats();
    useCBTStore.getState().fetchTodayMoods();
    useCBTStore.getState().fetchThoughts(5);
  }, []);

  const quickStats = [
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Moods Today",
      value: todayMoods.length,
      target: 3,
      color: "text-red-500 bg-red-50",
      onClick: () => setActiveTab("mood"),
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Thought Records",
      value: cbtStats?.thoughtEntriesLogged || 0,
      color: "text-purple-500 bg-purple-50",
      onClick: () => setActiveTab("thoughts"),
    },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      label: "Exercises Done",
      value: cbtStats?.exercisesCompleted || 0,
      color: "text-blue-500 bg-blue-50",
      onClick: () => setActiveTab("exercises"),
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      label: "Meal Links",
      value: cbtStats?.mealMoodCorrelationsLogged || 0,
      color: "text-orange-500 bg-orange-50",
      onClick: () => navigate("/mindfulness/emotional-eating"),
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <Brain className="w-4 h-4" /> },
    { id: "mood", label: "Mood", icon: <Heart className="w-4 h-4" /> },
    { id: "thoughts", label: "Thoughts", icon: <BookOpen className="w-4 h-4" /> },
    { id: "exercises", label: "Exercises", icon: <Dumbbell className="w-4 h-4" /> },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick mood check */}
      <MoodTracker />

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-orange-600 font-medium">Mood Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-700">
            {cbtStats?.moodCheckStreak || 0} days
          </p>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-purple-600 font-medium">CBT Streak</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {cbtStats?.cbtActivityStreak || 0} days
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat, i) => (
          <button
            key={i}
            onClick={stat.onClick}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all text-left"
          >
            <div className={cn("p-2 rounded-lg inline-block mb-2", stat.color)}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {stat.value}
              {stat.target && (
                <span className="text-sm font-normal text-gray-400">/{stat.target}</span>
              )}
            </p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">Explore</h3>
        <button
          onClick={() => navigate("/mindfulness/mood")}
          className="w-full p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Mood History</p>
              <p className="text-sm text-gray-500">View trends and patterns</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate("/mindfulness/emotional-eating")}
          className="w-full p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Utensils className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Emotional Eating Insights</p>
              <p className="text-sm text-gray-500">Understand your patterns</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout hidePlanBanner bgColor="bg-gray-50">
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Mood check-in modal */}
        <MoodCheckInPrompt />

      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white px-4 pt-12 pb-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Mindfulness</h1>
          </div>
          <p className="text-white/80">
            Track your mood, challenge negative thoughts, and build healthy habits
          </p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "mood" && (
          <div className="space-y-6">
            <MoodTracker />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/mindfulness/mood")}
            >
              View Mood History
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        {activeTab === "thoughts" && <ThoughtJournal />}
        {activeTab === "exercises" && <CBTExercises />}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default Mindfulness;
