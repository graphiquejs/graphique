import { useEffect } from "react"
import { useAtom } from "jotai"
import { tooltipState, TooltipProps } from "../../atoms"

export const Tooltip = ({
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
}: TooltipProps) => {
  const [, setTooltip] = useAtom(tooltipState)

  useEffect(() => {
    setTooltip(prev => ({
        ...prev,
        keepInParent: typeof keepInParent === "undefined" ? true : keepInParent,
        xAxis: xAxis || prev.xAxis,
        position: position || prev.position,
        content: content || prev.content,
        xFormat: xFormat || prev.xFormat,
        yFormat: yFormat || prev.yFormat,
        measureFormat: measureFormat || prev.measureFormat,
        datum,
        dx,
        dy,
        // x0,
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
    // x0,
  ])

  return null
}
