import dependencies from '#/input/geom-tile/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const scaleDeps = {
  '@types/d3-scale': '^4.0.8',
  '@types/d3-scale-chromatic': '^3.0.3',
}

const src = `import {
  GG, Labels, LegendOrientation, Theme, Tooltip, ScaleFill,
} from '@graphique/graphique';
import { GeomTile, Legend } from '@graphique/geom-tile';
import { crimes } from '@graphique/datasets';
import { schemeBlues } from 'd3-scale-chromatic';
import { scaleQuantile } from 'd3-scale';

const App = () => (
  <GG
    data={crimes.filter((d) => d.offenseCategory === 'Assault')}
    aes={{
      x: (d) => d.hr,
      y: (d) => d.dow,
      fill: (d) => d.count,
    }}
    isContainerWidth
    height={70}
    margin={{ top: 10, right: 0, bottom: 0, left: 10 }}
  >
    <GeomTile
      xPadding={0.04}
      yPadding={0.14}
      unfocusedStyle={{ fillOpacity: 0.35 }}
    />
    <ScaleFill
      type={scaleQuantile}
      values={schemeBlues[9].toReversed().slice(0, 7)}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
    <Tooltip content={() => null} />
    <Theme axisX={null} axisY={null} />
  </GG>
);`

export const Ordinal = () => (
  <CodeEditor
    src={src}
    additionalDeps={{ ...dependencies, ...scaleDeps }}
    additionalFiles={additionalFiles}
    height={160}
  />
)
