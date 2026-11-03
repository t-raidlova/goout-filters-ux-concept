import styles from './SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer className={`content-column ${styles.footer}`}>
      <p>Produktový koncept s fiktivními akcemi. Nejde o oficiální web GoOut.</p>
    </footer>
  )
}
