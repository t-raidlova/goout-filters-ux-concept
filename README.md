# GoOut event discovery: a product concept

A clickable prototype of how GoOut's event listing could answer one question faster: **"What can I go to this weekend, that I'd enjoy, and that I can afford?"**

**Live demo:** https://t-raidlova.github.io/goout-filters-ux-concept/

> **Independent concept, not an official GoOut project.** See the [disclaimer](#disclaimer).

## Overview
[GoOut](https://goout.net) is a Czech and Slovak platform for finding cultural events and buying tickets. This prototype **mirrors GoOut's listing** (layout, Czech copy, categories, filter bar) and adds three things:

1. **Several categories at once**, e.g. concerts *and* parties.
2. **A price filter**: free, up to 200 Kč, up to 500 Kč, up to 1 000 Kč.
3. **The price on every event card.**

All filters combine, results update instantly, and everything works with a keyboard and a screen reader. It was built in three days as a Product Builder exercise for a job application at PLG Group.

## The problem
**Observed** on GoOut's desktop listing (3 November 2026, details in [discovery.md](docs/discovery.md)):
- Category is a single choice.
- Cards don't show a price, and there's no price filter or "free" label.
- One "Redakční tipy ▾" dropdown both reorders and hides events, so users can't tell which is happening.

**Assumed, not validated:** people want to combine categories, filter by budget, and see prices up front. No GoOut user data was available; each hypothesis and how to test it is in [discovery.md](docs/discovery.md#hypotheses-requiring-validation).

## The solution
The prototype extends GoOut's existing filter bar instead of inventing a new one:

```
Česko ▾   Praha ▾   Všechny kategorie ▾   Cena ▾   Kdykoliv ▾        Redakční tipy   Řadit: Blížící se ▾
```

- **Categories:** a panel of GoOut's 10 categories; tick any number.
- **Cena:** a compact single-choice dropdown. Prices are in € when Slovensko is selected.
- **Kdykoliv:** Dnes, Zítra, Tento týden, Tento víkend, or a custom range.
- **Location:** Česko or Slovensko, and a searchable city list.
- **Redakční tipy and Řadit:** GoOut's mixed dropdown is split into an editors'-picks filter and a sort order.
- **Results:** a price on every card ("od 290 Kč", "Zdarma", "Cena neuvedena"), a result count, removable filter chips with "Zrušit vše", and an empty state that suggests which filter to drop and how many events that brings back.
- **Shareable links:** filters live in the URL (`?cat=concerts,parties&price=200&date=weekend`).

The demo uses a fixed date (**Friday 6 November 2026, 17:00, Prague time**) and 49 fictional events, so results are always the same.

## Key decisions
The full log, with reasons and trade-offs, is in [decisions.md](docs/decisions.md).

- **Price is shown before it's filtered.** You can't sensibly filter by a value you can't see.
- **Price caps are "up to", and match the cheapest ticket.** "Do 200 Kč" answers "can I get in for 200 Kč or less?" The card shows that same number ("od 200 Kč"), so every result is explainable.
- **Unknown prices are hidden** under a price filter, and the UI says how many were hidden.
- **Categories are OR, filters are AND.** "Concerts or parties, this weekend, under 200 Kč."
- **Location and sort are context, not filters.** "Zrušit vše" keeps them.
- **Results update instantly.** Screen-reader users hear one summary about half a second after the last change.

## Accessibility
Target: **WCAG 2.2 AA** ([requirements](docs/accessibility.md), [audit](docs/accessibility-audit.md)).

- Native checkboxes and radios, so names and states are announced without custom widgets.
- Full keyboard support; focus is always visible and lands somewhere sensible after every action.
- A polite status announces the active filters and the result count; focus never jumps.
- Selected states don't rely on colour; prices and statuses are text.
- No horizontal scrolling at 320px or at 200–400% zoom; reduced-motion and forced-colours modes are respected.

**Known issue:** the light-blue filled buttons (white on `#00b6eb`, 2.36:1) fail text contrast. The colour was kept to match GoOut; fixes are documented.

**Not yet tested:** real screen readers, Safari and Firefox, and testing with disabled users. **This isn't a conformance claim.**

## Getting started
You need **Node.js 24** ([`.nvmrc`](.nvmrc)) and npm.

```bash
nvm use
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run lint
npm run build      # type-check and production build
```

**Deployment:** every push to `main` runs lint, tests and the build, then publishes to GitHub Pages ([workflow](.github/workflows/deploy.yml)). The app is served from `/goout-filters-ux-concept/` (`base` in [vite.config.ts](vite.config.ts)).

**Stack:** React 19, TypeScript, Vite, Vitest (118 unit tests), oxlint, CSS Modules. No backend, no state library, no runtime dependencies beyond React.

## Project structure
```
docs/
  discovery.md           What was observed, hypotheses, priorities
  product-spec.md        Requirements, rules, acceptance criteria, edge cases
  decisions.md           Decisions with reasons and trade-offs
  accessibility.md       Accessibility requirements and keyboard behaviour
  accessibility-audit.md Audit method, findings, what's untested
src/
  App.tsx                Page layout; connects filters to results
  types.ts               Domain types
  data/                  Mock events, categories, cities, countries
  lib/                   Pure filtering, date, price, sort and URL logic, with tests
  hooks/                 Filter state (synced to the URL), debounced announcement
  components/            One component per file, with its CSS Module
```

## Limitations
A front-end prototype only. It has **no** GoOut API or backend (all events are fictional, at real venues), no login, event detail pages or checkout ("Vstupenky" and the other sidebar sections are visual only), no text search or map, no pagination, and no real clock. The phone layout is an assumption, since no GoOut mobile reference was used. No GoOut logo, photos or other assets are included.

## Next steps
- **Validate first:** check what share of real GoOut events have a known price, and test the hypotheses with analytics, interviews and A/B tests.
- **Finish the prototype:** fix the button contrast, test with real screen readers and other browsers, link cards to a detail page.
- **Possible features:** result counts per category, a mobile filter sheet, price ranges with a minimum, "Podle kamarádů" for logged-in users.

## How this was built
Built with Claude Code. The rules it had to follow (native controls first, pure tested logic, Prague time zone, no new dependencies) are in [CLAUDE.md](CLAUDE.md).

**AI-assisted review and fixes** (decisions [R1–R7](docs/decisions.md#review-fixes)):
- **Generated:**
  - focus handling for the category panel
  - URL sync
  - `hasClearableFilters` for the empty state
  - the city-search Enter fix
  - 5 unit tests
  - checks in headless Chrome
- **Changed:**
  - `ChoiceList` is generic over its keys, which removed runtime guards and a type cast
  - `EmptyState` takes one `onRelax(kind)` callback
  - the category toggle is its own component
  - `App` uses one setter factory instead of five copies
- **Removed (unused):** `categoryCounts`, `isDefault`, `ANY_PRICE`, `ANY_DATE`, `DEFAULT_SORT`, and the radio variant of `FilterOption`.
- **Rejected:** moving the category panel's markup next to its button. It would have turned the panel into an overlay, so focus management was used instead.

## Disclaimer
This is an **independent product concept**, made as part of a job application. It is **not an official GoOut project** and is not affiliated with or endorsed by GoOut or PLG Group. All events, prices and popularity numbers are fictional. Screenshots of GoOut's public website were used privately as design reference and aren't included in this repository.
