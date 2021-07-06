import React from 'react'
import { atom } from 'jotai'
import { isDate, formatDate } from '../util/dates'

export interface TooltipContent {
  label?: string
  group?: string | number | Date | null
  mark?: JSX.Element
  x?: number
  y?: number
  formattedX?: string
  formattedY?: string
  formattedMeasure?: string
  datum: any
  containerWidth: number
  xLab?: string
  yLab?: string
}

export interface TooltipProps {
  x0?: any
  y0?: any
  left?: number
  dx?: (({ width, x }: { width?: number; x?: number }) => number) | number
  dy?: (({ height, y }: { height?: number; y?: number }) => number) | number
  keepInParent?:
    | (({ width, x }: { width?: number; x?: number }) => boolean)
    | boolean
  position?: 'top' | 'data'
  xFormat?: (d: unknown) => string
  yFormat?: (d: unknown) => string
  measureFormat?: (d: unknown) => string
  content?: (value: TooltipContent[]) => React.ReactNode | undefined
  xAxis?: ((x: string | number | Date) => React.ReactNode) | boolean
  datum?: any[]
}

const defaultDataFormatter = (v: unknown) => {
  if (isDate(v)) return formatDate(v as Date)
  if (typeof v === 'number')
    return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return v as any
}

export const tooltipState = atom<TooltipProps>({
  position: 'data',
  keepInParent: true,
  xFormat: defaultDataFormatter,
  yFormat: defaultDataFormatter,
  measureFormat: defaultDataFormatter,
  xAxis: false,
  dx: () => 0,
  dy: () => 0,
})
