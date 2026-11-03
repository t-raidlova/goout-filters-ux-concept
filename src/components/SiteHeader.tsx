import { Icon, type IconName } from './Icon'
import styles from './SiteHeader.module.css'

/** Shown for visual fidelity with GoOut; account, search and tickets are out of scope. */
const UTILITY_ICONS: IconName[] = ['search', 'globe', 'ticket', 'bell', 'user']

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href="/" className={styles.logo}>
        goout
        <span className={styles.badge}>koncept</span>
        <span className="visually-hidden">, domů</span>
      </a>
      <div className={styles.utilities} aria-hidden="true">
        {UTILITY_ICONS.map((name) => (
          <Icon key={name} name={name} size={18} />
        ))}
      </div>
    </header>
  )
}
