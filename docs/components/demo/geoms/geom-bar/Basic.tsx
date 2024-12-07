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

const src = `import { GG } from '@graphique/graphique';
import { GeomBar } from '@graphique/geom-bar';
import { data } from './data';

const App = () => (
  <GG
    data={data}
    aes={{
      x: (d) => d.count,
      y: (d) => d.dow,
    }}
    margin={{ top: 20, right: 5, left: 80 }}
    height={276}
    isContainerWidth
  >
    <GeomBar attr={{ fill: "#4c9d90" }} />
  </GG>
);`

export const Basic = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    height={280}
    showTabs
  />
)
