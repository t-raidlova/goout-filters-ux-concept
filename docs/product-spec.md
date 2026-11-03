# Product spec: combined event filtering

## Problem statement
People looking for something to do in Prague can't combine event types or narrow by budget. Prices aren't visible until they open each event. Finding "something cheap this weekend, a concert or a club night" takes several searches and a lot of clicking.

## Target user
A Prague local, often a student or young professional, planning something in the next ~7 days. They're flexible about the type of event and sensitive to price. They often browse on a phone.

## User stories
1. As a user, I can select **several categories at once**, so I see concerts *and* club nights in one list.
2. As a user, I can limit results to **free events or a maximum price**, so I only see what I can afford.
3. As a user, I can **see the price on every event card**, so I don't have to open each event.
4. As a user, I can combine **category, price and date**, and the results update immediately.
5. As a user, I always know **how many results** match, and if none do, **which filter to remove**.
6. As a user, I can **clear one filter or all of them** in a single action.
7. As a keyboard or screen-reader user, I can do all of the above and hear the result count change.
8. *(Should)* As a user, I can **share a link** that opens the same filtered view.

## Functional requirements
| ID | Requirement | Priority |
|---|---|---|
| F1 | Category group with GoOut's 10 categories: Koncerty, Divadlo, Výstavy, Festivaly, Parties, Filmy, Gastro, Pro děti, Sport, Jiné akce. Any number can be selected. | Must |
| F2 | Price: a compact **"Cena" dropdown** in the bar with Jakákoliv cena (default), Zdarma, Do 200 Kč, Do 500 Kč, Do 1 000 Kč. Exactly one is selected; the active value shows as a badge next to "Cena". | Must |
| F3 | Date group: Any time (default), Today, Tomorrow, This weekend. Exactly one is selected. | Should |
| F4 | Results update on every change, with no Apply button. | Must |
| F5 | Result count is shown, plus "N without price info hidden" when relevant. | Must |
| F6 | Event card shows: title, categories, date/time, venue + district, price label, status (Sold out / Sale ended). | Must |
| F7 | Empty state shows a "Remove '<filter>' (shows N)" button for each active filter, plus Clear all. | Must |
| F8 | Active-filter summary, with a remove button per filter, plus Clear all. | Should |
| F9 | Filter state is synced to the URL (`cat`, `price`, `date`) and restored on load. | Should |
| F10 | Per-category result count on each chip, e.g. "Concerts (12)". | Could |
| F11 | About 50 realistic mock events in Prague, with a fixed demo "now" of Fri 6 Nov 2026, 17:00 CET. | Must |

## Acceptance criteria
- **Two categories:** selecting Koncerty and Parties shows every upcoming event tagged with either, each listed once.
- **No categories:** results equal the unfiltered list.
- **Free:** "Free" shows only events with `price.kind = free`.
- **Up to 200 Kč** shows:
  - free events
  - paid events whose cheapest ticket is ≤ 200 Kč, **including exactly 200**
- **Paid range:** an event priced 300–800 Kč appears under "Up to 500" and "Up to 1,000", but not under "Up to 200". Its card says "from 300 Kč".
- **Unknown price:**
  - Shown when price = Any.
  - Hidden when any other price option is selected, and the hidden count is displayed.
- **Today:** includes multi-day events running today (e.g. a festival from 23 Sep 2026 to 9 Jun 2027). Excludes single events that have already started.
- **This weekend:**
  - Monday to Friday: next Saturday and Sunday.
  - Saturday: today and tomorrow.
  - Sunday: today only.
- **Sort order:** by day (ongoing events count as today), then events starting that day before long-running ones already in progress, then on-sale before sold-out or sale-ended, then start time, then title.
- **Zero results:** the empty state appears with working relax suggestions.
- **Clear all:** returns to defaults and moves focus to the Filters heading.
- **URL:** reloading `?cat=concerts,clubbing&price=200&date=weekend` restores the same state. `?cat=foo&price=abc` loads defaults with no error.
- **Accessibility:** all of the above works by keyboard only, and every requirement in [accessibility.md](accessibility.md) is met.

## Events with several ticket prices
Each event has `ticketPrices: number[]`: every known ticket price in whole CZK (seat categories, early bird, on the door…).
- **Free entry is `0`.** An empty list means the **price is unknown** (e.g. tickets sold elsewhere).
- **Matching rule:** an event matches "Do N Kč" when its **lowest known ticket price ≤ N** (inclusive). It answers "can I get in for N Kč or less?"
- **"Zdarma" = cap 0:** matches events whose lowest price is 0. That includes free entry with optional paid tiers, e.g. `[0, 150]`.
- **Free events** (lowest price 0) match every cap.
- **Unknown price** never matches an active price filter. The summary and the screen-reader status say how many such events are hidden.
- **The card shows the same number the filter uses:**

  | Ticket prices | Card label |
  |---|---|
  | `[350]` | "350 Kč" |
  | `[590, 290, 390]` | "od 290 Kč" |
  | `[0]` | "Zdarma" |
  | `[0, 150]` | "Zdarma i od 150 Kč" |
  | `[]` | "Cena neuvedena" |

- **Example:** Labutí jezero `[1450, 950, 450, 200]` appears under "Do 200 Kč". Severní světla `[1290, 2490]` appears only under "Jakákoliv cena".

## Filtering logic
```
show(event) =
  isUpcoming(event, now)                      // (endsAt ?? startsAt) >= now
  AND (categories = ∅ OR event.categories ∩ categories ≠ ∅)
  AND priceMatch(event.price, priceFilter)
  AND (date = any OR [startDay, endDay] overlaps presetWindow(date, now))

priceMatch:
  any        → true
  max N      → ticketPrices ≠ [] AND min(ticketPrices) ≤ N
               (free entry = 0, so N = 0 means free only)
               (unknown → false)
```
All day comparisons use Prague calendar days (`YYYY-MM-DD`), whatever the viewer's time zone.

## Edge cases
| Case | Behaviour |
|---|---|
| No categories selected | Same as all |
| Every category selected | Same as all |
| Event has several categories | Matches if any tag matches; listed once |
| Price exactly on a band boundary (200 Kč) | Included (inclusive) |
| Price range spans bands (300–800) | Judged by `fromCzk`; card says "from 300 Kč" |
| Pay-what-you-want / donation | Modelled as Free |
| Unknown price + active price filter | Hidden; counted in "N without price info hidden" |
| Price above every band (e.g. 1,290 Kč) | Only shown under Any price |
| Single event started earlier today | Past, so excluded |
| Multi-day event running now | Included under Today; card date shows today, marked as ongoing |
| Event ended before now | Excluded |
| "This weekend" on Sat / Sun | Rest of the current weekend |
| Viewer in another time zone | No change; Prague days are used |
| Sold out / Sale ended | Shown, with a status label, after on-sale events on the same day |
| Invalid or duplicate URL params | Ignored or de-duplicated; falls back to defaults |
| Zero results | Empty state with relax suggestions |
| Rapid toggling | Visible count updates immediately; screen-reader announcement debounced (~500 ms) |
| Chip with 0 matching results (F10) | Shows "(0)" but stays enabled and focusable |
