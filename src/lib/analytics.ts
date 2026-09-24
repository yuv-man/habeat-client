import posthog from "posthog-js";

import { isProjectKey } from "./posthogKey";

const CONFIGURED_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
// Only a project key (phc_) may be used in the browser; see posthogKey.ts.
const POSTHOG_KEY = isProjectKey(CONFIGURED_KEY) ? CONFIGURED_KEY.trim() : undefined;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST as string | undefined;

if (CONFIGURED_KEY && !POSTHOG_KEY) {
  console.error(
    "[analytics] VITE_POSTHOG_KEY is not a PostHog project key (phc_…) — analytics disabled."
  );
}

export function initAnalytics() {
  if (!POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: "localStorage",
  });
}

export function identifyUser(userId: string, traits: Record<string, unknown> = {}) {
  if (!POSTHOG_KEY) return;
  posthog.identify(userId, traits);
}

export function resetAnalyticsUser() {
  if (!POSTHOG_KEY) return;
  posthog.reset();
}

export function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
