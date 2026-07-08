import { useState } from "react";
import { Brain, Heart, Users, Zap, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

export type EatingMode = "mindful" | "comfort" | "social" | "fuel" | "habit";

interface EatingModeCardProps {
  onSelect?: (mode: EatingMode) => void;
  className?: string;
}

export function EatingModeCard({ onSelect, className }: EatingModeCardProps) {
  const [selected, setSelected] = useState<EatingMode | null>(null);
  const selectedMode = EATING_MODES.find((m) => m.value === selected);

  const handleSelect = (mode: EatingMode) => {
    setSelected(mode);
    onSelect?.(mode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "rounded-2xl p-4",
        "bg-[#f4f5f8]",
        "shadow-[inset_0_1px_3px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.95)]",
        className
      )}
    >
      <p className="text-[10px] font-semibold text-gray-400 text-center mb-3 uppercase tracking-widest">
        How did you eat?
      </p>

      <div className="flex gap-2" role="radiogroup" aria-label="Select your eating mode">
        {EATING_MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selected === mode.value;

          return (
            <motion.button
              key={mode.value}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleSelect(mode.value)}
              role="radio"
              aria-checked={isSelected}
              aria-label={mode.label}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl",
                "transition-all duration-200 cursor-pointer",
                isSelected
                  ? `${mode.selectedBg} ring-2 ${mode.ringColor} shadow-sm`
                  : "bg-white/80 hover:bg-white active:bg-white"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors duration-200",
                isSelected ? `${mode.iconBg} ${mode.iconColor}` : "bg-gray-100 text-gray-400"
              )}>
                <Icon className="w-4 h-4 stroke-[2]" aria-hidden="true" />
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wide transition-colors duration-200",
                isSelected ? mode.labelColor : "text-gray-400"
              )}>
                {mode.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected && selectedMode && (
          <motion.p
            key="confirmation"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.18 }}
            className={cn("text-[11px] text-center font-medium overflow-hidden", selectedMode.labelColor)}
          >
            Logged as {selectedMode.label}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
