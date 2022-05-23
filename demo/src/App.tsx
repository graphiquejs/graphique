/* eslint-disable import/no-extraneous-dependencies */

import React from 'react'
import { GG, Labels, ScaleX, ScaleY } from '@graphique/graphique'
import { stocks, Stock, penguins, Penguin } from '@graphique/datasets'
import { GeomLine, Legend } from '@graphique/geom-line'
import { GeomHistogram } from '@graphique/geom-histogram'
// import { GeomArea } from '@graphique/geom-area'
import { GeomPoint, Legend as PointLegend } from '@graphique/geom-point'

function App() {
  return (
    <>
      <div style={{ maxWidth: 1200 }}>
        <GG
          data={stocks.filter((d) => ['AAPL', 'MSFT'].includes(d.symbol))}
          aes={{
            x: (d: Stock) => new Date(d.date),
            stroke: (d: Stock) => d.symbol,
            fill: (d: Stock) => d.symbol,
          }}
          margin={{ left: 50 }}
          isContainerWidth
        >
          {/* <GeomArea
            brushAction="zoom"
            fillOpacity={0.15}
            aes={{
              y0: (d: Stock) => d.marketCap * 0.75,
              y1: (d: Stock) => d.marketCap * 1.1,
            }}
          /> */}
          <GeomLine brushAction="zoom" aes={{ y: (d: Stock) => d.marketCap }} />
          <ScaleX reverse />
          <ScaleY domain={[900, 2000]} />
          <Legend style={{ padding: 20 }} orientation="horizontal" />
          <Labels x="hello" y="hello" />
        </GG>
        <GG
          data={penguins}
          aes={{
            x: (d: Penguin) => d.bodyMass,
            y: (d: Penguin) => d.flipperLength,
            fill: (d: Penguin) => d.species,
          }}
          margin={{ left: 50 }}
        >
          <GeomPoint brushAction="zoom" />
          <PointLegend orientation="horizontal" style={{ padding: 12 }} />
        </GG>
        <GG
          data={penguins}
          aes={{
            x: (d: Penguin) => d.bodyMass,
          }}
          isContainerWidth
        >
          <GeomHistogram
            bins={40}
            brushAction="zoom"
            stroke="#fff"
            strokeWidth={1}
          />
        </GG>
      </div>
    </>
  )
}

export default App
