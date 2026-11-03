# GoOut event discovery: a product concept

A clickable prototype of how GoOut's event listing could answer one question faster: **"What can I go to this weekend, that I'd enjoy, and that I can afford?"**

**Live demo:** https://t-raidlova.github.io/goout-filters-ux-concept/
**Case study:** [case-study.md](case-study.md): the problem, discovery, design decisions and what I'd validate next.

> **Independent concept, not an official GoOut project.** See the [disclaimer](#disclaimer).

## The problem

On GoOut's desktop listing ([discovery.md](docs/discovery.md)):

- Category is a single choice, so "concerts or parties" takes two searches.
- Cards don't show a price, and there's no price filter or "free" label.
- One "Redakční tipy ▾" dropdown both reorders and hides events, so users can't tell which is happening.

These are hypotheses, not validated findings: no GoOut user data was available.

## Filter UX improvements

The prototype extends GoOut's existing filter bar instead of inventing a new one:

```
Česko ▾   Praha ▾   Všechny kategorie ▾   Cena ▾   Kdykoliv ▾        Redakční tipy   Řadit: Blížící se ▾
```

1. **Several categories at once.** Tick any of GoOut's 10 categories; they combine as OR, e.g. concerts _or_ parties.
2. **A price filter.** Zdarma, do 200 Kč, do 500 Kč, do 1 000 Kč (in € for Slovensko).
3. **The price on every card.** "od 290 Kč", "Zdarma" or "Cena neuvedena".
4. **Picks and sort split apart.** "Redakční tipy" becomes a filter toggle; sort order gets its own "Řadit" control.
5. **Clear feedback.** A result count, removable filter chips, "Zrušit vše", and an empty state that suggests which filter to drop and how many events that brings back.
6. **Shareable links.** Filters live in the URL (`?cat=concerts,parties&price=200&date=weekend`).

## Key decisions

Full log in [decisions.md](docs/decisions.md).

- **Show price before filtering by it.** You can't sensibly filter by a value you can't see.
- **Price caps are "up to" and match the cheapest ticket.** The card shows that same number, so every result is explainable.
- **Unknown prices are hidden** under a price filter, and the UI says how many.
- **Categories are OR, filters are AND.** "Concerts or parties, this weekend, under 200 Kč."
- **Location and sort are context, not filters.** "Zrušit vše" keeps them.
- **Results update instantly**, without moving focus.

## Getting started

Requires **Node.js 24** ([`.nvmrc`](.nvmrc)).

```bash
nvm use
npm install
npm run dev        # http://localhost:5173
npm test
npm run lint
npm run build
```

Every push to `main` runs lint, tests and the build, then deploys to GitHub Pages. The demo uses a fixed date (Friday 6 November 2026, 17:00 Prague time) and 49 fictional events.

**Stack:** React 19, TypeScript, Vite, Vitest, oxlint, CSS Modules. No backend and no runtime dependencies beyond React.

## Limitations and next steps

Front-end only: fictional events, no API, login, event detail or checkout, no mobile reference.

- **Validate:** what share of real events have a known price; test the hypotheses with analytics, interviews and A/B tests.
- **Next features:** result counts per category, a mobile filter sheet, price ranges with a minimum.

## Disclaimer

An **independent product concept** made for a job application. **Not an official GoOut project**, and not affiliated with or endorsed by GoOut or PLG Group. All events, prices and popularity numbers are fictional. No GoOut logo, photos or other assets are included.
