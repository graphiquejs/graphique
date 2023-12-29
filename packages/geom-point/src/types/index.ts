import { Aes, DataValue } from '@graphique/graphique'

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x'> & {
  x?: DataValue<Datum>
}