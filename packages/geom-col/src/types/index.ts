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