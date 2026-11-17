import { expect, test } from '@playwright/test'
import { barButton, chips, clearAllButton, editorsPickToggle, openListing } from './fixtures'

/**
 * Keyboard-only use. Runs in Chromium only: WebKit follows Safari's default, where
 * Tab skips buttons and links unless the user turns on "Press Tab to highlight each item".
 */

test('the skip link is the first stop and moves focus to the results', async ({ page }) => {
  await openListing(page)
  await page.keyboard.press('Tab')
  const skip = page.getByRole('link', { name: 'Přeskočit na akce' })
  await expect(skip).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(page.locator('#results')).toBeFocused()
})

test('category panel: opens onto its first option, toggles with Space, and Shift+Tab returns to the button', async ({ page }) => {
  // Regression for audit finding #9: the panel follows the whole bar in the DOM.
  await openListing(page)
  await barButton(page, 'Kategorie').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Všechny akce' })).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('checkbox', { name: 'Koncerty' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('checkbox', { name: 'Koncerty' })).toBeChecked()
  await expect(page).toHaveURL(/\?cat=concerts$/)

  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Shift+Tab')
  await expect(barButton(page, 'Kategorie')).toBeFocused()
  await expect(barButton(page, 'Kategorie')).toHaveAttribute('aria-expanded', 'false')
})

for (const name of ['Země', 'Město', 'Kategorie', 'Cena', 'Datum', 'Řadit'] as const) {
  test(`Escape closes "${name}" and returns focus to its button`, async ({ page }) => {
    await openListing(page)
    const button = barButton(page, name)
    await button.focus()
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Escape')
    await expect(button).toHaveAttribute('aria-expanded', 'false')
    await expect(button).toBeFocused()
  })
}

test('price options: Tab enters the group, arrow keys apply a choice, Enter closes', async ({ page }) => {
  await openListing(page)
  const price = barButton(page, 'Cena')
  await price.focus()
  await page.keyboard.press('Enter')
  // Disclosure pattern: opening keeps focus on the button; Tab moves to the checked option.
  await expect(price).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('radio', { name: 'Jakákoliv cena' })).toBeFocused()

  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('radio', { name: 'Zdarma' })).toBeChecked()
  await expect(page).toHaveURL(/\?price=0$/)
  // Results changed, but focus stays where the user is.
  await expect(page.getByRole('radio', { name: 'Zdarma' })).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(price).toHaveAttribute('aria-expanded', 'false')
  await expect(price).toBeFocused()
})

test('removing chips moves focus to the next chip, then back to the filter bar', async ({ page }) => {
  await openListing(page, '?cat=concerts&tips=1')

  await page.getByRole('button', { name: 'Odebrat filtr: Koncerty' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Odebrat filtr: Redakční tipy' })).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(chips(page)).toHaveCount(0)
  await expect(editorsPickToggle(page)).toBeFocused()
})

test('"Zrušit vše" moves focus to the category button', async ({ page }) => {
  await openListing(page, '?cat=film&price=200')
  await clearAllButton(page).focus()
  await page.keyboard.press('Enter')
  await expect(barButton(page, 'Kategorie')).toBeFocused()
})
