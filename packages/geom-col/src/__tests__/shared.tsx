import React from 'react'
import { crimes } from '@graphique/datasets'
import { GG, Aes, defaultScheme } from '@graphique/graphique'
import { arrestsByDayAndCrime } from './__data__/crimeTotals'
import { setup } from '../../../../test/utils'
import { GeomCol } from '..'

const COLS = Array.from(new Set(crimes.map(c => c.dow)))
const GROUPS = Array.from(new Set(crimes.map(c => c.offenseCategory)))
const NUM_COLS = COLS.length
const NUM_GROUPS = GROUPS.length
const DEFAULT_AES: Aes = {
  x: d => d.dow,
  y: d => d.count,
  fill: d => d.offenseCategory
}
const DEFAULT_GROUP_FILLS = defaultScheme.slice(0, NUM_GROUPS)
const DEFAULT_FILL = '#777777ee'

interface ColProps {
  data?: unknown[]
  aes?: Aes
}

type CrimeTotal = {
  dow: string
  offenseCategory?: string
  count: number
}

const GGCol: React.FC<ColProps> = (
  {
    data = arrestsByDayAndCrime,
    aes = DEFAULT_AES,
    children = <GeomCol />,
  }
) => (
  <GG
    data={data}
    aes={aes}
  >
    {children}
  </GG>
)

export {
  COLS,
  GROUPS,
  NUM_COLS,
  NUM_GROUPS,
  DEFAULT_AES,
  DEFAULT_FILL,
  DEFAULT_GROUP_FILLS,
  setup,
  GGCol,
  type CrimeTotal,
  type ColProps,
}