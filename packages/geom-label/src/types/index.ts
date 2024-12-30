import { Aes, DataValue } from '@graphique/graphique'

export enum Entrance {
  DATA = 'data',
  BOTTOM = 'bottom',
}

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x'> & {
  x?: DataValue<Datum>
}
