import styles from './SiteHeader.module.css'

/** Wordmark only: GoOut's search, language, tickets and account icons are out of scope. */
export function SiteHeader() {
  return (
    <header className={styles.header}>
      <a href={import.meta.env.BASE_URL} className={styles.logo}>
        goout
        <span className={styles.badge}>koncept</span>
        <span className="visually-hidden">, domů</span>
      </a>
    </header>
  )
}
