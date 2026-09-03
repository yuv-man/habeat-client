/**
 * Validation for the free-text term inputs in onboarding — allergies,
 * dislikes, food preferences, custom dietary restrictions.
 *
 * These strings are stored on the user and interpolated straight into the
 * meal-generation prompt, so unbounded input is both a UI problem (a paragraph
 * rendered inside a chip) and a model problem (wasted tokens, and instructions
 * competing with ours).
 *
 * Mirrors the server rules in habeat-server `src/utils/term-list.ts` and the
 * @SafeTermArray decorator. Keep the two in sync: the client stops it early
 * with a helpful message, the server enforces it for anyone bypassing the UI.
 */

/** Per-term character cap. "Sulphur dioxide and sulphites" is 29 characters. */
export const MAX_TERM_LENGTH = 50;

/** Per-list item cap. */
export const MAX_TERMS_PER_LIST = 30;

export type TermRejection =
  | "empty"
  | "tooLong"
  | "noLetters"
  | "duplicate"
  | "listFull";

export type TermValidation =
  | { ok: true; value: string }
  | { ok: false; reason: TermRejection };

/** Trim, collapse whitespace, strip control characters. */
export const normaliseTerm = (raw: string): string =>
  raw
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Validate one candidate term against the list it would join.
 * Returns the cleaned value, or the reason it was rejected.
 */
export const validateTerm = (
  raw: string,
  existing: string[] = [],
): TermValidation => {
  const value = normaliseTerm(raw);

  if (!value) return { ok: false, reason: "empty" };
  if (value.length > MAX_TERM_LENGTH) return { ok: false, reason: "tooLong" };

  // A term with no letters is emoji, punctuation or digits — nothing the meal
  // generator can act on. Unicode-aware so Hebrew and accented input pass.
  if (!/\p{L}/u.test(value)) return { ok: false, reason: "noLetters" };

  if (existing.length >= MAX_TERMS_PER_LIST) {
    return { ok: false, reason: "listFull" };
  }

  const lower = value.toLowerCase();
  // Compare against the stored form, ignoring the "other:" prefix used by
  // custom dietary restrictions.
  const isDuplicate = existing.some(
    (item) => item.replace(/^other:/, "").trim().toLowerCase() === lower,
  );
  if (isDuplicate) return { ok: false, reason: "duplicate" };

  return { ok: true, value };
};
