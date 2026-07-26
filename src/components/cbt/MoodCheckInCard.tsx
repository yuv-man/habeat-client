import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { MoodCategory, MoodLevel } from "@/types/interfaces";

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

interface MoodCheckInCardProps {
  firstName?: string;
  selectedIndex: number | null;
  onSelect: (index: number, category: MoodCategory, level: MoodLevel) => void;
}

export function MoodCheckInCard({ firstName, selectedIndex, onSelect }: MoodCheckInCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
    </section>
  );
}
