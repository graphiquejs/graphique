import {
  GG,
  Labels,
  ScaleX,
  Tooltip,
  LegendOrientation,
  Theme,
} from '@graphique/graphique'
import { GeomPoint, Legend, SizeLegend } from '@graphique/geom-point'
import { GeomLabel, Entrance as LabelEntrance } from '@graphique/geom-label'
import { GapMinder, gapminder } from '@graphique/datasets'
import { useEffect, useState } from 'react'
import { useTheme } from 'nextra-theme-docs'
import { scaleLog } from 'd3-scale'
import styles from './gapMinder.module.css'
import { formatPop, formatXTick, getNumXTicks } from './formattingUtils'

const data = gapminder.filter((d) => d.year === 2007)

const State: React.FC = () => {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const themedColor = isDark ? '#000' : '#fff'

  const [focusedCountry, setFocusedCountry] = useState<GapMinder | undefined>()

  return isServer ? (
    <div style={{ height: 700 }} />
  ) : (
    <div className={styles.gapMinderContainer} style={{ paddingBottom: 160 }}>
      <GG
        data={data}
        aes={{
          x: (d) => d.gdpPercap,
          y: (d) => d.lifeExp,
          label: (d) => d.country,
          fill: (d) => d.continent,
          stroke: (d) => d.continent,
          size: (d) => d.pop,
        }}
        margin={{ top: 30, right: 30, left: 35 }}
        isContainerWidth
      >
        <GeomPoint<GapMinder>
          attr={{ fillOpacity: 0.35, strokeOpacity: 0.4 }}
          focusedStyle={{ fillOpacity: 1 }}
          onDatumFocus={(d) => setFocusedCountry(d?.[0])}
          onExit={() => setFocusedCountry(undefined)}
        />
        {focusedCountry && (
          <GeomLabel
            data={[focusedCountry]}
            entrance={LabelEntrance.DATA}
            attr={{
              fill: 'currentColor',
              stroke: themedColor,
              strokeOpacity: 0.7,
              fontSize: '0.8rem',
            }}
            isAnimated={false}
          />
        )}
        <ScaleX type={scaleLog} format={formatXTick} numTicks={getNumXTicks} />
        <Tooltip content={() => null} />
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
        <Theme grid={{ stroke: null }} axis={{ showAxisLine: true }} />
      </GG>
    </div>
  )
}

export default State
