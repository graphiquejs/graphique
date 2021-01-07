import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { themeState } from "./"

export type ThemeProps = {
  titleColor?: string
  markerStroke?: string
  defaultStroke?: string
  defaultFill?: string
  font?: {
    family?: string
  }
  grid?: {
    stroke?: string | null
  }
  axis?: {
    labelColor?: string
    stroke?: string
    tickLabelColor?: string
    tickStroke?: string
    hideAxisLines?: boolean
  }
  axisX?: {
    labelColor?: string
    stroke?: string
    tickLabelColor?: string
    tickStroke?: string
    hideAxisLine?: boolean
  }
  axisY?: {
    labelColor?: string
    stroke?: string
    tickLabelColor?: string
    tickStroke?: string
    hideAxisLine?: boolean
  }
}

const Theme: React.FC<ThemeProps> = ({
  titleColor,
  markerStroke,
  defaultStroke,
  defaultFill,
  font,
  grid,
  axis,
  axisX,
  axisY
}) => {

  const setThemeState = useSetRecoilState(themeState)

  useEffect(() => {
    setThemeState((theme) => {
      return {
        titleColor: titleColor || theme.titleColor,
        markerStroke: markerStroke || theme.markerStroke,
        defaultStroke: defaultStroke || theme.defaultStroke,
        defaultFill: defaultFill || theme.defaultFill,
        font: font ? { ...theme.font, ...font } : theme.font,
        grid: grid ? { ...theme.grid, ...grid } : theme.grid,
        axis: axis ? { ...theme.axis, ...axis } : theme.axis,
        axisX: axisX ? { ...theme.axisX, ...axisX } : theme.axisX,
        axisY: axisY ? { ...theme.axisY, ...axisY } : theme.axisY,
      }
    })
  }, [
    setThemeState,
    titleColor,
    markerStroke,
    defaultStroke,
    defaultFill,
    font,
    grid,
    axis,
    axisX,
    axisY
  ])

  return null
}

Theme.displayName = "Theme"
export { Theme }