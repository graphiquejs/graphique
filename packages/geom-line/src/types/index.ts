import { Aes, DataValue } from '@graphique/graphique'

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'fill' | 'size'> & {
  x?: DataValue<Datum>
}