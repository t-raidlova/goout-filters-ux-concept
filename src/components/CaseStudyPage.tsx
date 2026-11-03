import { PageShell } from './PageShell'
import styles from './CaseStudyPage.module.css'

const BASE = import.meta.env.BASE_URL
const DEMO_URL = `${BASE}?city=brno&price=500&sort=popular`

/** Short version of case-study.md. The write-up is in English; the shell stays Czech. */
export function CaseStudyPage() {
  return (
    <PageShell current="caseStudy" skipTarget="case-study" skipLabel="Přeskočit na obsah">
      <main id="case-study" className={`content-column ${styles.main}`} lang="en" tabIndex={-1}>
        <article className={styles.article}>
          <h1 className={styles.title}>GoOut: rethinking event filtering</h1>
          <p className={styles.meta}>
            UX case study · Product Builder application · Tereza Raidlová · November 2026
          </p>
          <p>
            <a className={styles.cta} href={DEMO_URL}>
              Open the live prototype
            </a>
          </p>

          <h2>Overview</h2>
          <p>
            I looked at how GoOut's listing filters help people narrow hundreds of events down to a
            few relevant ones, then built a working prototype with three focused changes:
          </p>
          <ol>
            <li>
              <strong>Multiple categories at once</strong>, e.g. <em>Výstavy + Festivaly</em>.
            </li>
            <li>
              <strong>A price filter, plus the price on every card</strong>, so people can compare
              without opening each event.
            </li>
            <li>
              <strong>"Redakční tipy" split from sorting.</strong> Editors' picks become a toggle;
              sorting gets its own labelled control.
            </li>
          </ol>
          <p>
            <strong>Scope:</strong> desktop event listing, filter bar and event card.{' '}
            <strong>Role:</strong> discovery, problem definition, UX design, front-end prototype.
            Built without access to GoOut's analytics or users.
          </p>

          <h2>Discovery</h2>
          <p>Discovery was a heuristic walkthrough of the live site, using realistic scenarios:</p>
          <ul>
            <li>
              <em>"I'm in Brno this weekend and want to see an exhibition or a festival."</em>
            </li>
            <li>
              <em>"I want to go out tonight but don't want to spend more than about 300 Kč."</em>
            </li>
            <li>
              <em>"Show me what GoOut recommends, sorted by what's coming up soonest."</em>
            </li>
          </ul>
          <h3>What I observed</h3>
          <ul>
            <li>
              <strong>Location and date work well</strong>, with search, suggestions and quick
              presets, so I left them alone.
            </li>
            <li>
              <strong>Categories are single-select.</strong> Someone interested in exhibitions{' '}
              <em>or</em> festivals has to browse two listings.
            </li>
            <li>
              <strong>Price is missing.</strong> Cards show no price and there's no price filter, so
              budget is discovered only on the detail page.
            </li>
            <li>
              <strong>One dropdown mixes two concepts.</strong> "Redakční tipy" sits next to sort
              orders (Populární, Blížící se, Novinky), so "editors' picks sorted by date" is
              impossible.
            </li>
          </ul>

          <h2>Problem</h2>
          <blockquote className={styles.quote}>
            <p>
              People deciding where to go out can't express their real constraints (several
              interests, a budget, a curated selection in a chosen order) in GoOut's filters, so
              they browse more listings and open more event pages than they need to.
            </p>
          </blockquote>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Problem</th>
                  <th scope="col">Consequence</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>P1</td>
                  <td>Categories are single-select</td>
                  <td>Broader interests need several separate searches</td>
                </tr>
                <tr>
                  <td>P2</td>
                  <td>No price on cards, no price filter</td>
                  <td>Budget is discovered late: extra clicks and drop-offs</td>
                </tr>
                <tr>
                  <td>P3</td>
                  <td>Sorting and curation share one control</td>
                  <td>Valid combinations are impossible; the control is unclear</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Hypothesis:</strong> if the filters match how people decide (interest + budget +
            trust in curation), they'll reach a relevant event in fewer steps, and more sessions will
            end in a purchase.
          </p>

          <h2>Key decisions</h2>
          <ul>
            <li>
              <strong>Preset price caps, not a slider.</strong> Zdarma / do 200 Kč / do 500 Kč / do
              1 000 Kč are faster to scan, match how people think about budget, and are easy with a
              keyboard.
            </li>
            <li>
              <strong>Match on the cheapest ticket.</strong> The card shows that same number ("od 290
              Kč"), so every result is explainable. Events without a known price are hidden under a
              price filter, and the UI says how many.
            </li>
            <li>
              <strong>Editors' picks as a filter, not a sort</strong>, so curation combines with any
              order.
            </li>
            <li>
              <strong>Keep GoOut's visual language</strong>: layout, categories and the blue accent
              stay.
            </li>
          </ul>

          <h2>Solution</h2>
          <h3>Multi-select categories</h3>
          <ul>
            <li>Tick any number of categories; they combine as OR, and with other filters as AND.</li>
            <li>The bar summarises the selection compactly; "Všechny kategorie" resets it.</li>
          </ul>
          <h3>Price filter and price on cards</h3>
          <ul>
            <li>
              A new <strong>Cena</strong> dropdown with preset caps (in € for Slovensko).
            </li>
            <li>
              Every card shows a price: <em>Zdarma</em>, <em>250 Kč</em>, <em>od 1 290 Kč</em> or{' '}
              <em>Cena neuvedena</em>.
            </li>
          </ul>
          <h3>Picks split from sorting</h3>
          <ul>
            <li>
              <strong>Redakční tipy</strong> is a standalone toggle that combines with every other
              filter.
            </li>
            <li>
              Sorting gets its own control, <strong>Řadit</strong>: Blížící se, Populární, Novinky.
            </li>
            <li>"Editors' picks in Brno under 500 Kč, sorted by date" is now possible.</li>
          </ul>
          <h3>Supporting details</h3>
          <ul>
            <li>A result count, removable filter chips and "Zrušit vše".</li>
            <li>
              An empty state that suggests which filter to drop and how many events that brings back.
            </li>
            <li>Filters live in the URL, so a filtered view can be shared or bookmarked.</li>
          </ul>

          <h2>Accessibility</h2>
          <p>
            Targets WCAG 2.2 AA: native checkboxes and radios, full keyboard support, selected states
            that don't rely on colour, and a polite status that announces the result count without
            moving focus.
          </p>

          <h2>Validation and next steps</h2>
          <ol>
            <li>
              <strong>Usability test</strong> with 5–6 participants on the discovery scenarios,
              current site vs. prototype: time to a relevant event, pages opened, hesitations.
            </li>
            <li>
              <strong>A/B test</strong> the changes one at a time, starting with price on cards
              (cheapest, likely highest impact).
            </li>
          </ol>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Metric</th>
                  <th scope="col">What it tells us</th>
                  <th scope="col">Expected</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Search-to-event click rate</td>
                  <td>Do filtered listings lead to an event detail?</td>
                  <td>↑</td>
                </tr>
                <tr>
                  <td>Filter adoption</td>
                  <td>Are the new filters used?</td>
                  <td>Track</td>
                </tr>
                <tr>
                  <td>Zero-results rate</td>
                  <td>Do combined filters get too narrow?</td>
                  <td>Must not grow much</td>
                </tr>
                <tr>
                  <td>Event-to-purchase conversion</td>
                  <td>Does seeing price up front mean more qualified clicks?</td>
                  <td>↑ or stable</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Guardrails:</strong> ticket revenue per session and bounce rate on event detail.
          </p>
          <p>
            <strong>Next:</strong> a mobile filter sheet, remembered city and price for returning
            users, and "Podle kamarádů" as a second toggle for logged-in users.
          </p>
        </article>
      </main>
    </PageShell>
  )
}
