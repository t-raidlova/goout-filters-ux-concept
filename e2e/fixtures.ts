import AxeBuilder from '@axe-core/playwright'
import { expect, type Locator, type Page } from '@playwright/test'

/**
 * Shared helpers for the listing page. Locators use roles and accessible names,
 * the same way assistive technology finds controls, so a renamed or unlabeled
 * control fails a test.
 */

/** Opens the listing with an optional query string, e.g. `?cat=film`. */
export async function openListing(page: Page, query = '') {
  await page.goto(`./${query}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

export const filterBar = (page: Page) => page.getByRole('region', { name: 'Filtry' })

/** Bar buttons, matched by the start of their accessible name ("Cena, do 500 Kč"). */
export const barButton = (page: Page, name: 'Země' | 'Město' | 'Kategorie' | 'Cena' | 'Datum' | 'Řadit') =>
  filterBar(page).getByRole('button', { name: new RegExp(`^${name}`) })

export const editorsPickToggle = (page: Page) =>
  filterBar(page).getByRole('button', { name: 'Redakční tipy', exact: true })

/**
 * Checks a category checkbox or a radio option. The native input is visually hidden
 * behind a styled circle, so, like a user, we click its label.
 */
export async function choose(page: Page, role: 'checkbox' | 'radio', name: string | RegExp) {
  const input = page.getByRole(role, { name, exact: typeof name === 'string' })
  await page.locator('label').filter({ has: input }).click()
}

/** Removable chips under the title ("Odebrat filtr: Koncerty"). */
export const chips = (page: Page) => page.getByRole('button', { name: /^Odebrat filtr:/ })

export const clearAllButton = (page: Page) => page.getByRole('button', { name: 'Zrušit vše', exact: true })

/** Result count under the title, e.g. "6 akcí, 1 akce bez uvedené ceny skryta". */
export const resultSummary = (page: Page) =>
  page.getByRole('main').getByRole('paragraph').first()

export const eventCards = (page: Page) => page.getByRole('main').getByRole('article')

/** Find one event card by its title. */
export const card = (page: Page, title: string): Locator =>
  eventCards(page).filter({ has: page.getByRole('heading', { level: 3, name: title, exact: true }) })

/** Card price labels: "Zdarma", "350 Kč", "od 290 Kč", "Zdarma i od 150 Kč", "od 15 €", "Cena neuvedena". */
const PRICE_LABEL = /^(Zdarma.*|Cena neuvedena|(od )?[\d\s]+ (Kč|€))$/

/** Price label of every card on the page, with Intl's non-breaking spaces normalised. */
export async function cardPrices(page: Page): Promise<string[]> {
  const prices: string[] = []
  for (const article of await eventCards(page).all()) {
    const lines = (await article.getByRole('paragraph').allTextContents()).map(normalizeSpaces)
    const price = lines.find((line) => PRICE_LABEL.test(line))
    if (price === undefined) throw new Error(`No price label on card: ${lines.join(' | ')}`)
    prices.push(price)
  }
  return prices
}

/**
 * Lowest price a card label shows, as the filter judges it: 0 for "Zdarma…",
 * null for "Cena neuvedena", otherwise the number ("od 1 290 Kč" → 1290).
 */
export function lowestFromLabel(label: string): number | null {
  if (label.startsWith('Zdarma')) return 0
  if (label === 'Cena neuvedena') return null
  return Number(label.replace(/\D/g, ''))
}

export const normalizeSpaces = (s: string) => s.replace(/[  ]/g, ' ').trim()

/** Number at the start of a label such as "6 akcí" or "Odebrat „Zdarma“ (1 akce)". */
export function countIn(text: string): number {
  const match = /(\d+) akc/.exec(text)
  if (!match) throw new Error(`No event count in "${text}"`)
  return Number(match[1])
}

/**
 * Known accessibility issues that are accepted on purpose. Each one points to the
 * audit (docs/accessibility-audit.md). Any other violation fails the test.
 */
const KNOWN_ISSUES = [
  {
    id: 'color-contrast',
    reason:
      'Audit finding #1, decision U9: filled buttons keep GoOut brand blue #00b6eb with white text (2.36:1).',
    /** Accept only that exact colour pair; any other low-contrast text still fails. */
    matches: (data: { fgColor?: string; bgColor?: string } | undefined) =>
      data?.fgColor === '#ffffff' && data?.bgColor === '#00b6eb',
  },
] as const

/** Runs axe (WCAG 2.2 A/AA + best practices) and fails on anything not in KNOWN_ISSUES. */
export async function expectNoNewA11yViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()

  const unexpected = violations
    .map((v) => {
      const known = KNOWN_ISSUES.find((k) => k.id === v.id)
      const nodes = known
        ? v.nodes.filter((n) => !n.any.some((check) => known.matches(check.data)))
        : v.nodes
      return { id: v.id, impact: v.impact, help: v.help, targets: nodes.map((n) => n.target.join(' ')) }
    })
    .filter((v) => v.targets.length > 0)

  expect(unexpected, 'accessibility violations not listed in KNOWN_ISSUES').toEqual([])
}
