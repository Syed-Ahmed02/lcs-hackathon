# Next.js Dashboard Plan

## Goal

- Turn the existing Next.js app into the signed-in dashboard for focus sessions, live tab decisions, and user insights.

## Repo Baseline

- `[package.json](package.json)` already includes Next.js, React, Tailwind, shadcn, and Convex.
- `[app/page.tsx](app/page.tsx)` is still starter content, so the dashboard can replace it directly.
- `convex/` has generated files only, so all schema, auth, API, and AI plumbing still need to be added.

## Scope

1. Add WorkOS AuthKit + Convex auth for the web app.
2. Add Convex schema and APIs for sessions, tab snapshots, decisions, and insight rollups.
3. Build the signed-in dashboard UI in the existing Next app.
4. Add the extension-linking flow so the popup can associate with the signed-in user.

## Implementation Plan

1. Set up production-shaped auth for the dashboard.

- Add `[convex.json](convex.json)` and `[convex/auth.config.ts](convex/auth.config.ts)` for WorkOS + Convex.
- Add the Next-side auth provider, callback route, protected layout, and signed-in state handling under `[app/](app/)`.
- Keep the extension out of the hosted WorkOS popup flow; instead, expose a linking handshake from the web app.

1. Create the Convex data model for dashboard and realtime analytics.

- Add `[convex/schema.ts](convex/schema.ts)` with tables such as:
  - `focusSessions`
  - `tabSnapshots`
  - `tabDecisions`
  - `insightRollups`
- Add user-scoped indexes for recent sessions, active session lookup, and per-session decision history.
- Only add an app-level `users` table if you need first-class profile rows beyond auth identity.

1. Add Convex functions for app reads/writes and AI-backed classification.

- Add public queries for:
  - active session
  - recent session history
  - recent tab decisions
  - dashboard insight cards
- Add mutations for:
  - creating a session
  - recording tab snapshots/decisions
  - manual overrides
- Add a separate Node action for OpenRouter-backed summarization/classification so model calls stay isolated from transactional writes.

1. Replace the starter page with a realtime dashboard.

- Update `[app/page.tsx](app/page.tsx)` to show:
  - current focus session
  - live allowed/blocked tab events
  - session history
  - insights like distraction rate and top distracting domains
- Add shadcn-based cards, tables, badges, tabs, and dialogs under `[components/](components/)`.
- Subscribe to Convex queries so the dashboard updates live while the extension is running.

1. Add a web-based extension linking flow.

- Create a small dashboard screen or dialog where the signed-in user can generate a short-lived link code or token.
- Add the backend mutation/query pair for validating and exchanging that code from the extension.
- Keep the linking flow minimal for MVP, but structure it so it can later be upgraded to a stronger device-authorization flow.

## Key Files

- `[app/page.tsx](app/page.tsx)`
- `[app/layout.tsx](app/layout.tsx)`
- `[components/](components/)`
- `[convex/schema.ts](convex/schema.ts)`
- `[convex/auth.config.ts](convex/auth.config.ts)`
- `[convex.json](convex.json)`
- `[convex/*.ts](convex/)`

## Validation

- Verify WorkOS sign-in returns to the dashboard successfully.
- Verify Convex receives authenticated requests from the web app.
- Verify the dashboard updates in realtime when session and tab-decision data changes.
- Verify extension linking succeeds and associates events with the correct signed-in user.

