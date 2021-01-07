import React, { useLayoutEffect, useState, useCallback } from "react"
import { YTooltipPortal } from "./TooltipPortals"
import { useRecoilValue } from "recoil"
import { layoutState, tooltipState, themeState } from "../"

type Props = {
  id: string
  left: number
  top: number
  value: React.ReactNode
}

export const YTooltip: React.FC<Props> = ({
  id,
  left,
  top,
  value,
}) => {

  const { width } = useRecoilValue(layoutState)
  const { position, keepInParent } = useRecoilValue(tooltipState)
  const { font } = useRecoilValue(themeState)

  const [containerHeight, setContainerHeight] = useState(0)
  const [containerWidth, setContainerWidth] = useState(0)

  const containerRef = useCallback((node: any) => {
    if (node !== null) {
      setContainerHeight(node.getBoundingClientRect().height)
      setContainerWidth(node.getBoundingClientRect().width)
    }
  }, [left])


  const [leftPos, setLeftPos] = useState<number | undefined>(undefined)
  const [topPos, setTopPos] = useState<number | undefined>(undefined)


  useLayoutEffect(() => {
    // const container = document.getElementById(`y-container-${id}`)
    // const containerBounds = container?.getBoundingClientRect()
    let leftPosition = left + 8
    if (keepInParent && leftPosition && leftPosition < 2) {
      leftPosition = 2
    } else if (keepInParent && left > width / 2) {
      leftPosition = left - (containerWidth) - 8
    }
    setLeftPos(leftPosition)
  }, [keepInParent, width, containerWidth, left])

  useLayoutEffect(() => {

    const topPosition = top - (position === "data" ? containerHeight / 2 : 0) - 4
    setTopPos(topPosition)

  }, [position, containerHeight, top])

  return (
    <YTooltipPortal id={id}>
      <div
        ref={containerRef}
        style={{
          fontFamily: font?.family,
          left: leftPos,
          top: topPos,
          pointerEvents: "none",
          position: "absolute",
          whiteSpace: "nowrap"
        }}
      >
        {value}
      </div>
    </YTooltipPortal>
  )
}
