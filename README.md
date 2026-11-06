# 심야 옥상

A quiet Korean rooftop experience with a procedural hillside neighborhood, three moon phases, manual sky and weather selection, drinks, breathing, and ephemeral anonymous rooms.

## Source

- `experience/`: HTML, CSS and browser JavaScript.
- `lib/rooftop-page.ts`: embeds the experience into the HTML response.
- `lib/whispers-api.ts`: D1-backed message relay; no author identity is returned to visitors.
- `worker/index.ts`: serves the HTML and relay directly, preserving the starter fallback and Sites build integration.
- `db/schema.ts` and `drizzle/`: database schema and migrations.

The Site is public and posting requires no login. Throttling uses a hash of the edge-provided network address; if absent it uses the signed-in ID or a shared anonymous bucket. Raw addresses are not stored. Visitors sharing a network may share the 5-second limit.

Rooms: all / work / study. Messages are capped at 60 UTF-16 code units, one per signed-in user every 5 seconds. Polling every 1.5 seconds returns only the last 6 seconds of messages, with ID cursors. The screen shows at most three nonoverlapping bubbles; short messages last 2.8 seconds, long messages 4.5 seconds, slow-reading mode 8 seconds. Excess arrivals are quietly omitted. The UI has no history. Records older than 60 seconds are deleted on the next API read/write; this is not a guarantee of physical deletion at exactly 60 seconds or deletion from provider backups.

## Validation

Build through the Sites build helper. Apply the generated D1 migration to the local preview, then run the built Worker with `npm start -- --port 8791`. `node tests/whispers.integration.mjs` checks authentication, input validation, origin restrictions, privacy of the response, cross-room isolation, cursors, cooldown including concurrent sends, and expiry. It sends only synthetic local test data.

Production builds and API tests pass. The development route wrapper incorrectly treated route responses as React elements; direct Worker dispatch avoids that wrapper while keeping the supported build pipeline. Use the built Worker preview for integration testing.

## Immersive dock update

Chat is always available below the action bar, with room selection inside the composer. Bubbles float over the scene, avoiding visible guidance and each other. Guidance, weather controls and the corner seat control fade after 30 seconds of inactivity; a persistent toggle or any pointer/keyboard interaction brings them back. Editing inputs or using a dialog postpones automatic hiding. Weather/time/moon selections are saved locally. Background adds rounded hills, deeper midnight tones, amber string lights, a blanket and a lantern.

## Message moderation

Messages are checked on the server before insertion, and filtered on reads too. The deterministic Korean/English rules reject explicit sexual terms, threats and profanity, including selected spacing, punctuation, zero-width and leetspeak variations. Rejected text is not stored. This is a baseline word/pattern filter, not semantic AI moderation, and can miss novel euphemisms or block harmless homonyms. Regression tests document supported cases.

## Weather music and plain text

The opt-in Web Audio soundtrack uses original note patterns: clear-night soft sine keys, rain with filtered noise and slower keys, and snow with bell partials. Weather changes crossfade buses and clean up retired nodes. No external audio assets or autoplay are used. Messages show only escaped text, with no sender label or bubble background.

The rooftop foreground is offset from the measured dock top so the sitter, table and bench stay visible. A warm fabric parasol opens while seated in rain/snow; snow coats its rim, and precipitation is masked underneath. A ResizeObserver recomputes clearance when the dock layout changes.
