import { stocks } from '@graphique/datasets'

const aaplMarketcap = stocks.filter((d) => (
  d.symbol === 'AAPL' &&
  new Date(d.date) >= new Date('2019-07-01')
))

export { aaplMarketcap }