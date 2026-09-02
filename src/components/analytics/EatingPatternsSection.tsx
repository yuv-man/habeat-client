import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Bike, CircleSlash, Moon, ChevronRight, Brain } from "lucide-react";
import { useCBTStore, useEmotionalEatingInsight } from "@/stores/cbtStore";
import { usePatternStore } from "@/stores/patternStore";
import { comparePeriods } from "@/lib/patterns";
import { C, softLift } from "@/lib/analyticsTheme";
import MindfulScoreTile from "./MindfulScoreTile";
import BehaviourTile from "./BehaviourTile";

interface EatingPatternsSectionProps {
  period: "week" | "month";
}

const WINDOW_DAYS: Record<"week" | "month", number> = { week: 7, month: 30 };

/**
 * The behavioural half of analytics.
 *
 * Everything else on this page measures what went *into* the user — calories,
 * macros, water. None of it says anything about how eating actually went, which
 * is the thing most people are actually trying to change. This section answers
 * "is the process working?" and is the only place the two data sources meet:
 * the server's mindful-eating score, and the local log of what the user did.
 */
export function EatingPatternsSection({ period }: EatingPatternsSectionProps) {
  const navigate = useNavigate();
  const fetchInsight = useCBTStore((s) => s.fetchEmotionalEatingInsight);
  const insight = useEmotionalEatingInsight();
  const events = usePatternStore((s) => s.events);

  useEffect(() => {
    fetchInsight(period);
  }, [fetchInsight, period]);

  const days = WINDOW_DAYS[period];
  const comparison = useMemo(() => comparePeriods(events, days), [events, days]);

  const comparisonLabel = period === "week" ? "last week" : "last month";
  const prev = comparison.hasPrevious ? comparison.previous : null;

  const hasScore = Boolean(insight && insight.totalMeals > 0);
  const hasBehaviour = events.length > 0;

  // Nothing to show is a real answer. An empty grid of zeroes would read as
  // "you did nothing", which is a claim about the user rather than about the
  // data we happen to hold.
  if (!hasScore && !hasBehaviour) {
    return (
      <section className="space-y-3">
        <SectionHeading />
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: C.surfaceLowest, border: `1px solid ${C.outlineVariant}` }}
        >
          <Brain className="w-10 h-10 mx-auto mb-3" style={{ color: C.outlineVariant }} />
          <h3 className="text-sm font-bold mb-1" style={{ color: C.onSurface }}>
            Nothing to compare yet
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: C.onSurfaceVariant }}>
            This fills in as you use the tracker — checking a mood against a meal,
            saying where food came from, or noting a meal that didn't happen. A
            few days is enough to start.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <SectionHeading />

      {hasScore && insight && (
        <MindfulScoreTile
          score={insight.mindfulEatingScore}
          trend={insight.weeklyTrend ?? []}
          mealsCheckedIn={insight.totalMeals}
          emotionalInstances={insight.emotionalEatingInstances}
        />
      )}

      {hasBehaviour && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <BehaviourTile
              label="Cooked at home"
              value={comparison.current.homeCooked}
              unit="meals"
              icon={ChefHat}
              iconBg="#e6f2ec"
              iconColor={C.primary}
              previous={prev?.homeCooked ?? null}
              upIsGood
              comparisonLabel={comparisonLabel}
            />
            <BehaviourTile
              label="Ordered or ate out"
              value={comparison.current.orderedIn}
              unit="meals"
              icon={Bike}
              iconBg="#fff3e0"
              iconColor="#b45309"
              previous={prev?.orderedIn ?? null}
              upIsGood={false}
              comparisonLabel={comparisonLabel}
            />
            <BehaviourTile
              label="Meals missed"
              value={comparison.current.mealsMissed}
              unit="meals"
              icon={CircleSlash}
              iconBg="#f4f3f1"
              iconColor={C.onSurfaceVariant}
              previous={prev?.mealsMissed ?? null}
              upIsGood={false}
              comparisonLabel={comparisonLabel}
            />
            <BehaviourTile
              label="Late-night snacks"
              value={comparison.current.lateNights}
              unit="nights"
              icon={Moon}
              iconBg="#ede9fe"
              iconColor={C.secondary}
              previous={prev?.lateNights ?? null}
              upIsGood={false}
              comparisonLabel={comparisonLabel}
            />
          </div>

          {/* Says plainly where these came from, so nobody reads them as a
              complete record of how they ate. */}
          <p className="text-[10px] px-1 leading-relaxed" style={{ color: C.outline }}>
            Counted from what you logged on this device over the last {days} days —
            meals you told us the source of, meals marked skipped, and snacks
            logged after 9pm.
          </p>
        </>
      )}

      <button
        onClick={() => navigate("/mindfulness/emotional-eating")}
        className="w-full flex items-center justify-between rounded-2xl px-4 py-3 transition-colors"
        style={{ background: C.surfaceLowest, ...softLift }}
      >
        <span className="text-xs font-semibold" style={{ color: C.primary }}>
          Triggers, risk windows and what helps
        </span>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" style={{ color: C.outline }} />
      </button>
    </section>
  );
}

const SectionHeading = () => (
  <div className="px-1">
    <h2 className="text-lg font-bold" style={{ color: C.onSurface }}>
      Eating Patterns
    </h2>
    <p className="text-xs" style={{ color: C.onSurfaceVariant }}>
      How eating went — not just what was in it
    </p>
  </div>
);

export default EatingPatternsSection;
