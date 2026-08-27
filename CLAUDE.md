# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no build step, package manager, linter, or test suite — this is a static site (plain HTML/CSS/JS).

- **Run the app**: open [index.html](index.html) directly in a browser (works from `file://`), or serve the directory with any static server (e.g. `npx serve .`).
- **No install, build, lint, or test commands exist.** Do not add a `package.json` or tooling unless the user explicitly asks for it — the no-build-step constraint is intentional (see below).

## Architecture

Single-page app: [index.html](index.html) mounts an empty `#app` div, [style.css](style.css) holds all styling, and [app.js](app.js) (~950 lines) contains all state, rendering, and logic. No frameworks, no modules, no bundler.

**Rendering model**: one global `state` object + a single `render()` function that rebuilds `#app`'s entire `innerHTML` from scratch on every change (`app.js:821`). There is no virtual DOM and no partial patching, except:
- The countdown timer updates its own DOM node directly every second via `updateTimerDom()` (`app.js:466`) instead of going through full `render()`, for performance.
- `render()` manually preserves focus and text-selection range across the re-render (`app.js:821-850`), since rebuilding `innerHTML` would otherwise drop focus while typing.

**Event handling**: fully delegated at the root `#app` element — one `click`, `input`, `change`, and `keydown` listener each, attached once in `init()` (`app.js:944-954`). Individual elements are never given their own listeners; instead:
- Clickable elements carry `data-action="..."` (and often `data-id`/`data-idx`/`data-tab`/etc.), dispatched through the `switch` in `onRootClick()` (`app.js:894`).
- Form inputs are matched by DOM `id` against the `INPUT_BINDINGS` map (`app.js:854`), which writes the typed value into `state`.
- Enter-to-submit fields are declared in `SUBMIT_ON_ENTER` (`app.js:885`), mapping an input's `id` to an action name resolved via `SUBMIT_ACTIONS` (`app.js:877`).

When adding a new interactive element, follow this pattern: add a `data-action` handler in `onRootClick`, or add the input's `id` to `INPUT_BINDINGS` (and `SUBMIT_ON_ENTER`/`SUBMIT_ACTIONS` if it should submit on Enter) — don't attach ad-hoc listeners.

**State shape** (`app.js:127`): one active/working trip is flattened into top-level `state` fields (`days`, `budgetTotal`, `expenses`, `todoBefore`, `todoDuring`, `tripName`, `tripStart`, …) plus UI state (`activeTab`, `activeDayIdx`, in-progress drafts and their error flags, modal state). `state.trips[]` holds saved snapshots of *all* trips; the active trip is copied out into the flat fields via `applyTripToState()` and copied back in via `collectTrip()` when switching trips (`app.js:312-331`).

**Persistence — autosave, no manual save button**: single `localStorage` key `tp-trips-v2` (`TRIPS_KEY`, `app.js:11`), storing `{ trips, currentTripId }`, written by `persist()` (`app.js:175`). There is no "Save" button — `render()` calls `scheduleAutoSave()` on every re-render (`app.js:850`), which debounces 600ms (`app.js:334-345`) before merging the flat state fields into `state.trips` via `collectTrip()` and calling `persist()`. A `beforeunload` listener (`app.js:953`) calls `flushAutoSave()` synchronously as a safety net in case the tab closes mid-debounce. `switchTrip()`/`createTrip()` still persist immediately and unconditionally (they don't rely on the debounce) since they swap which trip is active. On first load with no saved store, `loadStore()` seeds a default "טיול לונדון" (London) trip from the `SEED_*` constants (`app.js:39-109`) and persists it immediately. When adding new mutating actions, no extra persistence call is needed — just end the action with `render()` as usual and autosave picks it up.

**RTL/Hebrew**: the entire UI is Hebrew with `dir="rtl"` (set in [index.html](index.html)). All user-facing strings are Hebrew literals inline in `app.js` — there is no i18n layer. Keep new UI text in Hebrew and RTL-consistent.

**Font**: Rubik, loaded from Google Fonts via a `<link>` in [index.html](index.html) and set as the primary face in `--font-stack` ([style.css](style.css)'s `:root`), with system-font fallbacks for offline/`file://` use.

**Header layout**: [app.js](app.js)'s `renderHeader()` (`app.js:486`) renders two explicit flex rows (`tp-headerrow1`, `tp-headerrow2`) rather than one wrapping row:
- Row 1 holds an app-level eyebrow title ("תכנון הטיול הבא שלי", styled the same size/weight as the trip name) above the title block — trip name, year badge, and a **single** pencil (`edit-trip-info`) that toggles both the name and the date into inline-editable inputs together, saved/cancelled as one unit via `saveTripInfo()`/`cancelEditTripInfo()` (`app.js:375-391`). Don't split name-editing and date-editing back into two separate pencils — they were merged deliberately so there's exactly one edit affordance for "trip info."
- Row 2 holds `tp-tripbar-col`, a column stacking the trip-selector row (`tp-tripbar`: NEW button + `<select>`, no Save button — see Persistence above) directly above the countdown timer (`.tp-timer`, driven by `computeCountdown()`/`renderTimerBody()`, `app.js:433-465`); then the tab nav in order מסלול יומי → תקציב והוצאות → צ'ק-ליסט (first in DOM renders rightmost under RTL).

Keep new header controls in one of these two rows rather than reintroducing a single flat row.

**Icons**: all icons are inline SVG strings in the `ICO` and `ICON_PATHS` objects (`app.js:19-38`) — no icon library, no image assets.

## Design reference

[`לונדון_ מתכנן טיול אינטראקטיבי/design_handoff_trip_planner/`](לונדון_ מתכנן טיול אינטראקטיבי/design_handoff_trip_planner/) contains a separate hi-fidelity design handoff (`London Trip Planner.dc.html` + `support.js` + screenshots) that this app's design was implemented from. Its `README.md` documents exact colors, spacing, copy, and per-screen behavior in detail — consult it before changing visual design or copy, since [style.css](style.css)'s `:root` custom properties mirror its token names closely. The `.dc.html`/`support.js` files there are prototype-only and are not meant to be ported into or run alongside the production app.
