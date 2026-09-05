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
/** Null rather than the string "Invalid Date" when the input isn't a date.
 *  The period bounds can come back empty, and printing the failure verbatim
 *  put "Invalid Date–Invalid Date" in front of the user. */
const fmtDate = (isoDate: string | undefined | null): string | null => {
  if (!isoDate) return null;
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

/** "3 Aug–10 Aug", or null when either bound is unusable — callers drop the
 *  whole clause rather than rendering half a range. */
const fmtRange = (
  start: string | undefined | null,
  end: string | undefined | null
): string | null => {
  const a = fmtDate(start);
  const b = fmtDate(end);
  return a && b ? `${a}\u2013${b}` : null;
};

/** "Mon 14 Jul" — used in the per-bar readout. */
const dayFull = (isoDate: string | undefined | null): string => {
  if (!isoDate) return "That day";
  const d = new Date(`${isoDate}T00:00:00`);
  // Same guard as fmtDate — this one feeds an aria-label, where "Invalid Date"
  // would be read aloud verbatim.
  if (Number.isNaN(d.getTime())) return "That day";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

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
          {mealsAnalysed === 1 ? "" : "s"} you logged with a mood check-in near
          them over this period — not from your onboarding answers. Check in on
          your mood closer to eating and it gets sharper.
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
  /** Mindful-eating score that day on the 0–100 scale, or null when no meal
   *  that day had a mood near enough to read anything from. */
  mindfulScore: number | null;
  /** Meals ticked off that day. A day with meals but no score is a real day of
   *  eating we simply can't score — it gets a marker, not a blank. */
  mealsLogged: number;
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
  const loggedMealDays = days.filter((d) => d.mealsLogged > 0).length;
  const scoredMealDays = days.filter((d) => d.mindfulScore != null).length;
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
          const hasScore = day.mindfulScore != null;
          const hasMeal = day.mealsLogged > 0;
          const isSelected = selected === i;

          return (
            <button
              key={day.date}
              onClick={() => setSelected(isSelected ? null : i)}
              aria-label={`${dayFull(day.date)}: ${
                hasMood ? `mood ${day.moodAvg!.toFixed(1)} of 5` : "no mood logged"
              }, ${
                hasScore
                  ? `eating score ${day.mindfulScore} of 100`
                  : hasMeal
                    ? `${day.mealsLogged} meal${day.mealsLogged === 1 ? "" : "s"} logged, no mood nearby to score them`
                    : "no meals logged"
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

              {/* Lower: eating quality, grows from the centre line downward.
                  A day with meals but no nearby mood gets a hatched stub and
                  its meal count: the meals happened, the emotion behind them
                  is what's missing. Drawing that day as a dash was the bug —
                  it told users we had no meals when we had them all along. */}
              <div className="w-full bg-teal-100/50 rounded-b-md h-20 relative flex items-start justify-center overflow-hidden">
                {hasScore ? (
                  <div
                    className="w-1/2 bg-teal-400 rounded-b-md transition-all duration-500 ease-out"
                    style={{ height: `${Math.round(day.mindfulScore!)}%` }}
                  />
                ) : hasMeal ? (
                  <>
                    <div
                      className="w-1/2 rounded-b-md border border-teal-300 border-t-0"
                      style={{
                        height: "28%",
                        backgroundImage:
                          "repeating-linear-gradient(45deg, rgba(45,212,191,0.35) 0 3px, transparent 3px 6px)",
                      }}
                    />
                    <span className="absolute bottom-0.5 inset-x-0 text-center text-[9px] font-semibold text-teal-600 tabular-nums">
                      {day.mealsLogged}
                    </span>
                  </>
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
                  : active.mealsLogged > 0
                    ? `${active.mealsLogged} meal${active.mealsLogged === 1 ? "" : "s"} logged`
                    : "no meals logged"}
              </span>
              {active.mindfulScore == null && active.mealsLogged > 0 && (
                <span className="block text-[10px] text-slate-400 mt-0.5">
                  No mood check-in near them, so they can't be scored
                </span>
              )}
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
          <span className="font-semibold text-slate-600">A hatched stub</span>{" "}
          with a number means you logged that many meals but checked in on your
          mood too far from them to link the two. The meals count; the emotion
          behind them is what's missing.
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
          logged meals, out of the last {days.length}
          {scoredMealDays < loggedMealDays &&
            ` — ${scoredMealDays} of those meal days had a mood close enough to score`}
          .
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

/** Accepts either a 0–1 ratio or an already-scaled 0–100 percentage. */
function toPercent(value: number | undefined | null): number {
  if (value == null || Number.isNaN(value)) return 0;
  return value <= 1 ? value * 100 : value;
}

const REFLECTION_LABELS: Record<string, { emoji: string; label: string }> = {
  // hinderedBy
  stress: { emoji: "😫", label: "Stressed" },
  tiredness: { emoji: "😴", label: "Tired" },
  cravings: { emoji: "🍫", label: "Cravings" },
  "time-pressure": { emoji: "🏃", label: "Too busy" },
  boredom: { emoji: "😑", label: "Bored" },
  sadness: { emoji: "😢", label: "Low" },
  anxiety: { emoji: "😰", label: "Anxious" },
  social: { emoji: "👥", label: "Social" },
  habit: { emoji: "🔄", label: "Habit" },
  celebration: { emoji: "🎉", label: "Celebrating" },
  procrastination: { emoji: "📱", label: "Putting things off" },
  "late-night": { emoji: "🌙", label: "Late night" },
  // easedBy
  "had-time": { emoji: "😌", label: "Had time" },
  "felt-good": { emoji: "❤️", label: "Felt good" },
  "planned-ahead": { emoji: "📋", label: "Planned it" },
  "food-ready": { emoji: "🥗", label: "Food was ready" },
};

/**
 * Reads the daily reflection back to the user. Deliberately plain: counts and
 * proportions, no scoring, no verdict. Both halves get the same visual weight
 * so the page can't read as a list of failures with a footnote of wins.
 */
function ReflectionSummary({
  days,
  easedBy,
  hinderedBy,
}: {
  days: number;
  easedBy: { facilitator: string; count: number }[];
  hinderedBy: { trigger: string; count: number }[];
}) {
  const hasAny = easedBy.length > 0 || hinderedBy.length > 0;

  // Nothing answered yet — an invitation, not an empty-state apology.
  if (!hasAny) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)]">
        <h3 className="text-lg font-bold text-slate-800 mb-1">What you've noticed</h3>
        <p className="text-sm text-slate-400">
          After you check in on the daily tracker, you can add what made eating
          easier or harder that day. Answers show up here — even a couple of days
          is enough to start.
        </p>
      </div>
    );
  }

  const peak = Math.max(
    ...easedBy.map((e) => e.count),
    ...hinderedBy.map((h) => h.count)
  );

  const renderRow = (key: string, count: number, tone: "eased" | "hindered") => {
    const meta = REFLECTION_LABELS[key] ?? { emoji: "•", label: key };
    return (
      <div key={key} className="flex items-center gap-2.5">
        <span className="text-base w-5 shrink-0 text-center">{meta.emoji}</span>
        <span className="text-sm text-slate-600 w-32 shrink-0 truncate">
          {meta.label}
        </span>
        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              tone === "eased" ? "bg-teal-400" : "bg-amber-400"
            )}
            style={{ width: `${peak > 0 ? (count / peak) * 100 : 0}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-400 w-6 text-right tabular-nums">
          {count}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(15,118,110,0.08)]">
      <h3 className="text-lg font-bold text-slate-800 mb-1">What you've noticed</h3>
      <p className="text-[11px] text-slate-400 mb-4 flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 shrink-0" />
        {/* Say plainly how thin the data is — a handful of days is a start,
            not a pattern, and the copy shouldn't imply otherwise. */}
        <span>
          From <strong className="text-slate-500">{days}</strong> day
          {days === 1 ? "" : "s"} you reflected on
          {days < 3 && " — early days yet"}.
        </span>
      </p>

      <div className="space-y-4">
        {easedBy.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600 mb-2">
              Made it easier
            </p>
            <div className="space-y-2">
              {easedBy.map((e) => renderRow(e.facilitator, e.count, "eased"))}
            </div>
          </div>
        )}

        {hinderedBy.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-2">
              Made it harder
            </p>
            <div className="space-y-2">
              {hinderedBy.map((h) => renderRow(h.trigger, h.count, "hindered"))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
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
            patterns. Yours appear as the logs build up: two meals in the same
            slot, two late nights, a meal skipped twice, or a mood trigger seen
            at least once.
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
        mealsLogged: d.mealsLogged ?? 0,
      }));
    }

    // The insight call hasn't landed (or failed). Plot the mood check-ins we
    // already hold rather than an empty frame; the eating half stays unknown
    // rather than being invented.
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
        mealsLogged: 0,
      };
    });
  }, [insight, moodHistory]);

  // Patterns come from the server, which is the only place that can see the
  // meals, the moods and the days a planned meal never happened. The client's
  // job is to render them — and, when there are none, to say so with example
  // rows that are unmistakably labelled as examples.
  const { patterns, patternsAreExample } = useMemo<{
    patterns: Pattern[];
    patternsAreExample: boolean;
  }>(() => {
    const observed = insight?.patterns ?? [];

    if (observed.length) {
      return {
        patterns: observed.map((p) => ({
          emoji: p.emoji,
          name: p.name,
          context: p.context,
          frequency: p.frequency,
          impact: p.impact,
        })),
        patternsAreExample: false,
      };
    }

    return { patterns: DEFAULT_PATTERNS, patternsAreExample: true };
  }, [insight]);

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

  // `satietyRate` arrives as a 0–1 ratio while every sibling metric on this
  // page is already 0–100, so rendering it raw printed a healthy 0.6 as
  // "0.6%" and then labelled it "Low" — inverting the meaning of the number
  // rather than merely misformatting it. Normalise both conventions so the
  // tile stays correct whichever the server sends.
  const satietyPct = Math.round(toPercent(insight?.satietyRate));
  const mealsAnalyzed = insight?.totalMeals ?? 0;
  const mealsLogged = insight?.mealsLogged ?? 0;
  const satietyBasis = insight?.satietyBasis ?? 0;
  // Meals count as data on their own. The old gate only looked at moods, so a
  // week of ticked-off meals with no check-in still landed on "No patterns yet".
  const hasAnyData =
    mealsLogged > 0 ||
    moodHistory.length > 0 ||
    (insight?.reflectionDays ?? 0) > 0;

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

          {/* Provenance: what this page is actually computed from, and how it
              knows it. A meal the user linked a mood to and a meal we paired
              with a nearby check-in are not the same evidence, so the line
              names both rather than blurring them into one number. */}
          {insight && (
            <p className="text-[11px] text-slate-400 mb-6 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              {mealsLogged > 0 ? (
                <span>
                  From <strong className="text-slate-500">{mealsLogged}</strong>{" "}
                  meal{mealsLogged === 1 ? "" : "s"} you logged
                  {insight.totalMeals > 0 ? (
                    <>
                      {" "}— <strong className="text-slate-500">{insight.totalMeals}</strong>{" "}
                      of them with a mood close enough to read
                      {insight.linkedMeals > 0 && `, ${insight.linkedMeals} you linked yourself`}
                    </>
                  ) : (
                    <> — none yet with a mood logged near them</>
                  )}
                  {(() => {
                    const range = fmtRange(insight.period?.start, insight.period?.end);
                    return range ? `, ${range}.` : ".";
                  })()}
                </span>
              ) : moodHistory.length > 0 ? (
                <span>
                  <strong className="text-slate-500">{moodHistory.length}</strong> mood
                  entr{moodHistory.length === 1 ? "y" : "ies"} so far and no meals
                  ticked off — the eating half fills in as you log meals.
                </span>
              ) : (
                <span>
                  Nothing logged yet in this period. Tick off meals on the tracker
                  and check in on your mood to fill this in.
                </span>
              )}
            </p>
          )}

          {/* No data at all */}
          {!hasAnyData ? (
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

              {/* Shown until at least one meal can be read against a mood. The
                  copy changes depending on which half is missing — telling
                  someone who has logged nine meals to "log a meal" is what made
                  this screen feel like it wasn't watching. */}
              {(!insight || insight.totalMeals === 0) && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-start gap-3">
                  <Brain className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-teal-800 mb-0.5">
                      {mealsLogged > 0
                        ? "Your meals are here — the feelings aren't yet"
                        : "Mood data connected"}
                    </p>
                    <p className="text-xs text-teal-700 leading-relaxed">
                      {mealsLogged > 0
                        ? `We can see the ${mealsLogged} meal${mealsLogged === 1 ? "" : "s"} you ticked off, but no mood check-in landed close enough to any of them to say how you felt. Check in on your mood around a meal — within a couple of hours either side — and the eating half of the chart starts filling in.`
                        : "Your mood check-ins are showing above. To unlock your Mindful Eating Score and satiety stats, tick off a meal on the tracker and check in on your mood around the same time."}
                    </p>
                  </div>
                </div>
              )}

              {/* Bento row 2: Mini metric cards + Tips slider — only when real correlations */}
              {insight && insight.totalMeals > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    {/* Only meals where the hunger question was actually put
                        can answer this. Showing 0% because nobody was asked
                        would read as "you never eat for hunger". */}
                    <MetricCard
                      label="Satiety Rate"
                      value={satietyBasis > 0 ? `${satietyPct}%` : "—"}
                      unit={
                        satietyBasis > 0
                          ? satietyPct >= 70 ? "High" : satietyPct >= 40 ? "Medium" : "Low"
                          : "Not asked yet"
                      }
                      sublabel={
                        satietyBasis > 0
                          ? "Meals eaten for hunger, not emotion"
                          : "Rate your hunger when you link a mood to a meal"
                      }
                      icon={<Sparkles className="w-4 h-4" />}
                      color="teal"
                      help={
                        satietyBasis > 0
                          ? `Of the ${satietyBasis} meal${satietyBasis === 1 ? "" : "s"} where you rated your hunger before eating, ${satietyPct}% were started at a genuine hunger level (3 or more out of 5). The rest were started while you were full or close to it.`
                          : "This one needs your own answer: when you link a mood to a meal, the check-in asks how hungry you were beforehand. Until then there is nothing here to report."
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <MetricCard
                      label="Meals Analysed"
                      value={String(mealsAnalyzed)}
                      unit={mealsLogged > mealsAnalyzed ? `of ${mealsLogged} logged` : "total"}
                      sublabel={`${insight.emotionalEatingInstances} showed emotional eating`}
                      icon={<Brain className="w-4 h-4" />}
                      color="violet"
                      help={`Meals with a mood we could read against them${
                        fmtRange(insight.period?.start, insight.period?.end)
                          ? ` between ${fmtDate(insight.period?.start)} and ${fmtDate(insight.period?.end)}`
                          : ""
                      } — ${insight.linkedMeals} you linked to a mood yourself, ${insight.inferredMeals} paired with a check-in logged within two hours. ${
                        insight.unscoredMeals > 0
                          ? `${insight.unscoredMeals} more meal${insight.unscoredMeals === 1 ? " was" : "s were"} logged with no mood nearby, so ${insight.unscoredMeals === 1 ? "it isn't" : "they aren't"} scored.`
                          : "Every meal you logged had a mood near it."
                      }`}
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

              {/* Daily reflection readout. Sits above the patterns table
                  because it needs a couple of days of data, not a couple of
                  weeks — for most users it's the only real content here. */}
              <ReflectionSummary
                days={insight?.reflectionDays ?? 0}
                easedBy={insight?.reflectionFacilitators ?? []}
                hinderedBy={insight?.reflectionTriggers ?? []}
              />

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
