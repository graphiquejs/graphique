import { isDate } from "./dates"

export const widen = (
  data: unknown[],
  pivot: (d: unknown) => any,
  getGroup: (d: unknown) => any,
  count: (d: unknown) => any
) => {
  const pivots = Array.from(new Set(data.map(pivot)))
  const groups = Array.from(new Set(data.map(getGroup)))
  return pivots.map((p, i) => {
    const out: any = { key: isDate(p) ? p.valueOf() : p, i }
    groups.forEach((g) => {
      const pivotGroup = data.find(
        d =>
          (isDate(pivot(d))
            ? pivot(d).valueOf() === p.valueOf()
            : pivot(d) === p) && getGroup(d) === g
      )
      out[g] = pivotGroup ? count(pivotGroup) : undefined
    })
    return out
  })
}
