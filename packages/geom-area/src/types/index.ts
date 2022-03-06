import { DataValue } from "@graphique/graphique"

export type AreaAes = {
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: DataValue
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: DataValue
}