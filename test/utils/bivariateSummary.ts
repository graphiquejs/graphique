const bivariateSummary = <T,>(
  data: T[],
  var1: keyof T,
  var2?: keyof T,
  countAccessor: (datum?: T) => number | undefined = () => 1,
  summaryType: ('sum' | 'avg') = 'sum'
) => {
  const summaryMap = new Map<string, number>()
  const filteredData = data.filter(countAccessor)

  filteredData.forEach((d) => {
    const key = var2 ? `${d[var1]}-${d[var2]}` : `${d[var1]}`

    const total = summaryMap.get(key) ?? 0
    const runningTotal = (total + (countAccessor(d) ?? 0))

    summaryMap.set(key, runningTotal)
  })

  return Array.from(summaryMap).map((r) => {
    const [val1, val2] = r[0].split('-')
    const groupLength = filteredData.filter((fd => (
      var2
        ? fd[var1] === val1 && fd[var2] === val2
        : fd[var1] === val1
    ))).length

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
    ) as (T & { count: number })
  })
}

export { bivariateSummary }