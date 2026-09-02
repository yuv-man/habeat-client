import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EatingTrigger, MealSource } from "../types/interfaces";
import { toLocalDateString } from "../lib/dateUtils";

/**
 * A rolling, device-local log of eating-behaviour events.
 *
 * This is deliberately *not* the system of record. Every event here also goes
 * to the server through an endpoint that already exists — a meal's source rides
 * along with the meal, a missed meal and its reason become a daily-reflection
 * trigger, a late snack becomes a meal-mood correlation. What the server can't
 * give us is an answer *now*: the insight endpoints are period-aggregated and
 * cached, so they can't tell the dashboard "this is the fourth dinner you've
 * ordered this week" at the moment it would matter.
 *
 * So this store exists to make nudges timely, and only that. It is capped at
 * RETENTION_DAYS, holds nothing a server round-trip couldn't reconstruct, and
 * anything it can't prove it simply doesn't claim.
 */

/** Long enough to put a month beside the month before it, which is what the
 *  analytics comparison needs. Events are a few dozen bytes each. */
export const RETENTION_DAYS = 60;

/** Dismissals expire faster than the data behind them. A nudge waved off once
 *  shouldn't stay silenced for two months. */
export const DISMISSAL_DAYS = 30;

export type MealSlot = "breakfast" | "lunch" | "dinner" | "snacks";

/** Why a planned meal never happened. `not-hungry` is intentionally outside the
 *  EatingTrigger space — it isn't a problem to solve, and folding it in would
 *  inflate the trigger counts with a non-event. */
export type MissReason = EatingTrigger | "not-hungry";

export type PatternEvent =
  | { kind: "meal-source"; date: string; mealType: MealSlot; source: MealSource }
  | { kind: "rescue-swap"; date: string; mealType: MealSlot }
  | { kind: "missed-meal"; date: string; mealType: MealSlot; reason: MissReason | null }
  | { kind: "late-snack"; date: string; hour: number };

export type PatternEventOf<K extends PatternEvent["kind"]> = Extract<
  PatternEvent,
  { kind: K }
>;

interface PatternState {
  events: PatternEvent[];
  /** Observation keys the user has waved off, so a nudge doesn't re-appear the
   *  next time the dashboard mounts. Cleared alongside the events that fed it. */
  dismissed: Record<string, string>;
}

interface PatternActions {
  record: (event: PatternEvent) => void;
  dismiss: (key: string) => void;
  isDismissed: (key: string) => boolean;
  /** Drops anything older than RETENTION_DAYS. Called on every write, and once
   *  on rehydrate so a stale device doesn't surface month-old "patterns". */
  prune: () => void;
  reset: () => void;
}

type PatternStore = PatternState & PatternActions;

const cutoffDate = (days: number = RETENTION_DAYS): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toLocalDateString(d);
};

const initialState: PatternState = {
  events: [],
  dismissed: {},
};

export const usePatternStore = create<PatternStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      record: (event) => {
        const cutoff = cutoffDate();
        set((state) => ({
          events: [...state.events, event].filter((e) => e.date >= cutoff),
        }));
      },

      dismiss: (key) => {
        set((state) => ({
          dismissed: { ...state.dismissed, [key]: toLocalDateString(new Date()) },
        }));
      },

      isDismissed: (key) => {
        const at = get().dismissed[key];
        if (!at) return false;
        // A dismissal only silences the nudge for a while. Once it ages out,
        // the observation earns a fresh say.
        return at >= cutoffDate(DISMISSAL_DAYS);
      },

      prune: () => {
        const eventCutoff = cutoffDate();
        const dismissalCutoff = cutoffDate(DISMISSAL_DAYS);
        set((state) => ({
          events: state.events.filter((e) => e.date >= eventCutoff),
          dismissed: Object.fromEntries(
            Object.entries(state.dismissed).filter(
              ([, at]) => at >= dismissalCutoff
            )
          ),
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: "habeat-patterns",
      onRehydrateStorage: () => (state) => {
        state?.prune();
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<PatternState> | undefined;
        if (!p) return current;
        return {
          ...current,
          events: Array.isArray(p.events) ? p.events : [],
          dismissed:
            p.dismissed && typeof p.dismissed === "object" ? p.dismissed : {},
        };
      },
    }
  )
);

// ─── selectors ───────────────────────────────────────────────────────────────

export const usePatternEvents = () => usePatternStore((state) => state.events);
export const useRecordPattern = () => usePatternStore((state) => state.record);

/** Events from the last `days` days, newest last. */
export const eventsSince = (events: PatternEvent[], days: number): PatternEvent[] => {
  const from = new Date();
  from.setDate(from.getDate() - days);
  const cutoff = toLocalDateString(from);
  return events.filter((e) => e.date >= cutoff);
};

/** Distinct days an event kind occurred on. Counting days rather than events
 *  keeps one chaotic evening from reading as a habit. */
export const distinctDays = (events: PatternEvent[]): number =>
  new Set(events.map((e) => e.date)).size;
