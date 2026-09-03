# PostHog Self-driving setup report

## Summary

PostHog Self-driving was configured for the Habeat client project. Session Replay, Error Tracking, and Support were enabled with server-owned defaults; health, error, support, and GitHub signal sources were enabled. Findings from active scouts will begin appearing in the [Self-driving inbox](https://eu.posthog.com/project/263669/inbox) within about 30 minutes.

The browser configuration now takes its PostHog host from an environment variable and retains PostHog's default autocapture behavior. The production build completed successfully.

## AI data processing

Approved.

## GitHub

The PostHog GitHub App was already connected. Two repositories were available, and this repository was correctly matched to `yuv-man/habeat-client`.

GitHub Issues was selected in the initial tool picker, but the repository connection confirmation was cancelled. No GitHub warehouse source was created; the responder below is armed and dormant until a GitHub Issues warehouse source is connected.

## Products enabled

| Product | Result | Client check |
| --- | --- | --- |
| Session Replay | enabled | Browser SDK initialization does not disable session recording. |
| Error Tracking | enabled | Browser SDK initialization does not disable exception capture. |
| Support | enabled | An inbound email, inbox, or Slack channel is still required before tickets arrive. |

## Signal sources

| Source product | Source type | Action |
| --- | --- | --- |
| `signals_scout` | `cross_source_issue` | Kept at its platform-default enabled state; no opt-out row was created. |
| `health_checks` | `health_issue` | Enabled. |
| `error_tracking` | `issue_created` | Enabled. |
| `error_tracking` | `issue_reopened` | Enabled. |
| `error_tracking` | `issue_spiking` | Enabled. |
| `conversations` | `ticket` | Enabled. |
| `github` | `issue` | Enabled; dormant because no GitHub warehouse source exists yet. |
| `session_replay` | `session_analysis_cluster` | Deliberately skipped; Replay Vision scanners own this route. |

## Connected tools

| Tool | Status |
| --- | --- |
| GitHub Issues | Selected but no source detected (dormant). The responder is enabled and will begin work when a GitHub Issues source syncs. |
| Linear, Jira, Sentry, Zendesk, and other catalog tools | Not used. |

If GitHub Issues should feed the inbox, connect the `yuv-man/habeat-client` repository from [new data warehouse source](https://eu.posthog.com/project/263669/pipeline/new/source). Only the `issues` table is needed by the responder; other GitHub tables can be enabled later in the UI.

## Scout troop

**Enabled (4 total)**

| Scout | Why it is active |
| --- | --- |
| `signals-scout-general` | Cross-product patterns and surfaces without a specialist. |
| `signals-scout-product-analytics` | Core product journeys, conversion, retention, lifecycle, and paths. |
| `signals-scout-web-analytics` | Traffic, attribution, landing-page, and 404 health for the browser app. |
| `signals-scout-revenue-analytics` | Subscription and Stripe-related revenue instrumentation and goal health. |

**Disabled (23 total)**

| Scout(s) | Reason |
| --- | --- |
| `signals-scout-error-tracking` | Covered by the enabled native Error Tracking signal sources. |
| `signals-scout-session-replay` | Covered by Replay Vision scanners when scanner access is available. |
| `signals-scout-ai-observability`, `signals-scout-apm`, `signals-scout-logs` | No evidence these product surfaces are in use. |
| `signals-scout-conversations` | Support has no inbound channel yet; the native ticket source is enabled. |
| `signals-scout-csp-violations` | No CSP-reporting integration was found. |
| `signals-scout-customer-analytics` | No B2B account analytics evidence was found. |
| `signals-scout-data-pipelines`, `signals-scout-data-warehouse` | No data-pipeline or warehouse source is connected. |
| `signals-scout-experiments`, `signals-scout-feature-flags`, `signals-scout-surveys` | No active experiments, feature flags, or surveys were found. |
| `signals-scout-health-checks`, `signals-scout-observability-gaps`, `signals-scout-anomaly-detection` | Kept off to preserve a focused four-scout baseline; the health source and general scout supply baseline coverage. |
| `signals-scout-inbox-validation`, `signals-scout-insight-alerts` | No prior Self-driving reports or insight alerts need follow-up. |
| `signals-scout-mcp-tool-calls`, `signals-scout-skills-store`, `signals-scout-tasks` | These monitor PostHog agent/tooling surfaces, not the Habeat product. |
| `signals-scout-replay-vision` | No scanner observations yet; leave off until Replay Vision is operational. |
| `signals-scout-web-vitals` | Not selected for the focused baseline; enable later if per-page Core Web Vitals monitoring is needed. |

The verified limit is **100 scout runs/day**; **0** had run today and **100** remained at setup time. The current early-access banner says: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

## Custom scouts

No custom scouts were created. Two tailored candidates were proposed and declined/cancelled:

- **Meal-plan onboarding completion**: the `Registration` KYC flow culminates in profile completion and meal-plan generation before the daily tracker. A domain-specific scout could detect registrations that stop reaching that business outcome without an exception.
- **Wearable permission and sync readiness**: the `watchService` mediates the HealthKit/Health Connect permission-to-snapshot path. A domain-specific scout could detect a supported-device integration becoming unavailable or ceasing to yield usable data.

The built-in product analytics scout provides a conservative baseline. If a future custom scout becomes noisy, set its `emit` configuration to `false` in PostHog to make it dry-run only.

## Replay Vision scanners

Replay Vision scanners were not created. A scanner is an LLM that watches individual session recordings on a schedule and pushes findings to the inbox; it is the only part of this setup that spends Replay Vision quota. Scanner findings carry half weight and need corroboration before promotion into an inbox report.

Session Replay was enabled and the initial recordings probe found no recordings. The Replay Vision scanner list/create calls could not authenticate (`INVALID_API_KEY`), so existing scanner coverage, quota, estimates, and the required breakage/frustration monitor briefs could not be safely inspected or created.

## Repository changes

| Path | Change |
| --- | --- |
| `src/lib/analytics.ts` | Replaced the literal analytics host with `VITE_POSTHOG_HOST` and removed the existing `autocapture: false` override. |
| `.env` | Added `VITE_POSTHOG_HOST` using the configured EU PostHog ingestion host. |
| `posthog-self-driving-report.md` | Created this setup report. |

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) so Support tickets can reach the enabled responder.
- [ ] Connect the GitHub Issues warehouse source for `yuv-man/habeat-client` at [new data warehouse source](https://eu.posthog.com/project/263669/pipeline/new/source); the enabled GitHub responder will remain dormant until its first sync.
- [ ] Reauthorize the PostHog MCP connection with Replay Vision access, then create the breakage and user-frustration scanners. The scanner API rejected authenticated calls during this setup.
- [ ] Reauthorize the PostHog MCP connection with event/property schema read access if custom event-level scouts or event taxonomy analysis is needed.

## What happens next

The scout coordinator will pick up the fresh configurations within about 30 minutes. Runs draw from the verified daily budget, and actionable findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/263669/inbox), where they can become coding tasks.
