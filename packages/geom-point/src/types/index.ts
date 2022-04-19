import { Aes, DataValue } from '@graphique/graphique'

export type GeomAes = Omit<Aes, 'x'> & {
  x?: DataValue
}