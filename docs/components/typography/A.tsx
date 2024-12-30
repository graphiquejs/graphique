import { Url } from 'next/dist/shared/lib/router/router'
import Link from 'next/link'
import { AnchorHTMLAttributes } from 'react'
import { ExportIcon } from './icons'
import styles from './typography.module.css'

const replaceWithRoot = (url?: string) =>
  url?.replace(/https:\/\/graphique.dev\/?/, '/')

const A: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  children,
  href,
}) => {
  const url = replaceWithRoot(href)
  const isLocal = url?.startsWith('/')

  return (
    <span className="_inline-flex">
      <Link
        className={`${styles.link} _inline-flex _items-center _text-primary-600`}
        href={url as Url}
        target={isLocal ? undefined : '_blank'}
      >
        {children}
        {!isLocal && (
          <span className={styles.link}>
            <ExportIcon
              width={14}
              height={14}
              className={`${styles['link-icon']}`}
            />
          </span>
        )}
      </Link>
    </span>
  )
}

export default A
