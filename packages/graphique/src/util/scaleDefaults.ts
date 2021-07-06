import { schemeTableau10 } from "d3-scale-chromatic"

export const defaultScheme: string[] = [
  schemeTableau10[0],
  schemeTableau10[1],
  schemeTableau10[4],
  schemeTableau10[2],
  schemeTableau10[3],
  ...schemeTableau10.slice(5),
]
export const defaultDasharrays: string[] = [
  "0",
  "2,2",
  "5,4",
  "2,8,2",
  "15,4",
  "8,2,8",
]

export { interpolateViridis as defaultInterpolator } from "d3-scale-chromatic"
