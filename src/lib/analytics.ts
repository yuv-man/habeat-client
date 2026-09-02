import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initAnalytics() {
  if (!POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: "https://app.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: false,
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
