import { Aes, DataValue } from '@graphique/graphique'

export type GeomAes = Omit<Aes, 'x' | 'fill' | 'size'> & {
  x?: DataValue
}