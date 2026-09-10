import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/dailyScreen.css";
import { Trash2, Check, Droplet, ArrowRight, Flame } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import {
  IDailyProgress,
  WorkoutData,
  IMeal,
  MoodCategory,
  MoodLevel,
  IDailyReflection,
  EatingTrigger,
} from "@/types/interfaces";
import { MoodCheckInCard, moodIndexOf } from "@/components/cbt/MoodCheckInCard";
import MealLoader from "../helper/MealLoader";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import MealCard from "./MealCard";
import { useProgressStore } from "@/stores/progressStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useEngagementStore } from "@/stores/engagementStore";
import { useCBTStore } from "@/stores/cbtStore";
import { getWorkoutImageVite } from "@/lib/workoutImageHelper";
import { formatTime12Hour, formatDisplayDate, toLocalDateString } from "@/lib/dateUtils";
import { usePatternStore, MealSlot, MissReason } from "@/stores/patternStore";
import { LATE_NIGHT_HOUR } from "@/lib/mindfulEating";
import FastingClock from "./FastingClock";
import { LevelUpCelebration } from "@/components/engagement";
import { useShowMacros } from "@/hooks/useShowMacros";
import { ChallengesBanner, ChallengeClaimCelebration } from "@/components/challenges";
import { DeleteWorkoutModal } from "./DeleteWorkoutModal";
import { ExpiredPlanCard } from "./ExpiredPlanCard";
import FloatingActionButton from "./FloatingActionButton";
import AddSnackModal from "@/components/modals/AddSnackModal";
import WorkoutModal from "@/components/modals/WorkoutModal";
import PatternObservationCard from "./PatternObservationCard";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";

const CIRCUMFERENCE = 314.16; // 2 * Math.PI * 50

const formatDayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
};

const DailyMealScreen = () => {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());

  const userId = useAuthStore((state) => state.user?._id);
  const user = useAuthStore((state) => state.user);
  const plan = useAuthStore((state) => state.plan);
  const showMacros = useShowMacros();

  const todayProgress = useProgressStore((state) => state.todayProgress);
  const progressLoading = useProgressStore((state) => state.loading);
  const fetchTodayProgress = useProgressStore((state) => state.fetchTodayProgress);
  const setTodayProgress = useProgressStore((state) => state.setTodayProgress);
  const addWaterGlassToStore = useProgressStore((state) => state.addWaterGlass);

  const fetchFavorites = useFavoritesStore((state) => state.fetchFavorites);

  const fetchEngagementStats = useEngagementStore((state) => state.fetchStats);
  const engagementStats = useEngagementStore((state) => state.stats);
  const engagementLoading = useEngagementStore((state) => state.loading);

  const logMood = useCBTStore((state) => state.logMood);
  const updateMood = useCBTStore((state) => state.updateMood);
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);
  const [moodEntryId, setMoodEntryId] = useState<string | null>(null);
  const [reflection, setReflection] = useState<IDailyReflection | null>(null);
  const reflectionSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordPattern = usePatternStore((state) => state.record);
  /** Skip reasons given before any mood was logged today. The daily reflection
   *  hangs off a mood entry, so without one there is nothing to attach to —
   *  rather than drop the answer, it waits here and flushes on the next
   *  check-in. Losing it would silently penalise exactly the users who skip
   *  meals *and* check-ins, who are the ones this is for. */
  const pendingSkipTriggersRef = useRef<EatingTrigger[]>([]);

  const todayMoodEntries = useCBTStore((state) => state.todayMoodEntries);

  /**
   * Restore a mood already logged today.
   *
   * Without this the card comes back blank every time the screen remounts, so
   * a user who checked in at breakfast and returns at lunch sees an unanswered
   * question and logs the same feeling twice. It also strands the reflection:
   * the follow-up only attaches to a mood entry the screen is holding, so
   * forgetting the entry means the only way back to it is a duplicate log.
   *
   * Date-filtered because the store persists these across sessions, and
   * yesterday's mood is not today's answer.
   */
  useEffect(() => {
    if (selectedMoodIndex !== null) return;
    const today = toLocalDateString(new Date());
    const latest = [...todayMoodEntries]
      .reverse()
      .find((entry) => entry.date === today);
    if (!latest) return;

    const index = moodIndexOf(latest.moodCategory);
    if (index === null) return;

    setSelectedMoodIndex(index);
    setMoodEntryId(latest._id ?? null);
    if (latest.reflection) setReflection(latest.reflection);
  }, [todayMoodEntries, selectedMoodIndex]);

  const isPlanExpired = useMemo(() => {
    if (!plan?.weeklyPlan) return false;
    const dates = Object.keys(plan.weeklyPlan).sort();
    if (dates.length === 0) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDate = new Date(dates[dates.length - 1]);
    lastDate.setHours(0, 0, 0, 0);
    return lastDate < today;
  }, [plan]);

  const [dailyProgress, setDailyProgress] = useState<IDailyProgress | null>(null);
  const [workoutToDelete, setWorkoutToDelete] = useState<WorkoutData | null>(null);
  const [showAddSnackModal, setShowAddSnackModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [isAddingSnack, setIsAddingSnack] = useState(false);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!userId || hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchTodayProgress(userId);
    fetchFavorites(userId);
    fetchEngagementStats();
  }, [userId, fetchTodayProgress, fetchFavorites, fetchEngagementStats]);

  const planId = plan?._id?.toString();
  useEffect(() => {
    if (!userId || !planId || !hasFetchedRef.current) return;
    fetchTodayProgress(userId, true);
  }, [planId, userId]);

  useEffect(() => {
    if (!engagementStats && !engagementLoading) fetchEngagementStats();
  }, [engagementStats, engagementLoading, fetchEngagementStats]);

  useEffect(() => {
    if (todayProgress) setDailyProgress(todayProgress);
  }, [todayProgress]);

  const loading = progressLoading;
  const mealTimes = useAuthStore((state) => state.mealTimes);

  const getMealTime = (mealType: string) => {
    const time = mealTimes[mealType as keyof typeof mealTimes] || "12:00";
    return formatTime12Hour(time);
  };

  // Derive which meal slots are active given the user's fasting schedule.
  // A slot with an empty mealTimes entry is outside the eating window.
  const activeSlots = useMemo<Set<string>>(() => {
    if (user?.fastingHours && user?.fastingStartTime) {
      const active = new Set<string>();
      const [fh, fm] = user.fastingStartTime.split(":").map(Number);
      const fastStartMin = (fh ?? 0) * 60 + (fm ?? 0);
      const eatStartMin = (fastStartMin + user.fastingHours * 60) % 1440;
      const eatEndMin = fastStartMin;
      const SLOT_TIMES: Record<string, number> = {
        breakfast: 8 * 60,
        lunch: 12 * 60 + 30,
        snacks: 15 * 60,
        dinner: 18 * 60 + 30,
      };
      const inWindow = (t: number) =>
        eatStartMin < eatEndMin
          ? t >= eatStartMin && t < eatEndMin
          : t >= eatStartMin || t < eatEndMin;
      Object.entries(SLOT_TIMES).forEach(([slot, t]) => {
        if (inWindow(t)) active.add(slot);
      });
      return active;
    }
    return new Set(["breakfast", "lunch", "dinner", "snacks"]);
  }, [user?.fastingHours, user?.fastingStartTime]);

  /**
   * `missed` is the state the screen was previously unable to express: a meal
   * whose window has closed with nothing logged against it. It used to collapse
   * into `past`, which made "I ate it and marked it done" and "lunch never
   * happened" render identically — the second one being the case actually worth
   * a word.
   *
   * Only ever returned for today. On a day that's already over there is nothing
   * to recover and no reason to re-litigate it.
   */
  const getMealStatus = (
    meal: IMeal,
    mealType: string
  ): "past" | "current" | "future" | "missed" => {
    if (mealType === "snacks") return meal.done ? "past" : "future";
    if (meal.done) return "past";

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const isToday = dailyProgress?.date
      ? toLocalDateString(dailyProgress.date) === toLocalDateString(now)
      : false;
    // Reached only when the meal is not done, so a closed window means missed.
    const closed = (): "past" | "missed" => (isToday ? "missed" : "past");

    const parseTime = (key: string, fallback: number) => {
      const t = mealTimes[key as keyof typeof mealTimes];
      if (!t) return fallback;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    // Build the ordered list of active main-meal slots (snacks handled above).
    // For fasting users breakfast may not be active, so we must not gate lunch
    // on breakfast's status.
    const orderedMainSlots = (["breakfast", "lunch", "dinner"] as const).filter(
      (s) => activeSlots.has(s)
    );

    const slotTime: Record<string, number> = {
      breakfast: parseTime("breakfast", 8 * 60),
      lunch: parseTime("lunch", 12 * 60 + 30),
      dinner: parseTime("dinner", 19 * 60),
    };
    const midnight = 24 * 60;

    const idx = orderedMainSlots.indexOf(mealType as "breakfast" | "lunch" | "dinner");
    if (idx === -1) return "future";

    const thisTime = slotTime[mealType];
    const nextSlot = orderedMainSlots[idx + 1];
    const nextTime = nextSlot ? slotTime[nextSlot] : midnight;

    // Previous slot is done or its window has closed
    const prevSlot = orderedMainSlots[idx - 1];
    const prevDone = prevSlot
      ? (dailyProgress?.meals?.[prevSlot]?.done || currentTime >= nextTime - 60)
      : true; // no previous slot → always "past"

    if (prevDone) return currentTime < nextTime - 60 ? "current" : closed();
    if (currentTime < thisTime) return "future";
    return currentTime < nextTime - 60 ? "current" : closed();
  };

  /**
   * Which snack, if any, opens its mood check-in expanded.
   *
   * Late evening is when a snack is most worth a second's thought, but only one
   * card should say so — every unfinished snack springing open at 10pm would be
   * nagging, not noticing. The last unfinished snack is the one most likely to
   * be the one in hand.
   */
  const promptMoodCheckOnSnackIndex = useMemo(() => {
    if (new Date().getHours() < LATE_NIGHT_HOUR) return -1;
    const snacks = dailyProgress?.meals?.snacks;
    if (!snacks?.length) return -1;
    for (let i = snacks.length - 1; i >= 0; i--) {
      if (!snacks[i].done) return i;
    }
    return -1;
  }, [dailyProgress]);

  /**
   * Whether "What shaped your eating today?" is a question this user can
   * actually answer yet.
   *
   * Two ways it becomes answerable: something has been eaten, or the day has
   * run far enough past their own lunch time that meals have plausibly
   * happened whether or not they were logged — in which case "too busy" is a
   * real answer and worth capturing.
   *
   * Before either, it is not a question at all. Someone opening the app at
   * 7am to log that they feel calm has eaten nothing, and asking what shaped
   * their eating makes the app look like it isn't listening.
   */
  const canReflectOnEating = useMemo(() => {
    const meals = dailyProgress?.meals;
    const ateSomething = Boolean(
      meals?.breakfast?.done ||
        meals?.lunch?.done ||
        meals?.dinner?.done ||
        meals?.snacks?.some((snack) => snack.done)
    );
    if (ateSomething) return true;

    const [h, m] = (mealTimes?.lunch ?? "12:30").split(":").map(Number);
    const lunchMinutes = (Number.isFinite(h) ? h : 12) * 60 + (Number.isFinite(m) ? m : 30);
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() >= lunchMinutes;
  }, [dailyProgress, mealTimes]);

  const addWaterGlass = async () => {
    if (user?._id) await addWaterGlassToStore(user._id, currentDate.toISOString());
  };

  const handleMoodSelect = async (index: number, category: MoodCategory, level: MoodLevel) => {
    setSelectedMoodIndex(index);
    const now = new Date();
    try {
      const entry = await logMood({
        // Local, not UTC: an evening check-in west of Greenwich was being
        // filed against tomorrow, leaving today looking like a missed day.
        date: toLocalDateString(now),
        time: now.toTimeString().slice(0, 5),
        moodCategory: category,
        moodLevel: level,
        triggers: [],
        notes: "",
      });
      // Held so the reflection can attach to this entry as the user answers
      setMoodEntryId(entry?._id ?? null);

      // Any skip reasons given earlier today now have somewhere to live.
      if (entry?._id && pendingSkipTriggersRef.current.length > 0) {
        mergeReflectionTriggers(pendingSkipTriggersRef.current, entry._id);
        pendingSkipTriggersRef.current = [];
      }

      // Confirmation so the user knows the feeling was saved
      const label = category.charAt(0).toUpperCase() + category.slice(1);
      toast.success(`Feeling logged: ${label}`, {
        description: "Keep tracking to build your streak!",
        duration: 3000,
      });
    } catch {
      // mood log is non-critical
      setSelectedMoodIndex(null);
    }
  };

  /** The reflection saves on its own, a beat after the last tap — no submit
   *  step, and nothing is lost if the user stops partway through. */
  const handleReflectionChange = (next: IDailyReflection) => {
    setReflection(next);
    if (!moodEntryId) return;

    if (reflectionSaveRef.current) clearTimeout(reflectionSaveRef.current);
    reflectionSaveRef.current = setTimeout(() => {
      // Reflection is supplementary to the mood that's already saved; a failed
      // write shouldn't interrupt the screen or undo the selection.
      updateMood(moodEntryId, { reflection: next }).catch(() => {});
    }, 700);
  };

  /** Merges triggers into today's reflection without clobbering what the user
   *  ticked by hand, and writes through when there's an entry to write to. */
  const mergeReflectionTriggers = (
    triggers: EatingTrigger[],
    entryId: string | null
  ) => {
    if (triggers.length === 0) return;

    setReflection((prev) => {
      const merged: IDailyReflection = {
        easedBy: prev?.easedBy ?? [],
        hinderedBy: Array.from(
          new Set([...(prev?.hinderedBy ?? []), ...triggers])
        ),
      };
      if (entryId) {
        updateMood(entryId, { reflection: merged }).catch(() => {});
      }
      return merged;
    });
  };

  /**
   * A meal's window closed with nothing logged, and the user told us why.
   *
   * The reason goes three places, because each one answers a different
   * question: the pattern log so today's dashboard can react, the daily
   * reflection so it counts toward the same trigger totals as every other
   * self-report, and — for `stress` — the panel's own offer of a breathing
   * exercise. `not-hungry` is recorded but deliberately not filed as a
   * trigger; not being hungry isn't a problem needing a solution.
   */
  const handleMealMissed = (mealType: MealSlot, reason: MissReason | null) => {
    recordPattern({
      kind: "missed-meal",
      date: toLocalDateString(dailyProgress?.date ?? currentDate),
      mealType,
      reason,
    });

    if (!reason || reason === "not-hungry") return;

    if (moodEntryId) {
      mergeReflectionTriggers([reason], moodEntryId);
    } else {
      pendingSkipTriggersRef.current = Array.from(
        new Set([...pendingSkipTriggersRef.current, reason])
      );
    }
  };

  useEffect(() => {
    return () => {
      if (reflectionSaveRef.current) clearTimeout(reflectionSaveRef.current);
    };
  }, []);

  const handleDeleteWorkout = async (workout: WorkoutData) => {
    if (!user?._id || !dailyProgress) return;
    try {
      const workoutData: WorkoutData = {
        name: workout.name,
        category: workout.category,
        caloriesBurned: workout.caloriesBurned,
        duration: workout.duration,
      };
      const updatedWorkouts = dailyProgress.workouts.filter((w) => w.name !== workout.name);
      const updatedProgress = { ...dailyProgress, workouts: updatedWorkouts };
      if (config.testFrontend) { setTodayProgress(updatedProgress); return; }
      await userAPI.deleteWorkout(user._id, currentDate.toISOString().split("T")[0], workoutData);
      setTodayProgress(updatedProgress);
    } catch (error) {
      console.error("Failed to delete workout:", error);
    }
  };

  const handleCompleteWorkout = async (workoutIndex: number) => {
    if (!user?._id || !dailyProgress) return;
    const workout = dailyProgress.workouts[workoutIndex];
    if (!workout) return;
    const newDoneState = !(workout.done ?? false);
    const workoutData: WorkoutData = {
      name: workout.name,
      category: workout.category,
      caloriesBurned: workout.caloriesBurned,
      duration: workout.duration,
      done: newDoneState,
    };
    const originalProgress = { ...dailyProgress };
    const updatedWorkouts = [...dailyProgress.workouts];
    updatedWorkouts[workoutIndex] = { ...workout, done: newDoneState };
    setTodayProgress({ ...dailyProgress, workouts: updatedWorkouts });
    if (newDoneState) toast.success("💪 Well done! Keep crushing it!", { duration: 3000 });
    if (config.testFrontend) return;
    try {
      await userAPI.completeWorkout(user._id, currentDate.toISOString(), workoutData);
    } catch (error) {
      console.error("Failed to complete workout:", error);
      setTodayProgress(originalProgress);
      toast.error("Failed to update workout. Please try again.");
    }
  };

  const getExpiredDateInfo = () => {
    if (!plan?.weeklyPlan) return null;
    const dates = Object.keys(plan.weeklyPlan).sort();
    if (dates.length === 0) return null;
    return formatDisplayDate(dates[dates.length - 1]);
  };

  const handleAddSnack = async (snackName: string, time?: string, photoBase64?: string) => {
    if (!user?._id || !plan?._id || !dailyProgress) return;
    setIsAddingSnack(true);
    try {
      const dateStr = currentDate.toISOString().split("T")[0];
      await userAPI.addSnack(plan._id, dateStr, snackName.trim(), time, photoBase64);
      await fetchTodayProgress(user._id, true);
      toast.success("Snack added successfully!");
      setShowAddSnackModal(false);
    } catch (error) {
      console.error("Failed to add snack:", error);
      toast.error("Failed to add snack. Please try again.");
    } finally {
      setIsAddingSnack(false);
    }
  };

  const handleAddWorkout = async (workout: WorkoutData) => {
    if (!user?._id || !dailyProgress) return;
    try {
      const dateStr = currentDate.toISOString().split("T")[0];
      await userAPI.addWorkout(user._id, { ...workout, date: dateStr });
      await fetchTodayProgress(user._id, true);
      toast.success("Workout added successfully!");
      setShowWorkoutModal(false);
    } catch (error) {
      console.error("Failed to add workout:", error);
      toast.error("Failed to add workout. Please try again.");
    }
  };

  return (
    <>
      <LevelUpCelebration />
      <ChallengeClaimCelebration />

      {workoutToDelete && (
        <DeleteWorkoutModal
          workout={workoutToDelete}
          onCancel={() => setWorkoutToDelete(null)}
          onConfirm={(workout) => { handleDeleteWorkout(workout); setWorkoutToDelete(null); }}
        />
      )}

      <div className="min-h-screen bg-[#f8faf9]">
        {loading ? (
          <MealLoader />
        ) : isPlanExpired ? (
          <ExpiredPlanCard expiredDate={getExpiredDateInfo()} />
        ) : !dailyProgress ? (
          <div className="min-h-screen flex items-center justify-center flex-col gap-4 p-6">
            <p className="text-xl font-semibold text-gray-700 text-center">No Daily Progress Available</p>
            <p className="text-gray-500 text-center">Your daily progress will appear here once available.</p>
          </div>
        ) : (
          <div className="px-4 py-5 space-y-5 pb-28">

            {/* ── Date & Streak ───────────────────────────────────────── */}
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {formatDayDate(dailyProgress.date)}
              </p>
              {engagementStats && (
                <div className="flex items-center gap-1.5 bg-orange-50 border-b-2 border-orange-200 px-3 py-1.5 rounded-full">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-700">
                    {engagementStats.streak || 0} Day Streak
                  </span>
                </div>
              )}
            </div>

            {/* ── Mood Check-in ────────────────────────────────────────── */}
            <MoodCheckInCard
              firstName={user?.name?.split(" ")[0]}
              selectedIndex={selectedMoodIndex}
              onSelect={handleMoodSelect}
              reflection={reflection}
              onReflectionChange={handleReflectionChange}
              showReflection={canReflectOnEating}
            />

            {/* ── Pattern noticed ──────────────────────────────────────── */}
            <SectionErrorBoundary label="your patterns">
              <PatternObservationCard />
            </SectionErrorBoundary>

            {/* ── Challenges Banner ────────────────────────────────────── */}
            <SectionErrorBoundary label="challenges">
              <ChallengesBanner className="!mb-0" />
            </SectionErrorBoundary>

            {/* ── Fasting Clock ────────────────────────────────────────── */}
            {user?.fastingHours && user?.fastingStartTime && (
              <FastingClock fastingHours={user.fastingHours} fastingStartTime={user.fastingStartTime} />
            )}

            {/* ── Daily Nutrients ──────────────────────────────────────── */}
            {(() => {
              const consumed = dailyProgress.caloriesConsumed || 0;
              const goal = dailyProgress.caloriesGoal || 2000;
              const remaining = Math.max(0, goal - consumed);
              const pct = goal > 0 ? Math.min(consumed / goal, 1) : 0;
              const offset = CIRCUMFERENCE * (1 - pct);
              const overallPct = Math.round(pct * 100);

              const proteinConsumed = dailyProgress.protein.consumed || 0;
              const proteinGoal = dailyProgress.protein.goal || 140;
              const proteinPct = Math.min(Math.round((proteinConsumed / proteinGoal) * 100), 100);

              const carbsConsumed = dailyProgress.carbs.consumed || 0;
              const carbsGoal = dailyProgress.carbs.goal || 250;
              const carbsPct = Math.min(Math.round((carbsConsumed / carbsGoal) * 100), 100);

              const fatConsumed = dailyProgress.fat.consumed || 0;
              const fatGoal = dailyProgress.fat.goal || 65;
              const fatPct = Math.min(Math.round((fatConsumed / fatGoal) * 100), 100);

              return (
                <section>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-gray-500">Daily Nutrients</h3>
                    <span className="text-xs font-bold text-habeat">{overallPct}% of Goal</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-5">
                      {/* Calories donut */}
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
                          <circle cx="56" cy="56" r="50" fill="transparent" stroke="#e6e9e8" strokeWidth="8" />
                          <circle
                            cx="56" cy="56" r="50"
                            fill="transparent"
                            className="stroke-habeat"
                            strokeWidth="8"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {showMacros ? (
                            <span className="text-xl font-bold text-habeat">
                              {remaining.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xl font-bold text-habeat">
                              {overallPct}%
                            </span>
                          )}
                          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 mb-1" />
                          <span className="text-[10px] uppercase tracking-widest text-gray-400 leading-none">
                            {showMacros ? "Left" : "of Goal"}
                          </span>
                        </div>
                      </div>

                      {/* Macro bars */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-semibold text-gray-500">Protein</span>
                            <span className="text-sm font-bold text-gray-900">
                              {showMacros ? (
                                <>
                                  {proteinConsumed}g{" "}
                                  <span className="text-xs font-normal text-gray-400">/ {proteinGoal}g</span>
                                </>
                              ) : (
                                `${proteinPct}%`
                              )}
                            </span>
                          </div>
                          <div className="h-2.5 bg-purple-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-300 rounded-full transition-all duration-500" style={{ width: `${proteinPct}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-semibold text-gray-500">Carbs</span>
                            <span className="text-sm font-bold text-gray-900">
                              {showMacros ? (
                                <>
                                  {carbsConsumed}g{" "}
                                  <span className="text-xs font-normal text-gray-400">/ {carbsGoal}g</span>
                                </>
                              ) : (
                                `${carbsPct}%`
                              )}
                            </span>
                          </div>
                          <div className="h-2.5 bg-teal-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-300 rounded-full transition-all duration-500" style={{ width: `${carbsPct}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-semibold text-gray-500">Fats</span>
                            <span className="text-sm font-bold text-gray-900">
                              {showMacros ? (
                                <>
                                  {fatConsumed}g{" "}
                                  <span className="text-xs font-normal text-gray-400">/ {fatGoal}g</span>
                                </>
                              ) : (
                                `${fatPct}%`
                              )}
                            </span>
                          </div>
                          <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-300 rounded-full transition-all duration-500" style={{ width: `${fatPct}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* ── Today's Meals ────────────────────────────────────────── */}
            <section>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-gray-500">Today's Meals</h3>
                <button
                  onClick={() => navigate("/weekly-overview")}
                  className="flex items-center gap-1 text-xs font-semibold text-habeat transition-opacity hover:opacity-70"
                >
                  See All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-3">
                {/* Fasting window badge — shown once at the top when any main meal is skipped */}
                {user?.fastingHours && user?.fastingStartTime && !activeSlots.has("breakfast") && (() => {
                  const [fh, fm] = user.fastingStartTime.split(":").map(Number);
                  const eatStartMin = ((fh ?? 0) * 60 + (fm ?? 0) + user.fastingHours * 60) % 1440;
                  const eatH = Math.floor(eatStartMin / 60).toString().padStart(2, "0");
                  const eatM = (eatStartMin % 60).toString().padStart(2, "0");
                  return (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                      <span className="text-base">⏳</span>
                      <span>
                        Fasting until <strong>{eatH}:{eatM}</strong> · {user.fastingHours}:{24 - user.fastingHours} schedule
                      </span>
                    </div>
                  );
                })()}

                {(["breakfast", "lunch", "dinner"] as const).map((slot) => {
                  const meal = dailyProgress.meals[slot];
                  if (!meal) return null;
                  // Hide meals outside the fasting window
                  if (!activeSlots.has(slot)) return null;
                  return (
                    <MealCard
                      key={slot}
                      meal={meal}
                      mealType={slot}
                      mealTime={getMealTime(slot)}
                      date={dailyProgress.date}
                      mealStatus={getMealStatus(meal, slot)}
                      onMealMissed={handleMealMissed}
                      // The swap already refreshed the progress store, and
                      // this screen mirrors it — nothing to do here.
                      onMealChange={() => {}}
                    />
                  );
                })}

                {activeSlots.has("snacks") && dailyProgress.meals.snacks?.length > 0 &&
                  dailyProgress.meals.snacks.map((snack, index) => (
                    <MealCard
                      key={snack._id || index}
                      meal={snack}
                      mealType="snacks"
                      mealTime={getMealTime("snacks")}
                      date={dailyProgress.date}
                      snackIndex={index}
                      isSnack
                      promptMoodCheck={promptMoodCheckOnSnackIndex === index}
                      onMealChange={() => {}}
                    />
                  ))}
              </div>
            </section>

            {/* ── Active Beats (Workouts) ──────────────────────────────── */}
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Active Beats</h3>
              {(() => {
                const actualWorkouts = dailyProgress.workouts.filter(
                  (w) => !w.name?.toLowerCase().includes("rest"),
                );
                if (dailyProgress.workouts.length > 0 && actualWorkouts.length === 0) {
                  return <p className="py-3 text-sm text-gray-400 text-center">Rest Day 🌿</p>;
                }
                if (actualWorkouts.length === 0) {
                  return <p className="py-3 text-sm text-gray-400 text-center">No workouts planned for today</p>;
                }
                return (
                  <div className="space-y-2">
                    {actualWorkouts.map((workout, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-2xl border border-habeat/[0.09] flex items-center gap-4 shadow-sm transition-transform active:scale-[0.99]"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                            workout.done ? "bg-habeat/20" : "bg-gray-100"
                          }`}
                        >
                          <img
                            src={getWorkoutImageVite(workout.name)}
                            alt={workout.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const t = e.target as HTMLImageElement;
                              t.style.display = "none";
                              const p = t.parentElement;
                              if (p && !p.querySelector(".emoji-fallback")) {
                                const fb = document.createElement("span");
                                fb.className = "emoji-fallback text-xl";
                                fb.textContent = "💪";
                                p.appendChild(fb);
                              }
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{workout.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400">{workout.duration} min</span>
                            {workout.time && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{workout.time}</span>
                              </>
                            )}
                            <span className="flex items-center gap-0.5 text-xs text-gray-600">
                              <Flame className="w-3 h-3 text-orange-400" />
                              {workout.caloriesBurned} kcal
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setWorkoutToDelete(workout)}
                            className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                            aria-label="Delete workout"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                          </button>
                          <button
                            onClick={() => handleCompleteWorkout(index)}
                            className={`p-0.5 rounded-full transition-all duration-200 ${
                              workout.done
                                ? "bg-habeat scale-110 shadow-sm"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                            aria-label={workout.done ? "Mark as incomplete" : "Mark as complete"}
                          >
                            <Check
                              className={`w-3.5 h-3.5 transition-all duration-200 ${
                                workout.done ? "text-white stroke-[3]" : "text-gray-400 stroke-2"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </section>

            {/* ── Hydration Intake ─────────────────────────────────────── */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-gray-500">Hydration Intake</h3>
                <span className="text-sm font-bold text-habeat">
                  {dailyProgress.water.consumed}/{dailyProgress.water.goal} Cups
                </span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center gap-1">
                  {Array.from({ length: dailyProgress.water.goal }).map((_, i) => (
                    <button
                      key={i}
                      onClick={i < dailyProgress.water.consumed ? undefined : addWaterGlass}
                      className="flex-1 flex justify-center active:scale-75 transition-transform duration-150"
                      aria-label={i < dailyProgress.water.consumed ? "Water glass filled" : "Add water glass"}
                    >
                      <Droplet
                        className={`w-7 h-7 transition-colors ${
                          i < dailyProgress.water.consumed
                            ? "text-habeat fill-habeat"
                            : "text-gray-300 fill-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

        {dailyProgress && !isPlanExpired && (
          <FloatingActionButton
            onAddWorkout={() => setShowWorkoutModal(true)}
            onAddSnack={() => setShowAddSnackModal(true)}
          />
        )}

        {dailyProgress && (
          <AddSnackModal
            isOpen={showAddSnackModal}
            onClose={() => setShowAddSnackModal(false)}
            onAdd={handleAddSnack}
            date={dailyProgress.date}
            loading={isAddingSnack}
          />
        )}

        {dailyProgress && (
          <WorkoutModal
            onWorkoutAdd={handleAddWorkout}
            open={showWorkoutModal}
            onOpenChange={setShowWorkoutModal}
          >
            <div style={{ display: "none" }} />
          </WorkoutModal>
        )}
      </div>
    </>
  );
};

export default DailyMealScreen;
