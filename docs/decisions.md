# Decisions

Format: decision, why, trade-off. Newest at the bottom.

## Product
| # | Decision | Why | Trade-off |
|---|---|---|---|
| P1 | **Show price on every card** as well as the filter | You can't sensibly filter by something you can't see. This is cheap and probably delivers most of the value. | Needs price data per event, which a real product only partly has |
| P2 | Price bands are **cumulative ("up to")**, single-select | Matches how people think about a budget; one clear choice | Can't express "500–1,000 Kč only". That's rarely needed. |
| P3 | Match paid events on their **cheapest ticket**, bounds inclusive | Answers "can I get in for ≤ N?" | Some events show up even though their better seats cost more |
| P4 | **Unknown price is hidden** under a price filter, and the hidden count is shown | Never promise a price we don't know, and be open about what's hidden | Users might miss events with external ticketing |
| P5 | Categories use **OR within the group, AND across groups**; empty means all | The standard faceted-search model users already know | No "must be both Concert and Festival". Not needed. |
| P6 | **Filters apply instantly**, with no Apply button | Local data is fast, and it saves a step on mobile | Busier screen-reader output, handled with a debounced status |
| P7 | Add **date presets** (Today / Tomorrow / This weekend), not a date picker | "Combined filtering" isn't credible without date; presets cover the main intents | No custom date ranges |
| P8 | **Empty state with relax suggestions** and result counts | Combined filters make dead ends likely | A little extra computation per render. Trivial at this data size. |
| P9 | Sold-out and sale-ended events stay visible, sorted last within their day | Honest about what's on; matches GoOut's "Sale ended" | Some visual noise |
| P10 | Hypotheses are presented as hypotheses, with metrics | No user data in a 3-day exercise | Less "certain" pitch, more credible |

## Technical
| # | Decision | Why | Trade-off |
|---|---|---|---|
| T1 | Pure filter functions in `src/lib`, unit-tested with Vitest | Logic is where the edge cases live, and it's testable without a DOM | One new dev dependency |
| T2 | **Fixed demo "now"** (Fri 6 Nov 2026 17:00 CET), passed in as a parameter | Deterministic demo and tests | The prototype doesn't track the real clock |
| T3 | Date maths on **Prague calendar-day keys** (`Intl` with `Europe/Prague`) | Correct for viewers in any time zone; no date library needed | A little custom helper code |
| T4 | **Discriminated unions** for `PriceInfo` / `PriceFilter` | Makes "unknown" and "free" explicit and checked by the compiler | Slightly more verbose than plain numbers |
| T5 | **Native checkboxes and radios** styled as chips | Correct semantics, keyboard support and state for free | Styling hidden inputs takes some care |
| T6 | URL sync with `history.replaceState`, read on load and on `popstate` | Shareable state without flooding browser history | Back doesn't undo each filter click |
| T7 | CSS Modules + tokens; no UI library, no Tailwind | No dependencies; shows hand-built UI | More CSS to write |
| T8 | A single `useFilters` hook, no state library | State is small and local | Would need revisiting if the app grew |
| T9 | Render all ~50 results, no pagination | Simple; fast enough at this size | Won't scale to the real catalogue |
| T10 | No mobile bottom-sheet dialog; chips wrap inline | An accessible modal (focus trap, inert, Esc) costs about a day | Filters take more vertical space on phones |
| T11 | Card title is a plain heading, not a link | The detail page is out of scope; avoids dead links | Cards aren't clickable in the demo |

## Out of scope
- GoOut API, backend, authentication, checkout, ticket purchase
- Event detail page, search, map, favourites, recommendations
- Sorting options, district / "near me" filter, custom date ranges
- Price ranges with a lower bound, other currencies
- Internationalisation (Czech UI), cities other than Prague
- Pagination or infinite scroll, loading or error states for a network
- Mobile filter drawer or modal
- GoOut logo files, photography or other copied assets (text wordmark only)

## Visual alignment with GoOut (from `docs/references/` screenshots)
| # | Decision | Why | Trade-off |
|---|---|---|---|
| V1 | Mirror GoOut's shell: header with utility icons, left sidebar nav, location/category/date sub-nav, ~1006px centred column on grey, 3-column cards | The concept should read as an extension of GoOut, not a new product | Supersedes the earlier "no GoOut visual identity" rule |
| V2 | **Czech UI copy** and GoOut's 10 categories (`clubbing` → `parties`, `talks` → `other`, + `gastro`, `sport`) | Matches the real navigation the filters will extend | Product-spec labels changed; any English copy elsewhere must be updated |
| V3 | Brand blue `#1872b5`, slightly darker than GoOut's | GoOut's light blue with white text fails WCAG AA contrast | Small visible difference from the live site |
| V4 | Text wordmark "goout" + "koncept" badge, not the real logo | No copied brand assets; makes clear it's a concept | Not pixel-identical |
| V5 | Figtree (Google Fonts) as a stand-in for GoOut's typeface | Closest free geometric sans | One external font request; slightly different letterforms |
| V6 | Illustrated category posters instead of event photos | No licensing or network dependency | Looks flatter than GoOut's photo-led cards |
| V7 | Sidebar items other than "Akce", sub-nav dropdowns and header icons are visual only; "Vstupenky" is a label, not a link | Those sections and checkout are out of scope; no dead links | Sighted users may try to click them. Sub-nav becomes interactive in the filter step. |
| V8 | Price shown on the card footer, left of the ticket pill | The concept's key addition (P1), placed where it doesn't disturb GoOut's hierarchy | Extra line of information vs. GoOut |
| V9 | Grid of all events per day instead of GoOut's 3-card carousels with "Zobrazit vše" | Filtered results must all be visible; carousels hide results and add keyboard complexity | Longer page than GoOut |
| V10 | Below 1024px the sidebar becomes a tab row under the header; nav rows wrap on phones | No mobile reference available; wrapping avoids horizontal scroll at 320px | Mobile layout is my assumption, not GoOut's actual mobile design |
| V11 | Light theme only | GoOut has no dark theme | Dark-mode users get light UI |

## Category filter (implemented)
| # | Decision | Why | Trade-off |
|---|---|---|---|
| C1 | "Kategorie" in the sub-nav is a **disclosure button** opening an in-flow panel of round icons, as on GoOut | Keeps GoOut's interaction; a disclosure needs no focus trap, unlike a modal or popover | Panel pushes content down instead of overlaying it |
| C2 | Each category is a **native checkbox** inside `<fieldset>` + visually hidden `<legend>` | Correct role, state, Space toggling and label click for free | Custom styling via a transparent input over the option |
| C3 | "Všechny akce" is a **button with `aria-pressed`**, not a checkbox | It's a reset, not a category; pressed means "no category filter" | Pressing it when already pressed does nothing |
| C4 | Selection kept in **canonical order** (`toggleCategory` in `src/lib/categorySelection.ts`) | Equal selections are identical; stable chip order and future URLs | Chips don't reflect click order |
| C5 | Selecting all 10 categories is **not** normalised to "all" | Respect what the user did; results are identical anyway | Toggle reads "Koncerty +9" rather than "Všechny kategorie" |
| C6 | Active-filter chips + "Zrušit vše" under the heading | Selection stays visible when the panel is closed; one-tap clear | Extra row of UI vs. GoOut |
| C7 | Focus after removal handled with a ref read in a post-commit effect | Element to focus only exists after re-render; avoids setState-in-effect | Small amount of imperative code |
| C8 | Debounced (500 ms) `role="status"` "Nalezeno: N akcí"; visible count updates instantly | One announcement per burst of clicks | Announcement lags half a second |
| C9 | Page heading follows GoOut: one category → "Koncerty v Praze", otherwise "Akce v Praze" | Matches GoOut's pattern | Multi-select heading stays generic |
| C10 | Emoji in the category circles as stand-ins for GoOut's object photos | No assets needed; hidden from assistive tech | Rendering differs per OS |
