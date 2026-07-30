import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, Brain, Eye, Wind, BellOff, Sparkles, Info, ChevronDown,
} from "lucide-react";
import {
  useCBTStore,
  useEmotionalEatingInsight,
  useMoodHistory,
} from "@/stores/cbtStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CBTExercises } from "@/components/cbt/CBTExercises";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

/** Returns the ISO date string for N days ago */
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

/** Single-letter weekday for an ISO date string, derived from the date itself. */
const dayInitial = (isoDate: string) =>
  DAY_INITIALS[new Date(`${isoDate}T00:00:00`).getDay()];

/** "14 Jul" — used when naming the analysed period. */
const fmtDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });

/** "Mon 14 Jul" — used in the per-bar readout. */
const dayFull = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// ─── sub-components ──────────────────────────────────────────────────────────

interface ScoreRingProps {
  score: number;
  weeklyChange?: number;
  mealsAnalysed: number;
}

function ScoreRing({ score, weeklyChange, mealsAnalysed }: ScoreRingProps) {
  const R = 70;
  const circ = 2 * Math.PI * R;
  const filled = circ * (score / 100);
  const offset = circ - filled;

  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "Building" : "Developing";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(15,118,110,0.12)] border-b-4 border-b-teal-200 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Mindful Eating Score
          </span>
        </div>
        <Brain className="w-5 h-5 text-teal-600 opacity-60" />
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="80" cy="80" r={R}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="12"
            />
            <circle
              cx="80" cy="80" r={R}
              fill="transparent"
              stroke="#0f766e"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-teal-700 leading-none">{score}</span>
            <span className="text-xs text-slate-400 mt-1">/ 100</span>
          </div>
        </div>
        <span className="mt-2 text-sm font-medium text-teal-600">{label}</span>
      </div>

      {weeklyChange !== undefined && (
        <div className="mt-4 space-y-2 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Weekly Change</span>
            <span
              className={cn(
                "font-bold flex items-center gap-1",
                weeklyChange >= 0 ? "text-teal-600" : "text-red-500"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {weeklyChange >= 0 ? "+" : ""}
              {weeklyChange}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      <HowToRead>
        <p>
          Your Mindful Eating Score is the share of your logged meals that were
          eaten for physical hunger rather than emotion, scored 0–100. Higher is
          better.
        </p>
        <p>
          It is calculated from {mealsAnalysed} meal
          {mealsAnalysed === 1 ? "" : "s"} you linked to a mood check-in over this
          period — not from your onboarding answers. Log more meal-and-mood pairs
          and it gets sharper.
        </p>
        <p className="text-slate-400">
          75+ Excellent · 50–74 Building · under 50 Developing.
          {weeklyChange !== undefined &&
            " Weekly change compares this week's score with last week's."}
        </p>
      </HowToRead>
    </div>
  );
}

interface DayBar {
  date: string;
  label: string;
  /** Average mood that day on the 1–5 scale, or null if nothing was logged. */
  moodAvg: number | null;
  /** Mindful-eating score that day on the 0–100 scale, or null if no meals. */
  mindfulScore: number | null;
}

interface MoodEatingChartProps {
  days: DayBar[];
  insight: string | null;
}

/** Collapsible plain-language key for a chart. */
function HowToRead({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
        How to read this
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-500">
          {children}
        </div>
      )}
    </div>
  );
}

function MoodEatingChart({ days, insight }: MoodEatingChartProps) {
  const [selected, setSelected] = useState<number | null>(null);

  const loggedMoodDays = days.filter((d) => d.moodAvg != null).length;
  const loggedMealDays = days.filter((d) => d.mindfulScore != null).length;
  const active = selected != null ? days[selected] : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(15,118,110,0.08)] border-b-4 border-b-violet-200 flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Mood × Eating Drivers
        </span>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" /> Mood
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" /> Eating
          </span>
        </div>
      </div>

      {/* What the two halves actually measure — stated, not implied */}
      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
        Above the line: how you felt (1–5). Below: how mindful your eating was
        (0–100). Tap a day for its numbers.
      </p>

      {/* Bidirectional bars — both halves share an equal 0–100% height so the
          two directions are visually comparable. */}
      <div className="grid grid-cols-7 gap-2 flex-1 items-end">
        {days.map((day, i) => {
          const hasMood = day.moodAvg != null;
          const hasMeal = day.mindfulScore != null;
          const isSelected = selected === i;

          return (
            <button
              key={day.date}
              onClick={() => setSelected(isSelected ? null : i)}
              aria-label={`${dayFull(day.date)}: ${
                hasMood ? `mood ${day.moodAvg!.toFixed(1)} of 5` : "no mood logged"
              }, ${
                hasMeal ? `eating score ${day.mindfulScore} of 100` : "no meals logged"
              }`}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md transition-all",
                isSelected && "ring-2 ring-violet-300 ring-offset-2"
              )}
            >
              {/* Upper: mood, grows from the centre line upward */}
              <div className="w-full bg-violet-100/50 rounded-t-md h-20 relative flex items-end justify-center overflow-hidden">
                {hasMood ? (
                  <div
                    className="w-1/2 bg-violet-300 rounded-t-md transition-all duration-500 ease-out"
                    style={{ height: `${Math.round((day.moodAvg! / 5) * 100)}%` }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-slate-300 text-[9px]">
                    —
                  </span>
                )}
              </div>

              {/* Centre line */}
              <div className="w-full h-px bg-slate-300" />

              {/* Lower: eating quality, grows from the centre line downward */}
              <div className="w-full bg-teal-100/50 rounded-b-md h-20 relative flex items-start justify-center overflow-hidden">
                {hasMeal ? (
                  <div
                    className="w-1/2 bg-teal-400 rounded-b-md transition-all duration-500 ease-out"
                    style={{ height: `${Math.round(day.mindfulScore!)}%` }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-slate-300 text-[9px]">
                    —
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium mt-1",
                  isSelected ? "text-violet-600" : "text-slate-400"
                )}
              >
                {day.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Per-day readout for the tapped bar */}
      {active && (
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
            {dayFull(active.date)}
          </p>
          <div className="flex gap-5 text-[11px]">
            <span className="text-slate-500">
              <span className="w-2 h-2 rounded-full bg-violet-400 inline-block mr-1.5" />
              Mood{" "}
              <span className="font-semibold text-slate-700">
                {active.moodAvg != null ? `${active.moodAvg.toFixed(1)} / 5` : "not logged"}
              </span>
            </span>
            <span className="text-slate-500">
              <span className="w-2 h-2 rounded-full bg-teal-500 inline-block mr-1.5" />
              Eating{" "}
              <span className="font-semibold text-slate-700">
                {active.mindfulScore != null
                  ? `${active.mindfulScore} / 100`
                  : "no meals logged"}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Insight callout */}
      {insight && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-violet-50 rounded-xl border border-violet-100">
          <Brain className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
          <p className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-700">Insight: </span>
            {insight}
          </p>
        </div>
      )}

      <HowToRead>
        <p>
          <span className="font-semibold text-slate-600">Purple bars (up)</span> —
          your average mood that day, from your check-ins. A full bar is 5/5.
        </p>
        <p>
          <span className="font-semibold text-slate-600">Teal bars (down)</span> —
          your mindful eating score for meals logged that day. A full bar is
          100/100, meaning every meal was eaten for hunger rather than emotion.
        </p>
        <p>
          <span className="font-semibold text-slate-600">A dash (—)</span> means
          nothing was logged that day. It is not a score of zero — the day is
          simply blank.
        </p>
        <p className="pt-1 text-slate-400">
          Reading the shape: when a tall purple bar sits above a tall teal bar,
          good mood and mindful eating went together. A tall purple bar over a
          short teal one is the day worth looking at.
        </p>
        <p className="pt-1 text-slate-400">
          Based on {loggedMoodDays} day{loggedMoodDays === 1 ? "" : "s"} with mood
          check-ins and {loggedMealDays} day{loggedMealDays === 1 ? "" : "s"} with
          logged meals, out of the last 7.
        </p>
      </HowToRead>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  sublabel: string;
  icon: React.ReactNode;
  color: "teal" | "violet";
  /** Plain-language definition, revealed by the ⓘ button. */
  help: string;
}

function MetricCard({ label, value, unit, sublabel, icon, color, help }: MetricCardProps) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)] border border-slate-100 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 leading-tight">{label}</span>
        <button
          onClick={() => setShowHelp((v) => !v)}
          aria-label={`What does ${label} mean?`}
          aria-expanded={showHelp}
          className={cn(
            "transition-opacity hover:opacity-100",
            showHelp ? "opacity-100" : "opacity-50",
            color === "teal" ? "text-teal-600" : "text-violet-600"
          )}
        >
          {showHelp ? <Info className="w-4 h-4" /> : icon}
        </button>
      </div>

      {showHelp ? (
        <p className="text-[11px] text-slate-500 leading-relaxed flex-1">{help}</p>
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-3xl font-bold", color === "teal" ? "text-teal-700" : "text-violet-600")}>
              {value}
            </span>
            <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 leading-snug">
            {sublabel}
          </p>
        </>
      )}
    </div>
  );
}

const TIPS = [
  {
    icon: <Eye className="w-4 h-4" />,
    title: "Look at your food",
    body: "Take 5 seconds to observe textures and colors before your first bite.",
    color: "teal" as const,
  },
  {
    icon: <Wind className="w-4 h-4" />,
    title: "Breathe between bites",
    body: "Place utensils down and take one deep breath between every 3 bites.",
    color: "violet" as const,
  },
  {
    icon: <BellOff className="w-4 h-4" />,
    title: "No-tech zone",
    body: "Keep your phone away during dinner to focus on flavours and fullness.",
    color: "amber" as const,
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: "Hunger check",
    body: "Before eating, rate your hunger 1–10. Aim to eat between 3 and 7.",
    color: "teal" as const,
  },
];

const TIP_COLORS = {
  teal: "bg-teal-50 border-teal-500 text-teal-600",
  violet: "bg-violet-50 border-violet-500 text-violet-600",
  amber: "bg-amber-50 border-amber-500 text-amber-600",
};

function TipsSlider({ recommendations }: { recommendations: string[] }) {
  const isPersonalised = (recommendations ?? []).length >= 2;
  const tips = isPersonalised
    ? recommendations.slice(0, 4).map((r, i) => ({
        icon: TIPS[i % TIPS.length].icon,
        title: "Recommendation",
        body: r,
        color: TIPS[i % TIPS.length].color,
      }))
    : TIPS;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.06)] border border-slate-100">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Mindful Tips
        </span>
        {/* Say whether these were computed from the user's data or are defaults */}
        <span className="text-[10px] font-medium text-slate-400">
          {isPersonalised ? "Based on your logs" : "General tips"}
        </span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tips.map((tip, i) => (
          <div
            key={i}
            className={cn(
              "min-w-[220px] p-4 rounded-xl border-l-4 flex-shrink-0",
              TIP_COLORS[tip.color]
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {tip.icon}
              <span className="text-sm font-semibold">{tip.title}</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Pattern {
  emoji: string;
  name: string;
  context: string;
  frequency: string;
  impact: "positive" | "negative" | "neutral";
}

function PatternsTable({
  patterns,
  isExample,
}: {
  patterns: Pattern[];
  isExample: boolean;
}) {
  const IMPACT_STYLES = {
    positive: "bg-teal-100 text-teal-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-violet-100 text-violet-700",
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-bold text-slate-800">Top Recurring Patterns</h3>
        {isExample && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-amber-100 text-amber-700">
            Example
          </span>
        )}
      </div>

      {/* Placeholder rows must never read as findings about the user. */}
      {isExample && (
        <div className="mb-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] leading-relaxed text-amber-800">
            These rows illustrate what this table will show — they are not your
            patterns. Yours appear once you have logged two meals in the same slot,
            or a mood trigger has been observed at least once.
          </p>
        </div>
      )}

      <div
        className={cn(
          "bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)] overflow-hidden border border-slate-100",
          isExample && "opacity-60"
        )}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Pattern</th>
              <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Frequency</th>
              <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patterns.map((p, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                      {p.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{p.name}</div>
                      <div className="text-[11px] text-slate-400">{p.context}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-600">{p.frequency}</td>
                <td className="px-4 py-4 text-right">
                  <span className={cn("px-2.5 py-1 text-[10px] font-bold rounded-full uppercase", IMPACT_STYLES[p.impact])}>
                    {p.impact}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function EmotionalEating() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [showExercises, setShowExercises] = useState(false);

  const { fetchEmotionalEatingInsight, fetchMoodHistory } = useCBTStore();
  const insight = useEmotionalEatingInsight();
  const moodHistory = useMoodHistory();

  useEffect(() => {
    fetchEmotionalEatingInsight(period);
    const end = new Date().toISOString().split("T")[0];
    const start = daysAgo(7);
    fetchMoodHistory(start, end);
  }, [period, fetchEmotionalEatingInsight, fetchMoodHistory]);

  // Build the 7-day chart from real logged data only.
  // A day with nothing logged is rendered as an explicit gap — never as a zero,
  // and never padded with synthetic variance.
  const chartDays: DayBar[] = useMemo(() => {
    const breakdown = insight?.dailyBreakdown;

    if (breakdown?.length) {
      return breakdown.slice(-7).map((d) => ({
        date: d.date,
        label: dayInitial(d.date),
        moodAvg: d.moodAvg,
        mindfulScore: d.mindfulScore,
      }));
    }

    // Before any meal-mood correlations exist the backend has no mindfulScore to
    // give us. We still plot the mood check-ins the user *has* logged, and leave
    // the eating half empty rather than inventing a curve for it.
    return Array.from({ length: 7 }, (_, i) => {
      const dateKey = daysAgo(6 - i);
      const dayEntries = moodHistory.filter((m) => m.date.startsWith(dateKey));
      return {
        date: dateKey,
        label: dayInitial(dateKey),
        moodAvg: dayEntries.length
          ? dayEntries.reduce((s, m) => s + m.moodLevel, 0) / dayEntries.length
          : null,
        mindfulScore: null,
      };
    });
  }, [insight, moodHistory]);

  // Build patterns table — only observed patterns, never KYC seeds.
  // `isExample` tells the table to label itself as an illustration rather than
  // presenting placeholder rows as findings.
  const { patterns, patternsAreExample } = useMemo<{
    patterns: Pattern[];
    patternsAreExample: boolean;
  }>(() => {
    if (!insight) return { patterns: DEFAULT_PATTERNS, patternsAreExample: true };

    const rows: Pattern[] = [];

    const TRIGGER_EMOJIS: Record<string, string> = {
      stress: "😤", boredom: "😑", sadness: "😢", anxiety: "😰",
      social: "👥", tiredness: "😴", habit: "🔄", celebration: "🎉",
      procrastination: "📱", "late-night": "🌙",
    };

    // Positive: meal slot with strongest mindful eating score (≥2 logged meals)
    if (insight.strongestMealType) {
      const slot = insight.strongestMealType;
      const mealCount =
        insight.mealTypeBreakdown[slot as keyof typeof insight.mealTypeBreakdown] ?? 0;
      rows.push({
        emoji: "☀️",
        name: `${slot.charAt(0).toUpperCase()}${slot.slice(1)} Mindfulness`,
        context: "Most mindful meal of the day",
        frequency: `${mealCount} meal${mealCount !== 1 ? "s" : ""} logged`,
        impact: "positive",
      });
    }

    // Negative: only triggers that were actually observed (count > 0)
    (insight.commonTriggers ?? [])
      .filter((t) => t.count > 0)
      .slice(0, 3)
      .forEach((t) => {
        const key = t.trigger.toLowerCase();
        rows.push({
          emoji: TRIGGER_EMOJIS[key] ?? "⚡",
          name: `${t.trigger.charAt(0).toUpperCase()}${t.trigger.slice(1)}-Eating`,
          // The real window this trigger fires in, when the data supports naming
          // one. Falls back to the generic phrasing only when it doesn't.
          context: t.windowLabel ?? "Observed from your logs",
          frequency: `${t.count}× this ${period}`,
          impact: "negative",
        });
      });

    // Only fall back to defaults when there's genuinely no data at all
    return rows.length
      ? { patterns: rows, patternsAreExample: false }
      : { patterns: DEFAULT_PATTERNS, patternsAreExample: true };
  }, [insight, period]);

  const score = insight?.mindfulEatingScore ?? 0;
  const weeklyChange = (insight?.weeklyTrend?.length ?? 0) > 1
    ? (() => {
        const trend = insight!.weeklyTrend;
        if (trend.length < 2) return 0;
        const prev = trend[trend.length - 2]?.score ?? 0;
        const curr = trend[trend.length - 1]?.score ?? 0;
        return prev ? Math.round(((curr - prev) / prev) * 100) : 0;
      })()
    : undefined;

  const satietyPct = insight?.satietyRate ?? 0;
  const mealsAnalyzed = insight?.totalMeals ?? 0;

  return (
    <DashboardLayout hidePlanBanner bgColor="bg-slate-50">
      <div className="min-h-screen bg-slate-50 pb-24">

        {/* Header */}
        <div className="bg-slate-50 pt-2 pb-2 px-4 max-w-3xl mx-auto">
          <button
            onClick={() => navigate("/mindfulness")}
            className="mb-3 p-1.5 -ml-1.5 text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-end justify-between mb-1">
            <div>
              <span className="text-xs font-bold text-violet-500 uppercase tracking-widest">
                Insights
              </span>
              <h2 className="text-3xl font-bold text-slate-800 leading-tight tracking-tight">
                Eating Patterns
              </h2>
            </div>
            <div className="flex gap-2 mb-1">
              {(["week", "month"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    period === p
                      ? "bg-teal-600 text-white"
                      : "bg-white border border-slate-200 text-slate-500 hover:border-teal-300"
                  )}
                >
                  {p === "week" ? "7 Days" : "30 Days"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-400 mb-3 max-w-md">
            Understand the connection between your emotional state and eating habits.
          </p>

          {/* Provenance: what this page is actually computed from. */}
          {insight && (
            <p className="text-[11px] text-slate-400 mb-6 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              {insight.totalMeals > 0 ? (
                <span>
                  Computed from <strong className="text-slate-500">{insight.totalMeals}</strong>{" "}
                  meal{insight.totalMeals === 1 ? "" : "s"} linked to a mood check-in
                  {moodHistory.length > 0 && (
                    <>
                      {" "}and <strong className="text-slate-500">{moodHistory.length}</strong>{" "}
                      mood entr{moodHistory.length === 1 ? "y" : "ies"}
                    </>
                  )}
                  , {fmtDate(insight.period.start)}–{fmtDate(insight.period.end)}.
                </span>
              ) : (
                <span>
                  No meals linked to a mood yet — scores below stay locked until you
                  link at least one.
                </span>
              )}
            </p>
          )}

          {/* No data at all */}
          {!insight && moodHistory.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <div className="text-4xl mb-3">🌱</div>
              <p className="font-semibold text-slate-700 mb-1">No patterns yet</p>
              <p className="text-sm text-slate-400">
                Log meals and check in with your mood to start building your eating story.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Bento row 1: Score (only when real data) + Mood chart */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {insight && insight.totalMeals > 0 && (
                  <div className="md:col-span-5">
                    <ScoreRing
                      score={score}
                      weeklyChange={weeklyChange}
                      mealsAnalysed={mealsAnalyzed}
                    />
                  </div>
                )}
                <div className={insight && insight.totalMeals > 0 ? "md:col-span-7" : "md:col-span-12"}>
                  <MoodEatingChart
                    days={chartDays}
                    insight={insight?.patternSpotlight ?? null}
                  />
                </div>
              </div>

              {/* Link-moods CTA — shown until user has real meal-mood correlations */}
              {(!insight || insight.totalMeals === 0) && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
                  <Brain className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-teal-800 mb-0.5">Mood data connected</p>
                    <p className="text-xs text-teal-700 leading-relaxed">
                      Your mood check-ins are showing above. To unlock your Mindful Eating Score and satiety stats, log a mood right after a meal — the check-in will ask if you want to link it.
                    </p>
                  </div>
                </div>
              )}

              {/* Bento row 2: Mini metric cards + Tips slider — only when real correlations */}
              {insight && insight.totalMeals > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <MetricCard
                      label="Satiety Rate"
                      value={`${satietyPct}%`}
                      unit={satietyPct >= 70 ? "High" : satietyPct >= 40 ? "Medium" : "Low"}
                      sublabel="Meals eaten for hunger, not emotion"
                      icon={<Sparkles className="w-4 h-4" />}
                      color="teal"
                      help={`Of the ${mealsAnalyzed} meal${mealsAnalyzed === 1 ? "" : "s"} you logged, ${satietyPct}% were started at a genuine hunger level (3 or more out of 5 on the pre-meal check-in). The rest were started while you were full or close to it.`}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <MetricCard
                      label="Meals Analysed"
                      value={String(mealsAnalyzed)}
                      unit="total"
                      sublabel={`${insight.emotionalEatingInstances} showed emotional eating`}
                      icon={<Brain className="w-4 h-4" />}
                      color="violet"
                      help={`Meals you logged together with a mood check-in between ${fmtDate(insight.period.start)} and ${fmtDate(insight.period.end)}. Only these count towards your scores — meals logged without a mood aren't analysed.`}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-6">
                    <TipsSlider recommendations={insight.recommendations} />
                  </div>
                </div>
              )}

              {/* Tips slider standalone when no correlations yet */}
              {(!insight || insight.totalMeals === 0) && (
                <TipsSlider recommendations={[]} />
              )}

              {/* Patterns table */}
              <PatternsTable patterns={patterns} isExample={patternsAreExample} />

              {/* CBT Exercises toggle */}
              <div>
                <button
                  onClick={() => setShowExercises((v) => !v)}
                  className="w-full py-3 text-sm font-semibold text-teal-600 bg-white border border-teal-200 rounded-2xl hover:bg-teal-50 transition-colors"
                >
                  {showExercises ? "Hide" : "Show"} CBT Exercises
                </button>
                {showExercises && (
                  <div className="mt-4">
                    <CBTExercises category="eating" showRecommended={false} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── fallback patterns when no insight data ───────────────────────────────────

const DEFAULT_PATTERNS: Pattern[] = [
  {
    emoji: "😤",
    name: "Stress-Snacking",
    context: "Primarily 4 PM – 6 PM",
    frequency: "—",
    impact: "negative",
  },
  {
    emoji: "☀️",
    name: "Morning Satiety",
    context: "Post high-protein breakfast",
    frequency: "Daily",
    impact: "positive",
  },
  {
    emoji: "👥",
    name: "Social Dining",
    context: "Weekend meals",
    frequency: "2× / week",
    impact: "neutral",
  },
];
