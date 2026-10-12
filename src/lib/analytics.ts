import posthog from "posthog-js";

import { isProjectKey } from "./posthogKey";

const CONFIGURED_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
// Only a project key (phc_) may be used in the browser; see posthogKey.ts.
const POSTHOG_KEY = isProjectKey(CONFIGURED_KEY) ? CONFIGURED_KEY.trim() : undefined;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

/**
 * Only production builds send. A key in a developer's .env used to make every
 * local session a "real user" in the live project. Set VITE_ANALYTICS_ENABLED
 * to "true" to send from another build on purpose.
 */
const SENDING_ALLOWED =
  import.meta.env.PROD || import.meta.env.VITE_ANALYTICS_ENABLED === "true";

/** Outside production, events go to the console instead (not in tests). */
const LOG_LOCALLY = !SENDING_ALLOWED && import.meta.env.MODE !== "test";

/**
 * QA and demo accounts use the reserved example domains and are never sent,
 * in production either. Matches the server's utils/test-accounts.ts.
 */
const TEST_EMAIL = /@example\.(com|net|org)$/i;
export const isTestAccountEmail = (email?: unknown): boolean =>
  typeof email === "string" && TEST_EMAIL.test(email.trim());

let testAccount = false;

const enabled = (): boolean => !!POSTHOG_KEY && SENDING_ALLOWED && !testAccount;

const devLog = (what: string, payload: unknown) => {
  if (LOG_LOCALLY) console.info(`[analytics:dev] ${what}`, payload);
};

/** Days away before a return counts as a comeback. */
export const INACTIVITY_DAYS = 3;
const LAST_ACTIVE_KEY = "habeat_last_active_at";

if (CONFIGURED_KEY && !POSTHOG_KEY) {
  console.error(
    "[analytics] VITE_POSTHOG_KEY is not a PostHog project key (phc_…) — analytics disabled."
  );
}

export function initAnalytics() {
  if (!enabled() || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
  });
}

export function identifyUser(userId: string, traits: Record<string, unknown> = {}) {
  const wasTest = testAccount;
  testAccount = isTestAccountEmail(traits.email);
  // Stops automatic pageviews too, not only our own events.
  if (POSTHOG_KEY && SENDING_ALLOWED && testAccount !== wasTest) {
    if (testAccount) posthog.opt_out_capturing();
    else posthog.opt_in_capturing();
  }
  noteReturn();
  if (!enabled()) return;
  posthog.identify(userId, traits);
}

/**
 * Fires `returned_after_inactivity` on the first activity after a gap of
 * INACTIVITY_DAYS or more. Safe to call often: later calls see no gap. Per
 * device, since it is kept in local storage — a return on a second device is
 * not counted.
 */
export function noteReturn(now: number = Date.now()) {
  let last: number | null = null;
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY);
    last = raw ? Number(raw) : null;
    localStorage.setItem(LAST_ACTIVE_KEY, String(now));
  } catch {
    return; // storage unavailable: nothing to compare against
  }
  if (!last || Number.isNaN(last)) return;
  const daysInactive = Math.floor((now - last) / 86_400_000);
  if (daysInactive >= INACTIVITY_DAYS) {
    trackEvent("returned_after_inactivity", { days_inactive: daysInactive });
  }
}

export function resetAnalyticsUser() {
  if (testAccount && POSTHOG_KEY && SENDING_ALLOWED) posthog.opt_in_capturing();
  testAccount = false;
  if (!enabled()) return;
  posthog.reset();
}

export function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  if (!enabled()) {
    devLog(event, properties);
    return;
  }
  posthog.capture(event, properties);
}
