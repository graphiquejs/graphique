import dependencies from '#/input/geom-bar/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const files = {
  'data.ts': {
    code: `import { crimes, type Crime } from '@graphique/datasets';
import { bivariateSummary } from './utils';

type CrimeCount = Crime & {
  count: number
}

export const data: CrimeCount[] = bivariateSummary({
  data: crimes,
  var1: 'dow',
  var2: 'offenseCategory',
  countAccessor: (d) => d?.count,
});
`,
  },
  '/utils.ts': {
    code: `interface SummaryParams<T> {
  data: T[]
  var1: keyof T
  var2?: keyof T
  countAccessor?: (datum?: T) => number | undefined
  summaryType?: 'sum' | 'avg'
}

const bivariateSummary = <T,>({
  data,
  var1,
  var2,
  countAccessor = () => 1,
  summaryType = 'sum',
}: SummaryParams<T>) => {
  const summaryMap = new Map<string, number>()
  const filteredData = data.filter(countAccessor)

  filteredData.forEach((d) => {
    const key = var2 ? \`$\{d[var1]}-$\{d[var2]}\` : \`$\{d[var1]}\`

    const total = summaryMap.get(key) ?? 0
    const runningTotal = total + (countAccessor(d) ?? 0)

    summaryMap.set(key, runningTotal)
  })

  return Array.from(summaryMap).map((r) => {
    const [val1, val2] = r[0].split('-')
    const groupLength = filteredData.filter((fd) =>
      var2 ? fd[var1] === val1 && fd[var2] === val2 : fd[var1] === val1,
    ).length

    const out = {
      [var1]: val1,
      count: summaryType === 'avg' ? r[1] / groupLength : r[1],
    }

    return (
      var2
        ? {
            ...out,
            [var2]: val2,
          }
        : out
    ) as T & { count: number }
  })
}

export { bivariateSummary }
`,
  },
}

const src = `import {
  GG, Labels, LegendOrientation, ScaleX, Tooltip, TooltipPosition,
} from '@graphique/graphique';
import {
  GeomCol, Legend, FocusType, Position,
} from '@graphique/geom-col';
import { data } from './data';

const App = () => (
  <GG
    data={data}
    aes={{
      x: (d) => d.dow,
      y: (d) => d.count,
      fill: (d) => d.offenseCategory,
    }}
    margin={{ top: 30, right: 0, left: 50 }}
    height={320}
    isContainerWidth
  >
    <GeomCol position={Position.DODGE} focusType={FocusType.INDIVIDUAL} />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
    <ScaleX
      highlightOnFocus
      format={({ value, width }) =>
        width < 700 ? value.slice(0, 3) : value
      }
    />
    <Tooltip position={TooltipPosition.TOP} />
  </GG>
);`

export const Dodged = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    height={360}
    showTabs
  />
)
