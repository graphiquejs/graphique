import dependencies from '#/input/geom-histogram/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, BrushAction, Tooltip, TooltipPosition } from '@graphique/graphique';
import { GeomHistogram } from '@graphique/geom-histogram';
import { penguins } from '@graphique/datasets';

const App = () => (
  <GG
    data={penguins}
    aes={{ x: (d) => d.bodyMass }}
    margin={{ top: 55, bottom: 20, left: 30 }}
    height={440}
    isContainerWidth
  >
    <GeomHistogram
      attr={{ fill: "#4c9d90" }}
      brushAction={BrushAction.ZOOM}
    />
    <Tooltip position={TooltipPosition.TOP} />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
