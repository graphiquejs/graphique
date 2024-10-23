import { GG, Labels } from '@graphique/graphique'
import { GeomLine, Legend } from '@graphique/geom-line'
import { stocks } from '@graphique/datasets'
import './App.css'

function App() {
  return (
    <section>
      <h1>A Graphique Sandbox</h1>
      <div style={{ maxWidth: 1000 }}>
        <GG
          data={stocks}
          aes={{
            x: (d) => new Date(d.date),
            y: (d) => d.marketCap,
            stroke: (d) => d.symbol,
          }}
          isContainerWidth
          margin={{ left: 50 }}
        >
          <GeomLine brushAction="zoom" />
          <Labels header={<Legend orientation="horizontal" />} />
        </GG>
      </div>
    </section>
  )
}

export default App
