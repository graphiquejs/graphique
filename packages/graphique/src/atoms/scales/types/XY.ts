import { XYScale } from "../../../gg/types/Scales"

export interface XYScaleProps {
  type?: XYScale
  reverse?: boolean
  format?:
    | (({
        value,
        index,
        width,
      }: {
        value: any
        index: number
        width: number
      }) => string)
    | null
  className?: string
  numTicks?: ((widthOrHeight: number) => number | undefined) | number
  domain?: any[]
  highlightOnFocus?: boolean
}
