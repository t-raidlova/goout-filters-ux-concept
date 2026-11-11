import { expect, test, type Page } from '@playwright/test'
import { barButton, openListing } from './fixtures'

/**
 * Reflow and text spacing (WCAG 1.4.10, 1.4.12), the scripted part of the audit.
 * Viewports: desktop, 200% zoom of 1280×900, phone, and 400% zoom (320 CSS px).
 */

const VIEWPORTS = [
  { name: '1600 desktop', width: 1600, height: 900 },
  { name: '640 (200% zoom)', width: 640, height: 450 },
  { name: '375 phone', width: 375, height: 812 },
  { name: '320 (400% zoom)', width: 320, height: 256 },
]

const DROPDOWNS = ['Země', 'Město', 'Cena', 'Datum', 'Řadit'] as const

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

/** Elements whose text is cut off with "…" (audit finding #3). */
async function truncatedTexts(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((el) => getComputedStyle(el).textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth)
      .map((el) => el.textContent?.trim() ?? ''),
  )
}

for (const vp of VIEWPORTS) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('no horizontal scrolling or truncated text on the listing', async ({ page }) => {
      await openListing(page, '?cat=concerts,parties&price=500')
      expect(await horizontalOverflow(page)).toBe(0)
      expect(await truncatedTexts(page)).toEqual([])
    })

    test('no horizontal scrolling with any dropdown open', async ({ page }) => {
      // Regression for audit finding #2: the date dropdown overflowed at 640–899px.
      await openListing(page)
      for (const name of DROPDOWNS) {
        await barButton(page, name).click()
        await expect(barButton(page, name)).toHaveAttribute('aria-expanded', 'true')
        expect(await horizontalOverflow(page), `${name} open`).toBe(0)
        await page.keyboard.press('Escape')
      }
    })
  })
}

test('text spacing override (WCAG 1.4.12) does not cut off or hide text', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await openListing(page)
  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
  })
  expect(await horizontalOverflow(page)).toBe(0)
  expect(await truncatedTexts(page)).toEqual([])
})
