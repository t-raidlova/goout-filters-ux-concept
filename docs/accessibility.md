# Accessibility

**Target: WCAG 2.2 AA.** Audit results are in [accessibility-audit.md](accessibility-audit.md). GoOut's own site hasn't been assessed (see [discovery.md](discovery.md)), so make no claims about it.

## Requirements
| WCAG | How the prototype meets it |
|---|---|
| 1.3.1 Info and relationships | Each option group is a `<fieldset>` with a `<legend>`; landmarks and a logical heading order |
| 1.4.1 Use of colour | Selected options show a ✓ (plus a ring or bold text), not only a colour change; card status is text |
| 1.4.3 Contrast (text) | ≥ 4.5:1 for all text in every state. **Exception:** the filled buttons, see Known issue |
| 1.4.4 / 1.4.10 Resize and reflow | Usable at 200% and 400% zoom; no horizontal scroll at 320px (the bar and chips wrap; dropdowns stay on screen) |
| 1.4.11 Non-text contrast | Selection rings, input borders, focus rings and checkmarks ≥ 3:1 |
| 1.4.12 Text spacing | No fixed heights on options, chips or cards, so nothing clips |
| 2.1.1 Keyboard | Everything works by keyboard; no keyboard traps |
| 2.3.3 Animation | Transitions are off under `prefers-reduced-motion: reduce` |
| 2.4.1 Bypass blocks | "Přeskočit na akce" is the first focusable element |
| 2.4.3 Focus order | Header → filter bar (and any open panel) → active filters → results |
| 2.4.7 Focus visible | A `:focus-visible` ring of at least 2px with ≥ 3:1 contrast |
| 2.4.11 Focus not obscured | No sticky UI; open dropdowns close when focus leaves them |
| 2.5.8 Target size | At least 24×24px; bar items and dropdown rows are 44–48px tall |
| 3.2.2 On input | Filtering updates the content but never navigates or moves focus |
| 4.1.2 Name, role, value | Native inputs provide role and state; icon-only buttons have names |
| 4.1.3 Status messages | The result count is announced through a polite `role="status"` |

## Known issue
**Filled buttons (`#00b6eb`, white text) are 2.36:1**, which fails 1.4.3. This affects "Vstupenky", the price badge, "Použít" and "Zrušit všechny filtry". It was kept to match GoOut (decision B1).
- **Fix:** dark text (`#1a1a1a`, 8.9:1), or a darker blue (about `#0077a8`) with white text.
- Blue text, links and focus rings use `#1872b5`, which passes.

## Page structure
- **Landmarks:** banner, navigation ("Hlavní navigace"), region "Filtry", main, contentinfo.
- **Headings:** `h1` "Akce v Praze" → `h2` per day (or a hidden "Seznam akcí") → `h3` per card title. Active filters and the empty state have their own `h2`.
- **Bar items** are disclosure buttons (`aria-expanded`, `aria-controls`) with a hidden prefix in their name: "Země: Česko", "Město: Praha", "Kategorie: Koncerty +1", "Datum: Kdykoliv". An active price adds its value: "Cena, do 500 Kč".
- **Inputs** are transparent (`opacity: 0`) and laid over their visible option, never `display: none`, so they stay focusable and clickable. The focus ring is drawn on the visible part.
- **Decorative graphics** (icons, category emoji, card images) have `aria-hidden="true"` or `alt=""`.
- **Cards** are `<article>` elements with a plain-text title (no detail page, so no dead links), a `<time>`, the price as text, and the status as text.

## Keyboard and focus

### All dropdowns
Country, city, price, date and sort share `NavDropdown`:
- Enter or Space on the button opens it. Only one dropdown or panel is open at a time.
- **Escape** closes it and returns focus to the button. Tabbing out or clicking outside closes it without moving focus.
- Its content is unmounted while closed, so each opening starts fresh.

Single-choice lists (country, price, date, sort) are native radios in a `<fieldset>` (`ChoiceList`):
- Tab enters the group once. **Arrow keys move and apply** the option, and the dropdown stays open.
- Enter closes the dropdown and returns focus to the button.
- A mouse or touch click applies and closes, like a `<select>` (detected with `click.detail > 0`).
- The selected row shows a ✓ and bold blue text.

### Per control
| Control | Behaviour |
|---|---|
| Kategorie | A full-width panel of native checkboxes. Opening it **moves focus to "Všechny akce"**, because the panel follows the whole bar in the DOM. Shift+Tab from the first option, or Escape, closes it and returns to the button. Tab past the last option goes on to the results and closes it. "Všechny akce" (`aria-pressed`) clears the selection and keeps focus. |
| Město | Opening it focuses the search box ("Hledat město"). Typing filters the list; a polite status says how many cities are listed ("2 města", "Žádné město", "Žádné jiné město"). Enter picks the first listed city, and does nothing before typing. Picking a city closes the dropdown and returns focus. The × clears the city and keeps the dropdown open on the search box. |
| Cena | A hint ("Podle nejlevnější vstupenky…") is linked with `aria-describedby`. |
| Datum | Each preset shows its dates as visible text. "Jiné datum" keeps the dropdown open and reveals labelled native date fields (Od, Do) with `min` set. Errors use `role="alert"`, `aria-invalid` and `aria-describedby`. Enter in the form applies the range and returns focus to the button. |
| Řadit | Opens to the left. Each option's explanation is part of its label. |
| Redakční tipy | A toggle `<button aria-pressed>`; when on, it shows a check, a border and a tint. |

### Focus after actions
| Action | Focus goes to |
|---|---|
| Removing a chip | The next chip, else the previous one, else that filter's bar button |
| "Zrušit vše" | The "Kategorie" button |
| Empty-state buttons | The results container |
| Any filter change | Nowhere: focus never moves because results changed |

## Screen readers
- **Result announcement:** polite and debounced (~500 ms). It names the active filters first, so every change is heard, even when the count stays the same: "Praha, Koncerty, Zdarma: nalezeno 9 akcí. 4 akce bez uvedené ceny skryty." (decision C8). The results list itself isn't live.
- **Group names** come from the legends, e.g. "Kategorie (lze vybrat více)".
- **Buttons say what they do:** "Odebrat filtr: Do 200 Kč"; relax suggestions include their count: "Odebrat „Tento víkend“ (7 akcí)".
- **Prices and statuses** are text ("Zdarma", "od 300 Kč", "Cena neuvedena", "Vyprodáno"), never icons only.
- **Language:** the page is `lang="cs"`, and all UI copy is Czech.

## Testing checklist
- [ ] axe: no serious or critical issues in the default, filtered and empty states, and with each dropdown open
- [ ] Keyboard only: 2 categories → price → date → remove one chip → "Zrušit vše"
- [ ] Focus always visible, never hidden behind an open dropdown or panel
- [ ] VoiceOver + Safari (macOS): group names, checked states, announcements
- [ ] VoiceOver on iOS: options and dropdowns work with swipe and double-tap
- [ ] 320px wide: no horizontal scroll; 200% and 400% zoom reflow
- [ ] Text-spacing override: nothing clipped
- [ ] Contrast of options and chips in default, hover, selected and focus states
- [ ] `prefers-reduced-motion` and forced-colours modes
