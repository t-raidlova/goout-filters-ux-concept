# Discovery

## Current user experience
Source: a text-only fetch of `goout.net/en/-/events/le/` on 2026-11-03. **This still needs checking in a real browser.**

| Area | What's there today |
|---|---|
| Categories | One "All categories" control. It looks like a single choice. |
| Date | An "Anytime" control, plus "Today" and "Tomorrow" sections (`?scheduleTag=today`) |
| Price | No price filter seen |
| Event cards | Category, date/time, venue, and "Tickets" or "Sale ended". **No price shown.** |
| Free events | No "Free" label seen |
| Accessibility | **Not assessed yet.** A text fetch can't show roles, focus, contrast or announcements. |

## Observed problems
1. **One category at a time.** Someone open to "a concert *or* a club night" has to run two separate searches and compare the results in their head.
2. **Price is invisible on the listing.** Users have to open each event to find out whether they can afford it.
3. **No way to narrow by budget.** "Free" or "cheap tonight" is a common intent, especially for students and spontaneous plans, and there's no way to express it.

Problems 2 and 3 are linked: filtering by a value the user can't see is confusing. Showing the price is a precondition for filtering by it.

## Hypotheses requiring validation
| # | Hypothesis | How to validate (in a real product) |
|---|---|---|
| H1 | A meaningful share of users want to combine categories | Analytics: sessions that switch category 2+ times; 5 short user interviews |
| H2 | Showing price on cards lowers detail-page bounces for out-of-budget events | A/B test: price on cards vs. not; measure detail → ticket conversion |
| H3 | "Free" and "≤ 200 Kč" will be the most used price bands | Log how often each band is used after launch |
| H4 | A price filter increases ticket purchases overall, rather than shifting users to free events | A/B test on revenue per session, not just engagement |
| H5 | Combined filters cause zero-result dead ends unless the UI suggests how to relax them | Track the zero-results rate and the click-through on "remove filter" suggestions |
| H6 | GoOut's current filters have accessibility gaps | **Unverified.** Run the audit below before claiming anything. |

**Data reality to confirm:** what share of GoOut events have a known price? External ticketing and multi-tier pricing make "unknown" a normal state.

## Accessibility audit (to do, Day 1)
Tools:
- axe DevTools + Lighthouse
- keyboard-only pass
- VoiceOver + Safari
- 200% and 400% zoom, 320px reflow
- contrast spot checks

Record each finding with a screenshot, the WCAG criterion and a severity. Record positive findings too.

| Check | Result | WCAG | Severity |
|---|---|---|---|
| _to be filled_ | | | |

## Prioritisation
| Item | Value | Effort | Priority |
|---|---|---|---|
| Price on cards ("from X Kč" / Free / Price TBA) | High | Low | **Must** |
| Multi-select categories | Medium | Low | **Must** |
| Price filter (single-select, cumulative bands) | High | Low | **Must** |
| Result count + empty state with relax suggestions | High | Low | **Must** |
| Accessible, responsive filter controls | High | Medium | **Must** |
| Date presets (Today / Tomorrow / This weekend) | Medium | Low | Should |
| Filters in the URL (shareable) | Medium | Low | Should |
| Active-filter summary with remove buttons | Medium | Low | Should |
| Per-category result counts on chips | Low | Low | Could |
| Sort by price, district filter | Low | Medium | Won't (this round) |

If time runs short, cut in this order: per-chip counts → URL sync → date presets.
