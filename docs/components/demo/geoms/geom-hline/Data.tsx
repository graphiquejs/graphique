import dependencies from '#/input/geom-hline/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, Labels, LegendOrientation } from '@graphique/graphique';
import { penguins, type Penguin } from '@graphique/datasets';
import { GeomPoint, Legend } from '@graphique/geom-point';
import { GeomHLine } from '@graphique/geom-hline';
import { flatRollup, median } from 'd3-array';

const measurement: keyof Penguin = 'flipperLength';

const medians = flatRollup(
  penguins,
  (values) => median(values, (d) => d[measurement]),
  (d) => d.species,
).map(([key, value]) => ({
  species: key,
  [measurement]: value,
}));

const App = () => (
  <GG
    data={penguins}
    aes={{
      x: (d) => d.beakLength,
      y: (d) => d[measurement],
      fill: (d) => d.species,
      stroke: (d) => d.species,
    }}
    isContainerWidth
    margin={{ left: 45 }}
  >
    <GeomPoint
      attr={{ fillOpacity: 0.3, strokeOpacity: 0.4 }}
      showTooltip={false}
    />
    <GeomHLine
      data={medians}
      attr={{ strokeDasharray: '5,2' }}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Data = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={486}
  />
)
