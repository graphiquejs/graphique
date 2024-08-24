/* eslint-disable import/no-extraneous-dependencies */
import React from 'react'
import { GG, ScaleRadius } from '@graphique/graphique'
import { penguins, Penguin } from '@graphique/datasets'
import { GeomPoint, Legend, SizeLegend } from '@graphique/geom-point'
import { GeomVLine } from '@graphique/geom-vline'
import { GeomHLine } from '@graphique/geom-hline'

function App() {
  return (
    <div style={{ maxWidth: 1200, padding: '0 10px' }}>
      <div>
        <GG
          data={penguins}
          aes={{
            x: (d) => d.flipperLength,
            y: (d) => d.bodyMass,
            fill: (d) => d.species,
          }}
          margin={{ left: 50 }}
        >
          <GeomPoint<Penguin>
            isClipped={false}
            aes={{
              size: (d) => d.beakDepth,
            }}
            opacity={0.6}
          />
          <GeomVLine<Partial<Penguin>>
            data={[{ flipperLength: 200 }]}
            showTooltip={false}
          />
          <GeomHLine<Partial<Penguin>>
            data={[{ bodyMass: 4000 }]}
            showTooltip={false}
          />
          <Legend />
          <SizeLegend />
          <ScaleRadius range={[3, 25]} />
        </GG>
      </div>
    </div>
  )
}

export default App
