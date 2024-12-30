import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, Labels, BrushAction, LegendOrientation } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomPoint, SizeLegend, Legend } from '@graphique/geom-point';

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.beakLength,
      y: (d) => d.flipperLength,
      fill: (d) => d.species,
      stroke: (d) => d.species,
      size: (d) => d.bodyMass,
    }}
    margin={{ top: 30, right: 30, left: 45 }}
    isContainerWidth
  >
    <GeomPoint
      brushAction={BrushAction.ZOOM}
      attr={{ fillOpacity: 0.2, strokeOpacity: 0.3 }}
      focusedStyle={{ fillOpacity: 1 }}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
    <SizeLegend />
  </GG>
);`

export const Sized = () => (
  <CodeEditor
    src={src}
    height={560}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
