import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { tooltipState, TooltipProps } from '../../atoms'

/** A headless component used to customize a visualization's tooltip content and/or appearance. */
export const Tooltip = <Datum,>({
  keepInParent,
  position,
  xAxis,
  content,
  xFormat,
  yFormat,
  measureFormat,
  datum,
  dx,
  dy,
}: TooltipProps<Datum>) => {
  const [, setTooltip] = useAtom(tooltipState)

  useEffect(() => {
    setTooltip((prev) => ({
      ...prev,
      keepInParent: typeof keepInParent === 'undefined' ? true : keepInParent,
      xAxis: xAxis || prev.xAxis,
      position: position || prev.position,
      content: content || prev.content,
      xFormat: xFormat || prev.xFormat,
      yFormat: yFormat || prev.yFormat,
      measureFormat: measureFormat || prev.measureFormat,
      datum,
      dx,
      dy,
    }))
  }, [
    keepInParent,
    position,
    xAxis,
    content,
    xFormat,
    yFormat,
    measureFormat,
    datum,
    setTooltip,
    dx,
    dy,
  ])

  return null
}
