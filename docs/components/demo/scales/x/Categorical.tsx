import dependencies from '#/input/geom-col/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const files = {
  'data.ts': {
    code: `import { penguins, type Penguin } from '@graphique/datasets';
import { bivariateSummary } from './utils';

type PenguinCount = Penguin & {
  count: number
}

export const data: PenguinCount[] = bivariateSummary({
  data: penguins,
  var1: 'island',
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

const src = `import { GG, ScaleX, Tooltip, TooltipPosition } from '@graphique/graphique';
import { GeomCol } from '@graphique/geom-col';
import { data } from './data';

const App = () => (
  <GG
    data={data}
    aes={{
      x: (d) => d.island,
      y: (d) => d.count,
    }}
    margin={{ top: 50, right: 5, left: 40 }}
    height={276}
    isContainerWidth
  >
    <GeomCol attr={{ fill: "#4c9d90" }} xPadding={0.3} />
    <Tooltip position={TooltipPosition.TOP} />
    <ScaleX highlightOnFocus domain={['Torgersen', 'Biscoe', 'Aruba', 'Dream']} />
  </GG>
);`

export const Categorical = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    height={280}
    showTabs
  />
)
