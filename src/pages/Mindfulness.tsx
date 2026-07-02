import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain, Heart, BookOpen, Dumbbell, Utensils, ChevronRight,
  Flame, TrendingUp, Sparkles, Target, Lightbulb, Award,
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

// Shared "floating card" treatment matching the redesigned surfaces
const SOFT_LIFT = "shadow-[0_10px_40px_-10px_rgba(63,102,82,0.12)]";

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
      color: "text-green-700 bg-green-50",
      bar: "bg-green-500",
      onClick: () => setActiveTab("mood"),
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      label: "Thought Records",
      value: cbtStats?.thoughtEntriesLogged || 0,
      color: "text-violet-600 bg-violet-50",
      bar: "bg-violet-400",
      onClick: () => setActiveTab("thoughts"),
    },
    {
      icon: <Dumbbell className="w-5 h-5" />,
      label: "Exercises Done",
      value: cbtStats?.exercisesCompleted || 0,
      color: "text-amber-600 bg-amber-50",
      bar: "bg-amber-400",
      onClick: () => setActiveTab("exercises"),
    },
    {
      icon: <Utensils className="w-5 h-5" />,
      label: "Meal Links",
      value: cbtStats?.mealMoodCorrelationsLogged || 0,
      color: "text-rose-500 bg-rose-50",
      bar: "bg-rose-400",
      onClick: () => navigate("/mindfulness/emotional-eating"),
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <Brain className="w-6 h-6" /> },
    { id: "mood", label: "Mood", icon: <Heart className="w-6 h-6" /> },
    { id: "thoughts", label: "Thoughts", icon: <BookOpen className="w-6 h-6" /> },
    { id: "exercises", label: "Exercises", icon: <Dumbbell className="w-6 h-6" /> },
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
    if (streak >= 14) return "text-green-600";
    if (streak >= 7) return "text-green-500";
    return "text-gray-300";
  };

  const moodStreak = cbtStats?.moodCheckStreak || 0;
  const cbtStreak = cbtStats?.cbtActivityStreak || 0;
  const moodStreakInfo = getStreakMilestone(moodStreak);
  const cbtStreakInfo = getStreakMilestone(cbtStreak);
  const daysToMilestone = Math.max(0, moodStreakInfo.nextMilestone - moodStreak);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Mood logger */}
      <MoodTracker />

      {/* Streaks Section */}
      <div className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <TrendingUp className="w-5 h-5" />
            <h3 className="text-xl font-bold">Your Streaks</h3>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-sm font-semibold text-violet-600 hover:underline transition-colors">
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

        {/* Mood Streak Card */}
        <div className={cn("bg-green-800/5 rounded-3xl border border-green-800/10 p-5", SOFT_LIFT)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Flame className={cn("w-7 h-7", getFlameColor(moodStreak), moodStreak >= 7 && "animate-pulse")} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-green-900">Mood Streak</h4>
                <p className="text-sm text-gray-500">Daily check-ins</p>
              </div>
            </div>
            <div className="text-right leading-none">
              <span className="block text-4xl font-bold text-green-800">{moodStreak}</span>
              <span className="text-sm font-semibold text-gray-500">days</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-green-700">{getStreakMessage(moodStreak, "mood")}</span>
              <span className="text-gray-400">{moodStreakInfo.nextMilestone} days</span>
            </div>
            <div className="h-2 bg-green-800/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${moodStreakInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* CBT Activity Streak Card */}
        <div className={cn("bg-violet-500/5 rounded-3xl border border-violet-500/10 p-5", SOFT_LIFT)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm">
                <TrendingUp className={cn(
                  "w-7 h-7",
                  cbtStreak >= 30 ? "text-violet-500" :
                  cbtStreak >= 14 ? "text-violet-500" :
                  cbtStreak >= 7 ? "text-violet-400" : "text-gray-300",
                  cbtStreak >= 7 && "animate-pulse"
                )} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-violet-900">CBT Activity Streak</h4>
                <p className="text-sm text-gray-500">Any mindfulness activity</p>
              </div>
            </div>
            <div className="text-right leading-none">
              <span className="block text-4xl font-bold text-violet-700">{cbtStreak}</span>
              <span className="text-sm font-semibold text-gray-500">days</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-violet-600">{getStreakMessage(cbtStreak, "cbt")}</span>
              <span className="text-gray-400">{cbtStreakInfo.nextMilestone} days</span>
            </div>
            <div className="h-2 bg-violet-500/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${cbtStreakInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bento mini-insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-violet-500/10 p-5 rounded-3xl border border-violet-500/10 border-b-4 border-b-violet-400/40 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <Lightbulb className="w-7 h-7 text-violet-600" />
              <span className="bg-violet-500/15 text-violet-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Insight
              </span>
            </div>
            <p className="text-violet-900 leading-relaxed">
              {latestMood ? (
                <>
                  Your most recent check-in was{" "}
                  <span className="font-bold capitalize">{latestMood.moodCategory}</span>. Noticing your
                  emotions is the first step to understanding your habits.
                </>
              ) : (
                <>Log a mood check-in to start uncovering patterns between how you feel and what you do.</>
              )}
            </p>
          </div>
          <div className="bg-amber-500/10 p-5 rounded-3xl border border-amber-500/10 border-b-4 border-b-amber-400/40 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <Award className="w-7 h-7 text-amber-600" />
              <span className="bg-amber-500/15 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Goal
              </span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              {daysToMilestone > 0 ? (
                <>
                  Log your mood for{" "}
                  <span className="font-bold">
                    {daysToMilestone} more day{daysToMilestone !== 1 ? "s" : ""}
                  </span>{" "}
                  to reach your next milestone.
                </>
              ) : (
                <>You've hit your streak milestone — amazing consistency! 🏆</>
              )}
            </p>
          </div>
        </div>

        {/* Streak tip */}
        {(moodStreak === 0 || cbtStreak === 0) && (
          <div className="flex items-start gap-2 p-4 rounded-2xl bg-green-800/5 border border-green-800/10">
            <Sparkles className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800">
              <strong>Tip:</strong> Log a mood check-in or complete a quick exercise to start building your streak. Consistency is key to forming healthy habits!
            </p>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <Target className="w-5 h-5" />
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
                  "p-4 rounded-3xl border border-gray-200/70 bg-white transition-all text-left relative overflow-hidden group",
                  SOFT_LIFT,
                  "hover:-translate-y-0.5"
                )}
              >
                {isComplete && (
                  <div className="absolute top-3 right-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
                <div className={cn("p-2 rounded-xl inline-block mb-2", stat.color)}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value}
                  {stat.target && (
                    <span className="text-sm font-normal text-gray-300">/{stat.target}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">{stat.label}</p>
                {stat.target && (
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", isComplete ? stat.bar : "bg-gray-200")}
                      style={{ width: `${Math.min(100, (stat.value / stat.target) * 100)}%` }}
                    />
                  </div>
                )}
                <ChevronRight className="absolute right-2 bottom-2 w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Explore More
        </h3>
        <div className="space-y-3">
          {/* Mood History */}
          <button
            onClick={() => navigate("/mindfulness/mood")}
            className={cn(
              "w-full p-4 rounded-3xl border border-green-800/10 bg-green-800/5 hover:bg-green-800/10 transition-all flex items-center justify-between group",
              SOFT_LIFT
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <Heart className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-green-900">Mood History</p>
                <p className="text-xs text-gray-500">View trends and patterns over time</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-green-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Emotional Eating */}
          <button
            onClick={() => navigate("/mindfulness/emotional-eating")}
            className={cn(
              "w-full p-4 rounded-3xl border border-violet-500/10 bg-violet-500/5 hover:bg-violet-500/10 transition-all flex items-center justify-between group",
              SOFT_LIFT
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl shadow-sm">
                <Utensils className="w-5 h-5 text-violet-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-violet-900">Emotional Eating Insights</p>
                <p className="text-xs text-gray-500">Understand your eating patterns</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-violet-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      {/* Latest mood summary */}
      {latestMood && (
        <div className={cn("p-4 rounded-3xl border border-gray-200/70 bg-white", SOFT_LIFT)}>
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Your latest mood</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={MOOD_IMAGES[latestMood.moodCategory]}
                alt={latestMood.moodCategory}
                className="w-12 h-12 object-contain"
              />
              <div>
                <p className="font-semibold text-gray-800 capitalize">{latestMood.moodCategory}</p>
                <p className="text-xs text-gray-400">Level {latestMood.moodLevel}/5 • {latestMood.time}</p>
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

      {/* CBT connection note */}
      <div className="bg-gray-100 p-6 rounded-2xl border-l-4 border-green-800">
        <p className="text-gray-600 italic leading-relaxed">
          "Cognitive Behavioral Therapy (CBT) suggests that by acknowledging our emotional state, we can
          better navigate the thoughts that drive our daily habits. Today's check-in is your first step
          towards mindful action."
        </p>
      </div>
    </div>
  );

  return (
    <DashboardLayout hidePlanBanner bgColor="bg-[#faf9f6]">
      <div className="min-h-screen pb-20 bg-[#faf9f6]">
        {/* Mood check-in modal */}
        <MoodCheckInPrompt />

        {/* Hero */}
        <section
          className="relative overflow-hidden px-5 py-10 md:py-16"
          style={{
            background:
              "linear-gradient(135deg, rgba(166,208,184,0.25) 0%, rgba(229,222,255,0.25) 100%)",
          }}
        >
          <div className="max-w-lg mx-auto relative z-10 flex flex-col items-center text-center gap-6 md:flex-row md:text-left md:gap-8">
            <div className="relative w-40 h-40 md:w-52 md:h-52 flex-shrink-0">
              <div className="absolute inset-0 bg-green-800/10 rounded-full animate-pulse" />
              <img src={wellnessImg} alt="Mindfulness" className="relative z-10 w-full h-full object-contain" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl font-bold text-green-900 tracking-tight">Mindfulness</h1>
              <p className="text-gray-600 max-w-md">
                Understand the connection between your mood and habits. Use CBT-based insights to build a
                more resilient mind.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                <span className="bg-green-800/10 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold border border-green-800/20">
                  CBT Guided
                </span>
                <span className="bg-violet-500/10 text-violet-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-violet-500/20">
                  Daily Check-in
                </span>
              </div>
            </div>
          </div>
          {/* Decorative blurs */}
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-green-800/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Tab selection pill */}
        <div className="px-5 -mt-6 relative z-20">
          <div className={cn(
            "flex justify-between bg-white rounded-full p-1.5 border border-gray-200/60 max-w-md mx-auto",
            SOFT_LIFT
          )}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                title={tab.label}
                aria-label={tab.label}
                className={cn(
                  "flex-1 flex items-center justify-center py-2.5 rounded-full transition-all active:scale-95",
                  activeTab === tab.id
                    ? "text-green-800 bg-green-800/10"
                    : "text-gray-400 hover:text-green-800"
                )}
              >
                {tab.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-lg mx-auto px-5 py-8">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "mood" && (
            <div className="space-y-6">
              <MoodTracker />
              <Button
                variant="outline"
                className="w-full border-green-800/20 text-green-800 hover:bg-green-800/5 hover:border-green-800/30 rounded-2xl"
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
