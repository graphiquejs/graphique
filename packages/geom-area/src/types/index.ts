import { DataValue, Aes } from '@graphique/graphique'

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'size'> & {
  x?: DataValue<Datum>
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: DataValue<Datum>
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: DataValue<Datum>
}

export enum Position {
  /** groups are overlaid directly "on top" of each other (no effect on y scale) */
  IDENTITY = 'identity',
  /** groups are stacked vertically after any previous groups (additive effect on y scale) */
  STACK = 'stack',
  /** groups are stacked vertically as proportion of group total after any previous groups (y scale domain set to [0, 1]) */
  FILL = 'fill',
  /** groups are stacked vertically in a streamgraph (y scale domain set to a relatively meaningless/uninterpretable domain based on streamgraph layout) */
  STREAM = 'stream',
}

export type StackedArea = {
  x: number
  group: string
  y0: number
  y1: number
}
