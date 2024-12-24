import type { CSSProperties } from 'react'
import { atom } from 'jotai'
import type { Aes, DataValue, VisualEncodingTypes } from '../gg'

interface PointThemeProps<Datum> {
  fillOpacity?: number | string
  stroke?: string
  strokeWidth?: number | string
  strokeOpacity?: number | string
  strokeDasharray?: number | string
  unfocusedStyles?: CSSProperties
  fill?: string
  hasFill?: boolean
  fillScale?: VisualEncodingTypes
  strokeScale?: VisualEncodingTypes
  strokeDasharrayScale?: VisualEncodingTypes
  usableGroups?: string[]
  groupAccessor?: DataValue<Datum>
  aes?: Aes<Datum>
  size?: (d: any) => number | null | undefined
}

interface AreaProps<Datum> extends PointThemeProps<Datum> {
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: (d: Datum) => number | undefined
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: (d: Datum) => number | undefined
}

interface HistProps {
  binWidth?: number
}

interface GeomsTheme<Datum> {
  point?: PointThemeProps<Datum>
  line?: PointThemeProps<Datum>
  vline?: PointThemeProps<Datum>
  hline?: PointThemeProps<Datum>
  smooth?: PointThemeProps<Datum>
  tile?: PointThemeProps<Datum>
  bar?: PointThemeProps<Datum>
  col?: PointThemeProps<Datum>
  histogram?: HistProps
  area?: AreaProps<Datum>
  label?: PointThemeProps<Datum>
}

interface AxisTheme {
  stroke?: string
  label?: {
    fontSize?: number | string
    fontFamily?: string
    color?: string
  }
  tickLabel?: {
    fontSize?: number | string
    fontFamily?: string
    color?: string
  }
  tickStroke?: string
  showAxisLine?: boolean
}

interface LegendTheme {
  labelColor?: string
  tickColor?: string
}

interface TooltipTheme {
  font?: {
    family?: string
    size?: number
  }
  xLabel?: {
    fontSize?: number | string
    fontFamily?: string
    color?: string
  }
  yLabel?: {
    fontSize?: number | string
    fontFamily?: string
    color?: string
  }
  groupLabel?: {
    fontSize?: number | string
    fontFamily?: string
    color?: string
  }
}

interface FontTheme {
  family?: string
}

interface GridTheme {
  stroke?: string | null
}

export interface ThemeProps<Datum> {
  /** font color for header */
  headerColor?: string
  /** stroke color for marker (_default_: `"#ffffff"`) */
  markerStroke?: string
  /** stroke color used for geoms with a default stroke attribute (_default_: `"#777777ee"`) */
  defaultStroke?: string
  /** fill color used for geoms with a default fill attribute (_default_: `"#777777ee"`) */
  defaultFill?: string
  /** internal state that is set automatically and can be retrieved for each used Geom. _Note: you shouldn't ever need to modify this directly._ */
  geoms?: GeomsTheme<Datum>
  /** sets the default font used throughout a visualization */
  font?: FontTheme
  /** sets appearance properties for grid lines */
  grid?: GridTheme
  /** theme properties applied to x and y axes (ticks, labels, etc.)  */
  axis?: AxisTheme | null
  /** theme properties applied to x axis (ticks, labels, etc.)  */
  axisX?: AxisTheme | null
  /** theme properties applied to y axis (ticks, labels, etc.)  */
  axisY?: AxisTheme | null
  /** theme properties applied to legends */
  legend?: LegendTheme
  /** theme properties applied to tooltip */
  tooltip?: TooltipTheme
  /** duration in milliseconds for animated transitions (_default_: `1000`) */
  animationDuration?: number
}

export const pointThemeState = atom<PointThemeProps<any>>({})

export const themeState = atom<ThemeProps<any>>({
  markerStroke: '#fff',
  defaultStroke: '#777777ee',
  defaultFill: '#777777ee',
  font: {
    family: `system-ui, BlinkMacSystemFont, Segoe UI,
                Roboto, Oxygen-Sans, Ubuntu, Cantarell,
                Helvetica Neue, sans-serif`,
  },
  grid: {},
  axis: {
    showAxisLine: false,
  },
  axisX: {
    stroke: '#33333333',
    showAxisLine: false,
  },
  axisY: {
    stroke: '#33333333',
    showAxisLine: false,
  },
  geoms: {},
  legend: {},
  tooltip: {},
  animationDuration: 1000,
})
