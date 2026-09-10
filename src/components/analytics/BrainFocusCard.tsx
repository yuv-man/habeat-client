import { Sparkles, TrendingDown, Info } from "lucide-react";
import { IBrainFocus } from "@/types/interfaces";
import { cn } from "@/lib/utils";

/**
 * The one thing Habeat is working on with this user, at the top of the page.
 *
 * Everything else on the Eating Patterns screen is a measurement. Measurements
 * tell someone how they are doing; none of them says what is being done about
 * it, and a page that opens with a 0–100 score and a bidirectional chart asks
 * the user to work that out themselves.
 *
 * This card is the answer, in the order a person actually asks the questions:
 *
 *   1. What is this about?        the pattern, named plainly
 *   2. How do you know?           the evidence, verbatim and checkable
 *   3. So what are you doing?     the intervention, in the second person
 *   4. How will I know it works?  the success signal, no percentages
 *
 * Every string here is written server-side (`brain.view.ts` and the
 * interventions' `userFacing` block) so that what a stage *means* is defined
 * in one place rather than re-invented per screen.
 */
export function BrainFocusCard({
  focus,
  className,
}: {
  focus: IBrainFocus;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl overflow-hidden border border-teal-100 bg-white",
        "shadow-[0_10px_40px_-10px_rgba(15,118,110,0.15)]",
        className,
      )}
      aria-labelledby="brain-focus-heading"
    >
      {/* Band rather than a plain heading: this is the one block on the page
          that isn't a measurement, and it should not read as another tile. */}
      <div className="bg-teal-700 px-5 py-2.5 flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-teal-200 shrink-0" />
        <h2
          id="brain-focus-heading"
          className="text-[11px] font-bold uppercase tracking-widest text-white"
        >
          What we're working on
        </h2>
      </div>

      <div className="p-5">
        {/* 1 — what this is about */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-full bg-teal-50 flex items-center justify-center text-xl shrink-0"
            aria-hidden
          >
            {focus.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-800 leading-tight">
              {focus.patternName}
            </h3>
            <StageProgress
              label={focus.stageLabel}
              index={focus.stageIndex}
              count={focus.stageCount}
            />
          </div>

          {focus.improving && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold uppercase tracking-wide shrink-0">
              <TrendingDown className="w-3 h-3" />
              Easing
            </span>
          )}
        </div>

        {/* 2 — how we know. Stated before the plan, because a claim about
            someone's life has to be answerable before it is acted on. */}
        {focus.evidence.length > 0 && (
          <div className="mb-4 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
              What we noticed
            </p>
            <ul className="space-y-1">
              {focus.evidence.map((line, i) => (
                <li
                  key={i}
                  className="text-[13px] leading-relaxed text-slate-600"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3 — what we're doing about it */}
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            So this week
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {focus.whatWeAreDoing}
          </p>
        </div>

        {/* 4 — how they'll know. Deliberately not a percentage: a target the
            user can feel is worth more than one they'd have to compute. */}
        <div className="rounded-xl bg-teal-50/60 border border-teal-100 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700/70 mb-1">
            Going well if
          </p>
          <p className="text-[13px] leading-relaxed text-teal-900">
            {focus.goingWellIf}
          </p>
        </div>

        {/* Said plainly while the reading is still thin, so an early guess is
            never mistaken for a settled conclusion. */}
        {focus.confidence === "low" && (
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
            <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
            This is an early read — a few more days of logging will confirm it
            or replace it.
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Where the user is on the change ladder.
 *
 * Rungs, not a percentage bar: progress here is a sequence of distinct stages,
 * and a bar would imply "62% done with late-night eating", which is not a
 * thing. The stage can also move *backwards* when an intervention proves too
 * hard, and dots make that read as a step rather than as loss.
 */
function StageProgress({
  label,
  index,
  count,
}: {
  label: string;
  index: number;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className="text-[13px] font-medium text-teal-700">{label}</span>
      <span
        className="flex items-center gap-1"
        role="img"
        aria-label={`Step ${index} of ${count}`}
      >
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-colors",
              i < index ? "bg-teal-600" : "bg-slate-200",
            )}
          />
        ))}
      </span>
    </div>
  );
}

/**
 * Shown while the Brain has nothing it can honestly claim.
 *
 * Separate from the card rather than a variant of it, because "we're still
 * learning" and "here is what we found" are different messages and blending
 * them produces the thing this whole screen exists to avoid — a placeholder
 * that reads as a finding.
 */
export function BrainFocusPending({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200 border-dashed bg-white/60 p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-xl shrink-0">
          🌱
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-700 mb-1">
            Still getting to know you
          </h2>
          <p className="text-[13px] leading-relaxed text-slate-500">
            Habeat works on one habit at a time, and picks it from what you
            actually log rather than guessing. Keep ticking meals off for a few
            more days and the first one will show up here.
          </p>
        </div>
      </div>
    </section>
  );
}

export default BrainFocusCard;
