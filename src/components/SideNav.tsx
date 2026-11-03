import styles from './SideNav.module.css'

/**
 * GoOut's primary navigation. Only "Akce" exists in this prototype; the other
 * sections are shown as plain text so there are no dead links.
 */
const OTHER_SECTIONS = ['Feed', 'Umělci', 'Místa', 'Pořadatelé', 'Poukazy']

export function SideNav() {
  return (
    <nav className={styles.nav} aria-label="Hlavní navigace">
      <ul className={styles.list}>
        <li>
          <a href="/" className={`${styles.item} ${styles.active}`} aria-current="page">
            Akce
          </a>
        </li>
        {OTHER_SECTIONS.map((label) => (
          <li key={label}>
            <span className={styles.item}>{label}</span>
          </li>
        ))}
      </ul>
    </nav>
  )
}
