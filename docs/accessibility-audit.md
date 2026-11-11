# Accessibility & responsive audit: 2026-11-03

**This is not a WCAG 2.2 AA conformance claim.** It covers an automated scan, code review and scripted checks in one browser. A conformance statement would also need the manual tests listed under "Not tested".

## Method
- **axe-core 4.10** (WCAG 2.0/2.1/2.2 A+AA plus best practices) in headless Chrome. Seven states were scanned: default, category panel open, city, price and date dropdowns open (including "Jiné datum"), the empty state, and 375px mobile.
- **Scripted checks** in headless Chrome over the DevTools protocol:
  - horizontal overflow at 1600px, 640×450 (200% zoom of 1280×900), 375px and 320×256 (400% zoom)
  - text truncated with "…"
  - the WCAG 1.4.12 text-spacing override
  - click targets smaller than 24×24
  - focus after keyboard actions
  - live-region text before and after filter changes
- **Code review** of semantics, names, focus management and contrast tokens.

## Findings
| # | Issue | Impact | WCAG | Status |
|---|---|---|---|---|
| 1 | Filled buttons (#00b6eb, white text) are **2.36:1**: "Vstupenky", the price badge, "Použít", the empty-state button | Low-vision users may not be able to read them | 1.4.3 | **Open.** Kept by decision U9. Fix: dark text (#1a1a1a, 8.9:1) or a darker blue (about #0077a8) |
| 2 | Date dropdown overflowed the viewport at 640–899px (right edge at 781px at 200% zoom). The page scrolled sideways and "Do" and "Použít" were off-screen | Zoom and tablet users couldn't see or reach the custom range | 1.4.10 | **Fixed.** Below 900px, dropdowns anchor to the bar's left edge |
| 3 | Card title, date and venue were cut to one line with "…". At 200% and 400% zoom and with text spacing, dates and venues were lost (e.g. "23. 9. 2026 – 9. 6. 20…") | Information loss for zoom, phone and dyslexia-settings users | 1.4.10, 1.4.12 | **Fixed.** Card text wraps. 0 truncated texts at every tested size |
| 4 | The result announcement "Nalezeno: N akcí." didn't change when a filter changed but the count didn't, so screen readers said nothing | Screen reader users couldn't tell whether a filter applied | 4.1.3 | **Fixed.** The announcement names the active filters: "Praha, Koncerty, Zdarma: nalezeno 2 akce." |
| 5 | After an empty-state action, focus moved to the results with `outline: none` | Keyboard users lost track of focus | 2.4.7 | **Fixed.** `:focus-visible` ring on the results; none after a mouse click |
| 6 | Elements that look interactive but aren't: "Vstupenky" (the non-functional sidebar items and header icons were removed) | Sighted users click with no effect. Screen readers read "Vstupenky" as plain text | Not a WCAG failure as such | **Open.** These are prototype stubs (checkout and other sections are out of scope). Sold-out status *is* conveyed as text |
| 7 | Events have no detail link, so there's nothing to open from a card | Expected in a real product | — | Out of scope |
| 8 | The page `<title>` doesn't reflect the filters | Minor orientation cue when switching tabs | 2.4.2 (passes: a title exists) | Open, low priority |
| 9 | Found in the later code review: the category panel follows the whole bar in the DOM, so Tab from "Kategorie" reached Cena, Datum, Redakční tipy and Řadit before the categories | Keyboard and screen-reader users had to pass four controls to reach the panel they had just opened | 2.4.3 | **Fixed.** Opening moves focus to "Všechny akce"; Shift+Tab or Escape returns to the button |
| 10 | Found by the E2E tests (2026-11-11): with a price set, Chrome computes the "Cena" button's name as "Cena , do 500 Kč", with a space before the comma. The badge is `inline-block`, and Chrome adds a space around such elements when it builds a name | Cosmetic: screen readers read the same words, but the name doesn't match the visible text exactly | 2.5.3 (passes: the visible label is in the name) | **Open, low.** Fix: render the hidden ", " and the badge text as one inline run, or set an explicit name. `e2e/filters.spec.ts` accepts both forms |

## Passed in these checks
- No horizontal scrolling at 1600, 640 (200%), 375 or 320 (400%) CSS px, including with every dropdown open.
- No click targets under 24×24 CSS px (2.5.8). Dropdown rows are 44–48px tall.
- Every icon-only button has a name. Visible labels are part of the accessible names ("Město: Praha", "Cena, do 500 Kč"; see finding 10 for the extra space).
- Landmarks: banner, navigation, region "Filtry", main, contentinfo. Headings go h1 → h2 → h3.
- Every dropdown and panel can be operated by keyboard:
  - Escape closes and returns focus to its button.
  - Tab out or a click outside closes it.
  - The category panel moves focus to its first option on open (finding 9).
  - Removing a chip or clearing all moves focus somewhere sensible.
- Error messages for "Jiné datum" are text with `role="alert"` and `aria-invalid`.
- `prefers-reduced-motion` and `forced-colors` are handled.

## Not tested (needed before any conformance claim)
- Real screen readers: VoiceOver (macOS and iOS), NVDA and JAWS. In particular, how the live region, radios inside popovers and native date fields are announced.
- Safari and Firefox, and real browser zoom (only viewport emulation was used).
- Windows High Contrast with real system colours.
- Touch with a screen reader (iOS rotor, TalkBack).
- Cognitive walkthroughs, and testing with disabled users.
