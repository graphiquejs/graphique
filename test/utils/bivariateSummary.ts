const bivariateSummary = <T,>(
  data: T[],
  var1: keyof T,
  var2?: keyof T,
  countAccessor: (datum?: T) => number | undefined = () => 1,
) => {
  const summaryMap = new Map<string, number>()

  data.forEach((d) => {
    const key = var2 ? `${d[var1]}-${d[var2]}` : `${d[var1]}`

    const total = summaryMap.get(key) ?? 0
    const runningTotal = total + (countAccessor(d) ?? 0)

    summaryMap.set(key, runningTotal)
  })

  return Array.from(summaryMap).map((r) => {
    const [val1, val2] = r[0].split('-')

    const out = {
      [var1]: val1,
      count: r[1],
    }

    return (
      var2
        ? {
          ...out,
          [var2]: val2,
        } 
        : out
    ) as (T & { count: number })
  })
}

export { bivariateSummary }