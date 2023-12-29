import { DataValue, Aes } from "@graphique/graphique"

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'size'> &
{
  x?: DataValue<Datum>
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: DataValue<Datum>
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: DataValue<Datum>
}

export type StackedArea = {
  x: number
  group: string
  y0: number
  y1: number
}