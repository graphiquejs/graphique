import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, BrushAction } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomPoint } from '@graphique/geom-point';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.bodyMass,
      y: (d) => d.flipperLength,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomPoint
      attr={{ fill: "#6aafa3" }}
      brushAction={BrushAction.ZOOM}
    />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
