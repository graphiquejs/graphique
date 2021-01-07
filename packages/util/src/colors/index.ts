import { schemeTableau10 } from "d3-scale-chromatic"

export const defaultCategoricalScheme: string[] = [
  schemeTableau10[0],
  schemeTableau10[1],
  schemeTableau10[4],
  schemeTableau10[2],
  schemeTableau10[3],
  ...schemeTableau10.slice(5),
]
