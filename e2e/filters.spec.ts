import { expect, test } from '@playwright/test'
import {
  barButton,
  cardPrices,
  chips,
  choose,
  clearAllButton,
  countIn,
  editorsPickToggle,
  eventCards,
  filterBar,
  lowestFromLabel,
  openListing,
  resultSummary,
} from './fixtures'

/**
 * Main user flows on the listing. Assertions check what the user sees (cards, labels,
 * chips, counts) against the product rules, not exact numbers from the demo data.
 */

test.describe('categories', () => {
  test('several categories combine with OR and are reflected in the bar, title, chips and URL', async ({ page }) => {
    await openListing(page)
    await barButton(page, 'Kategorie').click()

    await choose(page, 'checkbox', 'Koncerty')
    await expect(page).toHaveURL(/\?cat=concerts$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Koncerty v Praze')
    const concerts = await eventCards(page).count()

    await choose(page, 'checkbox', 'Parties')
    await expect(page).toHaveURL(/\?cat=concerts,parties$/)
    await expect(barButton(page, 'Kategorie')).toHaveAccessibleName('Kategorie: Koncerty +1')
    // Two categories: the title falls back to "Akce", as on GoOut.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Akce v Praze')
    await expect(chips(page)).toHaveText(['Koncerty', 'Parties'])

    // OR: adding a category can only add events.
    expect(await eventCards(page).count()).toBeGreaterThan(concerts)
    await expect(resultSummary(page)).toContainText(`${await eventCards(page).count()} akc`)
  })

  test('"Všechny akce" clears the selection', async ({ page }) => {
    await openListing(page, '?cat=concerts,parties')
    await barButton(page, 'Kategorie').click()
    await page.getByRole('button', { name: 'Všechny akce' }).click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('button', { name: 'Všechny akce' })).toHaveAttribute('aria-pressed', 'true')
    await expect(chips(page)).toHaveCount(0)
  })
})

test.describe('price', () => {
  test('a price cap keeps only events whose cheapest ticket fits, and says how many unknown prices it hid', async ({ page }) => {
    await openListing(page)
    await barButton(page, 'Cena').click()
    await choose(page, 'radio', 'Do 500 Kč')

    await expect(page).toHaveURL(/\?price=500$/)
    // Chrome computes "Cena , do 500 Kč" (space before the comma): audit finding #10, open.
    await expect(barButton(page, 'Cena')).toHaveAccessibleName(/^Cena ?, do 500\sKč$/)

    const prices = await cardPrices(page)
    expect(prices.length).toBeGreaterThan(0)
    for (const label of prices) {
      const lowest = lowestFromLabel(label)
      expect(lowest, `"${label}" should be hidden or within the cap`).not.toBeNull()
      expect(lowest!).toBeLessThanOrEqual(500)
    }
    // The demo data has events without a price in Praha; they are hidden and counted.
    await expect(resultSummary(page)).toContainText(/bez uvedené ceny skryt/)
  })

  test('clicking an option applies it and closes the dropdown, like a <select>', async ({ page, browserName }) => {
    test.fail(
      browserName === 'webkit',
      'BUG-001 (docs/bug-reports.md): WebKit forwards the label click with event.detail 0, so the dropdown stays open',
    )
    await openListing(page)
    await barButton(page, 'Cena').click()
    await choose(page, 'radio', 'Zdarma')

    await expect(page).toHaveURL(/\?price=0$/)
    await expect(barButton(page, 'Cena')).toHaveAttribute('aria-expanded', 'false')
  })

  test('"Zdarma" shows only free events', async ({ page }) => {
    await openListing(page)
    await barButton(page, 'Cena').click()
    await choose(page, 'radio', 'Zdarma')

    await expect(page).toHaveURL(/\?price=0$/)
    for (const label of await cardPrices(page)) expect(label).toMatch(/^Zdarma/)
  })

  test('every card shows a price label, including "Cena neuvedena" when unknown', async ({ page }) => {
    await openListing(page)
    const prices = await cardPrices(page)
    expect(prices).toHaveLength(await eventCards(page).count())
    expect(prices).toContain('Cena neuvedena')
  })
})

test.describe('editors\' picks and sort', () => {
  test('sorting only reorders; "Redakční tipy" filters', async ({ page }) => {
    await openListing(page)
    const all = await eventCards(page).count()

    await barButton(page, 'Řadit').click()
    await choose(page, 'radio', /^Populární/)
    await expect(page).toHaveURL(/\?sort=popular$/)
    await expect(eventCards(page)).toHaveCount(all)

    await editorsPickToggle(page).click()
    await expect(editorsPickToggle(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page).toHaveURL(/\?tips=1&sort=popular$/)
    const picks = eventCards(page)
    expect(await picks.count()).toBeLessThan(all)
    for (const article of await picks.all()) await expect(article).toContainText('Redakční tip')
  })
})

test.describe('clearing filters', () => {
  test('"Zrušit vše" clears categories, price, date and picks but keeps city and sort', async ({ page }) => {
    await openListing(page, '?city=brno&cat=parties&price=200&date=weekend&tips=1&sort=popular')
    await expect(chips(page)).toHaveCount(4)

    await clearAllButton(page).click()

    await expect(chips(page)).toHaveCount(0)
    await expect(page).toHaveURL(/\?city=brno&sort=popular$/)
    await expect(barButton(page, 'Město')).toHaveAccessibleName('Město: Brno')
    await expect(barButton(page, 'Řadit')).toHaveAccessibleName('Řadit: Populární')
  })

  test('removing a chip removes only that filter', async ({ page }) => {
    await openListing(page, '?cat=concerts,parties&price=500')
    await page.getByRole('button', { name: 'Odebrat filtr: Parties' }).click()

    await expect(chips(page)).toHaveText(['Koncerty', 'Do 500 Kč'])
    await expect(page).toHaveURL(/\?cat=concerts&price=500$/)
  })
})

test.describe('empty state', () => {
  test('suggests which filter to drop, with the number of events it brings back', async ({ page }) => {
    await openListing(page, '?cat=gastro&price=0')

    await expect(page.getByRole('heading', { name: 'Žádné akce neodpovídají výběru' })).toBeVisible()
    await expect(eventCards(page)).toHaveCount(0)

    const dropPrice = page.getByRole('button', { name: /^Odebrat „Zdarma“/ })
    const promised = countIn((await dropPrice.textContent()) ?? '')
    await dropPrice.click()

    await expect(page).toHaveURL(/\?cat=gastro$/)
    await expect(eventCards(page)).toHaveCount(promised)
    // The suggestion buttons are gone, so focus moves to the results instead of the page top.
    await expect(page.locator('#results')).toBeFocused()
  })
})

test.describe('date', () => {
  test('a custom range rejects past dates and, once valid, splits results by day', async ({ page }) => {
    await openListing(page)
    await barButton(page, 'Datum').click()
    await choose(page, 'radio', /^Jiné datum/)

    await page.getByLabel('Od').fill('2026-11-01')
    await page.getByLabel('Do').fill('2026-11-02')
    await page.getByRole('button', { name: 'Použít' }).click()
    await expect(page.getByRole('alert')).toHaveText('Datum od nemůže být v minulosti.')
    await expect(page.getByLabel('Od')).toHaveAttribute('aria-invalid', 'true')
    await expect(page).toHaveURL(/\/$/)

    await page.getByLabel('Od').fill('2026-11-12')
    await page.getByLabel('Do').fill('2026-11-15')
    await page.getByRole('button', { name: 'Použít' }).click()

    await expect(page).toHaveURL(/\?date=2026-11-12\.\.2026-11-15$/)
    await expect(barButton(page, 'Datum')).toHaveAccessibleName('Datum: 12. 11. – 15. 11.')
    const dayHeadings = page.getByRole('main').getByRole('heading', { level: 2, name: /listopadu$/ })
    expect(await dayHeadings.count()).toBeGreaterThan(0)
    for (const heading of await dayHeadings.allTextContents()) {
      const day = Number(/(\d+)\. listopadu/.exec(heading)![1])
      expect(day).toBeGreaterThanOrEqual(12)
      expect(day).toBeLessThanOrEqual(15)
    }
  })
})

test.describe('location', () => {
  test('searching a city ignores diacritics and updates the title and URL', async ({ page }) => {
    await openListing(page)
    await barButton(page, 'Město').click()
    await page.getByRole('searchbox', { name: 'Hledat město' }).fill('ceske bud')
    await filterBar(page).getByRole('button', { name: 'České Budějovice' }).click()

    await expect(page).toHaveURL(/\?city=ceske-budejovice$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Akce v Českých Budějovicích')
  })

  test('switching to Slovensko shows the whole country with prices and caps in euros', async ({ page }) => {
    await openListing(page)
    await barButton(page, 'Země').click()
    await choose(page, 'radio', 'Slovensko')

    await expect(page).toHaveURL(/\?country=sk$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Akce na Slovensku')
    for (const label of await cardPrices(page)) expect(label).not.toContain('Kč')

    await barButton(page, 'Cena').click()
    await expect(page.getByRole('radio', { name: 'Do 20 €' })).toBeVisible()
  })
})
