import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wind, Check } from "lucide-react";
import { MissReason } from "@/stores/patternStore";
import { cn } from "@/lib/utils";

/** Shared so the caller-supplied "ate something else" trigger — which has to be
 *  a ChangeMealModal child rather than a plain button — matches the panel's own
 *  action without the styles drifting apart. */
export const MISSED_ACTION_CLASS =
  "w-full py-2 px-2 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-amber-900 hover:bg-amber-100/60 transition-colors cursor-pointer text-center";

const REASONS: { value: MissReason; label: string; emoji: string }[] = [
  { value: "time-pressure", label: "Too busy", emoji: "🏃" },
  { value: "stress", label: "Stressed", emoji: "😫" },
  { value: "tiredness", label: "Too tired", emoji: "😴" },
  { value: "not-hungry", label: "Wasn't hungry", emoji: "🤷" },
];

interface MissedMealPanelProps {
  mealLabel: string;
  /** The reason already on file for this meal today, if the user answered
   *  earlier. Without it a reload would re-ask a question they've answered,
   *  which reads as the app not listening. */
  answeredReason?: MissReason | null;
  hasAnswered?: boolean;
  /** The "I ate something else" trigger, supplied by the caller so it can be a
   *  ChangeMealModal child. Rendered as the first option because the most
   *  common truth behind an unlogged meal is that something *was* eaten — just
   *  not the planned thing. */
  logSomethingElseSlot: ReactNode;
  onSkipped: (reason: MissReason | null) => void;
  className?: string;
}

/**
 * What the app says when a planned meal never got logged.
 *
 * The old behaviour was to grey the card out and move on, which quietly treats
 * a skipped meal as a closed matter. It isn't: skipping lunch under stress is
 * the front half of a pattern whose back half is eating everything in the house
 * at 10pm. Naming it while the day is still running is the only chance to
 * catch that, and the reason chip is what turns "nothing logged" — which is
 * indistinguishable from forgetting to open the app — into usable signal.
 *
 * Tone rules, because this is the moment a food app most easily becomes a
 * scold: no "you failed to", no calorie maths, no streak threat. A missed meal
 * is information, and the panel's job is to collect it and get out of the way.
 */
export function MissedMealPanel({
  mealLabel,
  answeredReason = null,
  hasAnswered = false,
  logSomethingElseSlot,
  onSkipped,
  className,
}: MissedMealPanelProps) {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"ask" | "reason" | "done">(
    hasAnswered ? "done" : "ask"
  );
  const [chosen, setChosen] = useState<MissReason | null>(answeredReason);

  const handleReason = (reason: MissReason) => {
    setChosen(reason);
    setStage("done");
    onSkipped(reason);
  };

  if (stage === "done") {
    return (
      <div
        className={cn(
          "rounded-xl border border-gray-200 bg-gray-50 p-3",
          className
        )}
      >
        <div className="flex items-center gap-2 text-gray-600">
          <Check className="w-4 h-4 text-habeat shrink-0" />
          <p className="text-xs">
            Noted. Days go sideways — this just helps spot when it keeps
            happening at the same hour.
          </p>
        </div>

        {/* The one reason that has something useful attached to it. Offered,
            never auto-launched: a stressed person gets to decide whether they
            want a breathing exercise right now. */}
        {chosen === "stress" && (
          <button
            onClick={() =>
              navigate("/mindfulness?tab=exercises&exercise=breathing-478")
            }
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            Two minutes of breathing?
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 p-3",
        className
      )}
    >
      <p className="text-xs font-semibold text-amber-900 mb-2.5">
        {mealLabel} didn't get logged.
      </p>

      <AnimatePresence mode="wait">
        {stage === "ask" ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex gap-2"
          >
            <div className="flex-1">{logSomethingElseSlot}</div>
            <button
              onClick={() => setStage("reason")}
              className={cn("flex-1", MISSED_ACTION_CLASS)}
            >
              I skipped it
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="reason"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <p className="text-[11px] text-amber-700 mb-2">
              What got in the way?{" "}
              <button
                onClick={() => {
                  setStage("done");
                  onSkipped(null);
                }}
                className="underline underline-offset-2 hover:text-amber-900"
              >
                skip this
              </button>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => handleReason(reason.value)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white border border-amber-200 text-[11px] font-medium text-amber-900 hover:bg-amber-100 transition-colors"
                >
                  <span aria-hidden="true">{reason.emoji}</span>
                  {reason.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MissedMealPanel;
