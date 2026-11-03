# CLAUDE.md

## Project context
This is a 3-day Product Builder exercise for PLG Group. It is an independent prototype inspired by GoOut's Prague events listing. It adds:
- **multi-select categories**
- a **price filter**
- **price shown on every event card**

All three combine with date presets, and the whole thing works fully by keyboard and screen reader.

It is a concept presented as an extension of GoOut, so it **mirrors GoOut's layout and visual language** (reference screenshots: `docs/references/`). Use a text wordmark only: no copied logo files, photos or other GoOut assets. Keep the "koncept" badge and the footer disclaimer.

Docs: [discovery](docs/discovery.md) · [product spec](docs/product-spec.md) · [accessibility](docs/accessibility.md) · [decisions](docs/decisions.md)

## Technical constraints
- React 19 + TypeScript 7 + Vite 8, linted with oxlint. The app is frontend only.
- No backend, API, auth, checkout or router. Data is local mock data in `src/data/events.ts`.
- **No new runtime dependencies.** The only new dev dependency is `vitest`; `@testing-library/react` and `vitest-axe` are optional extras.
- Target: WCAG 2.2 AA. Evergreen browsers. Layout down to 320px wide.

## Code layout
```
src/types.ts            domain types (EventItem, PriceInfo, FilterState)
src/data/               categories, filter options, mock events
src/lib/                pure logic: dates, filterEvents, urlState, format (+ *.test.ts)
src/hooks/              useFilters (state + URL sync), useDebouncedValue
src/components/         one component per file, CSS Module alongside
```

## Coding conventions
- **All filtering logic stays pure, in `src/lib/`.** Components only render and dispatch. Every edge case in the spec gets a unit test.
- **Time is always passed in as `now: Date`. Never call `new Date()` inside the logic.** The app uses a fixed demo "now" so results stay deterministic.
- **Do all date maths in `Europe/Prague`** through `src/lib/dates.ts`, never in the browser's time zone. Day comparisons use `YYYY-MM-DD` keys.
- Event prices are `ticketPrices: number[]` (0 = free entry, `[]` = unknown); filter on `lowestPrice()` from `src/lib/priceFilter.ts`. Use discriminated unions for filter state (`PriceFilter`). Don't use magic numbers like `-1` for "unknown".
- **Use native form controls first:** checkboxes for categories, radios for price and date, each group in `<fieldset>` + `<legend>`. Don't add ARIA where native HTML already does the job.
- Styling: CSS Modules plus custom-property tokens in `src/index.css`. Selected states never rely on colour alone.
- Prices are whole CZK, formatted with `Intl.NumberFormat('cs-CZ')` ("200 Kč"). UI copy is in **Czech**, matching GoOut (`lang="cs"`). Code, comments and docs stay in English.
- Keep components small. No global state library; one `useFilters` hook is enough.

## Development workflow
Requires **Node 24** (`.nvmrc`). The shell defaults to Node 11, which can't run tsc/oxlint, so run `nvm use` first.
```bash
npm install
npm run dev        # local dev server
npm run lint       # oxlint
npm run build      # tsc -b && vite build. Must pass before any commit.
npm test           # Vitest unit tests (src/**/*.test.ts)
```
Definition of done for each feature:
- build, lint and tests pass
- it has been through a keyboard-only pass
- axe reports no serious or critical issues
- the docs are updated if a decision changed

Log notable AI-assisted work in `README.md`: what was generated, and what was changed or rejected.

## Important product decisions (details in docs/decisions.md)
- **Categories:** OR within the group, AND across groups. No categories selected means all of them.
- **Price bands are cumulative** ("up to"), so the price group is single-select.
- **A paid event matches on its cheapest ticket.** Bounds are inclusive. Free events fit under every price cap.
- **Unknown price** is hidden when any price filter is active, and the UI shows how many events were hidden.
- **Multi-day events** match a date preset if their span overlaps it. Past events are never shown.
- **Filters apply instantly**, with no Apply button. The result count is announced through a debounced `role="status"`. Focus never moves because the results changed.
- **Filter state lives in the URL** (`?cat=concerts,clubbing&price=200&date=weekend`). Invalid params are ignored.
