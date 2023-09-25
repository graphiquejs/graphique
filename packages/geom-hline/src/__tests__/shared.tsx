import React from 'react'
import {
  GG, Aes, defaultScheme,
} from '@graphique/graphique'
import { GeomHLine } from '..'
import { setup } from '../../../../test/utils'
import { flipperLengthsBySpecies, type PenguinSummary } from '../../../geom-vline/src/__tests__/__data__/penguinSummaries'

const GROUPS = Array.from(new Set(flipperLengthsBySpecies.map(s => s.species)))
const NUM_GROUPS = GROUPS.length
const DEFAULT_GROUP_STROKES = defaultScheme.slice(0, NUM_GROUPS)
const DEFAULT_STROKE_WIDTH = '1.5'
const DEFAULT_SINGLE_STROKE = '#777777ee'
const DEFAULT_AES: Aes = {
  x: (d: PenguinSummary) => d.beakLength,
  y: (d: PenguinSummary) => d.flipperLength,
  stroke: (d: PenguinSummary) => d.species,
}

interface HLineProps {
  data?: unknown[]
  aes?: Aes
}

const GGHLine: React.FC<HLineProps> = (
  { data = flipperLengthsBySpecies, aes = DEFAULT_AES, children = <GeomHLine /> }
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
  GGHLine,
  flipperLengthsBySpecies,
  type PenguinSummary,
  type HLineProps,
}
