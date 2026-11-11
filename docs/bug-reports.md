# Bug reports

Defects found in this prototype. Each report is written so a developer can reproduce it without asking. The template is at the end.

| ID | Title | Severity | Found by | Status |
|---|---|---|---|---|
| [BUG-001](#bug-001) | Safari: choosing an option doesn't close the dropdown | Medium | E2E (WebKit) | Open |
| [BUG-002](#bug-002) | "Cena" button's accessible name has a space before the comma | Low | E2E (Chromium) | Open |

---

## BUG-001

**Safari: choosing an option in Země, Cena, Datum or Řadit doesn't close the dropdown**

| | |
|---|---|
| Severity | Medium: the choice applies, but the open dropdown covers the results until the user taps outside it. Affects every iPhone user. |
| Priority | High: a small fix, and it affects every iPhone user (practically every iOS browser is WebKit) |
| Environment | Playwright 1.65, WebKit 27.2: desktop Safari profile and iPhone 14 emulation. Production build. **Still to confirm on a real iPhone and in desktop Safari.** |
| Found by | `e2e/filters.spec.ts` › "clicking an option applies it and closes the dropdown" (marked `test.fail` for WebKit until fixed) |

**Steps**
1. Open the listing in Safari (or WebKit).
2. Click "Cena".
3. Click "Zdarma".

**Expected:** results show free events only, and the dropdown closes, as it does in Chrome (`aria-expanded="false"`).
**Actual:** results update and the URL gets `?price=0`, but the dropdown stays open (`aria-expanded="true"`).

**Cause:** `ChoiceList.handleClick` tells a pointer click from a keyboard selection with `event.detail > 0`. A click on the `<label>` reaches the radio as a forwarded click. Chrome keeps `detail = 1` on it; WebKit sends `detail = 0`, so the click looks like an arrow-key selection and the list stays open.

**Suggested fix:** decide on the label's `pointerdown` or `pointerup` (record `pointerType` and close on the next `change`), or close on `change` unless the last key pressed was an arrow key. The E2E test then passes in WebKit and the `test.fail` marker must be removed.

---

## BUG-002

**"Cena" button's accessible name has a space before the comma**

| | |
|---|---|
| Severity | Low: screen readers read the same words; the name just doesn't match the visible text exactly |
| Environment | Chromium 1.65 (Playwright), production build |
| Found by | `e2e/filters.spec.ts`, while asserting the button name; logged as accessibility audit finding #10 |

**Steps**
1. Choose "Do 500 Kč" under "Cena".
2. Inspect the "Cena" button in the accessibility tree (DevTools › Accessibility).

**Expected:** name "Cena, do 500 Kč", matching the visible text.
**Actual:** "Cena , do 500 Kč".

**Cause:** the price badge is `inline-block`; Chrome adds a space around such elements when it computes a name from content.

**Suggested fix:** render the hidden ", " and the price as one inline text run, or give the button an explicit name.

---

## Template

Copy this for a new report, e.g. from an exploratory session on goout.net.

```markdown
## BUG-00X

**<What is wrong, where: one line a developer can search for>**

| | |
|---|---|
| Severity | Critical / High / Medium / Low: <impact on the user> |
| Priority | <how soon, and why> |
| Environment | <URL, browser + version, OS / device, viewport, logged in or not, build or date> |
| Found by | <exploratory session (charter), test case, E2E test, user report> |

**Steps**
1. …
2. …

**Expected:** …
**Actual:** …

**Evidence:** screenshot / video / console error / network response

**Notes:** how often it happens (always, 3 of 5 tries), workaround, related reports
```

### Exploratory session template

```markdown
## Session: <short name>

- **Charter:** Explore <area> with <resources / data / devices> to discover <risks or information>
- **Date, timebox:** 2026-11-__, 45 min
- **Environment:** <URL, browser, device>

### Notes
- <what I tried, what I saw, questions that came up>

### Bugs
- BUG-00X: <title>

### Questions for the team
- …

### Follow-up / not covered
- …
```
