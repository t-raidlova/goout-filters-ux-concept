# Decisions

Why the prototype works the way it does. IDs are stable and referenced from other docs. Replaced decisions are removed, and the last section summarises what changed and why. "—" means no trade-off worth noting.

## Product
| # | Decision | Why | Trade-off |
|---|---|---|---|
| P1 | **Price on every card**, as well as a price filter | You can't sensibly filter by a value you can't see. It's cheap and likely delivers most of the value. | Needs per-event prices, which real data only partly has |
| P2 | Price caps are **cumulative ("up to")**, single-select | Matches how people think about a budget | Can't ask for "500–1 000 Kč only" |
| P3 | A paid event matches on its **cheapest ticket**; bounds are inclusive | Answers "can I get in for N or less?" | Events appear even when better seats cost more |
| P4 | **Unknown price is hidden** under any price filter, and the hidden count is shown | Never promise a price we don't know, but say what's hidden | Events with external ticketing can be missed |
| P5 | Categories are **OR**ed; different filters are **AND**ed; no category selected = all | The standard faceted-search model | No "Koncerty AND Festivaly" |
| P6 | **Filters apply instantly**, with no Apply button | Local data is fast, and it saves a step on phones | Busier screen-reader output, handled by C8 |
| P7 | Date presets (Dnes, Zítra, Tento týden, Tento víkend) plus a custom range (D3) | Combined filtering isn't credible without a date | — |
| P8 | **Empty state suggests one change at a time**, each with the count it brings back | Combined filters make dead ends likely | The category suggestion clears all categories: removing one from an OR selection can't add results |
| P9 | Sold-out and sale-ended events stay visible, after on-sale events of the same day | Honest about what's on; matches GoOut | Some visual noise |
| P10 | Assumptions are labelled as hypotheses, with a way to measure each | No user data was available | — |

## Technical
| # | Decision | Why | Trade-off |
|---|---|---|---|
| T1 | Filtering logic is pure functions in `src/lib/`, unit-tested with Vitest | The edge cases live in the logic, and it's testable without a DOM | One dev dependency |
| T2 | **Fixed demo "now"** (Fri 6 Nov 2026, 17:00 CET), always passed in as a parameter | Deterministic demo and tests | The app doesn't follow the real clock |
| T3 | Date maths on **Prague day keys** (`YYYY-MM-DD`, via `Intl`) | Correct for viewers in any time zone, with no date library | A few custom helpers |
| T4 | **Discriminated unions** for filter state (`PriceFilter`, `DateFilter`) | "Any" and "custom range" are explicit and compiler-checked; no magic numbers | Slightly more verbose |
| T5 | **Native checkboxes and radios**, styled as GoOut's options and rows | Semantics, keyboard support and state for free | Styling transparent inputs takes care |
| T6 | URL sync with `history.replaceState`, read on load and on `popstate` | Shareable links without flooding the browser history | Back doesn't undo each filter click |
| T7 | CSS Modules and design tokens; no UI library | No dependencies | More CSS by hand |
| T8 | One `useFilters` hook; no state library | The state is small and local | Revisit if the app grows |
| T9 | All results rendered; no pagination | About 50 events | Won't scale to the real catalogue |
| T10 | No mobile filter sheet; the bar and chips wrap | An accessible modal costs about a day | Filters take more height on phones |
| T11 | The card title is a heading, not a link | The detail page is out of scope; no dead links | Cards aren't clickable |
| T12 | Hosted on **GitHub Pages**, deployed by a GitHub Actions workflow that runs lint, tests and the build first. Paths use `import.meta.env.BASE_URL`. | Free static hosting; a failing check never deploys | The repo name is baked into `base`; renaming the repo means updating it |

## Visual alignment with GoOut
Based on desktop screenshots of GoOut's listing from 2026-11-03. They aren't kept in the repository (see [discovery.md](discovery.md)).

| # | Decision | Why | Trade-off |
|---|---|---|---|
| V1 | Mirror GoOut's shell: header, left sidebar, filter bar, ~1006px column on grey, 3-column cards | The concept should read as an extension of GoOut | — |
| V2 | Czech UI copy and GoOut's 10 categories | Matches the navigation being extended | — |
| V3 | Text, links and focus rings use `#1872b5`, darker than GoOut's blue | GoOut's light blue fails text contrast | Slight difference from GoOut (filled buttons: B1) |
| V4 | Text wordmark "goout" with a "koncept" badge | No copied brand assets; clearly a concept | — |
| V5 | Figtree as a stand-in for GoOut's typeface | Closest free geometric sans | One font request |
| V6 | Illustrated category posters instead of event photos | No licensing or network dependency | Flatter than GoOut |
| V7 | Other GoOut sidebar sections are removed; the sidebar links to the case study instead. GoOut's header icons are removed; "Vstupenky" stays visual only | Out of scope; no dead links, and the case study is one click from the demo | "Vstupenky" may still be clicked with no effect |
| V8 | Price in the card footer, left of the ticket pill | The key addition, without disturbing GoOut's hierarchy | One more line per card |
| V9 | A full grid of results (split by day when a date is chosen, D9) instead of GoOut's 3-card carousels | Filtered results must all be visible; carousels add keyboard complexity | Longer page |
| V10 | Below 1024px the sidebar becomes a tab row; the bar wraps on phones | No mobile reference; avoids horizontal scrolling at 320px | The phone layout is an assumption |
| V11 | Light theme only | GoOut has no dark theme | — |

## Categories
| # | Decision | Why | Trade-off |
|---|---|---|---|
| C1 | "Kategorie" opens a full-width panel of round options that pushes the results down, as on GoOut | Keeps GoOut's interaction; no focus trap needed | Needs focus handling (R1) |
| C2 | Each category is a native checkbox in a `<fieldset>` with a hidden `<legend>` | Role, state, Space and label click for free | — |
| C3 | "Všechny akce" is a button with `aria-pressed`, not a checkbox | It's a reset, not a category | — |
| C4 | The selection is kept in canonical order (`toggleCategory`) | Equal selections compare and serialise identically | Chips don't follow click order |
| C5 | Selecting all 10 isn't converted to "all" | Respects what the user did; results are identical | The button reads "Koncerty +9" |
| C6 | Active-filter chips and "Zrušit vše" under the heading | The selection stays visible with the panel closed | An extra row of UI |
| C7 | Focus after removing a chip is set in a post-commit effect | The element to focus exists only after re-render | A little imperative code |
| C8 | Debounced (500 ms) `role="status"` that names the active filters: "Praha, Koncerty, Zdarma: nalezeno 2 akce." | One announcement per burst of clicks, and a change is heard even when the count stays the same | Half a second of lag |
| C9 | Heading: one category gives "Koncerty v Praze", otherwise "Akce v Praze" | GoOut's pattern | Generic heading for several categories |
| C10 | Emoji in the category circles | No assets needed; hidden from assistive tech | Looks different on each OS |

## Price
| # | Decision | Why | Trade-off |
|---|---|---|---|
| PD1 | Compact **"Cena" dropdown**: Jakákoliv cena, Zdarma, Do 200 / 500 / 1 000 Kč | Matches GoOut's dropdown bar | Opens differently from the category panel |
| PD2 | Native radio group in a disclosure popover, not an ARIA listbox | Semantics and keyboard support for free | Arrow keys apply immediately |
| PD3 | A pointer click closes the popover; keyboard selection doesn't (`click.detail`) | Feels like a `<select>` without trapping arrow-key browsing | Relies on keyboard clicks having `detail` 0 |
| PD4 | The active value shows as a badge next to "Cena" | The state is visible without opening the dropdown | Wider bar item |
| PD5 | `ticketPrices: number[]` (0 = free, `[]` = unknown). `lowestPrice()` drives both the filter and the card label. `PriceFilter` is `any` or `max N` (free = `max 0`). | One rule for the filter and the card | `[0, 150]` counts as Zdarma; the card says "Zdarma i od 150 Kč" |
| PD6 | On phones the popover spans the content width | Never off-screen; 44px rows | Covers the top of the results while open |
| PD7 | The URL accepts only the offered caps (`price=0`, `200`, `500`, `1000`) | No odd states from edited links | — |

## Location and country
| # | Decision | Why | Trade-off |
|---|---|---|---|
| L1 | City dropdown as on GoOut: search box, "Vybrané město" with ×, "Doporučená města" | Matches GoOut | — |
| L2 | **Single city**, default Praha; × means the whole country | As on GoOut | Can't combine two cities |
| L3 | Cities are buttons, not radios: picking one applies it and closes | A one-shot choice needs no apply step | Many Tab stops; the search box helps |
| L4 | Search ignores case and diacritics and matches word starts; Enter picks the first listed city (R7) | Czech names are hard to type | No fuzzy matching |
| L5 | The country and city buttons stay black, never "active" blue | Location is context, not a filter | — |
| L6 | **"Zrušit vše" keeps country and city**; the empty state offers "Všechna města" | Clearing filters shouldn't move you to another place | Two reset scopes |
| L7 | All bar dropdowns share `NavDropdown`; one dropdown or panel is open at a time; content is mounted only while open | One implementation of open, close, focus and outside click; fresh state on each opening | Closed options aren't in the DOM (chips and badges show the values) |
| L8 | Venue `city` is a typed `CityId`; mock events in six Czech cities | The filter needs data outside Prague | Some offered cities have no events |
| L9 | URL: `city` is omitted for Praha, `city=vse` means the whole country, and unknown values fall back to the default | Short default URLs | — |
| K1 | "Česko ▾" is a dropdown with Česko and Slovensko, using the same radio list as "Cena" | One single-choice pattern | — |
| K2 | **The country sets the currency and caps**: Kč (200 / 500 / 1 000) or € (10 / 20 / 40). Prices are stored in the venue country's currency. | Kč for Bratislava, or a 200 € cap, would look wrong | Amounts only make sense together with the country |
| K3 | Switching country shows the whole new country and resets the price; categories are kept | The city list and the currency both change | Switching back to Česko gives "Všechna města", not Praha |
| K4 | 7 Slovak cities and 8 Slovak mock events, priced in EUR | Realistic data for the option | Some cities have no events |
| B1 | Filled buttons use `#00b6eb` with white text (`--color-button`) | Fidelity to GoOut | **Fails WCAG AA contrast (2.36:1).** Logged in [accessibility.md](accessibility.md) |

## Date
| # | Decision | Why | Trade-off |
|---|---|---|---|
| D1 | "Kdykoliv ▾" as on GoOut: presets with their dates on the right, plus "Jiné datum" | Matches GoOut | — |
| D2 | **Tento týden** = today to Sunday. **Tento víkend** = Friday to Sunday, or the rest of it from Friday on. | Read from GoOut (on Tue 3. 11.: week 3.–8. 11., weekend 6.–8. 11.) | On Fridays both presets cover the same days |
| D3 | "Jiné datum" uses two native date fields and "Použít", not a custom calendar | Accessible and mobile-friendly for free | Doesn't look like GoOut's calendar |
| D4 | Choosing "Jiné datum" keeps the dropdown open; the filter changes on "Použít" | Picking a range takes several steps | — |
| D5 | `DateFilter` is a preset or a `range` of Prague day keys; `dateWindow()` is the single rule | One place for date logic, tested across weekdays, months, years and time zones | — |
| D6 | With a future range, ongoing events are grouped under its first day | "Dnes" makes no sense when looking at 12.–15. 11. | — |
| D7 | Date is a filter: blue when active, with a chip, cleared by "Zrušit vše", suggested in the empty state | It narrows results like price does | — |
| D8 | URL: `date=today`, `tomorrow`, `week`, `weekend` or `2026-11-10..2026-11-12`; invalid, reversed or past ranges are ignored (R4) | Shareable links | — |
| D9 | With "Kdykoliv", one continuous grid in date order; day sections only when a date is chosen | Without a date, day headings add length without helping | A hidden "Seznam akcí" `h2` keeps the heading order |

## Editors' picks and sorting
| # | Decision | Why | Trade-off |
|---|---|---|---|
| E1 | **Split** GoOut's "Redakční tipy ▾" into a picks toggle and a "Řadit" dropdown | GoOut mixes reordering with filtering: users can't tell whether events disappeared, or combine "picks, by popularity" | One more control than GoOut |
| E2 | "Podle kamarádů" is left out | It needs login | — |
| E3 | Each sort option explains its criterion ("Podle počtu zájemců") | GoOut doesn't say what "Populární" means | Taller dropdown |
| E4 | Sort is never blue, has no chip, and **"Zrušit vše" keeps it** | It never hides events, so it isn't a filter | — |
| E5 | Day headings only with "Blížící se" and a chosen date | Grouping by day would contradict the other orders | — |
| E6 | The "Redakční tip" badge is dark text on a white label | Readable on any image and read by screen readers | Differs from GoOut's white text on the photo |
| E7 | Cards show "N zájemců" only when sorted by popularity | Explains the order without clutter | — |
| E8 | Mock signals (`interested`, `addedAt`, `editorsPick`) in one `SIGNALS` table; ties fall back to date order | Deterministic, testable sorting | Invented values |
| E9 | URL: `tips=1`, `sort=popular` or `sort=new` | Shareable links | — |

## Accessibility fixes
From the audit of 2026-11-03 ([accessibility-audit.md](accessibility-audit.md)).

| # | Decision | Why | Trade-off |
|---|---|---|---|
| A1 | Card text wraps instead of being cut off with "…" | Nothing is lost at 200% and 400% zoom or with text spacing | Card heights vary within a row |
| A2 | Below 900px, dropdowns anchor to the bar's left edge | They stay inside the viewport at 200% zoom and on tablets | The popover isn't directly under its button at 640–899px |
| A3 | The result announcement names the active filters (C8) | A change is announced even when the count stays the same | Longer announcements |
| A4 | Focus ring on the results container after keyboard actions only (`:focus-visible`) | Keyboard users see where focus went | — |

## Review fixes
From a code review against CLAUDE.md, the product spec and the accessibility requirements.

| # | Decision | Why | Trade-off |
|---|---|---|---|
| R1 | Opening the category panel moves focus to its first option. Shift+Tab from it, or Escape, returns to the button. Tab out or a click outside closes it. | The panel follows the whole bar in the DOM, so Tab would otherwise pass four other controls first (WCAG 2.4.3) | Focus moves on open, unlike most other dropdowns |
| R2 | The empty state offers "Zrušit všechny filtry" only when a clearable filter is active (`hasClearableFilters`) | It keeps the city (L6), so for a city with no events it did nothing | — |
| R3 | URL sync is connected: `useFilters` reads the URL on load and on `popstate`, and writes it with `replaceState` (T6) | Links can be shared, and filters survive a reload | — |
| R4 | `parseFilters(search, now)` ignores custom ranges that start in the past, using the same `rangeError` as the form | A stale link shouldn't open with a range the form would refuse | — |
| R5 | Events with `endsAt` stay listed until they end, including same-day opening hours (a market 12:00–22:00) | You can still go; events without `endsAt` drop out once they start | — |
| R6 | `formatPrice` lives next to `lowestPrice` and uses it | The card and the filter must use the same number | — |
| R7 | City search: Enter picks the first *listed* city, and only after typing; the screen-reader count matches the list | Enter and the announcement match what's visible | — |

## Out of scope
GoOut API, backend, login and checkout; event detail pages, text search, map and favourites; sorting by price; a district or "near me" filter; price ranges with a minimum; countries beyond Česko and Slovensko; other UI languages; pagination; a mobile filter sheet; any copied GoOut logo, photo or asset.

## History
- **Price control:** round option buttons in a panel, then a max-price slider, then the current dropdown (PD1). The dropdown matches GoOut's bar and keeps price choices to a few meaningful caps.
- **Categories:** `clubbing` became `parties` and `talks` became `other` when the list was aligned with GoOut's 10 categories (V2).
- **Weekend:** an earlier Saturday–Sunday weekend was replaced by GoOut's Friday–Sunday (D2).
