import { expect, test, type Page } from '@playwright/test'
import { barButton, choose, expectNoNewA11yViolations, openListing } from './fixtures'

/**
 * Automated part of docs/accessibility-audit.md: axe in the same states the audit
 * scanned by hand. Known, accepted issues are listed in fixtures.ts (KNOWN_ISSUES).
 * axe finds roughly a third of WCAG issues; the manual checks in the audit still apply.
 */

const STATES: Record<string, (page: Page) => Promise<void>> = {
  'default listing': async (page) => openListing(page),
  'category panel open': async (page) => {
    await openListing(page, '?cat=concerts')
    await barButton(page, 'Kategorie').click()
  },
  'city dropdown open': async (page) => {
    await openListing(page)
    await barButton(page, 'Město').click()
  },
  'price dropdown open': async (page) => {
    await openListing(page, '?price=500')
    await barButton(page, 'Cena').click()
  },
  'custom date range with an error': async (page) => {
    await openListing(page)
    await barButton(page, 'Datum').click()
    await choose(page, 'radio', /^Jiné datum/)
    await page.getByLabel('Od').fill('2026-11-01')
    await page.getByRole('button', { name: 'Použít' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  },
  'sorted, editors\' picks only': async (page) => openListing(page, '?tips=1&sort=popular'),
  'empty state': async (page) => openListing(page, '?cat=gastro&price=0'),
}

for (const [name, setUp] of Object.entries(STATES)) {
  test(`no new axe violations: ${name}`, async ({ page }) => {
    await setUp(page)
    await expectNoNewA11yViolations(page)
  })
}

test('no new axe violations: 375px mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await openListing(page, '?cat=concerts,parties&price=500')
  await expectNoNewA11yViolations(page)
})

test('the live region names the active filters, so a change with the same count is still announced', async ({ page }) => {
  // Regression for audit finding #4.
  await openListing(page)
  const status = page.getByRole('status').filter({ hasText: 'nalezeno' })
  await expect(status).toHaveText(/^Praha: nalezeno \d+ akc/)

  await barButton(page, 'Cena').click()
  await choose(page, 'radio', 'Zdarma')
  await expect(status).toHaveText(/^Praha, Zdarma: nalezeno \d+ akc/)
})
