import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, Heart, BookOpen, Dumbbell, Utensils, ChevronRight,
  Flame, TrendingUp, Plus, Sparkles, Target, Award,
} from "lucide-react";
import { useCBTStore, useCBTStats, useTodayMoods, useLatestMood } from "@/stores/cbtStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MoodTracker, MOOD_IMAGES } from "@/components/cbt/MoodTracker";
import { ThoughtJournal } from "@/components/cbt/ThoughtJournal";
import { CBTExercises } from "@/components/cbt/CBTExercises";
import { MoodCheckInPrompt } from "@/components/cbt/MoodCheckInPrompt";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // Get streak milestone info
  const getStreakMilestone = (streak: number) => {
    const milestones = [7, 14, 21, 30, 60, 90];
    const nextMilestone = milestones.find(m => m > streak) || streak + 7;
    const prevMilestone = milestones.filter(m => m <= streak).pop() || 0;
    const progress = ((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
    return { nextMilestone, progress: Math.min(100, Math.max(0, progress)) };
  };

  const getStreakMessage = (streak: number, type: "mood" | "cbt") => {
    if (streak === 0) return type === "mood" ? "Log your first mood today!" : "Complete an activity today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return `${7 - streak} days to your first week!`;
    if (streak < 14) return "One week strong! 💪";
    if (streak < 21) return "Two weeks! You're building a habit!";
    if (streak < 30) return "Almost a month! Amazing!";
    return "You're a mindfulness champion! 🏆";
  };

  const getFlameColor = (streak: number) => {
    if (streak >= 30) return "text-orange-500";
    if (streak >= 14) return "text-amber-500";
    if (streak >= 7) return "text-yellow-500";
    return "text-gray-400";
  };

  const moodStreakInfo = getStreakMilestone(cbtStats?.moodCheckStreak || 0);
  const cbtStreakInfo = getStreakMilestone(cbtStats?.cbtActivityStreak || 0);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick mood check */}
      <MoodTracker />

      {/* Enhanced Streaks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-500" />
            Your Streaks
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs text-gray-400 hover:text-gray-600">
                  What's this?
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>Mood Streak:</strong> Days in a row you've logged at least one mood check-in.<br/><br/>
                  <strong>CBT Streak:</strong> Days in a row you've done a mindfulness activity (mood log, thought record, or exercise).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Mood Streak Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-100 relative overflow-hidden">
          {/* Background decoration */}
          {(cbtStats?.moodCheckStreak || 0) >= 7 && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-200/30 rounded-full blur-2xl" />
          )}

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  (cbtStats?.moodCheckStreak || 0) >= 7 ? "bg-orange-100" : "bg-gray-100"
                )}>
                  <Flame className={cn(
                    "w-5 h-5",
                    getFlameColor(cbtStats?.moodCheckStreak || 0),
                    (cbtStats?.moodCheckStreak || 0) >= 7 && "animate-pulse"
                  )} />
                </div>
                <div>
                  <span className="text-sm text-orange-700 font-medium">Mood Streak</span>
                  <p className="text-xs text-orange-500">Daily mood check-ins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-700">
                  {cbtStats?.moodCheckStreak || 0}
                </p>
                <p className="text-xs text-orange-500">days</p>
              </div>
            </div>

            {/* Progress to next milestone */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-orange-600">
                  {getStreakMessage(cbtStats?.moodCheckStreak || 0, "mood")}
                </span>
                <span className="text-orange-500">
                  {moodStreakInfo.nextMilestone} days
                </span>
              </div>
              <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${moodStreakInfo.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CBT Activity Streak Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 border border-purple-100 relative overflow-hidden">
          {/* Background decoration */}
          {(cbtStats?.cbtActivityStreak || 0) >= 7 && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl" />
          )}

          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  (cbtStats?.cbtActivityStreak || 0) >= 7 ? "bg-purple-100" : "bg-gray-100"
                )}>
                  <TrendingUp className={cn(
                    "w-5 h-5",
                    (cbtStats?.cbtActivityStreak || 0) >= 30 ? "text-purple-500" :
                    (cbtStats?.cbtActivityStreak || 0) >= 14 ? "text-violet-500" :
                    (cbtStats?.cbtActivityStreak || 0) >= 7 ? "text-indigo-500" : "text-gray-400",
                    (cbtStats?.cbtActivityStreak || 0) >= 7 && "animate-pulse"
                  )} />
                </div>
                <div>
                  <span className="text-sm text-purple-700 font-medium">CBT Activity Streak</span>
                  <p className="text-xs text-purple-500">Any mindfulness activity</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-700">
                  {cbtStats?.cbtActivityStreak || 0}
                </p>
                <p className="text-xs text-purple-500">days</p>
              </div>
            </div>

            {/* Progress to next milestone */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-purple-600">
                  {getStreakMessage(cbtStats?.cbtActivityStreak || 0, "cbt")}
                </span>
                <span className="text-purple-500">
                  {cbtStreakInfo.nextMilestone} days
                </span>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${cbtStreakInfo.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak tip */}
        {((cbtStats?.moodCheckStreak || 0) === 0 || (cbtStats?.cbtActivityStreak || 0) === 0) && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Sparkles className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> Log a mood check-in or complete a quick exercise to start building your streak. Consistency is key to forming healthy habits!
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Target className="w-4 h-4 text-gray-500" />
          Today's Progress
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickStats.map((stat, i) => {
            const isComplete = stat.target ? stat.value >= stat.target : stat.value > 0;
            return (
              <button
                key={i}
                onClick={stat.onClick}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left relative overflow-hidden group",
                  isComplete
                    ? "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-md"
                    : "bg-white border-gray-200 hover:shadow-md"
                )}
              >
                {/* Completion indicator */}
                {isComplete && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  </div>
                )}

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

                {/* Progress bar for items with targets */}
                {stat.target && (
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isComplete ? "bg-green-400" : "bg-gray-300"
                      )}
                      style={{ width: `${Math.min(100, (stat.value / stat.target) * 100)}%` }}
                    />
                  </div>
                )}

                {/* Hover arrow */}
                <ChevronRight className="absolute right-2 bottom-2 w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-gray-500" />
          Explore More
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => navigate("/mindfulness/mood")}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 hover:shadow-md hover:border-red-200 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Mood History</p>
                <p className="text-sm text-gray-500">View trends and patterns over time</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => navigate("/mindfulness/emotional-eating")}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 hover:shadow-md hover:border-orange-200 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-lg shadow-sm">
                <Utensils className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Emotional Eating Insights</p>
                <p className="text-sm text-gray-500">Understand your eating patterns</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      {/* Latest mood summary */}
      {latestMood && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Your latest mood</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={MOOD_IMAGES[latestMood.moodCategory]}
                alt={latestMood.moodCategory}
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="font-medium text-gray-800 capitalize">{latestMood.moodCategory}</p>
                <p className="text-xs text-gray-500">Level {latestMood.moodLevel}/5 • {latestMood.time}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/mindfulness/mood")}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              View all
            </Button>
          </div>
        </div>
      )}
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
