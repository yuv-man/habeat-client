import {
  PatternEvent,
  MealSlot,
  distinctDays,
  eventsSince,
} from "@/stores/patternStore";
import { toLocalDateString } from "@/lib/dateUtils";

/**
 * Turns the raw local event log into things worth saying out loud.
 *
 * Two rules hold everywhere in this file:
 *
 * 1. Never claim more than the data supports. Every observation carries the
 *    count it was derived from, and the card renders that count — so a reader
 *    can always check the claim against the evidence rather than trusting it.
 * 2. Observations describe, they don't scold. "Four of your last seven dinners
 *    were ordered in" is a fact the user can use. "You keep failing to cook"
 *    is the same fact turned into a verdict, and a verdict is the thing that
 *    makes people close the app.
 */

export type ObservationTone = "positive" | "neutral" | "supportive";

export type ObservationAction =
  | { kind: "shopping"; label: string }
  | { kind: "quick-meals"; label: string }
  | { kind: "breathing"; label: string }
  | { kind: "urge-surfing"; label: string }
  | { kind: "insights"; label: string };

export interface PatternObservation {
  /** Stable across re-derivations so a dismissal sticks to the right card. */
  key: string;
  tone: ObservationTone;
  emoji: string;
  title: string;
  body: string;
  /** The count behind the claim, rendered verbatim. Not decoration. */
  evidence: string;
  action?: ObservationAction;
}

const WINDOW_DAYS = 7;

/** Below this, a run of days is a week, not a pattern. Three of seven is the
 *  lowest count where "this keeps happening" is defensible. */
const PATTERN_THRESHOLD = 3;

const slotLabel = (slot: MealSlot): string =>
  slot === "snacks" ? "snack" : slot;

/** The meal slot a set of events concentrates in, when one clearly dominates.
 *  Returns null on a tie — naming an arbitrary winner would invent a pattern. */
const dominantSlot = (
  events: Extract<PatternEvent, { mealType: MealSlot }>[]
): MealSlot | null => {
  const counts = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.mealType] = (acc[e.mealType] ?? 0) + 1;
    return acc;
  }, {});
  const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return null;
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null;
  return ranked[0][0] as MealSlot;
};

// ─── ordering vs. cooking ────────────────────────────────────────────────────

function orderingObservations(events: PatternEvent[]): PatternObservation[] {
  const recent = eventsSince(events, WINDOW_DAYS);
  const out: PatternObservation[] = [];

  const sourced = recent.filter(
    (e): e is Extract<PatternEvent, { kind: "meal-source" }> =>
      e.kind === "meal-source"
  );
  const orderedIn = sourced.filter(
    (e) => e.source === "ordered" || e.source === "eaten-out"
  );
  const cooked = sourced.filter((e) => e.source === "cooked");

  const orderedDays = distinctDays(orderedIn);
  if (orderedDays >= PATTERN_THRESHOLD) {
    const slot = dominantSlot(orderedIn);
    out.push({
      key: `ordering-${orderedDays}`,
      tone: "neutral",
      emoji: "🛵",
      title: slot
        ? `${slotLabel(slot)[0].toUpperCase()}${slotLabel(slot).slice(1)} has mostly come from outside`
        : "Most meals came from outside this week",
      body: slot
        ? `${slotLabel(slot)} is the meal that most often gets ordered. That usually says something about how that hour of your day is going — not about willpower. Having something ready in advance is the thing that actually shifts it.`
        : "Ordering in has been the default this week. Worth a look at which meal it keeps happening at — that's usually where the fix goes.",
      evidence: `${orderedDays} of the last ${WINDOW_DAYS} days`,
      action: { kind: "shopping", label: "Plan ahead" },
    });
  }

  const cookedDays = distinctDays(cooked);
  // Only worth saying when it's both frequent and the dominant mode — otherwise
  // it's praise for something that didn't really happen.
  if (cookedDays >= 4 && cookedDays > orderedDays) {
    out.push({
      key: `cooking-${cookedDays}`,
      tone: "positive",
      emoji: "🍳",
      title: "You've been cooking most days",
      body: "That's the habit doing the work rather than motivation. Worth noticing on the days it feels like nothing is going right.",
      evidence: `${cookedDays} of the last ${WINDOW_DAYS} days`,
    });
  }

  return out;
}

// ─── time pressure ───────────────────────────────────────────────────────────

function rescueObservations(events: PatternEvent[]): PatternObservation[] {
  const recent = eventsSince(events, WINDOW_DAYS);
  const swaps = recent.filter(
    (e): e is Extract<PatternEvent, { kind: "rescue-swap" }> =>
      e.kind === "rescue-swap"
  );

  if (swaps.length < PATTERN_THRESHOLD) return [];

  const slot = dominantSlot(swaps);

  return [
    {
      key: `rescue-${swaps.length}`,
      tone: "supportive",
      emoji: "⏱️",
      title: slot
        ? `Your plan's ${slotLabel(slot)} may be asking for more time than you have`
        : "You've needed the quick-meal swap a lot",
      body: "Reaching for the quick swap this often is a signal about the plan, not about you. Meals you can actually make on a normal evening are the ones that get made.",
      evidence: `${swaps.length} swaps in the last ${WINDOW_DAYS} days`,
      action: { kind: "quick-meals", label: "See faster meals" },
    },
  ];
}

// ─── skipped meals ───────────────────────────────────────────────────────────

function missedMealObservations(events: PatternEvent[]): PatternObservation[] {
  const out: PatternObservation[] = [];
  const today = toLocalDateString(new Date());

  const missed = eventsSince(events, WINDOW_DAYS).filter(
    (e): e is Extract<PatternEvent, { kind: "missed-meal" }> =>
      e.kind === "missed-meal"
  );

  // ── today, looking forward ────────────────────────────────────────────────
  // The single most useful thing the app can say about a skipped lunch is said
  // in the hours *after* it, not in next week's summary: a long gap tends to
  // land on the evening. Framed as how bodies generally work, not as a finding
  // about this user — one skipped lunch is not evidence of anything personal.
  const missedToday = missed.filter(
    (e) => e.date === today && e.mealType !== "snacks"
  );
  const skippedNotHunger = missedToday.filter((e) => e.reason !== "not-hungry");

  if (skippedNotHunger.length > 0) {
    const slot = skippedNotHunger[skippedNotHunger.length - 1].mealType;
    out.push({
      key: `missed-today-${today}-${slot}`,
      tone: "supportive",
      emoji: "🌗",
      title: `A long gap since ${slotLabel(slot)}`,
      body: "Going without tends to catch up in the evening rather than at the next meal — it's appetite doing arithmetic, not a lapse. Eating something before you're ravenous is the part that actually helps.",
      evidence: "today",
      action: { kind: "quick-meals", label: "Something quick" },
    });
  }

  // ── the meal that keeps going ─────────────────────────────────────────────
  const bySlot = missed.reduce<Record<string, typeof missed>>((acc, e) => {
    (acc[e.mealType] ??= []).push(e);
    return acc;
  }, {});

  for (const [slot, slotEvents] of Object.entries(bySlot)) {
    const days = distinctDays(slotEvents);
    if (days < PATTERN_THRESHOLD) continue;

    // The reason given most often, when the user gave one. Drives the copy,
    // because "too busy" and "too stressed" want different responses.
    const reasons = slotEvents
      .map((e) => e.reason)
      .filter((r): r is NonNullable<typeof r> => r != null && r !== "not-hungry");
    const topReason = reasons.length
      ? Object.entries(
          reasons.reduce<Record<string, number>>((acc, r) => {
            acc[r] = (acc[r] ?? 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const stressLed = topReason === "stress";

    out.push({
      key: `missed-${slot}-${days}`,
      tone: "supportive",
      emoji: stressLed ? "😮‍💨" : "🕳️",
      title: `${slotLabel(slot as MealSlot)[0].toUpperCase()}${slotLabel(slot as MealSlot).slice(1)} keeps getting away from you`,
      body: stressLed
        ? "Stress is what you've named most often. Appetite switching off under pressure is ordinary physiology — the meal isn't the thing to fix first."
        : "One skipped meal is a busy day. This many is usually the schedule, not the appetite — something that needs no preparation at that hour tends to survive it.",
      evidence: `${days} of the last ${WINDOW_DAYS} days`,
      action: stressLed
        ? { kind: "breathing", label: "Two minutes of breathing" }
        : { kind: "quick-meals", label: "See faster meals" },
    });
  }

  return out;
}

// ─── late-night eating ───────────────────────────────────────────────────────

function lateNightObservations(events: PatternEvent[]): PatternObservation[] {
  const recent = eventsSince(events, WINDOW_DAYS);
  const late = recent.filter(
    (e): e is Extract<PatternEvent, { kind: "late-snack" }> =>
      e.kind === "late-snack"
  );

  const nights = distinctDays(late);
  if (nights < PATTERN_THRESHOLD) return [];

  // Whether the evenings follow days that went badly. This is the connection
  // the app could never previously draw, because a skipped meal left no trace
  // to correlate against.
  const missedDays = new Set(
    recent
      .filter((e) => e.kind === "missed-meal" && e.reason !== "not-hungry")
      .map((e) => e.date)
  );
  const afterAHardDay = late.filter((e) => missedDays.has(e.date));
  const followsMissedMeals = distinctDays(afterAHardDay) >= 2;

  const medianHour = (() => {
    const hours = late.map((e) => e.hour).sort((a, b) => a - b);
    return hours[Math.floor(hours.length / 2)];
  })();

  const clockLabel = medianHour > 12 ? `${medianHour - 12}pm` : `${medianHour}am`;

  return [
    {
      key: `late-night-${nights}${followsMissedMeals ? "-linked" : ""}`,
      tone: "neutral",
      emoji: "🌙",
      title: followsMissedMeals
        ? "Late snacking is landing on the days you ate less earlier"
        : `Evenings around ${clockLabel} are your snacking hour`,
      body: followsMissedMeals
        ? "On the days a meal gets skipped, the evening tends to make up the difference. That's the body settling a debt, not a lapse in discipline — and it's the earlier gap that's worth closing, not the snack."
        : "A consistent hour usually means the cue is the time itself rather than hunger. Noticing which one it is, in the moment, is most of the work.",
      evidence: `${nights} of the last ${WINDOW_DAYS} nights`,
      action: followsMissedMeals
        ? { kind: "insights", label: "See the pattern" }
        : { kind: "urge-surfing", label: "Try urge surfing" },
    },
  ];
}

// ─── period comparison (analytics) ───────────────────────────────────────────

/** The behaviours worth counting. Not a score — four plain tallies, each of
 *  which the user could verify by scrolling back through their own week. */
export interface BehaviourCounts {
  homeCooked: number;
  orderedIn: number;
  mealsMissed: number;
  lateNights: number;
}

export interface BehaviourComparison {
  current: BehaviourCounts;
  previous: BehaviourCounts;
  /** False when the earlier window holds no events at all. A delta against a
   *  window we never observed is not a delta, it's an artefact — the UI must
   *  show the count alone rather than invent an improvement. */
  hasPrevious: boolean;
  /** Days in each window, so the UI can name the comparison honestly. */
  windowDays: number;
}

const emptyCounts = (): BehaviourCounts => ({
  homeCooked: 0,
  orderedIn: 0,
  mealsMissed: 0,
  lateNights: 0,
});

const countBehaviours = (events: PatternEvent[]): BehaviourCounts =>
  events.reduce<BehaviourCounts>((acc, e) => {
    if (e.kind === "meal-source") {
      if (e.source === "cooked") acc.homeCooked += 1;
      else acc.orderedIn += 1;
    } else if (e.kind === "missed-meal") {
      // A meal the user skipped because they weren't hungry isn't a miss.
      if (e.reason !== "not-hungry") acc.mealsMissed += 1;
    } else if (e.kind === "late-snack") {
      acc.lateNights += 1;
    }
    return acc;
  }, emptyCounts());

/** Splits the log into the last `days` days and the `days` before those. */
export function comparePeriods(
  events: PatternEvent[],
  days: number
): BehaviourComparison {
  const boundary = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return toLocalDateString(d);
  };

  const currentFrom = boundary(days);
  const previousFrom = boundary(days * 2);

  const current = events.filter((e) => e.date >= currentFrom);
  const previous = events.filter(
    (e) => e.date >= previousFrom && e.date < currentFrom
  );

  return {
    current: countBehaviours(current),
    previous: countBehaviours(previous),
    hasPrevious: previous.length > 0,
    windowDays: days,
  };
}

// ─── entry point ─────────────────────────────────────────────────────────────

/**
 * All observations the local log currently supports, most actionable first.
 * Returns an empty array when nothing clears its threshold — the caller is
 * expected to render nothing at all rather than an empty-state apology.
 */
export function deriveObservations(events: PatternEvent[]): PatternObservation[] {
  // Ordered by how time-sensitive each one is. Today's skipped meal is only
  // useful before tonight; a seven-day ordering trend keeps until tomorrow.
  return [
    ...missedMealObservations(events),
    ...lateNightObservations(events),
    ...rescueObservations(events),
    ...orderingObservations(events),
  ];
}
