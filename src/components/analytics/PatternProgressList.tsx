import { useState } from "react";
import { TrendingDown, Minus, Check, ChevronDown, Lightbulb } from "lucide-react";
import { IPatternProgress } from "@/types/interfaces";
import { cn } from "@/lib/utils";

/**
 * How each of the user's eating patterns is moving, with things to try.
 *
 * The focus card above answers "what are we working on"; this answers the
 * question people ask next — "and is anything actually changing?" Trends are
 * measured server-side against where the user started, not last week, so a
 * noisy week doesn't read as a setback. No scores and no percentages: the
 * label says what changed, the evidence says how we know.
 */
export function PatternProgressList({
  progress,
  className,
}: {
  progress: IPatternProgress[];
  className?: string;
}) {
  if (progress.length === 0) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-sm p-5",
        className,
      )}
      aria-labelledby="pattern-progress-heading"
    >
      <h2
        id="pattern-progress-heading"
        className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3"
      >
        How your patterns are changing
      </h2>
      <ul className="divide-y divide-slate-100">
        {progress.map((p) => (
          <PatternRow key={p.patternId} pattern={p} />
        ))}
      </ul>
    </section>
  );
}

const TREND_CHIP: Record<
  IPatternProgress["trend"],
  { label: string; icon: typeof Check; className: string }
> = {
  improving: {
    label: "Easing",
    icon: TrendingDown,
    className: "bg-teal-50 text-teal-700",
  },
  steady: {
    label: "Steady",
    icon: Minus,
    className: "bg-slate-100 text-slate-600",
  },
  resolved: {
    label: "Resolved",
    icon: Check,
    className: "bg-emerald-50 text-emerald-700",
  },
};

function PatternRow({ pattern }: { pattern: IPatternProgress }) {
  // The pattern being worked on opens with its tips showing; the rest stay
  // folded so the list reads as a summary first.
  const [open, setOpen] = useState(pattern.isFocus);
  const chip = TREND_CHIP[pattern.trend];
  const Icon = chip.icon;
  const hasTips = pattern.tips.length > 0;

  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-lg shrink-0"
          aria-hidden
        >
          {pattern.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-800">{pattern.name}</h3>
            <span
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                chip.className,
              )}
            >
              <Icon className="w-3 h-3" />
              {chip.label}
            </span>
            {pattern.isFocus && (
              <span className="text-[10px] font-semibold text-teal-700">
                Working on it
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">{pattern.trendLabel}</p>
          {pattern.evidence && !pattern.isFocus && (
            <p className="text-[12px] leading-relaxed text-slate-600 mt-1">
              {pattern.evidence}
            </p>
          )}

          {hasTips && (
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-teal-700 hover:text-teal-800"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Things to try
              <ChevronDown
                className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
              />
            </button>
          )}
          {hasTips && open && (
            <ul className="mt-2 space-y-1.5">
              {pattern.tips.map((tip, i) => (
                <li
                  key={i}
                  className="text-[13px] leading-relaxed text-slate-700 pl-3 border-l-2 border-teal-200"
                >
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}
