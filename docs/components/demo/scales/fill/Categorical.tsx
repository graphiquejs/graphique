import dependencies from '#/input/geom-tile/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import {
  GG, Labels, LegendOrientation, Theme, Tooltip, ScaleFill, ScaleX,
} from '@graphique/graphique';
import { GeomTile, Legend } from '@graphique/geom-tile';
import { crimes } from '@graphique/datasets';

const xVals = Array.from(new Set(crimes.map((d) => d.hr)));

const App = () => (
  <GG
    data={crimes.filter((d) => d.offenseCategory === 'Assault')}
    aes={{
      x: (d) => d.hr,
      y: (d) => d.dow,
      fill: (d) => Math.floor(d.count) % 2 === 0 ? 'yes' : 'no',
    }}
    isContainerWidth
    height={80}
    margin={{ top: 20, right: 0, bottom: 0, left: 10 }}
  >
    <GeomTile
      xPadding={0.04}
      yPadding={0.14}
      unfocusedStyle={{ fillOpacity: 0.35 }}
    />
    <ScaleFill
      domain={['yes', 'no', 'maybe?']}
      values={['coral', 'darkseagreen', 'steelblue']}
    />
    <ScaleX domain={xVals} />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
    <Tooltip content={() => null} />
    <Theme axisX={null} axisY={null} />
  </GG>
);`

export const Categorical = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
    height={160}
  />
)
