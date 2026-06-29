import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "@/styles/dailyScreen.css";
import { Trash2, Check, Droplet, ArrowRight, Flame } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { IDailyProgress, WorkoutData, IMeal } from "@/types/interfaces";
import MealLoader from "../helper/MealLoader";
import { userAPI } from "@/services/api";
import config from "@/services/config";
import MealCard from "./MealCard";
import { useProgressStore } from "@/stores/progressStore";
import { useFavoritesStore } from "@/stores/favoritesStore";
import { useEngagementStore } from "@/stores/engagementStore";
import { useCBTStore } from "@/stores/cbtStore";
import { getWorkoutImageVite } from "@/lib/workoutImageHelper";
import { formatTime12Hour, formatDisplayDate } from "@/lib/dateUtils";
import FastingClock from "./FastingClock";
import { LevelUpCelebration } from "@/components/engagement";
import { ChallengesBanner, ChallengeClaimCelebration } from "@/components/challenges";
import { DeleteWorkoutModal } from "./DeleteWorkoutModal";
import { ExpiredPlanCard } from "./ExpiredPlanCard";
import FloatingActionButton from "./FloatingActionButton";
import AddSnackModal from "@/components/modals/AddSnackModal";
import WorkoutModal from "@/components/modals/WorkoutModal";

const CIRCUMFERENCE = 314.16; // 2 * Math.PI * 50

const MOOD_OPTIONS = [
  { emoji: "😔", label: "Low",   moodCategory: "sad",      moodLevel: 2 },
  { emoji: "😐", label: "Okay",  moodCategory: "neutral",  moodLevel: 3 },
  { emoji: "😊", label: "Good",  moodCategory: "happy",    moodLevel: 4 },
  { emoji: "🤩", label: "Great", moodCategory: "energetic",moodLevel: 5 },
] as const;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning!";
  if (h < 17) return "Good Afternoon!";
  return "Good Evening!";
};

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
  const [selectedMoodIndex, setSelectedMoodIndex] = useState<number | null>(null);

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

  const getMealStatus = (meal: IMeal, mealType: string): "past" | "current" | "future" => {
    if (mealType === "snacks") return meal.done ? "past" : "future";
    if (meal.done) return "past";

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (key: string, fallback: number) => {
      const t = mealTimes[key as keyof typeof mealTimes];
      if (!t) return fallback;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const breakfastTime = parseTime("breakfast", 8 * 60);
    const lunchTime = parseTime("lunch", 12 * 60 + 30);
    const dinnerTime = parseTime("dinner", 19 * 60);
    const midnight = 24 * 60;

    const breakfastDone = dailyProgress?.meals?.breakfast?.done || false;
    const lunchDone = dailyProgress?.meals?.lunch?.done || false;
    const breakfastPast = breakfastDone || currentTime >= lunchTime - 60;
    const lunchPast = lunchDone || currentTime >= dinnerTime - 60;

    if (mealType === "breakfast") {
      if (currentTime < breakfastTime) return "future";
      if (currentTime < lunchTime - 60) return "current";
      return "past";
    }
    if (mealType === "lunch") {
      if (breakfastPast) return currentTime < dinnerTime - 60 ? "current" : "past";
      if (currentTime < lunchTime) return "future";
      return currentTime < dinnerTime - 60 ? "current" : "past";
    }
    if (mealType === "dinner") {
      if (lunchPast) return currentTime < midnight ? "current" : "past";
      if (currentTime < dinnerTime) return "future";
      return currentTime < midnight ? "current" : "past";
    }
    return "future";
  };

  const addWaterGlass = async () => {
    if (user?._id) await addWaterGlassToStore(user._id, currentDate.toISOString());
  };

  const handleMoodSelect = async (index: number) => {
    setSelectedMoodIndex(index);
    const mood = MOOD_OPTIONS[index];
    const now = new Date();
    try {
      await logMood({
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        moodCategory: mood.moodCategory,
        moodLevel: mood.moodLevel,
        triggers: [],
        notes: "",
      });
    } catch {
      // mood log is non-critical
    }
  };

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

            {/* ── Greeting & Streak ───────────────────────────────────── */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {formatDayDate(dailyProgress.date)}
                </p>
                <h1 className="text-2xl font-bold leading-tight text-habeat">
                  {getGreeting()}
                </h1>
              </div>
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
            <section className="p-4 rounded-2xl border bg-habeat/[0.03] border-habeat/[0.09]">
              <h3 className="text-xs font-semibold text-center mb-3 text-habeat/60">
                How are you feeling right now?
              </h3>
              <div className="flex justify-around items-center">
                {MOOD_OPTIONS.map((mood, i) => (
                  <button
                    key={mood.label}
                    onClick={() => handleMoodSelect(i)}
                    className={`flex flex-col items-center gap-1 transition-all duration-200 active:scale-90 rounded-full px-3 py-1.5 ${
                      selectedMoodIndex === i ? "bg-white shadow-sm scale-105" : ""
                    }`}
                    aria-label={`Mood: ${mood.label}`}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span
                      className={`text-xs font-semibold ${
                        selectedMoodIndex === i ? "text-habeat" : "text-habeat-muted"
                      }`}
                    >
                      {mood.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Challenges Banner ────────────────────────────────────── */}
            <ChallengesBanner className="!mb-0" />

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
                          <span className="text-xl font-bold text-habeat">
                            {remaining.toLocaleString()}
                          </span>
                          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 mb-1" />
                          <span className="text-[10px] uppercase tracking-widest text-gray-400 leading-none">Left</span>
                        </div>
                      </div>

                      {/* Macro bars */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-xs font-semibold text-gray-500">Protein</span>
                            <span className="text-sm font-bold text-gray-900">
                              {proteinConsumed}g{" "}
                              <span className="text-xs font-normal text-gray-400">/ {proteinGoal}g</span>
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
                              {carbsConsumed}g{" "}
                              <span className="text-xs font-normal text-gray-400">/ {carbsGoal}g</span>
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
                              {fatConsumed}g{" "}
                              <span className="text-xs font-normal text-gray-400">/ {fatGoal}g</span>
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
                {dailyProgress.meals.breakfast && (
                  <MealCard
                    meal={dailyProgress.meals.breakfast}
                    mealType="breakfast"
                    mealTime={getMealTime("breakfast")}
                    date={dailyProgress.date}
                    mealStatus={getMealStatus(dailyProgress.meals.breakfast, "breakfast")}
                    onMealChange={(newMeal) =>
                      setTodayProgress({ ...dailyProgress, meals: { ...dailyProgress.meals, breakfast: newMeal } })
                    }
                  />
                )}
                {dailyProgress.meals.lunch && (
                  <MealCard
                    meal={dailyProgress.meals.lunch}
                    mealType="lunch"
                    mealTime={getMealTime("lunch")}
                    date={dailyProgress.date}
                    mealStatus={getMealStatus(dailyProgress.meals.lunch, "lunch")}
                    onMealChange={(newMeal) =>
                      setTodayProgress({ ...dailyProgress, meals: { ...dailyProgress.meals, lunch: newMeal } })
                    }
                  />
                )}
                {dailyProgress.meals.dinner && (
                  <MealCard
                    meal={dailyProgress.meals.dinner}
                    mealType="dinner"
                    mealTime={getMealTime("dinner")}
                    date={dailyProgress.date}
                    mealStatus={getMealStatus(dailyProgress.meals.dinner, "dinner")}
                    onMealChange={(newMeal) =>
                      setTodayProgress({ ...dailyProgress, meals: { ...dailyProgress.meals, dinner: newMeal } })
                    }
                  />
                )}
                {dailyProgress.meals.snacks?.length > 0 &&
                  dailyProgress.meals.snacks.map((snack, index) => (
                    <MealCard
                      key={snack._id || index}
                      meal={snack}
                      mealType="snacks"
                      mealTime={getMealTime("snacks")}
                      date={dailyProgress.date}
                      snackIndex={index}
                      isSnack
                      onMealChange={(newMeal) => {
                        const updatedSnacks = [...dailyProgress.meals.snacks];
                        updatedSnacks[index] = newMeal;
                        setTodayProgress({ ...dailyProgress, meals: { ...dailyProgress.meals, snacks: updatedSnacks } });
                      }}
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
