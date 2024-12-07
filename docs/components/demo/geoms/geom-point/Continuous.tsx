import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, Labels, BrushAction } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomPoint, Legend } from '@graphique/geom-point';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.beakLength,
      y: (d) => d.flipperLength,
      fill: (d) => d.bodyMass,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomPoint brushAction={BrushAction.ZOOM} />
    <Labels header={<Legend />} />
  </GG>
);`

export const Continuous = () => (
  <CodeEditor
    src={src}
    height={494}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
