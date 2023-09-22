import { Aes, DataValue } from '@graphique/graphique'

export type GeomAes = Omit<Aes, 'x' | 'size'> & {
  x?: DataValue
}