# Accessibility

Latest audit results: [accessibility-audit.md](accessibility-audit.md).

Target: **WCAG 2.2 Level AA**.

GoOut's current accessibility hasn't been assessed yet. See the audit section in [discovery.md](discovery.md). Make no claims about it until that audit is done.

## Requirements
| WCAG | Requirement in this prototype |
|---|---|
| 1.3.1 Info & relationships | Each filter group is a `<fieldset>` + `<legend>`. Landmarks and a logical heading order. |
| 1.4.1 Use of colour | Selected chips show a ✓ icon and a heavier border as well as the colour change. Card status is shown as text. |
| 1.4.3 Contrast (text) | ≥ 4.5:1, including chip labels in every state and the price label |
| 1.4.11 Non-text contrast | Chip borders, focus rings and checkmarks ≥ 3:1 against adjacent colours |
| 1.4.4 / 1.4.10 Resize & reflow | Usable at 200% zoom. No horizontal scroll at 320px wide (chips wrap). |
| 1.4.12 Text spacing | No clipping when users override text spacing (no fixed heights on chips or cards) |
| 2.1.1 Keyboard | Everything is operable by keyboard. No keyboard traps. |
| 2.4.1 Bypass blocks | "Skip to results" link is the first focusable element |
| 2.4.3 Focus order | Order: header → filters → active filters → results |
| 2.4.7 Focus visible | A clear `:focus-visible` ring of at least 2px, ≥ 3:1 contrast |
| 2.4.11 Focus not obscured | `scroll-padding-top` so a sticky filter bar never covers the focused element |
| 2.5.8 Target size | ≥ 24×24 CSS px minimum. Chips aim for a 44px height. |
| 3.2.2 On input | Instant filtering updates content but doesn't change context (no navigation, no focus jump) |
| 4.1.2 Name, role, value | Native inputs supply the role and state. Icon-only buttons get an accessible name. |
| 4.1.3 Status messages | Result count is announced through `role="status"` (polite) |
| 2.3.3 / motion | Transitions are turned off under `prefers-reduced-motion: reduce` |

## Known issues
- **Filled buttons use #00b6eb with white text (2.4:1).** This fails WCAG 1.4.3 (needs 4.5:1). It affects the "Vstupenky" pill, the price badge in the bar, the date "Použít" button and the empty-state "Zrušit všechny filtry" button. It was chosen deliberately to match GoOut (decision B1).
  - **Fix options:** use dark text (#1a1a1a on #00b6eb is 8.9:1), or darken the blue to about #0077a8 to keep white text.
  - Blue text, links and focus rings still use #1872b5, which passes.

## Semantic HTML
```html
<a class="skip-link" href="#results">Skip to results</a>
<header>…site title…</header>
<main>
  <section aria-labelledby="filters-heading">
    <h2 id="filters-heading" tabindex="-1">Filters</h2>
    <fieldset><legend>Category</legend>
      <label><input type="checkbox" name="cat" value="concerts"> Concerts</label> …
    </fieldset>
    <fieldset><legend>Price</legend>
      <label><input type="radio" name="price" value="any" checked> Jakákoliv cena</label> …
    </fieldset>
    <fieldset><legend>Date</legend> …radios… </fieldset>
  </section>
  <section id="results" aria-labelledby="results-heading" tabindex="-1">
    <h2 id="results-heading">Events</h2>
    <p>31 events</p>                         <!-- visible, not live -->
    <div role="status" class="visually-hidden">31 events</div>  <!-- debounced -->
    <ul>
      <li><article>
        <h3>Title</h3>
        <p><time datetime="2026-11-06T20:00+01:00">Fri 6 Nov, 20:00</time></p>
        <p>Venue · District</p>
        <p>from 450 Kč</p> <p>Sold out</p>
      </article></li>
    </ul>
  </section>
</main>
```
- Inputs are visually hidden with a clip technique, never with `display:none`, so they stay focusable. The focus ring is drawn on the visible chip with `input:focus-visible + span`.
- Decorative graphics (the date stub, icons) get `aria-hidden="true"` or `alt=""`. The same information is also given as text.
- The card title is a plain heading. The detail page is out of scope, so there are no dead links.

## Keyboard interactions
| Key | Category checkboxes | Price / date radios | Buttons (remove, Clear all) |
|---|---|---|---|
| Tab / Shift+Tab | Moves to each checkbox | Enters and leaves the group (one tab stop, on the checked radio) | Moves to each button |
| Space | Toggles the checkbox | Selects the focused radio | Activates |
| Enter | (nothing, native behaviour) | (nothing) | Activates |
| ← → ↑ ↓ | (nothing) | Moves **and selects** within the group (native) | (nothing) |

Focus management:
- **Category panel:** "Kategorie: …" in the sub-nav is a disclosure button (`aria-expanded`, `aria-controls`). Enter/Space opens it; **Escape** inside the panel closes it and returns focus to the button.
- **Remove filter** (chip in the summary): focus moves to the next chip, or the previous one, or the category button if none are left.
- **Zrušit vše:** focus moves to the category button.
- **"Všechny akce"** (in the panel, `aria-pressed`): clears the selection; focus stays on it.
- **Country dropdown:** "Země: Česko" is a disclosure button. It holds the same native radio list as "Cena" (`ChoiceList`): arrows move and apply, Enter or Escape closes and returns focus, and a mouse click applies and closes.
- **Date dropdown:** "Datum: Kdykoliv" is a disclosure button. The same radio list (`ChoiceList`) shows each date range as visible text next to its label, so screen readers read it too.
  - Arrows apply presets immediately.
  - "Jiné datum" doesn't close the dropdown. It reveals a form with two labelled native `<input type="date">` fields ("Od", "Do"), with `min` set to today and to the "Od" date.
  - Errors are shown as text with `role="alert"`, plus `aria-invalid` and `aria-describedby` on the fields. Enter in the form applies the range and closes the dropdown, returning focus to the button.
- **City dropdown:** the city name in the bar is a disclosure button. Its name reads "Město: Praha".
  - Opening it moves focus to the search box, labelled "Hledat město".
  - Typing filters the list. A polite status announces "N měst" or "Žádné město". Enter picks the first match.
  - Tab order: search → "Zrušit výběr města Praha" (×) → city buttons in a list labelled by "Doporučená města".
  - Picking a city closes the dropdown and returns focus to the button.
  - × clears the city and returns focus to the search box, leaving the dropdown open.
  - Rows are 44–48px tall. The list scrolls inside the dropdown.
  - The search box border is #949494 (3:1 contrast).
- **All dropdowns** (city, price) share `NavDropdown`:
  - Escape closes and returns focus to the button. Tab out or a click outside closes without moving focus.
  - Only one dropdown or panel is open at a time.
  - The content is unmounted while closed, so each opening starts fresh.
- **Price dropdown:** "Cena" is a disclosure button (`aria-expanded`, `aria-controls`). When a price is active, a badge shows the value as visible text, so the name becomes e.g. "Cena, do 500 Kč". The popover holds native radios in a `<fieldset>` (legend "Cena vstupenky"), with `aria-describedby` pointing to the hint about the cheapest ticket.
  - Tab enters the group once. ↑/↓ move and **apply** the option (native radio behaviour) and keep the popover open.
  - **Enter** or **Escape** closes the popover and returns focus to "Cena".
  - Tabbing out of the popover, or clicking outside it, closes it without moving focus.
  - A mouse or touch click on an option applies it and closes, like a `<select>`. This is detected with `click.detail > 0`, because keyboard-triggered clicks have detail 0.
  - The selected option shows a ✓ and bold blue text, not colour alone. Rows are 44px tall, and the focus ring is drawn on the whole row.
  - Opening the category panel closes the price dropdown, and vice versa.
- **Removing the price chip** when it's the last chip returns focus to the price button.
- **Empty-state buttons** ("Odebrat „Zdarma“ (1 akce)", "Všechny kategorie (6 akcí)", "Zrušit všechny filtry") move focus to the results.
- **Relax suggestion in the empty state:** focus moves to the results heading.
- **Filter change:** focus never moves.

## Screen reader considerations
- Group context is announced from the legend: "Category, group. Concerts, checkbox, checked."
- The result count is announced politely, debounced by about 500 ms. Example: "9 events, 4 without price info hidden." It says nothing when the count hasn't changed.
- Remove buttons have full names, e.g. `aria-label="Odebrat filtr: Do 200 Kč"`.
- Relax suggestions say what will happen: "Remove 'This weekend' (shows 7 events)".
- Prices are written as text ("Zdarma", "od 300 Kč", "Cena neuvedena"), never as icons only.
- The page uses `lang="cs"`; all UI copy is Czech. "Kč" stays as text; no unit abbreviations are hidden from assistive tech.
- No `aria-live` on the results list itself, so the whole list isn't re-read.

## Testing checklist
- [ ] axe DevTools: 0 serious or critical issues (default state, filtered state, empty state)
- [ ] Lighthouse accessibility ≥ 95 (a smoke check only)
- [ ] Keyboard only: complete the main flow (2 categories → price → date → remove one → Clear all) without a mouse
- [ ] Focus is always visible and never hidden behind sticky UI
- [ ] VoiceOver + Safari (macOS): group names, checked states and count announcements are correct
- [ ] VoiceOver on iOS: chips work with swipe and double-tap
- [ ] 320px width: no horizontal scroll; 200% and 400% zoom: content reflows
- [ ] Text-spacing bookmarklet: nothing clipped
- [ ] Contrast checked for chip default, hover, selected and focus states, and for the status labels
- [ ] `prefers-reduced-motion` turns off transitions
- [ ] Windows High Contrast / forced-colors: chips and the selected state stay visible
