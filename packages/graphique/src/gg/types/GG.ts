import { ReactNode } from 'react'
import { Aes } from './Aes'

interface Margin {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export interface RootGGProps<Datum> {
  /** the data used to create the base, an array of objects */
  data: Datum[]
  /** the functional mapping of data characteristics to visual characteristics */
  aes: Aes<Datum>
  /** the width of the visualization area in pixels (_default_: `550`)
   *
   * Use `isContainerWidth` if you'd like it to be as wide as the parent container.
   */
  width?: number
  /** the height of the visualization area in pixels (_default_: `450`) */
  height?: number
  /** an object specifying the margins surrounding the visualization area */
  margin?: Margin
  /** when true, the visualization will fill its parent container's width
   * (and respond to changes in its width)
   */
  isContainerWidth?: boolean
  /** elements used to specify and configure the visualization
   * (e.g. Geoms, Scales, Labels, Theme, etc.)
   */
  children?: ReactNode
}

export interface GGProps<Datum> extends RootGGProps<Datum> {
  parentWidth?: number
  id?: string
}
