# CLAUDE.md

## Project
A 3-day Product Builder exercise for PLG Group: an independent prototype that extends GoOut's Prague events listing with **multi-select categories**, a **price filter** and **the price on every card**. These combine with date, location, editors' picks and sort, and everything works by keyboard and screen reader.

It **mirrors GoOut's layout and visual language**, but uses a text wordmark only: no copied logo, photos or other GoOut assets. Keep the "koncept" badge and the footer disclaimer.

Docs: [product spec](docs/product-spec.md) (requirements, rules, edge cases) · [decisions](docs/decisions.md) · [audit](docs/accessibility-audit.md) · [discovery](docs/discovery.md)

## Constraints
- React 19, TypeScript 7, Vite 8, oxlint. Frontend only: no backend, API, auth, checkout or router.
- Data is local mock data in `src/data/events.ts`.
- **No new runtime dependencies.** Dev dependencies: `vitest`; `@testing-library/react` and `vitest-axe` are allowed if needed.
- WCAG 2.2 AA, evergreen browsers, layouts down to 320px wide.

## Code layout
```
src/types.ts        domain types (EventItem, PriceFilter, DateFilter, FilterState)
src/data/           categories, countries, cities, mock events
src/lib/            pure logic + *.test.ts: dates, dateFilter, priceFilter, filterEvents,
                    categorySelection, citySearch, groupEvents, sort, urlState, format
src/hooks/          useFilters (state + URL sync), useDebouncedValue
src/components/     one component per file, CSS Module alongside
```

## Rules
- **Filtering logic is pure and lives in `src/lib/`.** Components only render and dispatch. Every edge case in the spec gets a unit test.
- **Pass time in as `now: Date`; never call `new Date()` in the logic.** The app uses a fixed demo "now".
- **Date maths happens in `Europe/Prague`** via `src/lib/dates.ts`. Compare days as `YYYY-MM-DD` keys.
- **Prices:** `ticketPrices: number[]` (0 = free, `[]` = unknown), in whole units of the venue country's currency (CZK or EUR). Filter on `lowestPrice()`; format with `formatMoney()` ("200 Kč", "15 €"). Price caps come from `src/data/countries.ts`.
- **Types:** discriminated unions for filter state (`PriceFilter`, `DateFilter`); no magic values like `-1`.
- **Native controls first:** checkboxes for categories; radios for country, price, date and sort; each group in a `<fieldset>` with a `<legend>`. No ARIA where native HTML does the job.
- **Styling:** CSS Modules plus tokens in `src/index.css`. Selected states never rely on colour alone. Filled buttons use `--color-button` (`#00b6eb`, a known contrast issue); text and links use `--color-brand`.
- **Language:** UI copy is Czech (`lang="cs"`); code, comments and docs are English.
- Keep components small. No state library: `useFilters` is the single source of state.
- **Paths:** the app is served from `/goout-filters-ux-concept/` on GitHub Pages. Never hard-code `/` for links or assets: use `import.meta.env.BASE_URL` (files in `public/`) or `import` (files in `src/`).

## Product rules
Full detail in the spec and decisions.
- Categories are OR within the group, AND with other filters; none selected = all.
- Price caps are cumulative ("up to"), so single-select. An event matches on its cheapest ticket, inclusive; free events fit every cap.
- Unknown prices are hidden under any price filter, and the hidden count is shown.
- Past events are never shown. An event with `endsAt` stays listed until it ends; multi-day events match a date if any of their days overlap it.
- Filters apply instantly. The result count is announced through a debounced `role="status"`, and focus never moves because results changed.
- "Zrušit vše" clears categories, price, date and picks; it keeps country, city and sort.
- Filter state lives in the URL (`?cat=concerts,parties&price=200&date=weekend`) via `history.replaceState`. Invalid params and past date ranges are ignored.

## Workflow
Requires **Node 24** (`.nvmrc`). The shell defaults to Node 11, which can't run tsc or oxlint, so run `nvm use` first.
```bash
npm run dev        # dev server
npm run lint       # oxlint
npm test           # Vitest (src/**/*.test.ts)
npm run build      # tsc -b && vite build; must pass before any commit
```
Pushing to `main` deploys to GitHub Pages (`.github/workflows/deploy.yml`) after lint, tests and build pass.

**Done means:** build, lint and tests pass; a keyboard-only pass is done; axe reports no serious or critical issues; docs are updated when a decision changes.

Log notable AI-assisted work in `README.md` ("How this was built"): what was generated, and what was changed or rejected.
