import dependencies from '#/input/geom-tile/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import {
  GG, Labels, LegendOrientation, ScaleX, ScaleY,
} from '@graphique/graphique';
import { GeomTile, Legend } from '@graphique/geom-tile';
import { crimes } from '@graphique/datasets';

const App = () => (
  <GG
    data={crimes.filter((d) => d.offenseCategory === 'Theft')}
    aes={{
      x: (d) => d.hr,
      y: (d) => d.dow,
      fill: (d) => d.count,
    }}
    margin={{ top: 5, right: 0, bottom: 20, left: 35 }}
    height={276}
    isContainerWidth
  >
    <GeomTile xPadding={0.03} yPadding={0.03} />
    <ScaleX
      format={({ value, width }) => {
        const tickDivisor = width < 530 ? 4 : 2
        return Number(value.split(' ')[0]) % tickDivisor === 0 ? value : ''
      }}
    />
    <ScaleY
      highlightOnFocus
      format={({ value }) => value.slice(0, 2)}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Continuous = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={335}
  />
)
