import { ReactNode } from 'react'
import { Aes } from './Aes'

export interface RootGGProps {
  /** the data used to create the base, an array of objects */
  data: unknown[]
  /** the mapping of data characteristics to visual characteristics */
  aes: Aes
  /** the width of the visualization area in pixels (defaults to `550`)
   *
   * Use `isContainerWidth` if you'd like it to be as wide as the parent container.
   */
  width?: number
  /** the height of the visualization area in pixels (defaults to `450`) */
  height?: number
  /** specifies the margins surrounding the visualization area */
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  /** should the visualization fill its parent container's width
   * (and respond to changes in its width)
   */
  isContainerWidth?: boolean
  children?: ReactNode
}

export interface GGProps extends RootGGProps {
  parentWidth?: number
  id?: string
}
