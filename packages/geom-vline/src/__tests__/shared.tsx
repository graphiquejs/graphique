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
const DEFAULT_AES: Aes = {
  x: (d: PenguinSummary) => d.beakLength,
  y: (d: PenguinSummary) => d.flipperLength,
  stroke: (d: PenguinSummary) => d.species,
}

interface VLineProps {
  data?: unknown[]
  aes?: Aes
}

const GGVLine: React.FC<VLineProps> = (
  { data = beakLengthsBySpecies, aes = DEFAULT_AES, children = <GeomVLine /> }
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
