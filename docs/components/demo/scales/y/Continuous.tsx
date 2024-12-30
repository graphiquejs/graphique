import dependencies from '#/input/geom-line/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const scaleDeps = {
  '@types/d3-scale': '^4.0.8',
  '@types/d3-scale-chromatic': '^3.0.3',
}

const src = `import { GG, BrushAction, ScaleY } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomLine } from '@graphique/geom-line';
import { scaleLog } from 'd3-scale';

const factor = Math.random() * 1000;

const App = () => (
  <GG
    data={stocks.filter((d) => d.symbol === 'NVDA')}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap * factor,
    }}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
    height={350}
    isContainerWidth
  >
    <GeomLine
      attr={{ stroke: "#6aafa3" }}
      brushAction={BrushAction.ZOOM}
    />
    <ScaleY
      type={scaleLog}
      numTicks={3}
      reverse
    />
  </GG>
);`

export const Continuous = () => (
  <CodeEditor
    src={src}
    height={370}
    additionalDeps={{ ...dependencies, ...scaleDeps }}
    additionalFiles={additionalFiles}
  />
)
