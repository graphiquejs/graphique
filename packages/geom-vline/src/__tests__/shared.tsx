import React from 'react'
import {
  GG, Aes, defaultScheme,
} from '@graphique/graphique'
import { GeomVLine } from '..'
import { setup } from '../../../../test/utils'
import { beakLengthsBySpecies, type PenguinSummary } from './__data__/penguinSummaries'

const GROUPS = Array.from(new Set(beakLengthsBySpecies.map(s => s.species)))
const NUM_GROUPS = GROUPS.length
const DEFAULT_GROUP_STROKES = defaultScheme.slice(0, NUM_GROUPS)
const DEFAULT_STROKE_WIDTH = '1.5'
const DEFAULT_SINGLE_STROKE = '#777777ee'
const DEFAULT_AES: Aes<PenguinSummary> = {
  x: d => d.beakLength,
  y: d => d.flipperLength,
  stroke: d => d.species,
}

interface VLineProps<Datum> {
  data?: Datum[]
  aes?: Aes<Datum>
  children?: React.ReactNode
}

const GGVLine = <Datum,>(
  {
    data = beakLengthsBySpecies as Datum[],
    aes = DEFAULT_AES as Aes<Datum>,
    children = <GeomVLine />,
  }: VLineProps<Datum>
) => (
  <GG
    data={data}
    aes={aes}
    margin={{ left: 50 }}
  >
    {children}
  </GG>
)

export {
  GROUPS,
  NUM_GROUPS,
  DEFAULT_GROUP_STROKES,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_SINGLE_STROKE,
  DEFAULT_AES,
  setup,
  GGVLine,
  type VLineProps
}
