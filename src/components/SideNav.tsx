import styles from './SideNav.module.css'

export type NavPage = 'events' | 'caseStudy'

/**
 * GoOut's primary navigation. Only "Akce" exists in this prototype; the other
 * GoOut sections are left out so there are no dead links. "Case study" opens
 * this concept's write-up.
 */
const PAGES: { id: NavPage; label: string; href: string }[] = [
  { id: 'events', label: 'Akce', href: import.meta.env.BASE_URL },
  { id: 'caseStudy', label: 'CASE STUDY', href: `${import.meta.env.BASE_URL}case-study.html` },
]

export function SideNav({ current }: { current: NavPage }) {
  return (
    <nav className={styles.nav} aria-label="Hlavní navigace">
      <ul className={styles.list}>
        {PAGES.map(({ id, label, href }) => (
          <li key={id}>
            <a
              href={href}
              className={`${styles.item} ${id === current ? styles.active : ''}`}
              aria-current={id === current ? 'page' : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
