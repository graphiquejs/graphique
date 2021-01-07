import React, { useEffect, useState } from "react"
import { XTooltipPortal } from "./TooltipPortals"
import { useRecoilValue } from "recoil"
import { layoutState, themeState, tooltipState } from "../"

type Props = {
  id: string
  left: number
  top: number
  value: React.ReactNode
}

export const XTooltip: React.FC<Props> = ({
  id,
  left,
  top,
  value
}) => {

  const { width } = useRecoilValue(layoutState)
  const { font } = useRecoilValue(themeState)
  const { keepInParent } = useRecoilValue(tooltipState)
  const [leftPos, setLeftPos] = useState(0 as number | undefined)
  
  useEffect(() => {
    const container = document.getElementById(`x-container-${id}`)
    const containerBounds = container?.getBoundingClientRect()
    const containerWidth = containerBounds?.width
    let leftPosition = containerWidth && left - (containerWidth / 2)
    const rightX = leftPosition && containerWidth && (leftPosition + containerWidth)
    if (keepInParent && leftPosition && leftPosition < 2) {
      leftPosition = 2
    } else if (keepInParent && leftPosition && containerWidth && rightX && rightX > width) {
      leftPosition = width - (containerWidth) - 2
    }

    leftPosition && setLeftPos(leftPosition)
  }, [width, left, id, keepInParent])

  return (
    <XTooltipPortal id={id}>
      <div
        id={`x-container-${id}`}
        style={{
          fontFamily: font?.family,
          pointerEvents: "none",
          position: "absolute",
          left: leftPos,
          top: top,
          whiteSpace: "nowrap",
          // fontSize: 12,
          // padding: "3px 6px 3px 6px",
          // background: "#fefefeda",
          // border: "1px solid #eee",
          // borderRadius: 2,
          // boxShadow: "rgba(0, 0, 0, 0.5) 0px 1px 4px"
        }}
      >
        {value}
      </div>
    </XTooltipPortal>
  )
}
