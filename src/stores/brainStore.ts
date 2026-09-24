import { create } from "zustand";
import { brainAPI } from "@/services/api";
import { IBrainFocus, IPatternProgress } from "@/types/interfaces";

/**
 * The Brain's current focus, held once for the whole app.
 *
 * The Brain decides one thing at a time, and every screen that mentions it
 * should be mentioning the *same* thing — a dashboard nudge and the patterns
 * page disagreeing about what the user is working on would undo the point of
 * having a single decision-maker. So this is a store rather than a fetch
 * inside one page.
 *
 * Three states worth telling apart, and the reason `focus` alone isn't enough:
 *
 *   loaded=false            we haven't asked yet
 *   loaded=true, focus=null the Brain answered, and has nothing to claim
 *   loaded=true, focus=set  there is a behaviour being worked on
 *
 * A screen that only checks `focus` renders its empty state during the first
 * paint of every visit, which reads as "you have no patterns" to someone who
 * does.
 */

const CACHE_TTL = 5 * 60 * 1000;

interface BrainState {
  focus: IBrainFocus | null;
  /** Every confirmed pattern and which way it is moving. */
  progress: IPatternProgress[];
  /** Whether an answer has come back at all — see the note above. */
  loaded: boolean;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

interface BrainActions {
  /** Fetches unless a recent answer is already held. `force` skips the cache. */
  fetchFocus: (force?: boolean) => Promise<void>;
  reset: () => void;
}

const initialState: BrainState = {
  focus: null,
  progress: [],
  loaded: false,
  loading: false,
  error: null,
  fetchedAt: null,
};

export const useBrainStore = create<BrainState & BrainActions>()((set, get) => ({
  ...initialState,

  fetchFocus: async (force = false) => {
    const { loading, fetchedAt } = get();
    if (loading) return;
    if (!force && fetchedAt && Date.now() - fetchedAt < CACHE_TTL) return;

    set({ loading: true, error: null });

    try {
      const response = await brainAPI.getBrainFocus();
      set({
        focus: response.data ?? null,
        progress: response.progress ?? [],
        loaded: true,
        loading: false,
        fetchedAt: Date.now(),
      });
    } catch (error: any) {
      // A failure must not look like "nothing to work on". `loaded` stays as
      // it was, so a screen keeps showing the last good answer rather than
      // replacing it with an empty state.
      set({
        loading: false,
        error: error?.message || "Failed to load your focus",
      });
    }
  },

  reset: () => set(initialState),
}));

/** The focus itself, for components that don't care about load state. */
export const useBrainFocus = () => useBrainStore((s) => s.focus);
