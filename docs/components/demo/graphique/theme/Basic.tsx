import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import {
  GG, Labels, BrushAction, LegendOrientation, Theme,
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
    <Theme
      animationDuration={300}
      font={{ family: 'monospace' }}
      grid={{ stroke: null }}
      axis={{
        showAxisLine: true,
        stroke: 'dodgerblue',
        tickStroke: 'dodgerblue',
        tickLabel: { color: 'crimson' },
      }}
      headerColor="crimson"
      legend={{ labelColor: 'dodgerblue' }}
      tooltip={{ groupLabel: { fontSize: '1.1rem' } }}
    />
    <Labels
      header={
        <Legend title="Species" orientation={LegendOrientation.H} />
      }
      x="Body mass (g)"
      y="Flipper length (mm)"
    />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    height={530}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
