# Decisions

Why the prototype works the way it does.

## Product

| #   | Decision                                                                                                                    | Why                                                                                                  | Trade-off                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| P1  | **Price on every card**, as well as a price filter                                                                          | You can't filter by a value you can't see. It's cheap and likely delivers most of the value.         | Needs per-event prices, which real data only partly has            |
| P2  | Price caps are **"up to"** and single-select                                                                                | Matches how people think about a budget                                                              | No "500–1 000 Kč only"                                             |
| P3  | An event matches on its **cheapest ticket**, inclusive                                                                      | Answers "can I get in for N or less?"                                                                | Better seats may cost more                                         |
| P4  | **Unknown prices are hidden** under a price filter, and the hidden count is shown                                           | Never promise a price we don't know, but say what's hidden                                           | Events with external ticketing can be missed                       |
| P5  | Categories are **OR**, filters are **AND**; no category = all                                                               | The standard faceted-search model                                                                    | No "concerts AND festivals"                                        |
| P6  | **Filters apply instantly**, with no Apply button                                                                           | Local data is fast, and it saves a step                                                              | More screen-reader output, so the result announcement is debounced |
| P7  | The **empty state suggests one change at a time**, with the number of events it brings back                                 | Combined filters make dead ends likely                                                               | —                                                                  |
| P8  | Sold-out and sale-ended events stay visible, after on-sale ones                                                             | Honest about what's on; matches GoOut                                                                | Some visual noise                                                  |
| P9  | **Editors' picks become a toggle**, and sorting gets its own "Řadit" control                                                | GoOut's single dropdown mixes reordering with hiding events, so "picks, by popularity" is impossible | One more control than GoOut                                        |
| P10 | **Location and sort are context, not filters**: "Zrušit vše" keeps them                                                     | Clearing filters shouldn't move you to another place or reorder the list                             | Two reset scopes                                                   |
| P11 | **The country sets the currency and caps**: Kč (200 / 500 / 1 000) or € (10 / 20 / 40). Switching country resets the price. | A 200 € cap would look wrong                                                                         | Amounts only make sense together with the country                  |
| P12 | Assumptions are labelled as hypotheses, each with a way to measure it                                                       | No user data was available                                                                           | —                                                                  |

## Interface

| #   | Decision                                                                                        | Why                                                                 | Trade-off                                                                    |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| U1  | Mirror GoOut's layout, Czech copy and 10 categories, with a text wordmark and a "koncept" badge | Reads as an extension of GoOut, without copied brand assets         | —                                                                            |
| U2  | Native checkboxes for categories; native radios for country, price, date and sort               | Keyboard support and selected states for free                       | Styling them takes care                                                      |
| U3  | Price is a compact **"Cena" dropdown** with a few caps                                          | Matches GoOut's filter bar                                          | Opens differently from the category panel                                    |
| U4  | Each sort option explains itself ("Podle počtu zájemců")                                        | GoOut doesn't say what "Populární" means                            | Taller dropdown                                                              |
| U5  | "Tento víkend" is Friday to Sunday; "Jiné datum" uses native date fields                        | Matches GoOut; native fields work on phones and with assistive tech | Doesn't look like GoOut's calendar                                           |
| U6  | One city at a time, default Praha; × means the whole country                                    | As on GoOut                                                         | Can't combine two cities                                                     |
| U7  | All results in one grid, split by day only when a date is chosen                                | Filtered results must all be visible                                | Longer page than GoOut's carousels                                           |
| U8  | Filled buttons keep GoOut's `#00b6eb` with white text                                           | Fidelity to GoOut                                                   | **Fails WCAG AA contrast (2.36:1)**; see the [audit](accessibility-audit.md) |

## Technical

| #   | Decision                                                                                 | Why                                                                   | Trade-off                                 |
| --- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| T1  | Filtering logic is pure functions in `src/lib/`, unit-tested with Vitest                 | The edge cases live in the logic, and it's testable without a browser | —                                         |
| T2  | A **fixed demo "now"** (Fri 6 Nov 2026, 17:00), always passed in as a parameter          | The demo and tests always give the same results                       | The app doesn't follow the real clock     |
| T3  | Date maths on Prague calendar days (`YYYY-MM-DD`, via `Intl`)                            | Correct for viewers in any time zone, with no date library            | A few custom helpers                      |
| T4  | Filter state uses typed unions (`PriceFilter`, `DateFilter`)                             | "Any" and "custom range" are explicit; no magic values                | Slightly more verbose                     |
| T5  | Filters are synced to the URL with `history.replaceState`                                | Shareable links without flooding the browser history                  | Back doesn't undo each click              |
| T6  | One `useFilters` hook and CSS Modules; no state or UI library                            | The app is small; no extra dependencies                               | More CSS by hand                          |
| T7  | No pagination and no mobile filter sheet                                                 | About 50 events; an accessible sheet costs about a day                | Won't scale to the real catalogue         |
| T8  | Hosted on GitHub Pages; GitHub Actions deploys only after lint, tests and the build pass | Free hosting; a failing check never deploys                           | The repo name is baked into the base path |

## Out of scope

GoOut API, backend, login and checkout; event detail pages, search, map and favourites; sorting by price; district or "near me" filters; price ranges with a minimum; a mobile filter sheet; any copied GoOut logo, photo or asset.
