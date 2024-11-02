import {
  interpolateViridis as defaultInterpolator,
  schemeTableau10,
} from 'd3-scale-chromatic'

export const defaultScheme: string[] = [
  schemeTableau10[0],
  schemeTableau10[1],
  schemeTableau10[4],
  schemeTableau10[2],
  schemeTableau10[3],
  ...schemeTableau10.slice(5),
]
export const defaultDasharrays: string[] = [
  '0',
  '2,2',
  '5,4',
  '2,8,2',
  '15,4',
  '8,2,8',
]

export { defaultInterpolator }

export const createSequentialScheme = (
  interpolator = defaultInterpolator,
  n = 5,
) => {
  const scheme = []
  for (let i = 0; i < n; i += 1) {
    scheme.push(interpolator(i / (n - 1)))
  }
  return scheme
}
