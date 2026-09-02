import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { C, PLOT, STATUS, softLift } from "@/lib/analyticsTheme";

interface TrendPoint {
  week: string;
  score: number;
}

interface MindfulScoreTileProps {
  score: number;
  trend: TrendPoint[];
  /** The score's own denominator, rendered as the claim's evidence. */
  mealsCheckedIn: number;
  emotionalInstances: number;
}

// Drawn full-width below the value rather than beside it. Squeezed into the
// leftover half of a 320px card the line flattens into an indistinct block —
// four points need the whole width to read as a direction at all.
const SPARK_W = 300;
const SPARK_H = 44;
/** Clears the end-marker's radius plus its 2px surface ring, so the dot at the
 *  last point is never cropped by the viewBox edge. */
const PAD = 8;

/**
 * The one number that answers "is the process working?", as a stat tile rather
 * than a chart — a single value with a trend behind it is not a bar chart's
 * job.
 *
 * Deliberately not a hero figure: this page already leads with daily calories,
 * and a view gets exactly one hero. This sits a tier below it in weight.
 */
export function MindfulScoreTile({
  score,
  trend,
  mealsCheckedIn,
  emotionalInstances,
}: MindfulScoreTileProps) {
  // A trend needs two points to be a trend. With one, the number stands alone
  // rather than being drawn as a flat line implying stability we can't see.
  const hasTrend = trend.length >= 2;
  const delta = hasTrend
    ? trend[trend.length - 1].score - trend[trend.length - 2].score
    : null;

  const direction = delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down";
  const DirIcon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  // Higher is better here, so up is good.
  const statusColor =
    direction === "up" ? STATUS.good : direction === "down" ? STATUS.attention : STATUS.neutral;

  const points = (() => {
    if (!hasTrend) return [];
    const scores = trend.map((t) => t.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    // A flat series would divide by zero; centre it instead.
    const span = max - min || 1;
    const stepX = (SPARK_W - PAD * 2) / (trend.length - 1);
    return trend.map((t, i) => ({
      x: PAD + i * stepX,
      y: PAD + (1 - (t.score - min) / span) * (SPARK_H - PAD * 2),
      score: t.score,
      week: t.week,
    }));
  })();

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = points.length
    ? `${linePath} L${points[points.length - 1].x},${SPARK_H} L${points[0].x},${SPARK_H} Z`
    : "";
  const last = points[points.length - 1];

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: C.surfaceLowest, ...softLift }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color: C.onSurfaceVariant }}>
        Mindful eating score
      </p>

      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-1.5">
          {/* Proportional figures — a standalone value, not a column. */}
          <span className="text-4xl font-bold leading-none" style={{ color: C.onSurface }}>
            {score}
          </span>
          <span className="text-xs" style={{ color: C.outline }}>/ 100</span>
        </div>

        {delta !== null && (
          <div className="flex items-center gap-1">
            {/* The mark carries the colour; the text stays in ink. Arrow and
                wording both repeat the direction, so colour is never the
                only channel. */}
            <DirIcon className="w-3.5 h-3.5 shrink-0" style={{ color: statusColor }} />
            <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: C.onSurfaceVariant }}>
              {delta === 0
                ? "Level with last week"
                : `${delta > 0 ? "+" : ""}${delta} vs last week`}
            </span>
          </div>
        )}
      </div>

      {hasTrend && (
        <div className="mt-3">
          <svg
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            /* Uniform scaling — stretching the box would fatten the stroke on
               one axis and turn the end-markers into ellipses. */
            className="block w-full h-auto"
            role="img"
            aria-label={`Four-week trend: ${trend
              .map((t) => t.score)
              .join(", ")}. Most recent ${score}.`}
          >
            <path d={areaPath} fill={PLOT.wash} />
            <path
              d={linePath}
              fill="none"
              stroke={PLOT.accent}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.slice(0, -1).map((p) => (
              <circle key={p.week} cx={p.x} cy={p.y} r={2.5} fill={PLOT.deemphasis}>
                <title>{`${p.week}: ${p.score}`}</title>
              </circle>
            ))}
            {/* Current period in the accent, with a surface ring so it stays
                legible where it sits on the line. */}
            {last && (
              <circle
                cx={last.x}
                cy={last.y}
                r={4}
                fill={PLOT.accent}
                stroke={C.surfaceLowest}
                strokeWidth={2}
              >
                <title>{`${last.week}: ${last.score}`}</title>
              </circle>
            )}
          </svg>
        </div>
      )}

      {/* The evidence under the claim, same as everywhere else in the app: the
          reader can check the number against what it was counted from. */}
      <p className="text-[11px] mt-3 pt-3" style={{ color: C.outline, borderTop: `1px solid ${C.surface}` }}>
        {mealsCheckedIn > 0 ? (
          <>
            From <strong style={{ color: C.onSurfaceVariant }}>{mealsCheckedIn}</strong>{" "}
            meal{mealsCheckedIn === 1 ? "" : "s"} you checked in on
            {emotionalInstances > 0 && `, ${emotionalInstances} of which leaned emotional`}
            .
          </>
        ) : (
          "No meals checked in on yet this period."
        )}
      </p>
    </div>
  );
}

export default MindfulScoreTile;
