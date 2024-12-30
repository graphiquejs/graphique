import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { 
  GG, Labels, BrushAction, LegendOrientation,
} from '@graphique/graphique';
import { GeomLine, Legend } from '@graphique/geom-line';
import { stocks } from '@graphique/datasets';

const App = () => (
  <GG
    data={stocks}
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
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Legend = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={400}
  />
)
