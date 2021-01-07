import React, { useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { tooltipState, TooltipState } from ".."

const Tooltip: React.FC<TooltipState> = ({
  x0,
  y0,
  position,
  keepInParent,
  xAxis,
  content,
  yFormat,
  xFormat,
  datum
}) => {

  const setTooltipState = useSetRecoilState(tooltipState)

  useEffect(() => {
    setTooltipState((tooltip) => {
      return {
        x0: x0,
        y0: y0,
        position: position || tooltip.position,
        // keepInParent:
        //   typeof keepInParent === "undefined"
        //     ? tooltip.keepInParent
        //     : keepInParent,
        keepInParent: typeof keepInParent !== "undefined" ? keepInParent : tooltip.keepInParent,
        xAxis: xAxis || tooltip.xAxis,
        content: content || tooltip.content,
        yFormat: yFormat || tooltip.yFormat,
        xFormat: xFormat || tooltip.xFormat,
        datum: datum,
      }
    })
  }, [
    setTooltipState,
    x0,
    y0,
    position,
    keepInParent,
    xAxis,
    content,
    yFormat,
    xFormat,
    datum,
  ])

  return null
}

const styles = {
  fontSize: 12,
  padding: "4px 6px 4px 6px",
  background: "#fefefee1",
  border: "1px solid #eee",
  borderRadius: 2,
  boxShadow: "rgba(0, 0, 0, 0.5) 0px 1px 4px"
}

const TooltipContainer: React.FC<{ style?: {} }> = ({ children, style }) => {
  return (
    <div
      style={{
        ...styles,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

Tooltip.displayName = "Tooltip"
export { XTooltip } from "./XTooltip"
export { YTooltip } from "./YTooltip"
export { Tooltip, TooltipContainer }