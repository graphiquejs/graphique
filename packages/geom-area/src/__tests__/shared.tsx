import React from 'react'
import { Stock, stocks } from '@graphique/datasets'
import { GG, Aes, defaultScheme } from '@graphique/graphique'
import { setup } from '../../../../test/utils'
import { GeomArea } from '..'

const GROUPS = Array.from(new Set(stocks.map(c => c.symbol)))
const NUM_GROUPS = GROUPS.length
const DEFAULT_AES: Aes = {
  x: (d: Stock) => new Date(d.date),
  y: (d: Stock) => d.marketCap,
  fill: (d: Stock) => d.symbol
}
const DEFAULT_GROUP_FILLS = defaultScheme.slice(0, NUM_GROUPS)
const DEFAULT_FILL = '#777777ee'

interface AreaProps<T> {
  data: T[]
  aes: Aes
  children?: React.ReactNode
}

const DEFAULT_DATA = stocks.filter((d => (
  new Date(d.date) >= new Date('2019-07-01')
)))

const DEFAULT_AREA_PROPS: AreaProps<Stock> = {
  data: DEFAULT_DATA,
  aes: DEFAULT_AES,
  children: <GeomArea />
}

const GGArea: React.FC<AreaProps<unknown>> = (props = DEFAULT_AREA_PROPS) => (
  <GG
    data={props.data}
    aes={props.aes}
  >
    {props.children}
  </GG>
)

export { undefinedYValData } from '../../../geom-line/src/__tests__/__data__/discontinuousData'
export {
  GROUPS,
  NUM_GROUPS,
  DEFAULT_AES,
  DEFAULT_FILL,
  DEFAULT_GROUP_FILLS,
  DEFAULT_AREA_PROPS,
  DEFAULT_DATA,
  setup,
  GGArea,
  type AreaProps,
}