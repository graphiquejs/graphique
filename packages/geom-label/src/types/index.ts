import { Aes, DataValue } from '@graphique/graphique'

export enum Entrance {
  DATA = 'data',
  MIDPOINT = 'midpoint',
}

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x'> & {
  x?: DataValue<Datum>
}
