# Test strategy

How the filtering prototype is tested, what each level covers, and what is deliberately left to people.

## Goal

Make sure a user always gets the events that match what they chose, can see why, and can do it with any input method on any common browser. A wrong result costs more than a missing feature: a "Do 200 Kč" filter that shows a 450 Kč event, or one that hides a cheap event, breaks trust in the whole listing.

## Risks, by priority

| # | Risk | Impact | Likelihood | Main defence |
|---|---|---|---|---|
| R1 | Price filter shows events over the cap or hides ones that fit (several ticket tiers, free + paid extras, unknown price) | High: wrong results, lost trust and sales | Medium: many edge cases | Unit tests on `matchesPrice` and `formatPrice`; E2E checks every visible card against the cap |
| R2 | Date filters off by a day (Prague time zone, multi-day events, month ends) | High: wrong results | Medium | Unit tests with a fixed clock and UTC/Prague offsets; E2E checks day headings for a custom range |
| R3 | Filters combine wrongly (OR within categories, AND across filters) or "Zrušit vše" clears the wrong things | High | Low | Unit tests per rule; E2E flows for clearing and chips |
| R4 | A shared link opens a different view, or a bad link breaks the page | Medium: shared links are a growth channel | Medium: anyone can edit a URL | Unit tests on `parseFilters`; E2E for restore, reload and invalid params |
| R5 | Keyboard or screen-reader users can't reach or hear a change | High for them; legal risk (EAA) | Medium: focus handling is custom | E2E keyboard flows; axe on 8 states; manual screen-reader pass |
| R6 | Behaviour differs in Safari / on iPhone | Medium-high: on iPhone practically every browser is WebKit, so all iPhone users are affected | Medium | E2E user flows in WebKit and on an iPhone viewport (found BUG-001) |
| R7 | Layout breaks on small screens or at high zoom | Medium | Medium: dropdowns are positioned by hand | E2E reflow checks at 320–1600 px and with text spacing |
| R8 | Mock data contradicts itself (event ends before it starts, missing image) | Low in the prototype; high for a real API | Low | Data integrity tests |

## Test levels

| Level | Tool | What it covers | Size | Runs |
|---|---|---|---|---|
| Unit | Vitest | Pure logic in `src/lib/`: matching, prices, dates and time zones, URL parsing, labels and Czech plurals | 80 tests, ~0.2 s | Every push and PR |
| Data integrity | Vitest | `src/data/events.ts`: valid timestamps, end after start, whole non-negative prices, unique ids, images exist, every category and country has events. Stands in for API contract tests | 5 tests | Every push and PR |
| End-to-end | Playwright | The built app in a real browser: user flows, URL state, keyboard, axe, reflow | 80 runs (5 specs × browsers), ~1 min locally | Every push and PR; deploy waits for it |
| Manual | People | Screen readers, real devices, visual and copy review, exploratory testing | Checklists below | Before a release; after big UI changes |

**Why most cases are unit tests:** the rules live in pure functions, so a unit test can check each edge case in milliseconds and point to the exact rule that broke. E2E tests are slower and catch different bugs (wiring, focus, browser differences), so they cover flows, not every combination. Unit tests were reviewed for duplicates: a case covered by another test on the same code path was removed.

### End-to-end specs

| Spec | Covers | Browsers |
|---|---|---|
| [`filters.spec.ts`](../e2e/filters.spec.ts) | Categories (OR, title, chips), price caps against every card's label, unknown prices hidden and counted, sort vs. picks, "Zrušit vše" keeps city and sort, chip removal, empty-state suggestions, custom date range validation, city search, switching to Slovensko (€) | Chromium, WebKit, iPhone 14 |
| [`url-state.spec.ts`](../e2e/url-state.spec.ts) | Shared link and reload restore every filter; invalid and other-currency params are dropped; filter changes replace the URL instead of filling the history | Chromium, WebKit, iPhone 14 |
| [`keyboard.spec.ts`](../e2e/keyboard.spec.ts) | Skip link; category panel focus order (audit #9); Escape on every dropdown; arrow keys and Enter in options; focus after removing chips and "Zrušit vše" | Chromium |
| [`a11y.spec.ts`](../e2e/a11y.spec.ts) | axe (WCAG 2.2 A/AA + best practices) in 8 states, including the empty state, an error in the date form and 375 px; the live region names the active filters (audit #4) | Chromium |
| [`layout.spec.ts`](../e2e/layout.spec.ts) | No horizontal scroll and no "…" truncation at 1600, 640 (200 % zoom), 375 and 320 (400 % zoom) px, with every dropdown open (audit #2, #3); WCAG 1.4.12 text spacing | Chromium |

**Choices behind them**

- **Locators use roles and accessible names** (`getByRole('button', { name: 'Město: Praha' })`), not CSS classes. Tests read the page the way a screen reader does, so an unlabeled control fails a test, and styling changes don't.
- **Assertions check rules, not demo numbers.** A test checks that every visible card's cheapest price is within the cap, not that there are "6 events". Adding a mock event doesn't break the suite.
- **Tests run against the production build** under the GitHub Pages base path, so they test what is deployed.
- **Keyboard specs run only in Chromium.** WebKit follows Safari's default, where Tab skips buttons and links, so the same steps would test a browser setting, not the app.
- **axe and layout run once.** axe checks the DOM, which is the same in every engine, and the layout spec sets its own viewports.
- **Known issues are explicit.** `KNOWN_ISSUES` in [`fixtures.ts`](../e2e/fixtures.ts) accepts one colour pair (white on #00b6eb, audit #1, decision U9); any other contrast failure still fails. A known bug is marked with `test.fail` and a link to its report, so the suite turns red when the bug is fixed and the marker is forgotten.
- **Stability:** each E2E test was run 5 times in a row (400 runs, 0 failures) when it was added. CI retries a failed test once and keeps the trace, so a flaky test shows up as "flaky" in the report instead of being hidden.

## Coverage of the spec

Requirements from [product-spec.md](product-spec.md). U = unit, D = data integrity, E = end-to-end, M = manual.

| Requirement | U | D | E | M | Notes |
|---|:-:|:-:|:-:|:-:|---|
| F1 Categories, multi-select, bar label | ✓ | | ✓ | | |
| F2 Price dropdown and badge | ✓ | | ✓ | | Badge name: BUG-002 |
| F3 Date presets and custom range | ✓ | | ✓ | | |
| F4 Results update on every change | | | ✓ | | |
| F5 Result count and hidden unknown prices | ✓ | | ✓ | | |
| F6 Card content and price label | ✓ | | ✓ | ✓ | Visual check is manual |
| F7 Empty state with counts | ✓ | | ✓ | | E2E clicks a suggestion and compares the count |
| F8 Chips and "Zrušit vše" | ✓ | | ✓ | | |
| F9 State in the URL | ✓ | | ✓ | | |
| F11 Mock data | | ✓ | | | |
| F12 City dropdown and search | ✓ | | ✓ | | |
| F13 Country and currency | ✓ | | ✓ | | |
| F14 Picks and sorting | ✓ | | ✓ | | |
| Keyboard and screen reader (story 7) | | | ✓ | ✓ | Screen readers are manual |
| Prague time zone for all dates | ✓ | | | | E2E runs with `timezoneId: Europe/Prague` |

## Manual testing

Automation doesn't replace these; they run before a release or after a large UI change.

- **Screen readers:** VoiceOver + Safari (macOS, iOS) and NVDA + Firefox/Chrome. Filter, hear the count change, recover from the empty state.
- **Real devices:** an iPhone and an Android phone: tap targets, the dropdowns over the results, the date inputs' native pickers.
- **Zoom and OS settings:** 200 % and 400 % browser zoom, Windows high contrast, reduced motion.
- **Visual and copy review:** Czech plurals, prices, dates and line breaks look right; nothing overlaps.
- **Exploratory sessions:** time-boxed, with a charter, e.g. "Explore price filtering with events that have several ticket tiers and unknown prices, to find results a user wouldn't expect". Template in [bug-reports.md](bug-reports.md).

## Known issues

| | Status |
|---|---|
| Audit #1: filled buttons #00b6eb, contrast 2.36:1 | Accepted (decision U9); allowed in `KNOWN_ISSUES` |
| [BUG-001](bug-reports.md#bug-001): Safari doesn't close a dropdown after an option is clicked | Open; `test.fail` in WebKit |
| [BUG-002](bug-reports.md#bug-002) / audit #10: space before the comma in the "Cena" button's name | Open, low |

## Not covered yet (what I'd add for production)

- **API contract tests** for the listing endpoint (parameters as in the URL, lowest price or "unknown", counts for empty-state suggestions), replacing the data integrity tests.
- **Visual regression** screenshots of the card and the filter bar once the design is stable. Left out of the prototype because the design still changes often.
- **Analytics:** check that `filter_changed`, `zero_results_shown` and the other events fire with the right properties (see the spec).
- **Performance:** Lighthouse budget in CI; filtering a realistic catalogue (thousands of events) without lag.
- **Real-device cloud** (e.g. BrowserStack) for older iOS and Android versions.

## Running the tests

```bash
npm test               # unit and data integrity (Vitest)
npm run test:e2e       # end-to-end, all browsers (builds and serves the app itself)
npm run test:e2e:ui    # Playwright UI mode, for writing and debugging tests
npx playwright test --project=chromium e2e/filters.spec.ts   # one browser, one file
npx playwright show-report                                   # last HTML report
```

First run only: `npx playwright install chromium webkit`.

In CI ([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)) every pull request and push to `main` runs lint, unit tests and the build, then the E2E suite. A push to `main` deploys only if both pass. The Playwright report with traces is attached to every run as an artifact.
