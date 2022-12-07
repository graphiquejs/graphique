/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable react/jsx-props-no-spreading */

import React, { useState, useMemo } from 'react'
import {
  GG,
  ScaleX,
  ScaleY,
  Tooltip,
  ScaleStroke,
  ScaleFill,
  ScaleRadius,
  Theme,
} from '@graphique/graphique'
import { gapminder, GapMinder } from '@graphique/datasets'
import { GeomPoint, Legend } from '@graphique/geom-point'
import { GeomLine } from '@graphique/geom-line'
import { GeomLabel } from '@graphique/geom-label'
import { scaleLog } from 'd3-scale'
import { GeomBar } from '@graphique/geom-bar';

interface Data {
  x: number;
  group: string;
}

const data1 = [
  { x: 180, group: 'a' },
  { x: 20, group: 'b' },
  { x: 100, group: 'c' },
]

const data2 = [
  { x: 200, group: 'd' },
  { x: 100, group: 'e' },
]

const ggProps = {
  aes: {
    x: (d: Data) => d.x,
    y: () => '',
    fill: (d: Data) => d.group
  },
  margin: {
    top: 0,
    bottom: 0,
  },
  height: 70,
}

interface CountryFilterProps {
  onChange: React.ChangeEventHandler<HTMLSelectElement>
}

interface YearFilterProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const CountryFilter = ({ onChange }: CountryFilterProps) => (
  <div>
    <select onChange={onChange}>
    {
      Array.from(new Set(gapminder.map(d => d.country))).sort().map((c) => (
        <option key={c} value={c}>{c}</option>
      ))
    }
    </select>
  </div>
)

const years = Array.from(new Set(gapminder.map(d => d.year)))
const YearFilter = ({ onChange }: YearFilterProps) => (
  <div>
    <input
      type='range'
      onChange={onChange}
      min={Math.min(...years)}
      max={Math.max(...years)}
      step={5}
    />
  </div>
)

// const GGTooltip = () => (
//   <Tooltip
//     keepInParent={false}
//     content={(value) => {
//       const { label } = value[0]
//       return (
//         <div>
//           <svg width={130} height={40}>
//             <text
//               style={{
//                 fontFamily: "-apple-system, sans-serif",
//                 fontSize: 11,
//                 fontWeight: 600,
//                 strokeLinecap: "round",
//                 strokeLinejoin: "round",
//                 stroke: '#fff',
//               }}
//               fill="currentColor"
//               strokeWidth={3}
//               paintOrder="stroke"
//               x={2}
//               y={26}
//             >
//               {label}
//             </text>
//           </svg>
//         </div>
//       )
//     }}
//   />
// )

const continents = Array.from(new Set(gapminder.map(d => d.continent)))
const xVals = gapminder.map(d => d.gdpPercap)
const yVals = gapminder.map(d => d.lifeExp)
const pops = gapminder.map(d => d.pop)
const xExtent = [
  Math.min(...xVals),
  Math.max(...xVals),
]
const yExtent = [
  Math.min(...yVals),
  Math.max(...yVals),
]
const popExtent = [Math.min(...pops), Math.max(...pops)] as [number, number]

function App() {
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>()
  const [mousedOverCountry, setMousedOverCountry] = useState<string | undefined>()
  const [selectedYear, setSelectedYear] = useState(years[0])
  const [selectedContinents, setSelectedContinents] = useState(continents)

  const data = useMemo(() => (
    gapminder.filter((d) => d.year === selectedYear)
  ), [selectedYear])

  const lineData = useMemo(() => (
    gapminder.filter(d => (
      [mousedOverCountry, selectedCountry].includes(d.country)
      && selectedContinents.includes(d.continent)
    ))
  ), [mousedOverCountry, selectedCountry, selectedContinents])

  const [focused, setFocused] = useState<Data[] | undefined>([])

  return (
    <div style={{ maxWidth: 1200, padding: '0 50px' }}>
      <div id='group' style={{ margin: 50, marginBottom: 200 }}>
        <div>
          <GG
            data={data1}
            {...ggProps}
          >
            <GeomBar
              focusType='individual'
              stroke='#fff'
              strokeWidth={1.5}
              yPadding={0}
              onDatumFocus={(d) => setFocused(d)}
              onExit={() => setFocused(undefined)}
            />
            <Tooltip
              datum={focused}
            />
            <Theme
              axisX={null}
              axisY={null}
              grid={{ stroke: null }}
            />
          </GG>
        </div>
        <div>
          <GG
            data={data2}
            {...ggProps}
            height={18}
          >
            <GeomBar
              focusType='individual'
              stroke='#fff'
              strokeWidth={1.5}
              yPadding={0}
              onDatumFocus={(d) => setFocused(d)}
              onExit={() => setFocused(undefined)}
            />
            <Tooltip
              datum={focused}
            />
            <Theme axisX={null} axisY={null} grid={{ stroke: null }} />
            <ScaleFill values={['lightcoral', '#555']} />
          </GG>
        </div>
      </div>
      <GG
        data={data.filter(d => selectedContinents.includes(d.continent))}
        aes={{
          x: (d: GapMinder) => d.gdpPercap,
          y: (d: GapMinder) => d.lifeExp,
          fill: (d: GapMinder) => d.continent,
          size: (d: GapMinder) => d.pop,
          label: (d: GapMinder) => d.country,
          key: (d: GapMinder) => d.country,
        }}
        isContainerWidth
      >
        {(mousedOverCountry || selectedCountry) && (
          <>
            <GeomLine
              data={lineData}
              entrance='data'
              aes={{
                stroke: (d: GapMinder) => d.continent,
                group: (d: GapMinder) => d.country,
              }}
              showTooltip={false}
              strokeOpacity={0.75}
            />
            {/* <GeomPoint
              data={lineData}
              aes={{
                stroke: (d: GapMinder) => d.continent,
                key: (d: GapMinder) => `${d.country}-${d.year}`
              }}
              r={2.5}
              fill='#fff'
              entrance='data'
              showTooltip={false}
            /> */}
          </>
        )}
        <GeomPoint
          focusedKeys={[mousedOverCountry ?? '', selectedCountry ?? '']}
          fillOpacity={0.6}
          strokeWidth={0.8}
          strokeOpacity={0.7}
          stroke='#fff'
          focusedStyle={{ strokeWidth: 1.3, fillOpacity: 0.8 }}
          unfocusedStyle={{ fillOpacity: 0.1, strokeOpacity: 0 }}
          onDatumFocus={(d: GapMinder[]) => setMousedOverCountry(d[0].country)}
          onDatumSelection={(d: GapMinder) => setSelectedCountry(prev => prev === d.country ? undefined : d.country)}
          onExit={() => setMousedOverCountry(undefined)}
          // brushAction='zoom'
        />
        <GeomLabel
          data={
            data.filter(d => (
              ([mousedOverCountry, selectedCountry].includes(d.country))
                && selectedContinents.includes(d.continent)
            ))
          }
          aes={{ key: (d: GapMinder) => d.country }}
          entrance='data'
          fill='currentColor'
          strokeOpacity={0.7}
        />
        <Legend
          onSelection={(v) => setSelectedContinents((prev) => {
            if (prev.length === 1 && prev[0] === v)
              return continents
          
            return (
              prev.includes(v)
                ? prev.filter(p => p !== v)
                : [v, ...prev]
            )
          })}
        />
        <ScaleX
          type={scaleLog}
          domain={xExtent}
        />
        <ScaleY domain={yExtent} />
        <ScaleRadius domain={popExtent} />
        {/* <Legend /> */}
        {/* <GGTooltip /> */}
        <Theme
          grid={{ stroke: null }}
          axisX={{ showAxisLine: true }}
        />
        <ScaleFill domain={continents} />
        <ScaleStroke domain={continents} />
      </GG>
      <CountryFilter onChange={(e) => {
        const thisCountry = e.target.value
        const thisContinent = data.find(d => d.country === thisCountry)?.continent

        setSelectedCountry(thisCountry)
        if (thisContinent && !selectedContinents.includes(thisContinent)) {
          setSelectedContinents((prev) => [...prev, thisContinent])
        }
      }} />
      <YearFilter onChange={e => setSelectedYear(Number(e.target.value))} />
    </div>
  )
}

export default App
