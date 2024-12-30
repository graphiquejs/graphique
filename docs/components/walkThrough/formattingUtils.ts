// formats numbers as dollar values
const formatGDP = (v: number, includeCents = true): string =>
  v.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: !includeCents ? 0 : undefined,
  })

// generate sequence of log tick labels and format them as decimal-less $
const MAX_EXPONENT = 6
const EXPONENTS = Array.from(Array(MAX_EXPONENT).keys())
const BASE = 10
const generateTickSequence = (vals: number[]): number[] =>
  EXPONENTS.flatMap((x: number) => vals.map((v) => v * BASE ** x))
const INITIAL_VALS = [1, 2, 5]
const LOG_SCALE_TICKS = [0, ...generateTickSequence(INITIAL_VALS)]

const formatXTick = ({ value }: { value: number }): string =>
  LOG_SCALE_TICKS.includes(value)
    ? formatGDP(value, false) // no decimal
    : ''

// show fewer x ticks when the chart is narrow. otherwise, use Graphique's default
const NARROW_WIDTH = 600
const NUM_NARROW_TICKS = 2
const getNumXTicks = (width: number): number | undefined =>
  width < NARROW_WIDTH ? NUM_NARROW_TICKS : undefined

const formatPop = (v: number): string => {
  const B = 1000000000
  const M = 1000000

  if (v >= B) {
    return `${(v / B).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`
  }
  if (v >= M) {
    return `${v / M}M`
  }
  return v.toLocaleString()
}

export { formatGDP, formatXTick, getNumXTicks, formatPop }
