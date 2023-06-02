/* eslint-disable import/no-extraneous-dependencies */
import React from 'react'
import {
  GG,
  ScaleRadius,
} from '@graphique/graphique'
import { penguins, Penguin } from '@graphique/datasets'
import { GeomPoint, Legend, SizeLegend } from '@graphique/geom-point'

function App() {
  return (
    <div style={{ maxWidth: 1200, padding: '0 10px' }}>
      <div>
        <GG
          data={penguins}
          aes={{
            x: (d: Penguin) => d.flipperLength,
            y: (d: Penguin) => d.bodyMass,
            fill: (d: Penguin) => d.species,
          }}
          margin={{ left: 50 }}
        >
          <GeomPoint
            isClipped={false}
            aes={{
              size: (d: Penguin) => d.beakDepth
            }}
            opacity={0.6}
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
