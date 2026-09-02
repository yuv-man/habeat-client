import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatternStore } from "@/stores/patternStore";
import {
  deriveObservations,
  ObservationAction,
  ObservationTone,
  PatternObservation,
} from "@/lib/patterns";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<
  ObservationTone,
  { card: string; title: string; body: string; evidence: string; action: string }
> = {
  positive: {
    card: "bg-teal-50 border-teal-200",
    title: "text-teal-900",
    body: "text-teal-700",
    evidence: "text-teal-600 bg-teal-100/70",
    action: "text-teal-700 hover:bg-teal-100",
  },
  neutral: {
    card: "bg-white border-gray-200",
    title: "text-gray-900",
    body: "text-gray-600",
    evidence: "text-gray-500 bg-gray-100",
    action: "text-habeat hover:bg-habeat/10",
  },
  supportive: {
    card: "bg-amber-50 border-amber-200",
    title: "text-amber-900",
    body: "text-amber-800",
    evidence: "text-amber-700 bg-amber-100/70",
    action: "text-amber-800 hover:bg-amber-100",
  },
};

const ACTION_ROUTES: Record<ObservationAction["kind"], string> = {
  shopping: "/shopping-list",
  "quick-meals": "/recipes",
  breathing: "/mindfulness?tab=exercises&exercise=breathing-478",
  "urge-surfing": "/mindfulness?tab=exercises&exercise=urge-surfing",
  insights: "/mindfulness/emotional-eating",
};

/**
 * Shows at most one observation at a time.
 *
 * That cap is the whole design. Three true things stacked on a dashboard read
 * as a list of ways the user is failing, and the honest response to that is to
 * stop reading. One observation, dismissible, is a remark; a column of them is
 * a verdict.
 */
export function PatternObservationCard({ className }: { className?: string }) {
  const navigate = useNavigate();
  const events = usePatternStore((state) => state.events);
  const dismissed = usePatternStore((state) => state.dismissed);
  const dismiss = usePatternStore((state) => state.dismiss);

  const observation: PatternObservation | null = useMemo(() => {
    const all = deriveObservations(events);
    return all.find((o) => !dismissed[o.key]) ?? null;
  }, [events, dismissed]);

  if (!observation) return null;

  const styles = TONE_STYLES[observation.tone];

  return (
    <AnimatePresence>
      <motion.section
        key={observation.key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        aria-label="Pattern noticed"
        className={cn(
          "relative rounded-2xl border p-4 shadow-sm",
          styles.card,
          className
        )}
      >
        <button
          onClick={() => dismiss(observation.key)}
          aria-label="Dismiss this observation"
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-black/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 pe-6">
          <span className="text-2xl leading-none shrink-0" aria-hidden="true">
            {observation.emoji}
          </span>

          <div className="min-w-0 flex-1">
            <h3 className={cn("text-sm font-bold leading-snug", styles.title)}>
              {observation.title}
            </h3>

            {/* The count sits right under the claim, deliberately. A user can
                check what we said against what we actually saw. */}
            <span
              className={cn(
                "inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tabular-nums",
                styles.evidence
              )}
            >
              {observation.evidence}
            </span>

            <p className={cn("text-xs leading-relaxed mt-2", styles.body)}>
              {observation.body}
            </p>

            {observation.action && (
              <button
                onClick={() => navigate(ACTION_ROUTES[observation.action!.kind])}
                className={cn(
                  "mt-3 -ms-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors",
                  styles.action
                )}
              >
                {observation.action.label}
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            )}
          </div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

export default PatternObservationCard;
