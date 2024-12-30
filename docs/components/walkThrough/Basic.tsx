import { GG } from '@graphique/graphique'
import { GeomPoint } from '@graphique/geom-point'
import { gapminder } from '@graphique/datasets'
import { useEffect, useState } from 'react'
import styles from './gapMinder.module.css'

const data = gapminder.filter((d) => d.year === 2007)

const Blank: React.FC = () => {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])

  return isServer ? (
    <div style={{ height: 450 }} />
  ) : (
    <div className={styles.gapMinderContainer}>
      <GG
        data={data}
        aes={{
          x: (d) => d.gdpPercap,
          y: (d) => d.lifeExp,
        }}
        isContainerWidth
      >
        <GeomPoint />
      </GG>
    </div>
  )
}

export default Blank
