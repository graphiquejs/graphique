import { DataValue, Aes } from "@graphique/graphique"

export type GeomAes = Omit<Aes, 'x' | 'size'> &
{
  x?: DataValue
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: DataValue
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: DataValue
}

export type StackedArea = {
  x: number
  i: number
  y0: number
  y1: number
}