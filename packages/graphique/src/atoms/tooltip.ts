import React from 'react'
import { atom } from 'jotai'
import { isDate, formatDate } from '../util/dates'

export interface TooltipContent<Datum> {
  label?: string
  group?: string | number | Date | null
  mark?: JSX.Element
  x?: number
  y?: number
  formattedX?: string
  formattedY?: string
  formattedMeasure?: string
  datum?: Datum[]
  containerWidth: number
  xLab?: string
  yLab?: React.ReactNode
}

export enum TooltipPosition {
  TOP = 'top',
  DATA = 'data',
}

interface HorizontalProps {
  width?: number
  x?: number
}

interface VerticalProps {
  height?: number
  y?: number
}

export interface TooltipProps<Datum> {
  /** horizontal adjustment in pixels for tooltip's position relative to focused datum */
  dx?: (({ width, x }: HorizontalProps) => number) | number
  /** vertical adjustment in pixels for tooltip's position relative to focused datum */
  dy?: (({ height, y }: VerticalProps) => number) | number
  /** should the tooltip be contained within the visualization area (_default_: `true`)  */
  keepInParent?: (({ width, x }: HorizontalProps) => boolean) | boolean
  /** tooltip's position relative to focused datum (_default_: `TooltipPosition.DATA`) */
  position?: TooltipPosition
  /** formatting function for tooltip x values */
  xFormat?: (d: any) => string
  /** formatting function for tooltip y values */
  yFormat?: (d: any) => string
  /** formatting function for tooltip measure labels created with an [`aes.label`](https://graphique.dev/docs/graphique/gg#Aes) mapping */
  measureFormat?: (d: any) => string
  /** function that can be used to render a completely custom tooltip component based on the focused datum's individual parts */
  content?: (value?: TooltipContent<Datum>[]) => React.ReactNode | undefined
  /** should the tooltip x value be rendered as an independent tooltip along the x axis */
  xAxis?: ((x?: string | number | Date | null) => React.ReactNode) | boolean
  /** used for programmatically focusing Geom elements/displaying tooltip when given a meaningful subset of `data` */
  datum?: Datum[]
}

const defaultDataFormatter = (v: any) => {
  if (isDate(v)) return formatDate(v as Date)
  if (typeof v === 'number')
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return v
}

export const tooltipState = atom<TooltipProps<any>>({
  position: TooltipPosition.DATA,
  keepInParent: true,
  xFormat: defaultDataFormatter,
  yFormat: defaultDataFormatter,
  measureFormat: defaultDataFormatter,
  xAxis: false,
  dx: () => 0,
  dy: () => 0,
})
