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
const DEFAULT_AES: Aes = {
  x: (d: Stock) => new Date(d.date),
  y: (d: Stock) => d.marketCap,
  stroke: (d: Stock) => d.symbol,
}

interface LineProps {
  data?: unknown[]
  aes?: Aes
}

const GGLine: React.FC<LineProps> = (
  { data = stocks, aes = DEFAULT_AES, children = <GeomLine /> }
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
