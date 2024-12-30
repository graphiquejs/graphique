import { VisualEncoding } from '../../../gg/types/Scales'

export interface VisualEncodingProps {
  /** An explicit scale imported from [`d3-scale`](https://d3js.org/d3-scale) used to determine relationship between data inputs and visual outputs (_default_: inferred from `aes` mapping's initial return type) */
  type?: VisualEncoding
  /** Used to create an explicit/fixed scale. Continuous scales should get `[min, max]` and categorical scales should get an ordered list of categories.  */
  domain?: any[]
  /** Used to create an explicit/fixed scale. Continuous scales should get a function that maps the input domain to the output range (e.g. a [d3 interpolator](https://d3js.org/d3-scale-chromatic/sequential#sequential-schemes)), and categorical scales should get an ordered list of categories (e.g. a [d3 scheme](https://d3js.org/d3-scale-chromatic/categorical#categorical-schemes)).  */
  values?: readonly string[] | ((t: number) => string)
  /** For continuous scales, should the scale be reversed. _Note_: Categorical scales have their order controlled by `domain`. */
  reverse?: boolean
}

export interface SizeEncodingProps {
  /** Used to create an explicit/fixed scale given a `[min, max]` for the input domain (mapped data property) */
  domain?: [number, number]
  /** Used to create an explicit/fixed scale given a `[min, max]` for the output range in pixels (_default_: `[3, 30]`) */
  range?: [number, number]
}
