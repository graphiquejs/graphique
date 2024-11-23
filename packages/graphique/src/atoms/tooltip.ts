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
  yLab?: string
}

export interface TooltipProps<Datum> {
  x0?: any
  y0?: any
  left?: number
  dx?: (({ width, x }: { width?: number; x?: number }) => number) | number
  dy?: (({ height, y }: { height?: number; y?: number }) => number) | number
  keepInParent?:
    | (({ width, x }: { width?: number; x?: number }) => boolean)
    | boolean
  position?: 'top' | 'data'
  xFormat?: (d: any) => string
  yFormat?: (d: any) => string
  measureFormat?: (d: any) => string
  content?: (value?: TooltipContent<Datum>[]) => React.ReactNode | undefined
  xAxis?: ((x?: string | number | Date | null) => React.ReactNode) | boolean
  datum?: Datum[]
}

const defaultDataFormatter = (v: any) => {
  if (isDate(v)) return formatDate(v as Date)
  if (typeof v === 'number')
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return v
}

export const tooltipState = atom<TooltipProps<any>>({
  position: 'data',
  keepInParent: true,
  xFormat: defaultDataFormatter,
  yFormat: defaultDataFormatter,
  measureFormat: defaultDataFormatter,
  xAxis: false,
  dx: () => 0,
  dy: () => 0,
})
