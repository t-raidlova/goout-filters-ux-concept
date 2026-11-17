# Bug reports

| ID | Title | Severity | Found by | Status |
|---|---|---|---|---|
| [BUG-001](#bug-001) | WebKit: choosing an option doesn't close the dropdown | Medium | E2E (WebKit) | Open |
| [BUG-002](#bug-002) | "Cena" button's accessible name has a space before the comma | Low | E2E (Chromium) | Open |

---

## BUG-001

**WebKit: choosing an option in Země, Cena, Datum or Řadit doesn't close the dropdown**

| | |
|---|---|
| Severity | Medium: the choice applies, but the dropdown stays over the results until the user taps outside it |
| Priority | High: a small fix; if confirmed on a real iPhone, it affects every iPhone user (all iOS browsers are WebKit) |
| Environment | Playwright 1.65, WebKit 27.2, desktop Safari profile and iPhone 14 emulation, production build. **Not yet confirmed on a real iPhone or in desktop Safari.** |
| Found by | `filters.spec.ts` › "clicking an option applies it and closes the dropdown" (`test.fail` in WebKit) |

**Steps**
1. Open the listing in WebKit.
2. Click "Cena", then "Zdarma".

**Expected:** free events only, and the dropdown closes (`aria-expanded="false"`), as in Chrome.
**Actual:** results update and the URL gets `?price=0`, but the dropdown stays open.

**Cause:** `ChoiceList.handleClick` treats `event.detail > 0` as a pointer click. Clicking the `<label>` forwards a click to the radio: Chrome sends `detail = 1`, WebKit `0`, so WebKit looks like an arrow-key selection.

**Fix:** decide on the label's `pointerdown`/`pointerup`, or close on `change` unless the last key was an arrow key. Then remove the `test.fail` marker.

---

## BUG-002

**"Cena" button's accessible name has a space before the comma**

| | |
|---|---|
| Severity | Low: screen readers read the same words; the name just doesn't match the visible text |
| Environment | Production build. Confirmed in Chrome's accessibility tree; Playwright reports the same in WebKit. Safari's own tree not checked. |
| Found by | `filters.spec.ts` › "an active price shows in the button's accessible name" (`test.fail`); audit finding #10 |

**Steps**
1. Choose "Do 500 Kč" under "Cena".
2. Check the "Cena" button in DevTools › Accessibility.

**Expected:** "Cena, do 500 Kč".
**Actual:** "Cena , do 500 Kč".

**Cause:** the price badge is `inline-block`, and Chrome adds a space around such elements when it builds a name from content.

**Fix:** render ", " and the price as one inline text run, or give the button an explicit name.
