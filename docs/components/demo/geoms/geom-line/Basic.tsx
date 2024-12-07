import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, BrushAction } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomLine } from '@graphique/geom-line';

const App = () => (
  <GG
    data={stocks.filter((d) => d.symbol === 'NVDA')}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
    }}
    margin={{
      top: 20,
      right: 5,
      bottom: 20,
      left: 50,
    }}
    height={350}
    isContainerWidth
  >
    <GeomLine
      attr={{ stroke: "#6aafa3" }}
      brushAction={BrushAction.ZOOM}
    />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    height={370}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
