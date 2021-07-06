import React, { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { XTooltipPortal } from './TooltipPortals'
import { themeState, tooltipState } from '../../atoms'
import { useGG } from '../GGBase'

export interface XTooltipProps {
  id: string
  left: number
  top: number
  yPosition?: 'above' | 'below'
  value: React.ReactNode
}

export const XTooltip = ({
  id,
  left,
  top,
  value,
  yPosition = 'below',
}: XTooltipProps) => {
  const { width } = useGG()?.ggState || { width: 0 }
  const [{ font }] = useAtom(themeState)
  const [{ keepInParent }] = useAtom(tooltipState)
  const [leftPos, setLeftPos] = useState<number | undefined>(0)
  const [topPos, setTopPos] = useState<number | undefined>(0)

  useEffect(() => {
    const container = document.getElementById(`x-container-${id}`)
    const containerBounds = container?.getBoundingClientRect()
    const containerWidth = containerBounds?.width
    const containerHeight = containerBounds?.height
    let leftPosition = containerWidth && left - containerWidth / 2
    const rightX =
      leftPosition && containerWidth && leftPosition + containerWidth
    if (keepInParent && leftPosition && leftPosition < 2) {
      leftPosition = 2
    } else if (
      keepInParent &&
      leftPosition &&
      containerWidth &&
      rightX &&
      rightX > width
    ) {
      leftPosition = width - containerWidth - 2
    }

    setTopPos(top - (yPosition === 'above' ? (containerHeight || 0) + 8 : 0))

    if (leftPos) setLeftPos(leftPosition)
  }, [width, left, top, id, keepInParent, yPosition])

  return (
    <XTooltipPortal id={id}>
      <div
        id={`x-container-${id}`}
        style={{
          fontFamily: font?.family,
          pointerEvents: 'none',
          position: 'absolute',
          left: leftPos || -9999,
          top: topPos || -9999,
          whiteSpace: 'nowrap',
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
