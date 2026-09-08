import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  Heart,
  Users,
  Zap,
  RefreshCw,
  Check,
  ChevronDown,
  Leaf,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCBTStore } from "@/stores/cbtStore";
import { useWatchStore } from "@/stores/watchStore";
import { toLocalDateString } from "@/lib/dateUtils";
import {
  calcEmotionalEatingScore,
  getNudgeMessage,
  shouldNudge,
  NUDGE_THRESHOLD,
} from "@/lib/mindfulEating";
import type {
  EatingMode,
  IMoodEntry,
  MoodCategory,
  MoodLevel,
} from "@/types/interfaces";

/**
 * The one place a meal gets a feeling attached to it.
 *
 * There used to be three: an inline eating-mode picker on meal cards, a
 * three-step modal wizard behind a "Mood" button, and a before/after accordion
 * on snack cards — each with its own visual language and its own idea of what
 * a meal-mood correlation contains. This is all of them.
 *
 * Two rules hold across both phases:
 *   - Every tap saves. There is no Save button and nothing to submit.
 *   - Each save sends the whole picture, not a patch, so a request that fails
 *     is repaired by the next tap. The server upserts on (meal, date), so a
 *     before check-in and an after check-in refine one record.
 */

export type CheckInPhase = "before" | "after";

type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

const EATING_MODES: {
  value: EatingMode;
  label: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  ringColor: string;
  selectedBg: string;
  labelColor: string;
}[] = [
  {
    value: "mindful",
    label: "Mindful",
    icon: Brain,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    ringColor: "ring-teal-200",
    selectedBg: "bg-teal-50",
    labelColor: "text-teal-700",
  },
  {
    value: "comfort",
    label: "Comfort",
    icon: Heart,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-500",
    ringColor: "ring-rose-200",
    selectedBg: "bg-rose-50",
    labelColor: "text-rose-600",
  },
  {
    value: "social",
    label: "Social",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    ringColor: "ring-blue-200",
    selectedBg: "bg-blue-50",
    labelColor: "text-blue-700",
  },
  {
    value: "fuel",
    label: "Fuel",
    icon: Zap,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    ringColor: "ring-amber-200",
    selectedBg: "bg-amber-50",
    labelColor: "text-amber-700",
  },
  {
    value: "habit",
    label: "Habit",
    icon: RefreshCw,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    ringColor: "ring-gray-200",
    selectedBg: "bg-gray-50",
    labelColor: "text-gray-600",
  },
];

/** Five, not nine. Around a meal the useful answer is "better, same or worse"
 *  with a little shading; the full palette belongs to a check-in the user came
 *  to on purpose. Both phases share the row so the two answers are comparable. */
const MOODS: { value: MoodCategory; label: string; emoji: string }[] = [
  { value: "happy", label: "Good", emoji: "😄" },
  { value: "calm", label: "Calm", emoji: "😌" },
  { value: "neutral", label: "Fine", emoji: "😐" },
  { value: "stressed", label: "Tense", emoji: "😤" },
  { value: "sad", label: "Low", emoji: "😢" },
];

/** Anchored, because a bare 1–5 row asks the user to invent the scale. */
const HUNGER_ANCHORS: Record<number, string> = {
  1: "Not hungry",
  2: "Slightly hungry",
  3: "Moderately hungry",
  4: "Very hungry",
  5: "Extremely hungry",
};

const FULLNESS_ANCHORS: Record<number, string> = {
  1: "Still hungry",
  2: "Not quite",
  3: "Satisfied",
  4: "Full",
  5: "Too full",
};

interface MealCheckInProps {
  mealId: string;
  mealType: MealSlot;
  mealName: string;
  /** The plan date this meal belongs to, "YYYY-MM-DD". */
  date: string;
  phase: CheckInPhase;
  /** Collapsed behind a one-line header until tapped. The after phase is
   *  always open — the user just marked the meal done, so the question is
   *  already in context. */
  collapsible?: boolean;
  /** Opens a collapsible check-in immediately. Used where the moment itself is
   *  the reason to ask: a snack at 11pm shouldn't need a second tap. */
  defaultOpen?: boolean;
  /** Fired once the after-meal answer is complete and its confirmation has
   *  been shown, so the caller can put the panel away. The check-in raises the
   *  toast itself — the answer is the same wherever it was given. */
  onLogged?: () => void;
  className?: string;
}

export function MealCheckIn({
  mealId,
  mealType,
  mealName,
  date,
  phase,
  collapsible = false,
  defaultOpen = false,
  onLogged,
  className,
}: MealCheckInProps) {
  const navigate = useNavigate();
  const linkMoodToMeal = useCBTStore((s) => s.linkMoodToMeal);
  const watchSnapshot = useWatchStore((s) => s.snapshot);

  const isAfter = phase === "after";
  const [isOpen, setIsOpen] = useState(!collapsible || defaultOpen);
  const [showDetail, setShowDetail] = useState(false);
  /** Runs between the last tap and the panel going away, so the selection is
   *  visible for a beat rather than vanishing under the finger. */
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const [eatingMode, setEatingMode] = useState<EatingMode | null>(null);
  const [mood, setMood] = useState<MoodCategory | null>(null);
  const [level, setLevel] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState("");

  /** Mirrors state so a save can read values the current render hasn't
   *  committed yet — two quick taps would otherwise send a stale set. */
  const answers = useRef({
    eatingMode: null as EatingMode | null,
    mood: null as MoodCategory | null,
    level: null as MoodLevel | null,
    note: "",
  });

  const anchors = isAfter ? FULLNESS_ANCHORS : HUNGER_ANCHORS;

  const cancelDismiss = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = null;
  };

  useEffect(() => cancelDismiss, []);

  /**
   * The after-meal check-in is finished once both questions are answered, so
   * it puts itself away rather than sitting there looking unanswered. The
   * before-meal one stays: its whole point is the nudge underneath it.
   *
   * Nothing is dismissed while the detail section is open — the user is
   * plainly still working — and any tap reschedules, so changing an answer
   * never races the panel closing.
   */
  const scheduleDismiss = (detailOpen = showDetail) => {
    cancelDismiss();
    if (!isAfter || detailOpen) return;

    const { eatingMode: mode, mood: category } = answers.current;
    if (!mode || !category) return;

    const modeLabel = EATING_MODES.find((m) => m.value === mode)?.label;
    const moodLabel = MOODS.find((m) => m.value === category)?.label;

    dismissTimer.current = setTimeout(() => {
      dismissTimer.current = null;
      toast.success(`Logged as ${modeLabel} · ${moodLabel} after`, {
        duration: 2500,
      });
      setIsOpen(false);
      onLogged?.();
    }, 900);
  };

  const moodEntry = (category: MoodCategory, now: Date): IMoodEntry =>
    ({
      date: toLocalDateString(now),
      time: now.toTimeString().split(" ")[0].slice(0, 5),
      moodLevel: 3,
      moodCategory: category,
      linkedMealId: mealId,
      linkedMealType: mealType,
    }) as IMoodEntry;

  const biometrics = watchSnapshot
    ? {
        heartRate: watchSnapshot.heartRate,
        restingHeartRate: watchSnapshot.restingHeartRate,
        stressLevel: watchSnapshot.stressLevel,
        sleepHours: watchSnapshot.sleepHours,
        sleepQuality: watchSnapshot.sleepQuality,
        stepCount: watchSnapshot.stepCount,
      }
    : undefined;

  const save = (patch: Partial<typeof answers.current>) => {
    answers.current = { ...answers.current, ...patch };
    const {
      eatingMode: mode,
      mood: category,
      level: scale,
      note: text,
    } = answers.current;
    const now = new Date();

    // Before the meal, whether this looks emotional is a heuristic read on the
    // mood and hunger just given. After it, the user has answered outright by
    // naming why they ate — their own word wins over the guess.
    const wasEmotionalEating = isAfter
      ? mode === "comfort" || mode === "habit"
      : calcEmotionalEatingScore(category, scale, mealType, watchSnapshot) >
        NUDGE_THRESHOLD;

    linkMoodToMeal({
      mealId,
      mealName,
      mealType,
      date,
      wasEmotionalEating,
      biometrics,
      // The same 1–5 row is hunger before the meal and fullness after it.
      // Filing an after-meal answer as hunger is what made the Mindful Eating
      // Score read every satisfied user as ravenous.
      ...(isAfter
        ? {
            eatingMode: mode ?? undefined,
            moodAfter: category ? moodEntry(category, now) : undefined,
            satisfactionAfter: scale ?? undefined,
            notes: text || undefined,
          }
        : {
            moodBefore: category ? moodEntry(category, now) : undefined,
            hungerLevelBefore: scale ?? undefined,
          }),
    }).catch(() => {
      // A one-tap reflection is not worth interrupting the screen over, and
      // the next tap re-sends the full set anyway.
    });

    scheduleDismiss();
  };

  const showNudge =
    !isAfter &&
    !nudgeDismissed &&
    shouldNudge(mood, level, mealType, watchSnapshot);

  const selectedMode = EATING_MODES.find((m) => m.value === eatingMode);
  const selectedMood = MOODS.find((m) => m.value === mood);
  const hasAnswered = isAfter ? Boolean(eatingMode) : Boolean(mood || level);

  const scaleRow = (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-widest">
        {isAfter ? "How full are you?" : "How hungry are you?"}
      </p>
      <div className="flex gap-1.5" role="radiogroup">
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((value) => (
          <button
            key={value}
            onClick={() => {
              const next = level === value ? null : value;
              setLevel(next);
              save({ level: next });
            }}
            role="radio"
            aria-checked={level === value}
            aria-label={anchors[value]}
            className={cn(
              "flex-1 py-2 rounded-lg text-[11px] font-semibold transition-colors",
              level === value
                ? isAfter
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white"
                : "bg-white/80 text-gray-500 hover:bg-white"
            )}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 text-center">
        {level
          ? anchors[level]
          : isAfter
            ? "1 = still hungry · 5 = too full"
            : "1 = not hungry · 5 = extremely hungry"}
      </p>
    </div>
  );

  const moodRow = (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 text-center mb-2.5 uppercase tracking-widest">
        {isAfter ? "And how do you feel now?" : "And how are you feeling?"}
      </p>
      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label={
          isAfter ? "How you feel after eating" : "How you feel right now"
        }
      >
        {MOODS.map((option) => {
          const isSelected = mood === option.value;
          return (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.88 }}
              onClick={() => {
                setMood(option.value);
                save({ mood: option.value });
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl",
                "transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-white ring-2 ring-purple-200 shadow-sm"
                  : "bg-white/80 hover:bg-white active:bg-white"
              )}
            >
              <span
                className={cn(
                  "text-xl leading-none transition-all duration-200",
                  isSelected ? "grayscale-0" : "grayscale opacity-60"
                )}
                aria-hidden="true"
              >
                {option.emoji}
              </span>
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wide transition-colors duration-200",
                  isSelected ? "text-purple-700" : "text-gray-400"
                )}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );

  const body = isAfter ? (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold text-gray-400 text-center mb-3 uppercase tracking-widest">
          How did you eat?
        </p>
        <div
          className="flex gap-2"
          role="radiogroup"
          aria-label="Select your eating mode"
        >
          {EATING_MODES.map((option) => {
            const Icon = option.icon;
            const isSelected = eatingMode === option.value;
            return (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.88 }}
                onClick={() => {
                  setEatingMode(option.value);
                  save({ eatingMode: option.value });
                }}
                role="radio"
                aria-checked={isSelected}
                aria-label={option.label}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl",
                  "transition-all duration-200 cursor-pointer",
                  isSelected
                    ? `${option.selectedBg} ring-2 ${option.ringColor} shadow-sm`
                    : "bg-white/80 hover:bg-white active:bg-white"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-colors duration-200",
                    isSelected
                      ? `${option.iconBg} ${option.iconColor}`
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <Icon className="w-4 h-4 stroke-[2]" aria-hidden="true" />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wide transition-colors duration-200",
                    isSelected ? option.labelColor : "text-gray-400"
                  )}
                >
                  {option.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* The second question only exists once the first is answered. Both at
          once turns a one-tap reflection back into a form. */}
      <AnimatePresence initial={false}>
        {eatingMode && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {moodRow}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Everything past the two questions is opt-in. It used to be a third
          wizard step standing between the user and saving anything at all. */}
      <AnimatePresence initial={false}>
        {showDetail && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3">
              {scaleRow}
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={() => save({ note: note.trim() })}
                placeholder="Anything worth remembering?"
                className="w-full px-3 py-2 rounded-lg bg-white/80 text-xs text-gray-700 placeholder:text-gray-400 border-0 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ) : (
    <div className="space-y-4">
      {scaleRow}
      {moodRow}

      {/* The app has an exercise built for precisely this moment. It was once
          reachable only by browsing to it. */}
      <AnimatePresence initial={false}>
        {showNudge && (
          <motion.div
            key="nudge"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <div className="flex items-start gap-2.5">
                <Leaf className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="flex-1 min-w-0 text-[11px] text-purple-700 leading-relaxed">
                  {getNudgeMessage(mood, level, mealType)}
                </p>
                <button
                  onClick={() => setNudgeDismissed(true)}
                  className="text-[11px] text-purple-400 hover:text-purple-600 flex-shrink-0 mt-0.5"
                >
                  Got it
                </button>
              </div>
              <button
                onClick={() =>
                  navigate("/mindfulness?tab=exercises&exercise=urge-surfing")
                }
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white border border-purple-200 text-[11px] font-semibold text-purple-700 hover:bg-purple-100/60 transition-colors"
              >
                <Waves className="w-3.5 h-3.5" />
                Ride it out — 5 min
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const shell = (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "rounded-2xl p-4",
        "bg-[#f4f5f8]",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.95)]",
        !collapsible && className
      )}
    >
      {body}

      {/* Confirmation on the left, the one remaining affordance on the right.
          No Save button — every tap above has already saved. */}
      <AnimatePresence initial={false}>
        {hasAnswered && (
          <motion.div
            key="footer"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-between gap-2 overflow-hidden"
          >
            <span
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                isAfter ? selectedMode?.labelColor : "text-purple-700"
              )}
            >
              <Check className="w-3 h-3" aria-hidden="true" />
              {isAfter
                ? `${selectedMode?.label}${selectedMood ? ` · ${selectedMood.label} after` : ""}`
                : "Noted"}
            </span>

            {isAfter && (
              <button
                onClick={() => {
                  // Opening detail means the user isn't done; closing it means
                  // they are. The panel follows rather than second-guessing.
                  const willOpen = !showDetail;
                  setShowDetail(willOpen);
                  if (willOpen) cancelDismiss();
                  else scheduleDismiss(false);
                }}
                className="text-[11px] font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showDetail ? "Less" : "+ Add detail"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  if (!collapsible) return shell;

  return (
    <div className={className}>
      <button
        onClick={() => {
          cancelDismiss();
          setIsOpen((v) => !v);
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-medium">
          <Leaf className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
          {hasAnswered
            ? "Checked in"
            : isAfter
              ? "How was that meal?"
              : "Check in before eating"}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-gray-300 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2">{shell}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
