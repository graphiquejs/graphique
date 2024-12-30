import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import {
  GG, Labels, BrushAction, LegendOrientation,
} from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomPoint, Legend } from '@graphique/geom-point';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.bodyMass,
      y: (d) => d.flipperLength,
      fill: (d) => d.species,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomPoint brushAction={BrushAction.ZOOM} />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Categorical = () => (
  <CodeEditor
    src={src}
    height={486}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
