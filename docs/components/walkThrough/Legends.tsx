import {
  GG,
  Labels,
  ScaleX,
  Tooltip,
  LegendOrientation,
} from '@graphique/graphique'
import { GeomPoint, Legend, SizeLegend } from '@graphique/geom-point'
import { gapminder } from '@graphique/datasets'
import { useEffect, useState } from 'react'
import { scaleLog } from 'd3-scale'
import styles from './gapMinder.module.css'
import {
  formatGDP,
  formatPop,
  formatXTick,
  getNumXTicks,
} from './formattingUtils'

const data = gapminder.filter((d) => d.year === 2007)

const Legends: React.FC = () => {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])

  return isServer ? (
    <div style={{ height: 500 }} />
  ) : (
    <div className={styles.gapMinderContainer} style={{ paddingBottom: 160 }}>
      <GG
        data={data}
        aes={{
          x: (d) => d.gdpPercap,
          y: (d) => d.lifeExp,
          label: (d) => d.country,
          fill: (d) => d.continent,
          size: (d) => d.pop,
        }}
        margin={{ top: 30, right: 30, left: 35 }}
        isContainerWidth
      >
        <GeomPoint attr={{ opacity: 0.7 }} />
        <ScaleX type={scaleLog} format={formatXTick} numTicks={getNumXTicks} />
        <Tooltip xFormat={formatGDP} />
        <Labels
          x="GDP per capita"
          y="Life expectancy (years)"
          header={
            <span className={styles.title}>
              The health and wealth of nations
            </span>
          }
        />
        <div className={styles.legends}>
          <Legend
            orientation={LegendOrientation.H}
            title={<span className={styles['legend-title']}>Continent</span>}
          />
          <SizeLegend
            title={<span className={styles['legend-title']}>Population</span>}
            format={formatPop}
          />
        </div>
      </GG>
    </div>
  )
}

export default Legends
