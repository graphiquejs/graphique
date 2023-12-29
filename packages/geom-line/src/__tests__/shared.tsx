import React from 'react'
import {
  GG, Aes, defaultScheme, defaultDasharrays,
} from '@graphique/graphique'
import { stocks, type Stock } from '@graphique/datasets'
import { GeomLine } from '..'
import { setup } from '../../../../test/utils'

const GROUPS = Array.from(new Set(stocks.map(s => s.symbol)))
const NUM_GROUPS = GROUPS.length
const DEFAULT_GROUP_STROKES = defaultScheme.slice(0, NUM_GROUPS)
const DEFAULT_DASHARRAYS = defaultDasharrays.slice(0, NUM_GROUPS)
const DEFAULT_STROKE_WIDTH = '2.5'
const DEFAULT_SINGLE_STROKE = '#777777ee'
const DEFAULT_AES: Aes<Stock> = {
  x: d => new Date(d.date),
  y: d => d.marketCap,
  stroke: d => d.symbol,
}

interface LineProps<Datum> {
  data?: Datum[]
  aes?: Aes<Datum>
  children?: React.ReactNode
}

const GGLine = (
  { data = stocks, aes = DEFAULT_AES, children = <GeomLine /> }: LineProps<Stock>
) => (
  <GG
    data={data}
    aes={aes}
  >
    {children}
  </GG>
)

export {
  GROUPS,
  NUM_GROUPS,
  DEFAULT_GROUP_STROKES,
  DEFAULT_DASHARRAYS,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_SINGLE_STROKE,
  DEFAULT_AES,
  setup,
  GGLine,
  type LineProps
}
