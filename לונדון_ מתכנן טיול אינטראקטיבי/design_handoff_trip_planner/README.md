# Handoff: Multi-Trip Travel Planner (Hebrew / RTL)

## Overview
A single-screen, tab-based trip planner for consumer travel planning, in **Hebrew with full RTL layout**. It manages multiple saved trips (dropdown switch, SAVE, NEW), a live countdown to departure, a day-by-day itinerary, a budget/expense dashboard, and a pre-trip / during-trip checklist. All data is local to the device (localStorage) — no backend.

The seeded trip is a real 7-day London itinerary (24/7–30/7), used as the default example trip.

## About the Design Files
The bundled file `London Trip Planner.dc.html` is a **design reference created in HTML** — a working prototype that shows intended look, copy and behavior. It is **not production code to copy directly**. `support.js` is only the prototype runtime that renders it; it has no place in a production codebase.

The task is to **recreate this design in the target codebase's existing environment** (React/Next, Vue, SwiftUI, Android/Compose, etc.), using its established component library, state management and styling conventions. If no codebase exists yet, pick the appropriate framework (React + TypeScript is a natural fit for this structure) and implement it there.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, radii, shadows, copy and interaction states below are final and exact. Recreate pixel-faithfully with the codebase's own primitives.

## Global frame

- Root: `dir="rtl"`, `min-height: 100dvh`, background `#F3F5FA`, text `#1B2559`, `overflow-x: hidden`.
- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif` (deliberately no webfont — a Google Font import previously caused frozen first paint on iOS).
- `box-sizing: border-box` globally.
- Content column: `max-width: 1180px`, centered, padding `24px 20px 60px`.
- Tap highlight: `rgba(47,95,224,0.15)`.

### Header (dark, sticky-free)
`linear-gradient(135deg, #1B2559 0%, #232E6B 100%)`, padding `18px 28px`, flex row, `justify-content: space-between`, `gap: 16px`, wraps.

Children, in RTL order (right → left):
1. **Title block** — `h1` = active trip name, 22px/800, `#fff`; year badge next to it (`#2F5FE0` bg, `#fff`, 12px/700, padding `3px 10px`, radius `999px`); sub-line 13px `#AEB8E8` = `"<end date> - <start date> • מסלול טיול אינטראקטיבי, תקציב וצ'ק-ליסט"`. Title, year and dates are all **derived from the active trip**, never hardcoded.
2. **Trip bar** (`.tp-tripbar`) — trip `<select>` + `SAVE` + `+ NEW`.
   - Select: bg `rgba(255,255,255,0.1)`, border `1px solid rgba(174,184,232,0.35)`, `#fff`, 13px/700, padding `9px 12px`, radius `11px`, `max-width: 200px`. Options render dark text (`#1B2559`) for native menus.
   - SAVE: `#2F5FE0` bg, `#fff`, 13px/800, padding `9px 16px`, radius `11px`, letter-spacing `.4px`. After a save it turns `#10A05F` and reads `נשמר ✓` for 1800ms, then reverts to `SAVE`.
   - + NEW: transparent bg, border `1px solid rgba(174,184,232,0.45)`, text `#DCE3FF`, same metrics; hover `background: rgba(255,255,255,0.12)`.
3. **Countdown timer** (`.tp-timer`) — bg `rgba(255,255,255,0.08)`, border `1px solid rgba(174,184,232,0.28)`, radius `12px`, padding `6px 12px`, flex, `gap: 8px`. A 15px clock icon (stroke `#AEB8E8`), then four number/label pairs separated by `:` (`#4A5691`, 12px):
   - number: `#fff`, 14px/800, line-height 1.1; label: `#8B96CC`, 9px/600.
   - labels: `ימים`, `שעות`, `דקות`, `שניות`; min-widths 30/26/26/26px; hours/mins/secs zero-padded to 2 digits.
   - Ticks every 1000ms. Position is intentional: immediately to the **right of the צ'ק-ליסט tab** (i.e. just before the nav in DOM order).
   - When departure has passed: single line 13px/700 `#fff` — `הטיול בעיצומו! 🇬🇧` during the 7 days after start, else `הטיול הסתיים`.
4. **Tab nav** (`.tp-nav`) — three tabs, RTL order: `צ'ק-ליסט`, `תקציב והוצאות`, `מסלול יומי`; each is icon (16px stroke-2 SVG) + label, 13px, padding `9px 16px`, radius `11px`, `gap: 6px`.
   - active: bg `#2F5FE0`, color `#fff`, weight 700; inactive: transparent, color `#C7CEEF`, weight 600.
   - Trailing 38×38 `#2F5FE0` square-ish button (radius `12px`) with a send/share glyph → `window.print()`, `title="הדפסה / שיתוף"`.

## Screens / Views

### 1. Itinerary — `מסלול יומי` (default tab)
**Purpose:** browse and edit the day-by-day plan.

- Section head: `h2` 20px/800 `לוח זמנים ומסלול טיול יומי`; `p` 14px `#697089`, max-width 560px: "תכנון יומי מפורט: אתרים, אטרקציות, סיורים ומקומות לארוחות. ניתן להוסיף, לערוך ולמחוק פרטים."
- Actions row (`.tp-toprow-actions`, gap 10px):
  - `שחזור לגרסה שנשמרה` — bg `#EDF0FA`, `#1B2559`, 13px/600, padding `10px 16px`, radius `10px`, 14px refresh icon. Restores the active trip's itinerary from its **last SAVEd snapshot** (fallback: the London seed for the seeded trip, otherwise empty days for the trip's date range).
  - `הוספת פעילות` — bg `#2F5FE0`, `#fff`, 13px/700, same metrics, `+` icon.
- **Day pills** (`.tp-daypills`): horizontal scroller, `gap: 10px`, `overflow-x: auto`, `padding-bottom: 6px`, `margin-bottom: 18px`. Pill = date + weekday; active pill `#2F5FE0`/white, inactive white bg with `#E3E8F5` border and `#4A5691` text, radius `12px`.
- **Day card** (`.tp-daycard`): white, radius `20px`, padding `22px 24px`, shadow `0 2px 14px rgba(27,37,89,0.06)`. Header = day title (17–18px/800) + weekday/date meta (13px `#697089`).
- **Add-activity form** (inline, shown on demand): dashed `1.5px #C6D0F5`, radius `14px`, padding `16px`, bg `#F8F9FF`. Grid `repeat(auto-fit, minmax(140px,1fr))`, gap 10px: time text, category select (`תחבורה / לינה / אטרקציה / אוכל`), title, description, price. Inputs: padding `9px 12px`, radius `9px`, border `1px solid #DADFF0`, 13px. Validation: title required → inline error `#D14343` 12.5px/700. Enter submits, Esc/cancel closes.
- **Activity row** (`.tp-item-row`): flex, gap 12px, align-items flex-start.
  - Right: delete + edit icon buttons (`background:none`, `#B5BCD6`, 2px padding).
  - Category icon chip (`.tp-item-icon`): 36–38px rounded square (radius ~12px), 18px stroke-2 glyph. Palette: transport `#E7EEFF`/`#2F5FE0`, lodging `#F1EAFB`/`#8B5CF6`, activity `#FEF3DC`/`#E0A324`, food `#E4F7EF`/`#10A05F`.
  - Text column: time chip (12px, `#697089`), title 14–15px/700, description 13px `#697089`, optional price pill (`<currency><amount>`).
  - Editing an item swaps the row for the same grid form, prefilled.

### 2. Budget — `תקציב והוצאות`
**Purpose:** track planned budget vs. actual spend by category.

- Head: `h2` `תקציב והוצאות`; `p` 14px `#697089` "לוח בקרה פיננסי לניהול תקציב הטיול לפי קטגוריות."
- **Stat cards**: grid `repeat(auto-fit, minmax(180px,1fr))`, gap 14px, margin-bottom 20px.
  - Primary card: bg `#1B2559`, white text; label 12px `#AEB8E8` (`תקציב כולל`), editable total value large/800.
  - Remaining / spent cards: white, radius 16px, padding `18px 20px`, shadow as above; value 20–22px/800; over-budget state uses `#D14343`.
- **Category breakdown**: per category — label + amount, and a progress bar (track `#EDF0FA`, radius 999px, height ~8px) filled with the category color. Reference allocation of total: food 30%, transport 15%, activity 40%, shopping 15%. A category over its allocation renders its bar and value in `#D14343`.
- **Add expense** card: white, radius 20px, padding `22px 24px`; `h3` 15px/800 `הוספת הוצאה`; grid `repeat(auto-fit, minmax(140px,1fr))`, gap 10px — category select, amount (number), note. Amount must be a positive number, else inline error. Enter submits.
- **Expense list**: rows with category chip, note, amount, delete button.
- Category labels: `אוכל`, `תחבורה`, `אטרקציות`, `קניות`. Currency symbol is configurable, default `£`.

### 3. Checklist — `צ'ק-ליסט`
**Purpose:** two-phase task list.

- Head: `h2` `רשימת משימות לטיול`; `p` "צ'ק-ליסט לפני הנסיעה ובמהלך הטיול."
- Phase toggle (segmented): active `#EDF0FA` bg + `#2F5FE0` text, inactive transparent + `#8892B0`; padding `8px 16px`, radius `9px`, 13px/700.
- Two panels in grid `repeat(auto-fit, minmax(300px,1fr))`, gap 16px: `לפני הנסיעה`, `במהלך הטיול` — white cards, radius 20px, padding `20px 22px`.
- Task row: 20×20 checkbox (radius 6px; unchecked `1.5px solid #C7CEE0` on `#fff`, checked solid `#2F5FE0` with white tick), text 13px `#1B2559`; done → `#B5BCD6` + line-through. Delete icon on the row.
- Add-task input + button; empty text → inline error. Enter submits.

### 4. New-trip dialog (modal)
Triggered by `+ NEW`. Overlay `rgba(27,37,89,0.55)`, centered, z-index 50. Card: white, radius 20px, padding 26px, `max-width: 440px`, shadow `0 18px 50px rgba(27,37,89,0.28)`.
- `h2` 19px/800 `טיול חדש`; `p` 13px `#697089` "הזן את פרטי הטיול. המסלול, ההוצאות והצ'ק-ליסט יתחילו ריקים."
- Fields (grid, gap 14px; labels 12px/700 `#4A5691`; inputs border `1.5px solid #DDE3F0`, radius 11px, padding `11px 13px`, 14px):
  - `שם הטיול` (text, required, placeholder "לדוגמה: טיול פריז")
  - `תאריך יציאה` (date, required)
  - `מספר ימים` (number 1–30, default 7) and `תקציב` (number, default 3000) in a 2-column sub-grid
- Errors: `יש להזין שם לטיול`, `יש לבחור תאריך יציאה` — `#D14343`, 12.5px/700.
- Buttons: `צור טיול` (flex:1, `#2F5FE0`, white, 14px/800, radius 12px, padding 12px) and `ביטול` (`#F1F3FA` bg, `#4A5691`).
- Enter anywhere in the form submits.

## Interactions & Behavior

**Multi-trip**
- Dropdown switch: saves the current trip into the in-memory trip list first, then loads the target trip (days, budget, expenses, todos, start date, name) and resets to day 0, closing any open editors.
- SAVE: upserts the active trip into the list and persists the whole store; button flashes success for 1800ms.
- NEW: validates, persists the current trip, generates a fresh trip with `id = 'trip-' + Date.now()`, blank day scaffold for the chosen length (Hebrew weekday + `d/m` per day), empty expenses/todos, then switches to it on the itinerary tab.

**Countdown:** 1s interval; `diff = start - now`; days = `floor(diff/86400000)`, then mod-24/60/60 zero-padded. Past-start states described above. Clear the interval on unmount.

**Validation:** every add form blocks empty/invalid input with an inline message (no alerts) and clears the error on successful submit. All add forms submit on Enter.

**Print/share:** `window.print()`.

**Responsive**
- `≤900px`: timer and nav re-order below the title/trip bar.
- `≤720px`: header stacks (`flex-direction: column; align-items: stretch`), padding `14px 16px` plus `env(safe-area-inset-*)`; nav becomes a horizontal scroller with hidden scrollbar and no-wrap tabs; trip bar full width with the select flexing; timer full width, centered; **all inputs/selects forced to 16px** to prevent iOS focus zoom; tap targets ≥44px (tabs, pills, trip-bar buttons, action buttons); main padding respects safe-area left/right/bottom; modal becomes a bottom sheet (`align-items: flex-end`, radius `20px 20px 0 0`, `max-height: 88dvh`, scrollable, bottom-inset padding), modal buttons ≥46px; item rows wrap with the category icon moving above the text (`order: -1`).
- `≤400px`: tighter timer gaps and smaller trip-bar buttons (12.5px).
- Verified against 360px (Samsung), 393px (iPhone 16 Pro / 17), 430px (16 Pro Max) and desktop.

## State Management

Per active trip (working copy):
`days[]` — `{ date, weekday, title, items[] }`, `items[]` — `{ id, time, category, title, desc, price }`
`budgetTotal` (string), `expenses[]` — `{ id, category, amount, note }`
`todoBefore[]` / `todoDuring[]` — `{ id, text, done }`

App-level: `trips[]` (saved snapshots: `{ id, name, startDate, days, budgetTotal, expenses, todoBefore, todoDuring }`), `currentTripId`, `tripName`, `tripStart` (ISO `YYYY-MM-DDTHH:mm`), `activeTab` (`itinerary | budget | todo`), `activeDayIdx`, `todoPhase` (`before | during`), draft objects + error flags per form, `justSaved`, `newTripOpen`, `newTripDraft`, `now` (tick).

**Persistence:** one localStorage key, `tp-trips-v2`, holding `{ trips, currentTripId }`. Read on mount; if absent, seed with the London trip and persist. Writes happen on SAVE, trip switch and trip creation. In production, swap this for the app's own persistence/sync layer but keep the same shape.

## Design Tokens

Colors — `#1B2559` (ink/deep navy), `#232E6B` (header gradient end), `#2F5FE0` (primary), `#1B3FB0` (link hover), `#DCE3FF`, `#C7CEEF`, `#AEB8E8`, `#8B96CC`, `#4A5691`, `#697089`, `#8892B0`, `#B5BCD6`, `#C7CEE0`, `#DADFF0`, `#DDE3F0`, `#E3E8F5`, `#EDF0FA`, `#F1F3FA`, `#F3F5FA` (page bg), `#F8F9FF`, `#fff`. Semantic: success `#10A05F`, warning/activity `#E0A324`, danger `#D14343`, purple `#8B5CF6`. Category tints: `#E7EEFF`, `#F1EAFB`, `#FEF3DC`, `#E4F7EF`.

Type — 22/800 (h1), 20/800 (h2), 19/800 (modal h2), 17–18/800 (day title), 15/800 (h3), 14–14.5/700 (item title, buttons), 13–13.5 (body, labels, tabs), 12–12.5 (meta, field labels), 9/600 (timer labels). Weights used: 600, 700, 800.

Spacing — 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28px.

Radii — 6 (checkbox), 9, 10, 11, 12, 14, 16, 20 (cards/modal), 999 (pills/bars).

Shadows — card `0 2px 14px rgba(27,37,89,0.06)`; modal `0 18px 50px rgba(27,37,89,0.28)`.

Other — scrollbars 6px with `#C7CEE0` thumb; `-webkit-text-size-adjust: 100%`.

## Assets
None external. All icons are inline 24×24 stroke-2 SVG paths (clock, checkbox, card, map pin, refresh, plus, pencil, trash, send). No images, no webfonts — keep it that way for offline/first-paint reasons, or substitute the codebase's own icon set at the same optical size.

## Screenshots
`screenshots/` — reference captures of the built prototype at desktop width:
- `01-itinerary-desktop.png` — itinerary tab (day pills + day card + activity rows)
- `02-budget-desktop.png` — budget dashboard (stat cards, category bars, add-expense, expense list)
- `03-checklist-desktop.png` — checklist tab (both phases)
- `04-new-trip-modal.png` — new-trip dialog over the app

For mobile, open the prototype in a browser at 360 / 393 / 430px width — the responsive rules are documented above.

## Files
- `London Trip Planner.dc.html` — the full prototype (markup + logic + seeded London trip data, including the real itinerary, expenses and checklist copy).
- `support.js` — prototype runtime only; do not port.
