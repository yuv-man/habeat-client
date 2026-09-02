import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { C, STATUS, softLift } from "@/lib/analyticsTheme";

interface BehaviourTileProps {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  previous: number | null;
  /** Which direction counts as progress. Some of these read backwards — fewer
   *  missed meals is the good news — so the tile is told rather than guessing. */
  upIsGood: boolean;
  /** How to name the window being compared against, e.g. "last week". Kept
   *  short: it appears inside a sentence in a half-width tile. */
  comparisonLabel: string;
}

/**
 * One behaviour, counted, next to the same count from the period before.
 *
 * These are tallies rather than scores on purpose. A user can scroll back
 * through their own week and verify "4 meals ordered in"; they cannot verify a
 * composite index, and an unverifiable number is one they have to take on
 * faith. Faith is what makes people stop reading dashboards.
 */
export function BehaviourTile({
  label,
  value,
  unit,
  icon: Icon,
  iconBg,
  iconColor,
  previous,
  upIsGood,
  comparisonLabel,
}: BehaviourTileProps) {
  const delta = previous === null ? null : value - previous;
  const direction = delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down";

  const DirIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  const statusColor =
    direction === "flat"
      ? STATUS.neutral
      : (direction === "up") === upIsGood
        ? STATUS.good
        : STATUS.attention;

  return (
    <div
      className="rounded-2xl p-4 flex flex-col"
      style={{ background: C.surfaceLowest, ...softLift }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center mb-2.5"
        style={{ background: iconBg }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} aria-hidden="true" />
      </div>

      <p className="text-[11px] font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>
        {label}
      </p>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold leading-none" style={{ color: C.onSurface }}>
          {value}
        </span>
        <span className="text-[11px]" style={{ color: C.outline }}>
          {unit}
        </span>
      </div>

      <div className="mt-2.5 pt-2" style={{ borderTop: `1px solid ${C.surface}` }}>
        {delta === null ? (
          // Nothing observed in the earlier window. Saying "no change" here
          // would be a claim about a period we never saw.
          <span className="text-[10px]" style={{ color: C.outline }}>
            No earlier data
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <DirIcon className="w-3 h-3 shrink-0" style={{ color: statusColor }} />
            <span className="text-[10px] font-medium" style={{ color: C.onSurfaceVariant }}>
              {delta === 0
                ? `Same as ${comparisonLabel}`
                : `${Math.abs(delta)} ${delta > 0 ? "more" : "fewer"} than ${comparisonLabel}`}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

export default BehaviourTile;
