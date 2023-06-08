import { atom } from "jotai"
import type { DataValue, VisualEncodingTypes } from "../gg"

interface PointThemeProps {
  fillOpacity?: number | string
  stroke?: string
  strokeWidth?: number | string
  strokeOpacity?: number | string
  strokeDasharray?: number | string
  fill?: string
  hasFill?: boolean
  fillScale?: VisualEncodingTypes
  strokeScale?: VisualEncodingTypes
  usableGroups?: string[]
  groupAccessor?: DataValue
  size?: (d: any) => number | null | undefined
}

interface BarColProps extends PointThemeProps {
  position?: "identity" | "stack" | "dodge" | "fill"
}

interface AreaProps extends PointThemeProps {
  /** controls how to draw the area */
  position?: 'identity' | 'stack' | 'fill' | 'stream'
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: DataValue
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: DataValue
}

export interface ThemeProps {
  titleColor?: string
  markerStroke?: string
  defaultStroke?: string
  defaultFill?: string
  geoms?: {
    point?: PointThemeProps
    line?: PointThemeProps
    vline?: PointThemeProps
    hline?: PointThemeProps
    smooth?: PointThemeProps
    tile?: PointThemeProps
    bar?: BarColProps
    col?: BarColProps
    area?: AreaProps
    label?: PointThemeProps
  }
  font?: {
    family?: string
  }
  grid?: {
    stroke?: string | null
  }
  axis?: {
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
    showAxisLines?: boolean
  }
  axisX?: {
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
  } | null
  axisY?: {
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
  } | null
  legend?: {
    labelColor?: string
    tickColor?: string
  }
  tooltip?: {
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
  animationDuration?: number
}

export const pointThemeState = atom<PointThemeProps>({})

export const themeState = atom<ThemeProps>({
  // titleColor: "#222",
  markerStroke: "#fff",
  defaultStroke: "#777777ee",
  defaultFill: "#777777ee",
  font: {
    family: `system-ui, BlinkMacSystemFont, Segoe UI,
                Roboto, Oxygen-Sans, Ubuntu, Cantarell,
                Helvetica Neue, sans-serif`,
  },
  grid: {
    // stroke: "#33333313",
  },
  axis: {
    // labelColor: "#666",
    // stroke: "#55555533",
    // tickLabelColor: "#888",
    showAxisLines: false,
  },
  axisX: {
    // labelColor: "#666",
    stroke: "#33333333",
    // tickLabelColor: "#888",
    showAxisLine: false,
  },
  axisY: {
    // labelColor: "#666",
    stroke: "#33333333",
    // tickLabelColor: "#888",
    showAxisLine: false,
  },
  geoms: {},
  legend: {
    // titleColor: "#666",
    // tickColor: "#444",
  },
  tooltip: {},
  animationDuration: 1000,
})
