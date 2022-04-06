/* eslint-disable import/no-extraneous-dependencies */

import React from 'react'
import { GG } from '@graphique/graphique'
import { stocks, Stock } from '@graphique/datasets'
// import { GeomLine } from '@graphique/geom-line'
// import { GeomPoint } from '@graphique/geom-point'
import { GeomArea, Legend } from '@graphique/geom-area'
import { curveStep } from 'd3-shape'

function App() {
  return (
    <>
      <div>
        <GG
          // data={stocks}
          data={stocks.filter(
            (d) => new Date(d.date) >= new Date('2020/01/01')
          )}
          // data={stocks
          //   .filter((d) => ['AAPL', 'AMZN'].includes(d.symbol))
          //   .map((d) => {
          //     const dDate = new Date(d.date)
          //     const shouldRemove =
          //       dDate >= new Date('2020/01/01') &&
          //       dDate <= new Date('2020/06/01')

          //     return shouldRemove ? { ...d, marketCap: null } : d
          //   })}
          // .filter((d) => d.symbol === 'AAPL')
          // }
          aes={{
            x: (d: Stock) => new Date(d.date),
            y: (d: Stock) => d.marketCap,
            fill: (d: Stock) => d.symbol,
            // fill: (d: Stock) =>
            //   ['AAPL', 'MSFT'].includes(d.symbol) ? 'yes' : 'no',
            // stroke: (d: Stock) => d.symbol,
          }}
          margin={{
            left: 50,
          }}
          isContainerWidth
        >
          <GeomArea
            // fill="tomato"
            position="stack"
            stroke="#fff"
            curve={curveStep}
            fillOpacity={0.5}
            // showTooltip={false}
            aes={{
              x: (d: Stock) => new Date(d.date),
              // y0: (d: Stock) => d.marketCap - d.marketCap * 0.1,
              // y1: (d: Stock) => d.marketCap + d.marketCap * 0.3,
              // fill: (d: Stock) => d.symbol,
            }}
          />
          {/* <GeomPoint r={2} fill="tomato" opacity={0.5} /> */}
          {/* <GeomLine strokeWidth={1.4} strokeOpacity={0.7} /> */}
          <Legend style={{ padding: 12 }} orientation="horizontal" />
        </GG>
      </div>
          <div>
        <GG
          // data={stocks}
          data={stocks.filter(
            (d) => new Date(d.date) >= new Date('2020/01/01')
          )}
          // data={stocks
          //   .filter((d) => ['AAPL', 'AMZN'].includes(d.symbol))
          //   .map((d) => {
          //     const dDate = new Date(d.date)
          //     const shouldRemove =
          //       dDate >= new Date('2020/01/01') &&
          //       dDate <= new Date('2020/06/01')

          //     return shouldRemove ? { ...d, marketCap: null } : d
          //   })}
          // .filter((d) => d.symbol === 'AAPL')
          // }
          aes={{
            x: (d: Stock) => new Date(d.date),
            y: (d: Stock) => d.marketCap,
            fill: (d: Stock) => d.symbol,
            // fill: (d: Stock) =>
            //   ['AAPL', 'MSFT'].includes(d.symbol) ? 'yes' : 'no',
            // stroke: (d: Stock) => d.symbol,
          }}
          margin={{
            left: 50,
          }}
          isContainerWidth
        >
          <GeomArea
            // fill="tomato"
            position="stack"
            stroke="#fff"
            curve={curveStep}
            fillOpacity={0.5}
            // showTooltip={false}
            aes={{
              x: (d: Stock) => new Date(d.date),
              // y0: (d: Stock) => d.marketCap - d.marketCap * 0.1,
              // y1: (d: Stock) => d.marketCap + d.marketCap * 0.3,
              // fill: (d: Stock) => d.symbol,
            }}
          />
          {/* <GeomPoint r={2} fill="tomato" opacity={0.5} /> */}
          {/* <GeomLine strokeWidth={1.4} strokeOpacity={0.7} /> */}
          <Legend style={{ padding: 12 }} orientation="horizontal" />
        </GG>
      </div>
      {/* <div>
        <GG
          data={stocks.filter((d) => d.symbol === "AAPL")}
          aes={{
            x: (d: Stock) => new Date(d.date),
            y: (d: Stock) => d.marketCap,
          }}
          margin={{
            left: 50,
          }}
          isContainerWidth
        >
          <GeomLine stroke="steelblue" showTooltip={false} />
          <GeomArea
            fill="steelblue"
            opacity={0.3}
            // aes={{
            //   x: (d: Stock) => new Date(d.date),
            //   y0: (d: Stock) => d.marketCap - 100,
            //   y1: (d: Stock) => d.marketCap + 100,
            // }}
          />
          <ScaleY domain={[0, 3000]} />
        </GG>
      </div> */}
    </>
  )
}

export default App
