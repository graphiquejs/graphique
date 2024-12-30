import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { themeState, ThemeProps } from '../../atoms'

/** A headless component used to customize the look and feel of a visualization. */
export const Theme = <Datum,>({
  headerColor,
  markerStroke,
  defaultStroke,
  defaultFill,
  font,
  grid,
  axis,
  axisX,
  axisY,
  legend,
  tooltip,
  animationDuration,
}: ThemeProps<Datum>) => {
  const [, setTheme] = useAtom(themeState)
  const reconcileAxis = (
    thisAxis: typeof axisX | typeof axisY,
    original: typeof axisX | typeof axisY,
  ) => {
    let reconciledAxis
    if (typeof thisAxis !== 'undefined') {
      if (thisAxis === null) {
        reconciledAxis = thisAxis
      } else {
        reconciledAxis = { ...original, ...thisAxis }
      }
    } else {
      reconciledAxis = original
    }
    return reconciledAxis
  }
  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      headerColor: headerColor ?? prev.headerColor,
      markerStroke: markerStroke ?? prev.markerStroke,
      defaultStroke: defaultStroke ?? prev.defaultStroke,
      defaultFill: defaultFill ?? prev.defaultFill,
      animationDuration: animationDuration ?? prev.animationDuration,
      font: font ? { ...prev.font, ...font } : prev.font,
      grid: grid ? { ...prev.grid, ...grid } : prev.grid,
      axis: reconcileAxis(axis, prev.axis),
      axisX: reconcileAxis(axisX, prev.axisX),
      axisY: reconcileAxis(axisY, prev.axisY),
      legend: legend ? { ...prev.legend, ...legend } : prev.legend,
      tooltip: tooltip ? { ...prev.tooltip, ...tooltip } : prev.tooltip,
    }))
  }, [
    setTheme,
    headerColor,
    markerStroke,
    defaultStroke,
    defaultFill,
    font,
    grid,
    axis,
    axisX,
    axisY,
    legend,
    tooltip,
    animationDuration,
  ])

  return null
}
