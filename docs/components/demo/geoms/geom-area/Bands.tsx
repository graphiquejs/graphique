import dependencies from '#/input/geom-area/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, BrushAction, Labels, LegendOrientation } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomArea, Legend, Position } from '@graphique/geom-area';

const App = () => (
  <GG
    data={stocks.filter((d) => ['AAPL', 'NVDA'].includes(d.symbol))}
    aes={{
      x: (d) => new Date(d.date),
      fill: (d) => d.symbol,
      stroke: (d) => d.symbol,
    }}
    isContainerWidth
    height={380}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
  >
    <GeomArea
      aes={{
        y0: (d) => d.marketCap,
        y1: (d) => d.marketCap * 1.2,
      }}
      attr={{ fillOpacity: 0.4, strokeWidth: 1 }}
      brushAction={BrushAction.ZOOM}
    />
    <Labels header={ <Legend orientation={LegendOrientation.H} /> } />
  </GG>
);`

export const Bands = () => (
  <CodeEditor
    src={src}
    height={425}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
