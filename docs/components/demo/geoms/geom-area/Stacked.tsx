import dependencies from '#/input/geom-area/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, BrushAction, Labels, LegendOrientation } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomArea, Legend, Position } from '@graphique/geom-area';

const App = () => (
  <GG
    data={stocks}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
      fill: (d) => d.symbol,
      stroke: (d) => d.symbol,
    }}
    isContainerWidth
    height={380}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
  >
    <GeomArea
      attr={{ fillOpacity: 0.4, strokeWidth: 1 }}
      brushAction={BrushAction.ZOOM}
      position={Position.STACK}
    />
    <Labels header={ <Legend orientation={LegendOrientation.H} /> } />
  </GG>
);`

export const Stacked = () => (
  <CodeEditor
    src={src}
    height={425}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
