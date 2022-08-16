/* eslint-disable import/no-extraneous-dependencies */

import React, { useState } from 'react'
import { GG, Labels, Tooltip } from '@graphique/graphique'
import { stocks, Stock } from '@graphique/datasets'
import { GeomLine } from '@graphique/geom-line'

const dualData = stocks.filter((d) => ['AAPL', 'AMZN'].includes(d.symbol))

function App() {
  const [focusedIndex, setFocusedIndex] = useState<number[] | undefined>()

  return (
    <>
      <div style={{ maxWidth: 1200 }}>
        <GG
          data={dualData}
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
            onDatumFocus={(d, i) => {
              setFocusedIndex(i)
            }}
            onExit={() => setFocusedIndex(undefined)}
          />
          <Tooltip
            datum={
              typeof focusedIndex === 'undefined'
                ? undefined
                : dualData.filter(
                    (d) => d.date === dualData[focusedIndex[0]].date
                  )
            }
          />
        </GG>
        {Array.from(new Set(stocks.map((s) => s.symbol)))
          .filter((s) => !['AAPL', 'AMZN'].includes(s))
          .map((sym) => {
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
                  onDatumFocus={(d, i) => setFocusedIndex(i)}
                  onExit={() => setFocusedIndex(undefined)}
                />
                <Labels y={sym} />
                <Tooltip
                  datum={
                    typeof focusedIndex === 'undefined'
                      ? undefined
                      : [stockData[focusedIndex[0]]]
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
