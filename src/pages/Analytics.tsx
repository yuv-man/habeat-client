import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { userAPI } from "@/services/api";
import { IAnalyticsData } from "@/types/interfaces";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Flame,
  Droplets,
  Dumbbell,
  Calendar,
  Target,
  Zap,
  Lightbulb,
  Activity,
  TrendingUp,
} from "lucide-react";
import MealLoader from "@/components/helper/MealLoader";

// Design tokens — exact hex values from the Habeats design system
const C = {
  primary:           "#274e3b",
  primaryContainer:  "#3f6652",
  surfaceLowest:     "#ffffff",
  surfaceLow:        "#f4f3f1",
  surface:           "#efeeeb",
  onSurface:         "#1a1c1a",
  onSurfaceVariant:  "#414843",
  outline:           "#717973",
  outlineVariant:    "#c1c8c2",
  secondary:         "#5f5a80",
  secondaryContainer:"#d9d2ff",
  onSecondaryContainer:"#5e597f",
  background:        "#faf9f6",
};

const softLift = { boxShadow: "0 10px 40px -10px rgba(63,102,82,0.08)" };
const tacticBorderPrimary   = { borderBottom: "4px solid rgba(63,102,82,0.2)" };
const tacticBorderSecondary = { borderBottom: "4px solid rgba(95,90,128,0.2)" };

const Analytics = () => {
  const navigate = useNavigate();
  const { user, loading, token } = useAuthStore();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [analytics, setAnalytics] = useState<IAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user && !token) navigate("/register");
  }, [user, loading, token, navigate]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?._id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await userAPI.getAnalytics(user._id, period);
        setAnalytics(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [user?._id, period]);

  const getInsight = (a: IAnalyticsData): string => {
    if (a.goalPercentages.protein < 50)
      return `Your protein intake is a bit low this ${period}. Try adding Greek yogurt to your breakfast for a 15g boost!`;
    if (a.goalPercentages.water < 50)
      return `You're below your hydration goal. Keep a water bottle nearby as a reminder to sip throughout the day.`;
    if (a.daysTracked < a.totalDays / 2)
      return `You've tracked ${a.daysTracked} of ${a.totalDays} days. Consistent tracking unlocks much better insights!`;
    return `Great consistency this ${period}! Keep balancing your macros and hitting your water target.`;
  };

  if (loading || (token && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.background }}>
        <MealLoader customMessages={["Loading your analytics..."]} />
      </div>
    );
  }

  if (!user) return <div>Redirecting...</div>;

  return (
    <DashboardLayout currentView="weekly" bgColor={`bg-[${C.background}]`}>
      <div
        className="max-w-md mx-auto px-5 pb-10 space-y-5"
        style={{ background: C.background, minHeight: "100%" }}
      >
        {/* Period Toggle */}
        <div
          className="mt-4 p-1 flex gap-1 rounded-full"
          style={{ background: C.surface }}
        >
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-full text-sm font-semibold transition-all duration-200 capitalize"
              style={
                period === p
                  ? { background: C.surfaceLowest, color: C.primary, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                  : { color: C.onSurfaceVariant }
              }
            >
              {p === "week" ? "Week" : "Month"}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <MealLoader />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && analytics && (
          <>
            {/* ── Hero Card ── */}
            <section
              className="relative overflow-hidden rounded-2xl p-6"
              style={{ background: C.primaryContainer, ...tacticBorderPrimary, ...softLift }}
            >
              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Daily Average
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-bold tracking-tight text-white">
                    {analytics.averages.calories.toLocaleString()}
                  </span>
                  <span className="text-base text-white/70">calories/day</span>
                </div>

                <div className="pt-4 space-y-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <HeroRow icon={<Calendar className="w-4 h-4" />}>
                    {analytics.daysTracked} of {analytics.totalDays} days tracked
                  </HeroRow>
                  <HeroRow icon={<Target className="w-4 h-4" />}>
                    Target: {analytics.targets.calories.toLocaleString()}/day
                  </HeroRow>
                  {analytics.totals.caloriesBurned > 0 && (
                    <HeroRow icon={<Zap className="w-4 h-4" />}>
                      {analytics.totals.caloriesBurned.toLocaleString()} cal burned
                    </HeroRow>
                  )}
                </div>
              </div>

              {/* Decorative blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <TrendingUp className="w-28 h-28 text-white" />
              </div>
            </section>

            {/* ── Bento Grid ── */}
            <section className="grid grid-cols-2 gap-3">
              <BentoCard
                iconBg="#fff3e0" icon={<Flame className="w-5 h-5" style={{ color: "#ea6c00" }} />}
                label="Total Calories"
                value={analytics.totals.calories.toLocaleString()} unit="kcal"
                targetLabel={`Target: ${(analytics.targets.calories * analytics.totalDays).toLocaleString()}`}
                pct={analytics.goalPercentages.calories}
                bar="#f97316" pctColor="#ea6c00"
                border="primary"
              />
              <BentoCard
                iconBg="#e8f0fe" icon={<Dumbbell className="w-5 h-5 text-blue-600" />}
                label="Avg Protein"
                value={analytics.averages.protein} unit="g/day"
                targetLabel={`Target: ${analytics.targets.protein}`}
                pct={analytics.goalPercentages.protein}
                bar="#3b82f6" pctColor="#2563eb"
                border="secondary"
              />
              <BentoCard
                iconBg="#e0f7fa" icon={<Droplets className="w-5 h-5 text-cyan-600" />}
                label="Avg Water"
                value={analytics.averages.water} unit="glasses/day"
                targetLabel={`Target: ${analytics.targets.water}`}
                pct={analytics.goalPercentages.water}
                bar="#06b6d4" pctColor="#0891b2"
                border="primary"
              />
              <BentoCard
                iconBg="#f3e8ff" icon={<Activity className="w-5 h-5 text-purple-600" />}
                label="Workouts"
                value={analytics.totals.workoutsCompleted} unit={`of ${analytics.totals.workoutsTotal}`}
                targetLabel={null}
                pct={analytics.totals.workoutsTotal > 0
                  ? Math.round((analytics.totals.workoutsCompleted / analytics.totals.workoutsTotal) * 100)
                  : 0}
                bar="#a855f7" pctColor="#9333ea"
                border="secondary"
              />
            </section>

            {/* ── Macro Averages ── */}
            <section className="rounded-2xl p-6" style={{ background: C.surfaceLowest, ...softLift }}>
              <h2 className="text-lg font-bold mb-5" style={{ color: C.onSurface }}>Daily Macro Averages</h2>
              <div className="space-y-5">
                {[
                  { label: "Protein", value: analytics.averages.protein, target: analytics.targets.protein, pct: analytics.goalPercentages.protein, bar: "#3b82f6" },
                  { label: "Carbs",   value: analytics.averages.carbs,   target: analytics.targets.carbs,   pct: analytics.goalPercentages.carbs,   bar: "#fb923c" },
                  { label: "Fat",     value: analytics.averages.fat,      target: analytics.targets.fat,     pct: analytics.goalPercentages.fat,     bar: "#f472b6" },
                ].map((m) => (
                  <div key={m.label} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-semibold" style={{ color: C.onSurface }}>{m.label}</span>
                      <span className="text-xs" style={{ color: C.onSurfaceVariant }}>
                        {m.value}g / {m.target}g ({m.pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: C.surface }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(m.pct, 100)}%`, background: m.bar }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── Daily Breakdown ── */}
            {analytics.dailyData.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-lg font-bold px-1" style={{ color: C.onSurface }}>Daily Breakdown</h2>
                <div className="space-y-3">
                  {analytics.dailyData.map((day) => {
                    const d = new Date(day.date);
                    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                    const dayNum  = d.getDate();
                    const month   = d.toLocaleDateString("en-US", { month: "short" });
                    const pct     = day.caloriesGoal > 0 ? Math.round((day.calories / day.caloriesGoal) * 100) : 0;

                    return (
                      <div
                        key={day.dateKey}
                        className="rounded-2xl p-4 flex items-center gap-4"
                        style={{ background: C.surfaceLow, ...softLift }}
                      >
                        {/* Date column */}
                        <div
                          className="text-center shrink-0 pr-4 min-w-[44px]"
                          style={{ borderRight: `1px solid ${C.outlineVariant}` }}
                        >
                          <p className="text-[10px] font-bold uppercase" style={{ color: C.outline }}>{dayName}</p>
                          <p className="text-xl font-bold leading-tight" style={{ color: C.onSurface }}>{dayNum}</p>
                          <p className="text-[10px] font-medium" style={{ color: C.outline }}>{month}</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold" style={{ color: C.onSurfaceVariant }}>Calories</span>
                            <span className="text-xs font-bold" style={{ color: C.primary }}>
                              {day.calories} / {day.caloriesGoal}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.surface }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${Math.min(pct, 100)}%`, background: C.primaryContainer }}
                            />
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            {[
                              { label: `P: ${day.protein}g` },
                              { label: `C: ${day.carbs}g` },
                              { label: `F: ${day.fat}g` },
                            ].map((x) => (
                              <span key={x.label} className="text-[10px] font-bold" style={{ color: C.outline }}>{x.label}</span>
                            ))}
                            <span className="flex items-center gap-0.5 text-[10px] font-bold text-cyan-600">
                              <Droplets className="w-3 h-3" />{day.water}
                            </span>
                            {day.workoutsCompleted > 0 && (
                              <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-600">
                                <Dumbbell className="w-3 h-3" />{day.workoutsCompleted}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Empty State */}
            {analytics.daysTracked === 0 && (
              <div className="rounded-2xl p-8 text-center" style={{ background: C.surfaceLowest, border: `1px solid ${C.outlineVariant}` }}>
                <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: C.outlineVariant }} />
                <h3 className="text-base font-bold mb-1" style={{ color: C.onSurface }}>No Data Yet</h3>
                <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                  Start tracking your meals and workouts to see your progress here.
                </p>
              </div>
            )}

            {/* ── Growth Insight ── */}
            <div
              className="p-5 rounded-2xl flex gap-4"
              style={{ background: `${C.secondaryContainer}33`, border: `1px solid ${C.secondary}1a` }}
            >
              <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: C.secondaryContainer }}
              >
                <Lightbulb className="w-5 h-5" style={{ color: C.secondary }} />
              </div>
              <div>
                <h4 className="text-sm font-bold mb-1" style={{ color: C.secondary }}>Growth Insight</h4>
                <p className="text-xs leading-relaxed" style={{ color: C.onSecondaryContainer }}>
                  {getInsight(analytics)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const HeroRow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
      {icon}
    </div>
    <span className="text-sm text-white/90">{children}</span>
  </div>
);

const BentoCard = ({
  iconBg, icon, label, value, unit,
  targetLabel, pct, bar, pctColor, border,
}: {
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  value: number | string;
  unit: string;
  targetLabel: string | null;
  pct: number;
  bar: string;
  pctColor: string;
  border: "primary" | "secondary";
}) => (
  <div
    className="rounded-2xl p-5 flex flex-col"
    style={{
      background: C.surfaceLowest,
      ...softLift,
      ...(border === "primary" ? tacticBorderPrimary : tacticBorderSecondary),
    }}
  >
    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ background: iconBg }}>
      {icon}
    </div>
    <p className="text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>{label}</p>
    <div className="flex items-baseline gap-1 mb-3">
      <span className="text-2xl font-bold" style={{ color: C.onSurface }}>{value}</span>
      <span className="text-xs" style={{ color: C.outline }}>{unit}</span>
    </div>
    <div className="mt-auto space-y-1">
      <div className="flex justify-between text-[10px] font-bold" style={{ color: C.outline }}>
        {targetLabel ? <span>{targetLabel}</span> : <span />}
        <span style={{ color: pctColor }}>{Math.min(pct, 100)}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: C.surface }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%`, background: bar }}
        />
      </div>
    </div>
  </div>
);

export default Analytics;
