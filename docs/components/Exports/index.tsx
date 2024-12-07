import { Table, Tr, Th, Td } from 'nextra/components'
import { Fragment, HtmlHTMLAttributes } from 'react'
import { ApiItemKind } from '#/utils/constants'
import styles from './Exports.module.css'

interface Definition {
  kind: string
  data: {
    name: string
    type:
      | {
          label: string
        }
      | {
          label: undefined
        }
  }
}

interface Interface {
  kind: string
  data: {
    name: string
    kindLabel: string
    data: {
      name: string
      description: JSX.Element
    }[]
  }
}

interface Props {
  apiItems?: (Definition | Interface)[]
}

const H3 = (props: HtmlHTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={`${styles.h2} _font-semibold _tracking-tight _text-slate-900 dark:_text-slate-100`}
    {...props}
  />
)

const Hr = () => (
  <hr
    className={`${styles.hr} _border-neutral-200/70 contrast-more:_border-neutral-400 dark:_border-primary-100/10 contrast-more:dark:_border-neutral-400 _mt-6`}
  />
)

export const Exports = ({ apiItems }: Props) => (
  <>
    {apiItems &&
      apiItems.map((item, i) => {
        if (item.kind === ApiItemKind.REFERENCE) {
          const itemData = (item as Definition).data
          return (
            <Fragment key={itemData.name}>
              <div className={styles['exports-container']}>
                <H3 id={itemData.name}>
                  <code className={`nextra-code ${styles['code-header']}`}>
                    {itemData.name}
                  </code>
                  {itemData?.type?.label && (
                    <code
                      className={`nextra-code ${styles['kind-label']}`}
                      dangerouslySetInnerHTML={{
                        __html: itemData.type.label,
                      }}
                    />
                  )}
                  <a
                    href={`#${item.data.name}`}
                    className="nextra-focus subheading-anchor"
                    aria-label="Permalink for this section"
                  />
                </H3>
              </div>
              {i < apiItems.length - 1 && <Hr />}
            </Fragment>
          )
        }
        if (item.kind === ApiItemKind.INTERFACE) {
          const itemData = (item as Interface).data

          return (
            <Fragment key={itemData.name}>
              <div className={styles['exports-container']}>
                <H3 id={itemData.name}>
                  <code className={`nextra-code ${styles['code-header']}`}>
                    {itemData.name}
                  </code>
                  <code
                    className={`nextra-code ${styles['kind-label']}`}
                    dangerouslySetInnerHTML={{
                      __html: itemData.kindLabel,
                    }}
                  />
                  <a
                    href={`#${itemData.name}`}
                    className="nextra-focus subheading-anchor"
                    aria-label="Permalink for this section"
                  />
                </H3>
                <Table className={styles.table}>
                  <thead>
                    <Tr className={styles['table-header']}>
                      {Object.keys(itemData.data[0]).map((k) => (
                        <Th className={styles.th} align="left" key={k}>
                          {k}
                        </Th>
                      ))}
                    </Tr>
                  </thead>
                  <tbody>
                    {itemData.data.map((row, i: number) => (
                      <Tr key={String(i)} className={styles.tr}>
                        {Object.values(row).map((cell, j: number) => (
                          <Td key={`${i}-${j}`} className={styles.td}>
                            {j === 0 ? (
                              <code
                                dangerouslySetInnerHTML={{ __html: cell }}
                              />
                            ) : (
                              <>{cell}</>
                            )}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {i < apiItems.length - 1 && <Hr />}
            </Fragment>
          )
        }
      })}
  </>
)
