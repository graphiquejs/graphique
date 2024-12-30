import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { 
  GG, Labels, BrushAction, LegendOrientation, ScaleStroke,
} from '@graphique/graphique';
import { GeomLine, Legend } from '@graphique/geom-line';
import { stocks } from '@graphique/datasets';

const App = () => (
  <GG
    data={stocks.filter((d) => ['AAPL', 'NVDA'].includes(d.symbol))}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
      stroke: (d) => d.symbol,
    }}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
    height={350}
    isContainerWidth
  >
    <GeomLine brushAction={BrushAction.ZOOM} />
    <ScaleStroke
      domain={['AAPL', 'NVDA', 'META']}
      values={['coral', 'darkseagreen', 'steelblue']}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={400}
  />
)
