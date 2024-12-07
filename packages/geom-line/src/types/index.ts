import { Aes, DataValue } from '@graphique/graphique'

export enum Entrance {
  DATA = 'data',
  MIDPOINT = 'midpoint',
}

export enum FocusType {
  X = 'x',
  CLOSEST = 'closest',
}

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'fill' | 'size'> & {
  x?: DataValue<Datum>
  /** functional mapping to `data` used to create higher-level groups for focusing when combined with `group` Aes and `focusType=FocusType.CLOSEST`  */
  focusGroup?: DataValue<Datum>
}
