import { expect, test } from '@playwright/test'
import { barButton, chips, choose, editorsPickToggle, openListing } from './fixtures'

/** Filters live in the URL, so a link restores the same view and a reload keeps it. */

test('the page loads under the GitHub Pages base path with no failed requests', async ({ page }) => {
  // Catches assets or images linked with "/" instead of the base path, which 404 on Pages.
  const failed: string[] = []
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`) })
  page.on('requestfailed', (r) => failed.push(`failed ${r.url()}`))

  await openListing(page)
  await page.waitForLoadState('networkidle')
  expect(failed).toEqual([])
  const brokenImages = await page.locator('main img').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.src),
  )
  expect(brokenImages).toEqual([])
})

test('a shared link restores every filter, and a reload keeps them', async ({ page }) => {
  await openListing(page, '?country=sk&city=bratislava&cat=concerts&price=20&date=weekend&tips=1&sort=new')

  const expectRestored = async () => {
    await expect(barButton(page, 'Země')).toHaveAccessibleName('Země: Slovensko')
    await expect(barButton(page, 'Město')).toHaveAccessibleName('Město: Bratislava')
    await expect(barButton(page, 'Kategorie')).toHaveAccessibleName('Kategorie: Koncerty')
    await expect(barButton(page, 'Cena')).toHaveAccessibleName(/do 20\s€$/)
    await expect(barButton(page, 'Datum')).toHaveAccessibleName('Datum: Tento víkend')
    await expect(editorsPickToggle(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(barButton(page, 'Řadit')).toHaveAccessibleName('Řadit: Novinky')
    await expect(chips(page)).toHaveText(['Koncerty', 'Do 20 €', 'Tento víkend', 'Redakční tipy'])
  }

  await expectRestored()
  await page.reload()
  await expectRestored()
})

test('invalid or unknown parameters are ignored and dropped from the URL', async ({ page }) => {
  await openListing(
    page,
    '?cat=nope,film&price=450&date=2020-01-01..2020-01-02&sort=random&tips=yes&city=atlantis',
  )

  await expect(barButton(page, 'Kategorie')).toHaveAccessibleName('Kategorie: Filmy')
  await expect(barButton(page, 'Cena')).toHaveAccessibleName('Cena')
  await expect(barButton(page, 'Datum')).toHaveAccessibleName('Datum: Kdykoliv')
  await expect(barButton(page, 'Řadit')).toHaveAccessibleName('Řadit: Blížící se')
  await expect(barButton(page, 'Město')).toHaveAccessibleName('Město: Praha')
  await expect(page).toHaveURL(/\?cat=film$/)
})

test('a price cap from the other currency is ignored', async ({ page }) => {
  await openListing(page, '?country=sk&price=200')
  await expect(barButton(page, 'Cena')).toHaveAccessibleName('Cena')
  await expect(page).toHaveURL(/\?country=sk$/)
})

test('changing filters replaces the URL instead of adding history entries', async ({ page }) => {
  await openListing(page)
  const before = await page.evaluate(() => history.length)

  await barButton(page, 'Cena').click()
  await choose(page, 'radio', 'Zdarma')
  await editorsPickToggle(page).click()
  await expect(page).toHaveURL(/\?price=0&tips=1$/)

  expect(await page.evaluate(() => history.length)).toBe(before)
})
