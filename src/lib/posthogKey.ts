/**
 * Which PostHog keys may go to the browser.
 *
 * A project API key (`phc_…`) is write-only and meant to be public. A personal
 * API key (`phx_…`) is a login to the PostHog account — it can read every
 * event, recording and person, and change the project. One was set as
 * VITE_POSTHOG_KEY: Vite inlined it into the bundle, and PostHog answered its
 * config requests with 404s because it is not a project key. Anything that is
 * not a project key is never used in the browser.
 */
export const isProjectKey = (key: string | undefined | null): key is string =>
  typeof key === "string" && key.trim().startsWith("phc_");

/** A key that must never be shipped to a browser. */
export const isPersonalKey = (key: string | undefined | null): boolean =>
  typeof key === "string" && key.trim().startsWith("phx_");
