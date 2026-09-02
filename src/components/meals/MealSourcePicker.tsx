import { ChefHat, Bike, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MealSource } from "@/types/interfaces";
import { cn } from "@/lib/utils";

const SOURCES: {
  value: MealSource;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: "cooked", label: "Cooked it", icon: ChefHat },
  { value: "ordered", label: "Ordered in", icon: Bike },
  { value: "eaten-out", label: "Ate out", icon: UtensilsCrossed },
];

interface MealSourcePickerProps {
  value: MealSource | null;
  onChange: (source: MealSource | null) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Asks where the food came from, once, at the only moment the user actually
 * knows: while they're logging what they ate.
 *
 * Stays optional on purpose. A required answer here would tax the exact user
 * this is meant to help — the one logging a takeaway at 9pm — and an answer
 * given to dismiss a form is worse than no answer at all. Tapping the selected
 * chip again clears it.
 */
export function MealSourcePicker({
  value,
  onChange,
  disabled = false,
  className,
}: MealSourcePickerProps) {
  return (
    <div className={className}>
      <p className="block text-sm font-medium text-gray-700 mb-1.5">
        Where did it come from?{" "}
        <span className="font-normal text-gray-400">— optional</span>
      </p>
      <div
        className="flex gap-2"
        role="radiogroup"
        aria-label="Where the meal came from"
      >
        {SOURCES.map((source) => {
          const Icon = source.icon;
          const isSelected = value === source.value;
          return (
            <button
              key={source.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(isSelected ? null : source.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-2 transition-all duration-150",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              )}
            >
              <Icon className="w-4 h-4 stroke-2" aria-hidden="true" />
              <span className="text-xs font-medium whitespace-nowrap">
                {source.label}
              </span>
            </button>
          );
        })}
      </div>
      {/* No judgment attached to any answer — the copy has to earn the honest
          one, because a user who feels graded here starts lying to the form. */}
      <p className="text-[11px] text-gray-400 mt-1.5">
        Helps spot which meals keep running out of time. No wrong answer.
      </p>
    </div>
  );
}

export default MealSourcePicker;
