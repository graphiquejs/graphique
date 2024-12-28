import {
  GG,
  Labels,
  ScaleX,
  ScaleY,
  ScaleFill,
  ScaleStroke,
  Tooltip,
  LegendOrientation,
  Theme,
} from '@graphique/graphique'
import { GeomPoint, Legend, SizeLegend } from '@graphique/geom-point'
import { GeomLabel } from '@graphique/geom-label'
import { GeomLine } from '@graphique/geom-line'
import { GapMinder, gapminder } from '@graphique/datasets'
import { useEffect, useState, useMemo } from 'react'
import { scaleLog } from 'd3-scale'
import { useTheme } from 'nextra-theme-docs'
import { extent } from 'd3-array'
import styles from './gapMinder.module.css'
import { formatPop, formatXTick, getNumXTicks } from './formattingUtils'

const data = gapminder.filter((d) => d.year === 2007)
const continents = Array.from(new Set(data.map((d) => d.continent))).sort()

const ConditionalGeoms: React.FC = () => {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const themedColor = isDark ? '#000' : '#fff'

  const [selectedContinents, setSelectedContinents] = useState(continents)
  const [focusedCountry, setFocusedCountry] = useState<GapMinder | undefined>()
  const focusedCountryTrend = useMemo(
    () => gapminder.filter((d) => d.country === focusedCountry?.country),
    [focusedCountry],
  )

  const includedCountries = useMemo(
    () => data.filter((d) => selectedContinents.includes(d.continent)),
    [selectedContinents],
  )

  const xExtent = useMemo(
    () =>
      extent(
        gapminder.filter((d) => selectedContinents.includes(d.continent)),
        (d) => d.gdpPercap,
      ),
    [selectedContinents],
  )

  const yExtent = useMemo(
    () =>
      extent(
        gapminder.filter((d) => selectedContinents.includes(d.continent)),
        (d) => d.lifeExp,
      ),
    [selectedContinents],
  )

  return isServer ? (
    <div style={{ height: 500 }} />
  ) : (
    <div className={styles.gapMinderContainer} style={{ paddingBottom: 160 }}>
      <GG
        data={includedCountries}
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
        {focusedCountryTrend && (
          <>
            <GeomLine
              data={focusedCountryTrend}
              showTooltip={false}
              attr={{ strokeWidth: 2, strokeOpacity: 0.8 }}
              isAnimated={false}
            />
            <GeomPoint
              data={focusedCountryTrend}
              showTooltip={false}
              attr={{ fill: themedColor, fillOpacity: 0.8, r: 2.3 }}
              isAnimated={false}
            />
          </>
        )}
        <GeomPoint<GapMinder>
          key="countries"
          aes={{ key: (d) => d.country }}
          attr={{ fillOpacity: 0.35, strokeOpacity: 0.4 }}
          focusedStyle={{ fillOpacity: 1 }}
          onDatumFocus={(d) => {
            setFocusedCountry(d?.[0])
          }}
          onExit={() => setFocusedCountry(undefined)}
        />
        {focusedCountry && (
          <GeomLabel
            data={[focusedCountry]}
            attr={{
              fill: 'currentColor',
              stroke: themedColor,
              strokeOpacity: 0.7,
              fontSize: '0.8rem',
            }}
            isAnimated={false}
          />
        )}
        <ScaleX
          type={scaleLog}
          format={formatXTick}
          numTicks={getNumXTicks}
          domain={xExtent}
        />
        <ScaleY domain={yExtent} />
        <ScaleFill domain={continents} />
        <ScaleStroke domain={continents} />
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
            onSelection={(v) => {
              setSelectedContinents((prev) => {
                if (prev.includes(v) && prev.length === 1) {
                  return continents
                }
                if (prev.includes(v)) {
                  return prev.filter((p) => p !== v)
                }
                return [...prev, v]
              })

              if (focusedCountry?.continent === v) {
                setFocusedCountry(undefined)
              }
            }}
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

export default ConditionalGeoms
