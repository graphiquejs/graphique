import dependencies from '#/input/geom-area/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const src = `import { GG, BrushAction } from '@graphique/graphique';
import { stocks } from '@graphique/datasets';
import { GeomArea } from '@graphique/geom-area';

const App = () => (
  <GG
    data={stocks.filter((d) => d.symbol === 'NVDA')}
    aes={{
      x: (d) => new Date(d.date),
      y: (d) => d.marketCap,
    }}
    isContainerWidth
    height={360}
    margin={{ top: 20, right: 5, bottom: 20, left: 50 }}
  >
    <GeomArea
      attr={{
        fillOpacity: 0.4,
        strokeWidth: 1,
        fill: "#6aafa3",
        stroke: "#6aafa3",
      }}
      brushAction={BrushAction.ZOOM}
    />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    height={370}
    additionalDeps={dependencies}
    additionalFiles={additionalFiles}
  />
)
