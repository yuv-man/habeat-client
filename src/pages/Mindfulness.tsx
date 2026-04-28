import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, Heart, BookOpen, Dumbbell, Utensils, ChevronRight,
  Flame, TrendingUp, Sparkles, Target, Award,
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
import wellnessImg from "@/assets/images/wellness.webp";

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
      color: "text-indigo-500 bg-indigo-50",
      bar: "bg-indigo-400",
      onClick: () => setActiveTab("mood"),
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Thought Records",
      value: cbtStats?.thoughtEntriesLogged || 0,
      color: "text-violet-500 bg-violet-50",
      bar: "bg-violet-400",
      onClick: () => setActiveTab("thoughts"),
    },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      label: "Exercises Done",
      value: cbtStats?.exercisesCompleted || 0,
      color: "text-blue-500 bg-blue-50",
      bar: "bg-blue-400",
      onClick: () => setActiveTab("exercises"),
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      label: "Meal Links",
      value: cbtStats?.mealMoodCorrelationsLogged || 0,
      color: "text-purple-500 bg-purple-50",
      bar: "bg-purple-400",
      onClick: () => navigate("/mindfulness/emotional-eating"),
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <Brain className="w-4 h-4" /> },
    { id: "mood", label: "Mood", icon: <Heart className="w-4 h-4" /> },
    { id: "thoughts", label: "Thoughts", icon: <BookOpen className="w-4 h-4" /> },
    { id: "exercises", label: "Exercises", icon: <Dumbbell className="w-4 h-4" /> },
  ];

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
    if (streak >= 30) return "text-violet-500";
    if (streak >= 14) return "text-indigo-500";
    if (streak >= 7) return "text-blue-400";
    return "text-slate-300";
  };

  const moodStreakInfo = getStreakMilestone(cbtStats?.moodCheckStreak || 0);
  const cbtStreakInfo = getStreakMilestone(cbtStats?.cbtActivityStreak || 0);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick mood check */}
      <MoodTracker />

      {/* Streaks Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-400" />
            Your Streaks
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-xs text-indigo-300 hover:text-indigo-500 transition-colors">
                  What's this?
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>Mood Streak:</strong> Days in a row you've logged at least one mood check-in.<br /><br />
                  <strong>CBT Streak:</strong> Days in a row you've done a mindfulness activity (mood log, thought record, or exercise).
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Mood Streak Card — periwinkle */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-periwinkle-50 border border-indigo-100 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #eff6ff 0%, #eef2ff 50%, #f5f3ff 100%)" }}>
          {(cbtStats?.moodCheckStreak || 0) >= 7 && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-200/40 rounded-full blur-2xl" />
          )}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-xl",
                  (cbtStats?.moodCheckStreak || 0) >= 7 ? "bg-indigo-100" : "bg-white/70"
                )}>
                  <Flame className={cn(
                    "w-5 h-5",
                    getFlameColor(cbtStats?.moodCheckStreak || 0),
                    (cbtStats?.moodCheckStreak || 0) >= 7 && "animate-pulse"
                  )} />
                </div>
                <div>
                  <span className="text-sm text-indigo-700 font-semibold">Mood Streak</span>
                  <p className="text-xs text-indigo-400">Daily mood check-ins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-700">
                  {cbtStats?.moodCheckStreak || 0}
                </p>
                <p className="text-xs text-indigo-400">days</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-indigo-600">
                  {getStreakMessage(cbtStats?.moodCheckStreak || 0, "mood")}
                </span>
                <span className="text-indigo-400">
                  {moodStreakInfo.nextMilestone} days
                </span>
              </div>
              <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${moodStreakInfo.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CBT Activity Streak Card — lavender */}
        <div className="p-4 rounded-2xl border border-violet-100 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 40%, #eef2ff 100%)" }}>
          {(cbtStats?.cbtActivityStreak || 0) >= 7 && (
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-violet-200/40 rounded-full blur-2xl" />
          )}
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-xl",
                  (cbtStats?.cbtActivityStreak || 0) >= 7 ? "bg-violet-100" : "bg-white/70"
                )}>
                  <TrendingUp className={cn(
                    "w-5 h-5",
                    (cbtStats?.cbtActivityStreak || 0) >= 30 ? "text-violet-500" :
                    (cbtStats?.cbtActivityStreak || 0) >= 14 ? "text-purple-500" :
                    (cbtStats?.cbtActivityStreak || 0) >= 7 ? "text-indigo-400" : "text-slate-300",
                    (cbtStats?.cbtActivityStreak || 0) >= 7 && "animate-pulse"
                  )} />
                </div>
                <div>
                  <span className="text-sm text-violet-700 font-semibold">CBT Activity Streak</span>
                  <p className="text-xs text-violet-400">Any mindfulness activity</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-violet-700">
                  {cbtStats?.cbtActivityStreak || 0}
                </p>
                <p className="text-xs text-violet-400">days</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-violet-600">
                  {getStreakMessage(cbtStats?.cbtActivityStreak || 0, "cbt")}
                </span>
                <span className="text-violet-400">
                  {cbtStreakInfo.nextMilestone} days
                </span>
              </div>
              <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${cbtStreakInfo.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Streak tip */}
        {((cbtStats?.moodCheckStreak || 0) === 0 || (cbtStats?.cbtActivityStreak || 0) === 0) && (
          <div className="flex items-start gap-2 p-3 rounded-xl border border-indigo-100"
            style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)" }}>
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-700">
              <strong>Tip:</strong> Log a mood check-in or complete a quick exercise to start building your streak. Consistency is key to forming healthy habits!
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="space-y-3">
        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
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
                  "p-4 rounded-2xl border transition-all text-left relative overflow-hidden group",
                  isComplete
                    ? "bg-white border-indigo-100 hover:shadow-md hover:shadow-indigo-100/50"
                    : "bg-white border-slate-100 hover:shadow-md hover:shadow-indigo-100/30"
                )}
              >
                {isComplete && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-indigo-300 rounded-full" />
                  </div>
                )}
                <div className={cn("p-2 rounded-xl inline-block mb-2", stat.color)}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-slate-700">
                  {stat.value}
                  {stat.target && (
                    <span className="text-sm font-normal text-slate-300">/{stat.target}</span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{stat.label}</p>
                {stat.target && (
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isComplete ? stat.bar : "bg-slate-200")}
                      style={{ width: `${Math.min(100, (stat.value / stat.target) * 100)}%` }}
                    />
                  </div>
                )}
                <ChevronRight className="absolute right-2 bottom-2 w-4 h-4 text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          Explore More
        </h3>
        <div className="space-y-2">
          {/* Mood History */}
          <button
            onClick={() => navigate("/mindfulness/mood")}
            className="w-full p-4 rounded-2xl border border-indigo-100 hover:shadow-md hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all flex items-center justify-between group"
            style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <Heart className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-indigo-900">Mood History</p>
                <p className="text-xs text-indigo-400">View trends and patterns over time</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Emotional Eating */}
          <button
            onClick={() => navigate("/mindfulness/emotional-eating")}
            className="w-full p-4 rounded-2xl border border-violet-100 hover:shadow-md hover:shadow-violet-100/50 hover:border-violet-200 transition-all flex items-center justify-between group"
            style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <Utensils className="w-5 h-5 text-violet-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-violet-900">Emotional Eating Insights</p>
                <p className="text-xs text-violet-400">Understand your eating patterns</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-violet-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      {/* Latest mood summary */}
      {latestMood && (
        <div className="p-4 rounded-2xl border border-indigo-100"
          style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)" }}>
          <p className="text-xs text-indigo-400 mb-2 font-medium uppercase tracking-wide">Your latest mood</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={MOOD_IMAGES[latestMood.moodCategory]}
                alt={latestMood.moodCategory}
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="font-semibold text-indigo-900 capitalize">{latestMood.moodCategory}</p>
                <p className="text-xs text-indigo-400">Level {latestMood.moodLevel}/5 • {latestMood.time}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/mindfulness/mood")}
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout hidePlanBanner bgColor="bg-slate-50">
      <div className="min-h-screen pb-20" style={{ background: "linear-gradient(180deg, #eef2ff 0%, #f8f7ff 40%, #f5f3ff 100%)" }}>
        {/* Mood check-in modal */}
        <MoodCheckInPrompt />

        {/* Header */}
        <div className="text-white p-4 "
          style={{ background: "linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)" }}>
          <div className="max-w-lg mx-auto">
            {/* Soft glow decorations */}
            <div className="absolute right-8 top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-4 top-8 w-20 h-20 bg-blue-200/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex flex-row items-center justify-start">
              <img src={wellnessImg} alt="Wellness" className="size-40" />
                <div className="relative flex flex-col gap-1 items-start justify-center">
                <h1 className="text-2xl font-bold tracking-tight">Mindfulness</h1>
                <p className="text-white/75 text-sm leading-relaxed">
                  Track your mood, 
                  <br />
                  challenge negative thoughts,
                  <br />
                  and build healthy habits
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-indigo-100 shadow-sm shadow-indigo-100/30">
          <div className="max-w-lg mx-auto px-4">
            <div className="flex gap-1 py-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
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
                className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl"
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
