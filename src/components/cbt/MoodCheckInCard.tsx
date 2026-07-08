import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MoodCategory, MoodLevel } from "@/types/interfaces";

import happyImg from "@/assets/feelingsTypes/happy.webp";
import calmImg from "@/assets/feelingsTypes/calm.webp";
import energeticImg from "@/assets/feelingsTypes/energetic.webp";
import neutralImg from "@/assets/feelingsTypes/neutral.webp";
import tiredImg from "@/assets/feelingsTypes/tired.webp";
import stressedImg from "@/assets/feelingsTypes/stressed.webp";
import anxiousImg from "@/assets/feelingsTypes/anxious.webp";
import sadImg from "@/assets/feelingsTypes/sad.webp";

const MOOD_OPTIONS: {
  value: MoodCategory;
  label: string;
  image: string;
  level: MoodLevel;
  ringColor: string;
  activeBg: string;
}[] = [
  { value: "happy",    label: "Happy",    image: happyImg,    level: 5, ringColor: "ring-yellow-300", activeBg: "bg-yellow-50" },
  { value: "calm",     label: "Calm",     image: calmImg,     level: 4, ringColor: "ring-blue-300",   activeBg: "bg-blue-50"   },
  { value: "energetic",label: "Energetic",image: energeticImg,level: 5, ringColor: "ring-orange-300", activeBg: "bg-orange-50" },
  { value: "neutral",  label: "Neutral",  image: neutralImg,  level: 3, ringColor: "ring-gray-300",   activeBg: "bg-gray-100"  },
  { value: "tired",    label: "Tired",    image: tiredImg,    level: 2, ringColor: "ring-indigo-300", activeBg: "bg-indigo-50" },
  { value: "stressed", label: "Stressed", image: stressedImg, level: 2, ringColor: "ring-red-300",    activeBg: "bg-red-50"    },
  { value: "anxious",  label: "Anxious",  image: anxiousImg,  level: 2, ringColor: "ring-purple-300", activeBg: "bg-purple-50" },
  { value: "sad",      label: "Sad",      image: sadImg,      level: 1, ringColor: "ring-cyan-300",   activeBg: "bg-cyan-50"   },
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
              <img
                src={mood.image}
                alt={mood.label}
                className="w-12 h-12 object-contain"
                loading="lazy"
              />
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
