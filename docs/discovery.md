# Discovery

## Sources
Both from 2026-11-03:
- a text-only fetch of `goout.net/en/-/events/le/`
- desktop screenshots of GoOut's Czech listing: the default layout and the date, location and "Redakční tipy" dropdowns. They were used as visual reference and **aren't kept in this repository**, because they contain GoOut's logo and third-party photos.

Not checked: GoOut's mobile site and app.

## What GoOut has today
| Area | Today |
|---|---|
| Location | "Česko ▾" and "Praha ▾" in the filter bar; the city dropdown has search, the selected city and recommended cities |
| Categories | One control ("Festivaly ▾"). **Single choice.** The heading follows it ("Festivaly v Praze"). |
| Date | "Kdykoliv ▾": Dnes, Zítra, Tento týden, Tento víkend (with dates) and Jiné datum (a calendar) |
| Order and picks | One "Redakční tipy ▾" dropdown: Populární, Redakční tipy, Podle kamarádů, Blížící se, Novinky |
| Results | Sections ("Dnes", "Populární", "Redakční tipy"), each a 3-card carousel with "Zobrazit vše" |
| Event cards | Image, title, category, date, venue, and "Vstupenky" or "Prodej ukončen". **No price**, no "Zdarma" label. |
| Price | No price filter |
| Accessibility | **Not assessed:** neither source shows roles, focus, contrast or announcements |

## Problems
1. **One category at a time.** Someone open to "a concert *or* a club night" has to run two searches and compare them.
2. **Price is invisible on the listing.** Users open each event to see whether they can afford it.
3. **No way to narrow by budget**, e.g. "free" or "cheap tonight". *How common this intent is, is an assumption (H3).*
4. **"Redakční tipy ▾" mixes reordering and filtering.** Users can't tell whether events disappeared, and can't combine "picks, by popularity".

Problems 2 and 3 are linked: showing the price is a precondition for filtering by it.

## Hypotheses requiring validation
| # | Hypothesis | How to validate |
|---|---|---|
| H1 | A meaningful share of users want to combine categories | Analytics: sessions that switch category 2+ times; 5 short interviews |
| H2 | Prices on cards reduce detail-page visits for out-of-budget events | A/B test; measure detail → ticket conversion |
| H3 | "Zdarma" and "Do 200 Kč" will be the most used price options | Log option usage after launch |
| H4 | A price filter increases ticket purchases overall, not just free-event visits | A/B test on revenue per session |
| H5 | Combined filters cause dead ends unless the UI suggests how to relax them | Track the zero-results rate and suggestion clicks |
| H6 | GoOut's current filters have accessibility gaps | **Unverified;** run the audit below first |

**Data to confirm:** what share of GoOut events have a known price. External ticketing makes "unknown" a normal state.

## Accessibility audit of GoOut (not done)
H6 stays unverified until this is done. The prototype's own audit is separate: [accessibility-audit.md](accessibility-audit.md).

Planned: axe and Lighthouse, a keyboard-only pass, VoiceOver + Safari, 200% and 400% zoom with 320px reflow, contrast spot checks. Record each finding with its WCAG criterion and severity, and record what works well too.

## Prioritisation
| Item | Value | Effort | Priority | Status |
|---|---|---|---|---|
| Price on cards | High | Low | Must | Done |
| Multi-select categories | Medium | Low | Must | Done |
| Price filter | High | Low | Must | Done |
| Result count and empty state with suggestions | High | Low | Must | Done |
| Accessible, responsive controls | High | Medium | Must | Done (see the audit for what's untested) |
| Date presets | Medium | Low | Should | Done, plus a custom range |
| Active-filter chips | Medium | Low | Should | Done |
| Filters in the URL | Medium | Low | Should | Done |
| Country and city, as in GoOut's bar | Medium | Low | Added | Done |
| Picks filter and sort, split from "Redakční tipy" | Medium | Low | Added | Done |
| Result count per category | Low | Low | Could | Not done |
| Sort by price, district filter | Low | Medium | Won't (this round) | — |
