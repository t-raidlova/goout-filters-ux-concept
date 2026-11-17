# Test strategy

**Goal:** a user always gets the events that match their filters, can see why, and can get there with any input method in any common browser. A wrong result costs more than a missing feature: a "Do 200 Kč" filter that shows a 450 Kč event breaks trust in the whole listing.

## Risks

| # | Risk | Impact | Main defence |
|---|---|---|---|
| R1 | Price filter shows events over the cap or hides ones that fit (ticket tiers, free + paid extras, unknown price) | High | Unit tests on price matching; E2E checks every card against the cap |
| R2 | Date filter off by a day (Prague time, multi-day events, month ends) | High | Unit tests with a fixed clock and UTC/Prague offsets; E2E checks day headings |
| R3 | Filters combine wrongly, or "Zrušit vše" clears the wrong things | High | Unit tests per rule; E2E for chips and clearing |
| R4 | A shared link opens a different view, or a bad link breaks the page | Medium | Unit tests on URL parsing; E2E for restore, reload and invalid params |
| R5 | Keyboard or screen-reader users can't reach or hear a change | High (and EAA) | E2E keyboard flows; axe in 8 states; manual screen-reader pass |
| R6 | Different behaviour in Safari / on iPhone (all iPhone browsers are WebKit) | Medium-high | E2E in WebKit and iPhone emulation (found BUG-001) |
| R7 | Layout breaks on small screens or at high zoom | Medium | E2E reflow checks at 320–1600 px and with text spacing |
| R8 | Mock data contradicts itself | Low here, high with a real API | Data integrity tests |

## Test levels

| Level | Tool | Covers | Size |
|---|---|---|---|
| Unit | Vitest | Pure logic in `src/lib/`: matching, prices, dates, URL parsing, Czech labels | 84 tests, ~0.2 s |
| Data integrity | Vitest | `src/data/events.ts`: valid dates, end after start, prices, unique ids, images exist, every category and country has events | 5 tests |
| End-to-end | Playwright | The production build in a real browser: flows, URL state, keyboard, axe, reflow | 48 tests, 86 runs, ~30 s locally |
| Manual | People | Screen readers, real devices, visual and copy review, exploratory testing | [Checklist](#manual-testing) |

Most cases are unit tests: the rules are pure functions, so each edge case runs in milliseconds and points to the exact rule that broke. E2E covers what unit tests can't: wiring, focus and browser differences.

### End-to-end specs

| Spec | Covers | Browsers |
|---|---|---|
| [`filters.spec.ts`](../e2e/filters.spec.ts) | Categories, price caps, sort vs. picks, "Zrušit vše", chips, empty state, custom dates, city search, Slovensko (€) | Chromium, WebKit, iPhone 14 |
| [`url-state.spec.ts`](../e2e/url-state.spec.ts) | Loads under the Pages base path with no failed requests; links and reload restore filters; invalid params dropped; no extra history entries | Chromium, WebKit, iPhone 14 |
| [`keyboard.spec.ts`](../e2e/keyboard.spec.ts) | Skip link, category panel focus (audit #9), Escape on every dropdown, arrow keys, focus after removing chips | Chromium |
| [`a11y.spec.ts`](../e2e/a11y.spec.ts) | axe (WCAG 2.2 A/AA) in 8 states; the live region names active filters (audit #4) | Chromium |
| [`layout.spec.ts`](../e2e/layout.spec.ts) | At 1600, 640, 375 and 320 px: no horizontal scroll or "…" on the listing, no horizontal scroll with each dropdown open (audit #2, #3); text spacing | Chromium |

### Choices

- **Locators use roles and accessible names**, not CSS classes, so an unlabeled control fails a test and styling changes don't.
- **Assertions check rules, not demo numbers**: "every card is within the cap", not "6 events".
- **Keyboard specs run only in Chromium**: Safari's Tab skips buttons by default, so WebKit would test a browser setting.
- **axe and layout run once**: the DOM is the same in every engine, and the layout spec sets its own viewports.
- **Known issues stay visible.** `KNOWN_ISSUES` in [`fixtures.ts`](../e2e/fixtures.ts) accepts only white on #00b6eb (audit #1); any other contrast failure fails. A known bug is marked `test.fail`, so the suite turns red once it's fixed.
- **Stability:** every E2E test ran 5× in a row when it was added (430 runs, 0 failures). CI retries once, so flaky tests show as "flaky", not hidden.

## Spec coverage

U = unit, D = data integrity, E = end-to-end, M = manual. Requirements from [product-spec.md](product-spec.md).

| Requirement | U | D | E | M |
|---|:-:|:-:|:-:|:-:|
| F1 Categories | ✓ | | ✓ | |
| F2 Price dropdown | ✓ | | ✓ | |
| F3 Date presets and custom range | ✓ | | ✓ | |
| F4 Results update on every change | | | ✓ | |
| F5 Result count, hidden unknown prices | ✓ | | ✓ | |
| F6 Card content and price label | ✓ | | ✓ | ✓ |
| F7 Empty state with counts | ✓ | | ✓ | |
| F8 Chips and "Zrušit vše" | ✓ | | ✓ | |
| F9 State in the URL | ✓ | | ✓ | |
| F11 Mock data | | ✓ | ✓ | |
| F12 City search | ✓ | | ✓ | |
| F13 Country and currency | ✓ | | ✓ | |
| F14 Picks and sorting | ✓ | | ✓ | |
| Keyboard and screen reader | | | ✓ | ✓ |
| Prague time zone | ✓ | | | |

## Manual testing

Before a release or after a big UI change:

- **Screen readers:** VoiceOver + Safari (macOS, iOS), NVDA + Firefox/Chrome.
- **Real devices:** an iPhone and an Android phone: tap targets, dropdowns, native date pickers.
- **Zoom and OS settings:** 200 % and 400 % zoom, Windows high contrast, reduced motion.
- **Visual and copy review:** Czech plurals, prices, dates, line breaks.
- **Exploratory sessions** with a charter, e.g. "Explore price filtering with several ticket tiers and unknown prices, to find results a user wouldn't expect".

## Known issues

| | Status |
|---|---|
| Audit #1: white on #00b6eb, contrast 2.36:1 | Accepted (decision U9) |
| [BUG-001](bug-reports.md#bug-001): WebKit doesn't close a dropdown after a click | Open; `test.fail` in WebKit |
| [BUG-002](bug-reports.md#bug-002): space before the comma in the "Cena" button's name | Open, low; `test.fail` everywhere |

## Next, for production

- API contract tests for the listing endpoint, replacing the data integrity tests.
- Visual regression once the design settles.
- Analytics events fire with the right properties.
- Performance budget in CI; filtering thousands of events without lag.
- Real-device cloud for older iOS and Android.

## Running

```bash
npm test                 # unit + data integrity
npm run test:e2e         # all browsers; builds and serves the app
npm run test:e2e:ui      # Playwright UI mode
npx playwright show-report
```

CI ([`ci.yml`](../.github/workflows/ci.yml)) runs lint, unit tests and the build, then E2E, on every PR and push to `main`. `main` deploys only if both pass. The Playwright report is attached to every run, with traces of failed tests.
