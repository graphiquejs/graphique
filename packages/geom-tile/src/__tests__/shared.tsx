import React from 'react'
import { crimes, type Crime } from '@graphique/datasets'
import { GG, Theme, type Aes } from '@graphique/graphique'
import { setup } from '../../../../test/utils'
import { GeomTile, Legend } from '..'

interface PossiblyNullCountCrime extends Omit<Crime, 'count'> {
  count: number | null
}

interface ContinuousCrime extends Omit<Crime, 'dow' | 'hr' | 'count'> {
  dow: number
  hr: number
  count: number | null
}

const ROWS = Array.from(new Set(crimes.map((c) => c.dow)))
const NUM_ROWS = ROWS.length
const COLS = Array.from(new Set(crimes.map((c) => c.hr)))
const NUM_COLS = COLS.length
const DEFAULT_AES: Aes<PossiblyNullCountCrime | ContinuousCrime> = {
  x: (d) => d.hr,
  y: (d) => d.dow,
  fill: (d) => d.count,
}
const THEFT = 'Theft'

interface Props<Datum> {
  data?: Datum[]
  aes?: Aes<Datum>
  children?: React.ReactNode
}

const testTileData = crimes.filter((d) => d.offenseCategory === THEFT)

const GGTile = ({
  data = testTileData,
  aes = DEFAULT_AES,
  children = (
    <>
      <GeomTile />
      <Legend title={THEFT} />
      <Theme animationDuration={0} />
    </>
  ),
}: Props<PossiblyNullCountCrime | ContinuousCrime>) => (
  <GG data={data} aes={aes}>
    {children}
  </GG>
)

const formatHourAsNumber = (hrString: string): number => {
  const [hr, tod] = hrString.split(' ')

  if (hrString === '12 am') return 23
  if (hrString === '12 pm') return 11

  return tod === 'am' ? Number(hr) - 1 : Number(hr) + 11
}

const formatDayAsNumber = (dow: string): number => {
  const days = Array.from(new Set(crimes.map((d) => d.dow)))

  return days.indexOf(dow)
}

const continuousXYTileData = crimes
  .filter((d) => d.offenseCategory === THEFT)
  .map((d) => ({
    ...d,
    hr: formatHourAsNumber(d.hr),
    dow: formatDayAsNumber(d.dow),
  }))

const CONTINUOUS_X_TICKS = ['0', '5', '10', '15', '20']
const CONTINUOUS_Y_TICKS = ['0', '2', '4', '6']

export {
  COLS,
  NUM_COLS,
  ROWS,
  NUM_ROWS,
  DEFAULT_AES,
  THEFT,
  setup,
  GGTile,
  testTileData,
  continuousXYTileData,
  CONTINUOUS_X_TICKS,
  CONTINUOUS_Y_TICKS,
}
