import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { SideNav, type NavPage } from './SideNav'
import { SiteFooter } from './SiteFooter'
import styles from './PageShell.module.css'

type Props = {
  current: NavPage
  /** Id of the main content, target of the skip link. */
  skipTarget: string
  skipLabel: string
  children: ReactNode
}

/** GoOut shell shared by every page: header, sidebar navigation, content and footer. */
export function PageShell({ current, skipTarget, skipLabel, children }: Props) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href={`#${skipTarget}`}>
        {skipLabel}
      </a>
      <div className={styles.header}>
        <SiteHeader />
      </div>
      <div className={styles.sidebar}>
        <SideNav current={current} />
      </div>
      <div className={styles.content}>
        {children}
        <SiteFooter />
      </div>
    </div>
  )
}
