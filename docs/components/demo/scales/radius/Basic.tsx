import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, Labels, ScaleRadius } from '@graphique/graphique';
import { penguins } from '@graphique/datasets';
import { GeomPoint, SizeLegend } from '@graphique/geom-point';

const App = () => (
  <GG
    data={penguins.filter((d) => d.island === 'Torgersen')}
    aes={{
      x: () => '',
      y: (d) => d.flipperLength,
      size: (d) => d.bodyMass,
      label: (d) => d.bodyMass!.toLocaleString(),
    }}
    margin={{ top: 45, left: 45 }}
    isContainerWidth
  >
    <GeomPoint
      attr={{ fill: 'none', stroke: '#6aafa3', strokeOpacity: 0.3 }}
      focusedStyle={{ strokeOpacity: 1 }}
    />
    <Labels header={<SizeLegend width={150} />} />
    <ScaleRadius domain={[2000, 4700]} range={[5, 50]} />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    height={575}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
