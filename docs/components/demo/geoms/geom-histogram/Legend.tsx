import dependencies from '#/input/geom-histogram/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import {
  GG, Labels, Tooltip, TooltipPosition, LegendOrientation, BrushAction,
} from '@graphique/graphique';
import { GeomHistogram, Legend } from '@graphique/geom-histogram';
import { penguins } from '@graphique/datasets';

const App = () => (
  <GG
    data={penguins}
    aes={{ x: (d) => d.bodyMass, fill: (d) => d.species }}
    margin={{ top: 50, bottom: 20, left: 30 }}
    height={410}
    isContainerWidth
  >
    <GeomHistogram
      attr={{ fillOpacity: 0.5 }}
      focusedStyle={{ fillOpacity: 0.65, stroke: '#111' }}
      unfocusedStyle={{ fillOpacity: 0.15, stroke: 'transparent' }}
      brushAction={BrushAction.ZOOM}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
    <Tooltip position={TooltipPosition.TOP} />
  </GG>
);`

export const Legend = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
