import { Aes, DataValue } from '@graphique/graphique'

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'size'> & {
  x?: DataValue<Datum>
}

export interface HistogramBin {
  n: number
  group: string
  x0?: number
  x1?: number
}

export enum FocusType {
  /** pointer events focus all groups within bars */
  GROUP = 'group',
  /** pointer events focus individual groups within bars */
  INDIVIDUAL = 'individual',
}

export enum Position {
  /** groups are overlaid directly "on top" of each other (no effect on y scale) */
  IDENTITY = 'identity',
  /** groups are stacked vertically after any previous groups (additive effect on y scale) */
  STACK = 'stack',
  /** groups are positioned horizontally after any previous groups (no effect on y scale) */
  DODGE = 'dodge',
  /** groups are stacked vertically as proportion of group total after any previous groups (y scale domain set to [0, 1]) */
  FILL = 'fill',
}

export enum Alignment {
  CENTER = 'center',
  LEFT = 'left',
  RIGHT = 'right',
}
