import { stocks, type Stock } from '@graphique/datasets'

const MIN_DATE = new Date(2020, 0, 1)
const MAX_DATE = new Date(2021, 0, 1)

const undefinedYValData = stocks.map((s) => {
  const dateVal = new Date(s.date)
  const isInRange = dateVal >= MIN_DATE && dateVal < MAX_DATE

  return ({
    ...s,
    marketCap: isInRange ? undefined : s.marketCap,
  })
}) as Stock[]

export { undefinedYValData }