/* eslint-disable import/no-extraneous-dependencies */

import React, { useState } from 'react'
import { GG, Labels, Tooltip } from '@graphique/graphique'
import { stocks, Stock } from '@graphique/datasets'
import { GeomLine } from '@graphique/geom-line'

function App() {
  // const [yDomain, setYDomain] = useState<number[]>()
  // useEffect(() => setYDomain([900, 2000]), [])

  const [focusedIndex, setFocusedIndex] = useState<number | undefined>()

  return (
    <>
      <div style={{ maxWidth: 1200 }}>
        {Array.from(new Set(stocks.map((s) => s.symbol))).map((sym) => {
          const stockData = stocks.filter((s) => s.symbol === sym)
          return (
            <GG
              key={sym}
              data={stockData}
              aes={{
                x: (d: Stock) => new Date(d.date),
                y: (d: Stock) => d.marketCap,
                stroke: (d: Stock) => d.symbol,
              }}
              height={150}
              isContainerWidth
              margin={{ left: 50 }}
            >
              <GeomLine
                onDatumFocus={(d, i) => setFocusedIndex(i as number)}
                onExit={() => setFocusedIndex(undefined)}
              />
              <Labels y={sym} />
              <Tooltip
                datum={
                  typeof focusedIndex === 'undefined'
                    ? undefined
                    : [stockData[focusedIndex]]
                }
              />
            </GG>
          )
        })}
      </div>
    </>
  )
}

export default App
