import { describe, expect, it } from 'vitest'
import { DEMO_NOW, EVENTS } from './events'
import { CATEGORY_IDS } from './categories'
import { COUNTRIES } from './countries'
import { cityById } from './cities'
import { isUpcoming } from '../lib/filterEvents'

/**
 * Data integrity: rules the mock catalogue must follow that TypeScript can't check.
 * In production these would be contract tests on the events API response.
 * One test per rule; a failure names the offending event ids.
 */

const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/
const images = Object.keys(import.meta.glob('../../public/images/*.svg'))
const isWholeNonNegative = (n: number) => Number.isInteger(n) && n >= 0
const idsWhere = (bad: (e: (typeof EVENTS)[number]) => boolean) => EVENTS.filter(bad).map((e) => e.id)

describe('mock catalogue', () => {
  it('has unique ids', () => {
    const ids = EVENTS.map((e) => e.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it('has valid timestamps with an explicit offset; events end after they start and were added before "now"', () => {
    const invalid = (t: string | undefined) =>
      t !== undefined && (!ISO_WITH_OFFSET.test(t) || Number.isNaN(Date.parse(t)))
    expect(idsWhere((e) => [e.startsAt, e.endsAt, e.addedAt].some(invalid))).toEqual([])
    expect(idsWhere((e) => !!e.endsAt && Date.parse(e.endsAt) <= Date.parse(e.startsAt))).toEqual([])
    expect(idsWhere((e) => Date.parse(e.addedAt) > DEMO_NOW.getTime())).toEqual([])
  })

  it('has whole, non-negative prices and interest counts', () => {
    expect(idsWhere((e) => !e.ticketPrices.every(isWholeNonNegative) || !isWholeNonNegative(e.interested))).toEqual([])
  })

  it('has no repeated categories on an event, and every image exists in public/images', () => {
    expect(idsWhere((e) => new Set(e.categories).size !== e.categories.length)).toEqual([])
    // BASE_URL is "/" in Vitest, so this can't catch a hard-coded "/images/…" path.
    // The E2E smoke test checks that images load under the GitHub Pages base path.
    const prefix = `${import.meta.env.BASE_URL}images/`
    const broken = (url: string) =>
      !url.startsWith(prefix) || !images.includes(`../../public/images/${url.slice(prefix.length)}`)
    expect(idsWhere((e) => broken(e.imageUrl))).toEqual([])
  })

  // An empty category or country would look like a broken filter in the demo.
  it('has at least one upcoming event in every category and every country', () => {
    const upcoming = EVENTS.filter((e) => isUpcoming(e, DEMO_NOW))
    const emptyCategories = CATEGORY_IDS.filter((c) => !upcoming.some((e) => e.categories.includes(c)))
    const emptyCountries = COUNTRIES.map((c) => c.id).filter(
      (id) => !upcoming.some((e) => cityById(e.venue.city).country === id),
    )
    expect([...emptyCategories, ...emptyCountries]).toEqual([])
  })
})
