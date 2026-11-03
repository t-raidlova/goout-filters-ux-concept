# Product spec: combined event filtering

## Problem
People looking for something to do in Prague can't combine event types or narrow results by budget, and prices aren't visible until they open each event. Finding "something cheap this weekend, a concert or a club night" takes several searches.

**Target user (assumed, not from GoOut data):** a Prague local, often a student or young professional, planning something in the next week. Flexible about the type of event, sensitive to price, often on a phone.

## User stories
1. I can select **several categories at once**, so concerts *and* club nights appear in one list.
2. I can limit results to **free events or a maximum price**.
3. I can **see the price on every event card** without opening the event.
4. I can combine **category, price and date**, and results update immediately.
5. I always know **how many results** match, and if none do, **which filter to remove**.
6. I can **clear one filter or all of them** in one action.
7. As a keyboard or screen-reader user, I can do all of the above and hear the result count change.
8. I can **share a link** that opens the same filtered view.

## Requirements
All are implemented except F10.

| ID | Requirement | Priority |
|---|---|---|
| F1 | **Categories:** GoOut's 10 (Koncerty, Divadlo, Výstavy, Festivaly, Parties, Filmy, Gastro, Pro děti, Sport, Jiné akce), any number selectable. The bar button reads "Všechny kategorie", "Koncerty" or "Koncerty +2". | Must |
| F2 | **Price:** a "Cena" dropdown with Jakákoliv cena (default), Zdarma, Do 200 Kč, Do 500 Kč, Do 1 000 Kč. One is selected; an active value shows as a badge. | Must |
| F3 | **Date:** "Kdykoliv ▾" with Kdykoliv, Dnes, Zítra, Tento týden, Tento víkend (dates shown on the right) and Jiné datum (Od/Do fields + "Použít"). | Must |
| F4 | Results update on every change; no Apply button. | Must |
| F5 | The result count is shown, plus "N akcí bez uvedené ceny skryto" when a price filter hides unknown prices. | Must |
| F6 | **Card:** title, primary category, date/time or range, venue, price label, ticket status (Vstupenky, Vyprodáno, Prodej ukončen). | Must |
| F7 | **Empty state:** one button per single change that brings results back, with its count ("Odebrat „Zdarma“ (3 akce)"), plus "Zrušit všechny filtry" when a clearable filter is active. | Must |
| F8 | Active filters as chips, each removable, plus "Zrušit vše". | Should |
| F9 | Filter state is kept in the URL and restored on load and on Back/Forward. | Should |
| F10 | Result count per category option, e.g. "Koncerty (12)". **Not done.** | Could |
| F11 | **Data:** 49 fictional events at real venues (31 in Prague, one already over; 10 elsewhere in Česko; 8 in Slovensko). Fixed demo "now": Fri 6 Nov 2026, 17:00 CET. | Must |
| F12 | **City:** "Praha ▾" opens a dropdown with a search box (ignores case and diacritics), the selected city with ×, and recommended cities. Single choice; × means the whole country. The heading follows the city ("Akce v Brně", "Akce v Česku"). | Must |
| F13 | **Country:** "Česko ▾" offers Česko and Slovensko. It sets the cities and the currency (Slovensko: Do 10 / 20 / 40 €). Switching shows the whole new country and resets the price; categories are kept. | Must |
| F14 | **Picks and sorting:** a "Redakční tipy" on/off filter, and "Řadit ▾" with Blížící se, Populární, Novinky (each explained). Picks have a "Redakční tip" badge; Populární shows the number of people interested. | Must |

## Rules

### Filtering
Implemented in `src/lib/filterEvents.ts` (`matchesAll`). All day comparisons use Prague calendar days, whatever the viewer's time zone.

```
show(event) =
  (endsAt ?? startsAt) >= now                          // upcoming, or still running
  AND (no categories selected OR event has any selected category)
  AND priceMatch
  AND venue is in the selected country
  AND (no city selected OR venue is in that city)
  AND (date = any OR the event's days overlap the date window)
  AND (picks off OR event is an editors' pick)

priceMatch = price filter is "any"
             OR (the price is known AND cheapest ticket <= cap)
```

### Prices
Each event has `ticketPrices: number[]` in whole units of the venue country's currency. `0` is free entry; `[]` means the price is unknown.

- An event matches "Do N" when its **cheapest ticket is ≤ N** (inclusive). "Zdarma" is a cap of 0.
- Free events match every cap. Unknown prices match none, and the hidden count is shown and announced.
- The card shows the same number the filter uses:

| Ticket prices | Card label |
|---|---|
| `[350]` | 350 Kč |
| `[590, 290, 390]` | od 290 Kč |
| `[0]` | Zdarma |
| `[0, 150]` | Zdarma i od 150 Kč |
| `[]` | Cena neuvedena |

### Dates
- **Tento týden:** today to Sunday.
- **Tento víkend:** Monday to Thursday, the coming Friday to Sunday; Friday to Sunday, today to Sunday.
- **Multi-day events** match if any of their days falls in the window.
- **Jiné datum:** both dates are required, no past days, and Do ≥ Od. Errors are shown in Czech and announced.

### Order and grouping ("Blížící se")
Sorted by day (ongoing events count as the first day shown), then events starting that day before ones already running, then on sale before sold out or sale ended, then start time, then title. Day headings appear only with "Blížící se" **and** a chosen date. Otherwise the results are one list, and equal popularity or the same added date falls back to date order.

### Clearing
"Zrušit vše" clears categories, price, date and "Redakční tipy", then moves focus to the category button. It **keeps country, city and sort**: location is context, and sorting never hides events.

## Acceptance criteria
- **Two categories:** Koncerty + Parties shows every upcoming event tagged with either, each once.
- **No categories, or all of them:** the same as unfiltered.
- **Do 200 Kč:** shows free events and events whose cheapest ticket is ≤ 200 Kč, including exactly 200. Labutí jezero `[1450, 950, 450, 200]` appears.
- **Paid range:** a 300–800 Kč event appears under Do 500 and Do 1 000 Kč, not under Do 200, and its card says "od 300 Kč".
- **Above every cap:** Severní světla `[1290, 2490]` appears only under Jakákoliv cena.
- **Unknown price:** shown under Jakákoliv cena; hidden and counted under any other option.
- **Dnes:** includes a festival running 23 Sep 2026 – 9 Jun 2027; excludes an event without `endsAt` that started earlier today.
- **Zero results:** the empty state appears, and every suggestion works.
- **URL:** `?cat=concerts,parties&price=200&date=weekend` opens that state; `?cat=foo&price=abc` opens the defaults without an error and cleans the address bar.
- **Accessibility:** everything above works by keyboard alone and meets [accessibility.md](accessibility.md).

## Edge cases
| Case | Behaviour |
|---|---|
| Event with several categories | Matches if any matches; listed once |
| Pay-what-you-want / donation | Modelled as free (`0`) |
| Free entry with paid extras `[0, 150]` | Counts as Zdarma |
| Event with opening hours today (`endsAt` the same day) | Shown until it closes |
| Ongoing event, date range starting in the future | Listed under the range's first day, not "Dnes" |
| Sold out / sale ended | Shown with a status label, after on-sale events that day |
| Rapid toggling | The visible count updates at once; the announcement is debounced (500 ms) |
| Invalid, duplicate or other-currency URL params (`?country=sk&price=200`) | Ignored; defaults are used |
| Custom date range in the URL that starts in the past | Ignored, as in the form |
| City with no events (e.g. Zlín) | Empty state offers "Všechna města (N akcí)"; no "Zrušit všechny filtry" unless another filter is active |
| City search, Enter | Picks the first city in the list (not the selected one); does nothing before typing |
| City search, no match | "Žádné město neodpovídá „…“"; screen readers hear "Žádné město" |
| City cleared with × | Whole country; the dropdown stays open on the search box |
| Switching country | Whole new country; price reset (the currency changes); categories kept |
| "Redakční tipy" with no matching picks | Empty state offers "Nejen redakční tipy (N akcí)" |
