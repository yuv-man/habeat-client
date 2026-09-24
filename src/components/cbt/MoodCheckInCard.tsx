import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EatingFacilitator,
  EatingTrigger,
  IDailyReflection,
  MoodCategory,
  MoodLevel,
} from "@/types/interfaces";

const MOOD_OPTIONS: {
  value: MoodCategory;
  label: string;
  emoji: string;
  level: MoodLevel;
  ringColor: string;
  activeBg: string;
}[] = [
  { value: "happy",    label: "Happy",    emoji: "😄", level: 5, ringColor: "ring-yellow-300", activeBg: "bg-yellow-50" },
  { value: "calm",     label: "Calm",     emoji: "😌", level: 4, ringColor: "ring-blue-300",   activeBg: "bg-blue-50"   },
  { value: "energetic",label: "Energetic",emoji: "😁", level: 5, ringColor: "ring-orange-300", activeBg: "bg-orange-50" },
  { value: "neutral",  label: "Neutral",  emoji: "😐", level: 3, ringColor: "ring-gray-300",   activeBg: "bg-gray-100"  },
  { value: "tired",    label: "Tired",    emoji: "😴", level: 2, ringColor: "ring-indigo-300", activeBg: "bg-indigo-50" },
  { value: "stressed", label: "Stressed", emoji: "😤", level: 2, ringColor: "ring-red-300",    activeBg: "bg-red-50"    },
  { value: "anxious",  label: "Anxious",  emoji: "😰", level: 2, ringColor: "ring-purple-300", activeBg: "bg-purple-50" },
  { value: "sad",      label: "Sad",      emoji: "😢", level: 1, ringColor: "ring-cyan-300",   activeBg: "bg-cyan-50"   },
];

const EASED_BY_OPTIONS: { value: EatingFacilitator; label: string; emoji: string }[] = [
  { value: "had-time",      label: "Had time",     emoji: "😌" },
  { value: "felt-good",     label: "Felt good",    emoji: "❤️" },
  { value: "planned-ahead", label: "Planned it",   emoji: "📋" },
  { value: "food-ready",    label: "Food ready", emoji: "🥗" },
];

const HINDERED_BY_OPTIONS: { value: EatingTrigger; label: string; emoji: string }[] = [
  { value: "stress",        label: "Stressed",  emoji: "😫" },
  { value: "tiredness",     label: "Tired",     emoji: "😴" },
  { value: "cravings",      label: "Cravings",  emoji: "🍫" },
  { value: "time-pressure", label: "Too busy",  emoji: "🏃" },
];

/** The card identifies a mood by its position in the row, so anything wanting
 *  to restore a previously logged mood needs the reverse lookup. */
export const moodIndexOf = (category: MoodCategory): number | null => {
  const i = MOOD_OPTIONS.findIndex((m) => m.value === category);
  return i === -1 ? null : i;
};

interface MoodCheckInCardProps {
  firstName?: string;
  selectedIndex: number | null;
  onSelect: (index: number, category: MoodCategory, level: MoodLevel) => void;
  /** Null until a mood is logged — the reflection is the card's second beat. */
  reflection?: IDailyReflection | null;
  onReflectionChange?: (next: IDailyReflection) => void;
  /** Whether there is any eating yet to reflect on. The card can't know this,
   *  so the screen decides. Defaults to false: a missing prop should cost the
   *  reflection, never put an unanswerable question in front of someone. */
  showReflection?: boolean;
  /** Done (with the answers) or Skip (null). The question then goes away for
   *  the day. */
  onReflectionClose?: (answers: IDailyReflection | null) => void;
}

/** How long the "noted" line stays before the section folds away. */
const THANKS_MS = 2200;

export function MoodCheckInCard({
  firstName,
  selectedIndex,
  onSelect,
  reflection,
  onReflectionChange,
  showReflection = false,
  onReflectionClose,
}: MoodCheckInCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  /** Just answered: show a short "noted" line, then fold away. */
  const [thanking, setThanking] = useState(false);
  useEffect(() => {
    if (!thanking) return;
    const t = setTimeout(() => setThanking(false), THANKS_MS);
    return () => clearTimeout(t);
  }, [thanking]);

  const easedBy = reflection?.easedBy ?? [];
  const hinderedBy = reflection?.hinderedBy ?? [];

  const toggleEasedBy = (value: EatingFacilitator) => {
    onReflectionChange?.({
      easedBy: easedBy.includes(value)
        ? easedBy.filter((v) => v !== value)
        : [...easedBy, value],
      hinderedBy,
    });
  };

  const toggleHinderedBy = (value: EatingTrigger) => {
    onReflectionChange?.({
      easedBy,
      hinderedBy: hinderedBy.includes(value)
        ? hinderedBy.filter((v) => v !== value)
        : [...hinderedBy, value],
    });
  };

  return (
    <section
      className="rounded-3xl p-5 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100"
      aria-label="Daily mood check-in"
    >
      <div className="mb-4">
        {firstName && (
          <p className="text-xs font-medium text-gray-400 mb-1">Hello {firstName},</p>
        )}
        <h2 className="text-xl font-bold leading-snug text-gray-800">
          How do you <span className="text-habeat">feel today?</span>
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        role="radiogroup"
        aria-label="Select your mood"
      >
        {MOOD_OPTIONS.map((mood, i) => {
          const isSelected = selectedIndex === i;
          return (
            <motion.button
              key={mood.value}
              whileTap={{ scale: 0.88 }}
              onClick={() => onSelect(i, mood.value, mood.level)}
              role="radio"
              aria-checked={isSelected}
              aria-label={mood.label}
              className={cn(
                "flex-shrink-0 flex flex-col items-center gap-1.5 px-2.5 py-2.5 rounded-2xl min-w-[60px]",
                "transition-all duration-200 cursor-pointer",
                isSelected
                  ? `${mood.activeBg} ring-2 ${mood.ringColor} shadow-sm`
                  : "hover:bg-gray-50 active:bg-gray-100"
              )}
            >
              <div className="relative">
                <motion.span
                  className="text-4xl leading-none block text-center"
                  animate={isSelected ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                >{mood.emoji}</motion.span>
                {/* Confirmation gesture — pops in when the feeling is logged */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 16 }}
                      className="absolute -top-1.5 -right-1.5 bg-habeat text-white rounded-full p-0.5 shadow-md"
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <span className={cn(
                "text-[10px] font-semibold whitespace-nowrap",
                isSelected ? "text-gray-700" : "text-gray-400"
              )}>
                {mood.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Second beat: why the day went the way it did ──────────────
          Only once a feeling is logged AND something has been eaten — asked
          before any eating, it is a question with no answer. Optional, and
          closed for the day by Done or Skip; the mood itself is already saved
          by the time this renders. */}
      <AnimatePresence initial={false}>
        {selectedIndex !== null && onReflectionChange && showReflection && !reflection?.closedAt && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    What shaped your eating today?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Pick any that fit</p>
                </div>
                <button
                  type="button"
                  onClick={() => onReflectionClose?.(null)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600 px-1 py-0.5"
                >
                  Skip
                </button>
              </div>

              <ReflectionRow
                label="Helped"
                icon={<ThumbsUp className="w-3.5 h-3.5 text-habeat" aria-hidden />}
                options={EASED_BY_OPTIONS}
                selected={easedBy}
                onToggle={toggleEasedBy}
                activeClass="border-habeat bg-habeat/10 text-habeat"
              />

              <ReflectionRow
                label="Got in the way"
                icon={<ThumbsDown className="w-3.5 h-3.5 text-amber-500" aria-hidden />}
                options={HINDERED_BY_OPTIONS}
                selected={hinderedBy}
                onToggle={toggleHinderedBy}
                activeClass="border-amber-400 bg-amber-50 text-amber-700"
              />

              <button
                type="button"
                disabled={easedBy.length + hinderedBy.length === 0}
                onClick={() => {
                  setThanking(true);
                  onReflectionClose?.({ ...reflection, easedBy, hinderedBy });
                }}
                className="mt-4 w-full rounded-xl bg-habeat py-2.5 text-sm font-semibold text-white transition-opacity hover:bg-habeat-hover disabled:opacity-40"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
        {thanking && (
          <motion.p
            key="thanks"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            role="status"
            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-habeat overflow-hidden"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
            Noted — thanks
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

interface ReflectionRowProps<T extends string> {
  label: string;
  icon: ReactNode;
  options: { value: T; label: string; emoji: string }[];
  selected: T[];
  onToggle: (value: T) => void;
  activeClass: string;
}

function ReflectionRow<T extends string>({
  label,
  icon,
  options,
  selected,
  onToggle,
  activeClass,
}: ReflectionRowProps<T>) {
  return (
    <div className="mt-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
        {icon}
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const isActive = selected.includes(option.value);
          return (
            <motion.button
              key={option.value}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onToggle(option.value)}
              aria-pressed={isActive}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors duration-150",
                isActive
                  ? cn(activeClass, "font-semibold")
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              )}
            >
              <span className="text-lg leading-none" aria-hidden>
                {option.emoji}
              </span>
              <span className="truncate">{option.label}</span>
              {isActive && (
                <Check className="ml-auto w-3.5 h-3.5 flex-shrink-0" strokeWidth={3} aria-hidden />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
