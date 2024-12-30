import dependencies from '#/input/geom-point/build/dependencies'
import { CodeEditor } from '../../CodeEditor'
import { additionalFiles } from './additionalFiles'

const scaleDeps = {
  '@types/d3-scale': '^4.0.8',
  '@types/d3-scale-chromatic': '^3.0.3',
}

const files = {
  '/utils.ts': {
    code: `// formats numbers as dollar values
const formatGDP = (v: number, includeCents = true): string => (
  v.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: !includeCents ? 0 : undefined,
  })
);
    
// generate sequence of log tick labels and format them as decimal-less $
const MAX_EXPONENT = 6;
const EXPONENTS = Array.from(Array(MAX_EXPONENT).keys());
const BASE = 10;
const generateTickSequence = (vals: number[]): number[] => (
  EXPONENTS.flatMap((x: number) => vals.map((v) => v * (BASE ** x)))
);
const INITIAL_VALS = [1, 2, 5];
const LOG_SCALE_TICKS = [0, ...generateTickSequence(INITIAL_VALS)];
 
const formatXTick = ({ value }: { value: number }): string => (
  LOG_SCALE_TICKS.includes(value)
    ? formatGDP(value, false) // no decimal
    : ''
);

// show fewer x ticks when the chart is narrow. otherwise, use Graphique's default
const NARROW_WIDTH = 600;
const NUM_NARROW_TICKS = 2;
const getNumXTicks = (width: number): number | undefined => (
  width < NARROW_WIDTH ? NUM_NARROW_TICKS : undefined
);

export { formatXTick, getNumXTicks }
`,
  },
}

const src = `import { GG, BrushAction, ScaleX } from '@graphique/graphique';
import { gapminder } from '@graphique/datasets';
import { GeomPoint } from '@graphique/geom-point';
import { scaleLog } from 'd3-scale';
import { formatXTick, getNumXTicks } from './utils';

const App = () => (
  <GG
    data={gapminder.filter((d) => d.year === 2007)}
    aes={{
      x: (d) => d.gdpPercap,
      y: (d) => d.lifeExp,
    }}
    margin={{ left: 45 }}
    isContainerWidth
  >
    <GeomPoint
      attr={{ fill: "#6aafa3", fillOpacity: 0.4 }}
      focusedStyle={{ fillOpacity: 1 }}
      brushAction={BrushAction.ZOOM}
    />
    <ScaleX
      type={scaleLog}
      format={formatXTick}
      numTicks={getNumXTicks}
    />
  </GG>
);`

export const Continuous = () => (
  <CodeEditor
    src={src}
    additionalDeps={{ ...dependencies, ...scaleDeps }}
    additionalFiles={{ ...additionalFiles, ...files }}
    showTabs
  />
)
