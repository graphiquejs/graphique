import { XYScale } from '../../../gg/types/Scales'

interface FormatOptions {
  value: any
  index: number
  width: number
}

export interface XYScaleProps {
  /** An explicit scale imported from [`d3-scale`](https://d3js.org/d3-scale) used to determine relationship between data inputs and visual outputs (_default_: inferred from `aes` mapping's initial return type) */
  type?: XYScale
  /** For continuous scales, should the scale (and relevant axis) be reversed. _Note_: Categorical scales have their order controlled by `domain`. */
  reverse?: boolean
  /** Function used to format axis tick labels */
  format?: ({ value, index, width }: FormatOptions) => string
  /** Approximate number of ticks to use in axis (_default_: derived from parent container's width or height) */
  numTicks?: ((widthOrHeight: number) => number | undefined) | number
  /** Used to create an explicit/fixed scale. Continuous scales should get `[min, max]` and categorical scales should get an ordered list of categories.  */
  domain?: unknown[]
  /** For categorical scales, should the focused data highlight the associated axis tick label */
  highlightOnFocus?: boolean
  /** For categorical scales, the tick labels that should be explicitly/programmatically focused */
  focusedTicks?: string[]
  /** This is passed to the top-level axis element, and can be used to control styling */
  className?: string
}
