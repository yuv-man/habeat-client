/**
 * Classifies a meal-plan generation failure so every call site can show the
 * user the real reason instead of failing silently.
 *
 * The server surfaces a rich message on failure (e.g. "PLAN_GENERATION_
 * UNAVAILABLE: Our AI services are temporarily busy…"), and `withErrorHandling`
 * preserves it — but several generate handlers only `console.error`d it, so the
 * user saw a spinner that just stopped. This centralises the "is it the AI
 * being busy vs a hard failure?" decision used across those handlers.
 */
export function isAiBusyError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  return (
    msg.includes("PLAN_GENERATION_UNAVAILABLE") ||
    lower.includes("rate limit") ||
    lower.includes("temporarily busy") ||
    lower.includes("high demand")
  );
}

/** i18n key (under the "navigation" namespace) for the toast to show. */
export function planErrorKey(error: unknown): "errors.aiBusy" | "errors.generateFailed" {
  return isAiBusyError(error) ? "errors.aiBusy" : "errors.generateFailed";
}
