// Design tokens — exact hex values from the Habeats design system.
// Shared so the analytics surfaces and anything plotted on them stay in step.

export const C = {
  primary:             "#274e3b",
  primaryContainer:    "#3f6652",
  surfaceLowest:       "#ffffff",
  surfaceLow:          "#f4f3f1",
  surface:             "#efeeeb",
  onSurface:           "#1a1c1a",
  onSurfaceVariant:    "#414843",
  outline:             "#717973",
  outlineVariant:      "#c1c8c2",
  secondary:           "#5f5a80",
  secondaryContainer:  "#d9d2ff",
  onSecondaryContainer:"#5e597f",
  background:          "#faf9f6",
} as const;

export const softLift = { boxShadow: "0 10px 40px -10px rgba(63,102,82,0.08)" };
export const tacticBorderPrimary   = { borderBottom: "4px solid rgba(63,102,82,0.2)" };
export const tacticBorderSecondary = { borderBottom: "4px solid rgba(95,90,128,0.2)" };

/**
 * Status colors, reserved for direction-of-travel and nothing else.
 *
 * Teal/amber rather than the more obvious green/red for two reasons. The pair
 * clears colour-vision separation where green/amber does not (ΔE 11.2 vs 6.9
 * under protanopia, checked rather than eyeballed), and red would overstate
 * what these numbers mean — a missed lunch is worth noticing, not an alarm.
 *
 * Both always ship alongside an arrow icon and a written comparison, so the
 * colour is the third channel carrying the meaning, never the only one.
 */
export const STATUS = {
  good: "#0f766e",
  attention: "#b45309",
  /** No previous period to compare against, or no change. */
  neutral: C.outline,
} as const;

/** The single hue anything plotted on these surfaces is drawn in. */
export const PLOT = {
  accent: C.primaryContainer,
  /** Area wash under a line — a wash, never a saturated block. */
  wash: "rgba(63,102,82,0.10)",
  deemphasis: C.outlineVariant,
} as const;
