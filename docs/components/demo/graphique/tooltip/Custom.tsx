import dependencies from '#/input/geom-bar/build/dependencies'
import { CodeEditor } from '#/components/demo/CodeEditor'
import { additionalFiles } from './additionalFiles'

const files = {
  'data.ts': {
    code: `import { crimes, type Crime } from '@graphique/datasets';
import { bivariateSummary } from './utils';

export type CrimeCount = Crime & {
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
  '/tooltipStyles.module.css': {
    code: `.group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.2rem 0.3rem 0;
  border-bottom: 1px solid #e0e0e0;
  width: 100%;
}

.group-label {
  font-weight: 500;
  font-size: 0.8rem;
}

.value {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  font-size: 0.9rem;
  padding: 0.3rem 0.2rem 0.15rem 0.2rem;
}

.value-number {
  font-weight: 500;
}

.value-percentage {
  font-weight: 300;
}
`,
  },
}

const src = `import {
  GG, Labels, LegendOrientation, Tooltip, TooltipContainer,
} from '@graphique/graphique';
import { GeomBar, Legend, FocusType, Position } from '@graphique/geom-bar';
import { data, type CrimeCount } from './data';
import styles from './tooltipStyles.module.css';

const filteredData = data.filter((d) => d.dow === 'Monday');

const App = () => (
  <GG
    data={filteredData}
    aes={{
      x: (d) => d.count,
      y: (d) => d.dow,
      fill: (d) => d.offenseCategory,
    }}
    margin={{ top: 25, right: 10, left: 10 }}
    height={130}
    isContainerWidth
  >
    <GeomBar
      focusType={FocusType.INDIVIDUAL}
      position={Position.STACK}
      xPadding={0.05}
    />
    <Tooltip<CrimeCount>
      content={(values) => {
        if (values?.[0]) {
          const { mark, group, formattedX, datum } = values[0];

          const proportion = datum?.[0]
            ? datum[0].count /
              filteredData.map((d) => d.count).reduce((a, b) => a + b)
            : 0;

          return (
            <TooltipContainer>
              <div className={styles.group}>
                {mark}
                <span className={styles["group-label"]}>
                  {String(group)}
                </span>
              </div>
              <div className={styles.value}>
                <span className={styles["value-number"]}>{formattedX}</span>
                <span className={styles["value-percentage"]}>
                  {'(' + proportion.toLocaleString(undefined, {
                    style: 'percent',
                    maximumFractionDigits: 1,
                  }) + ')'}
                </span>
              </div>
            </TooltipContainer>
          );
        }
      }}
    />
    <Labels header={<Legend orientation={LegendOrientation.H} />} />
  </GG>
);`

export const Custom = () => (
  <CodeEditor
    src={src}
    additionalDeps={dependencies}
    additionalFiles={{ ...additionalFiles, ...files }}
    height={170}
    showTabs
  />
)
