import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useAtom } from 'jotai'
import { YTooltipPortal } from './TooltipPortals'
import { useGG } from '../GGBase'
import { tooltipState, themeState } from '../../atoms'

export interface YTooltipProps {
  id: string
  left: number
  top: number
  value: React.ReactNode
  wait?: boolean
}

export const YTooltip = ({ id, left, top, value, wait }: YTooltipProps) => {
  const { ggState } = useGG() || {}
  const { width, height } = ggState || { width: 0, height: 0 }
  const [{ position, keepInParent, dx, dy }] = useAtom(tooltipState)
  const [{ font }] = useAtom(themeState)

  // const [containerHeight, setContainerHeight] = useState(0)
  // const [containerWidth, setContainerWidth] = useState(0)
  const [leftPos, setLeftPos] = useState<number | undefined>(undefined)
  const [topPos, setTopPos] = useState<number | undefined>(undefined)

  const containerRef = useRef<HTMLDivElement | null>(null)

  const xAdj = useMemo(() => {
    if (!dx) {
      return 0
    }
    if (typeof dx === 'number') {
      return dx
    }
    return dx({ width, x: left })
  }, [dx, width, left])
  const yAdj = useMemo(() => {
    if (!dy) {
      return 0
    }
    if (typeof dy === 'number') {
      return dy
    }
    return dy({ height, y: -top })
  }, [dy, height, top])

  const shouldKeepInParent = useMemo(() => {
    if (typeof keepInParent === 'boolean') {
      return keepInParent
    }
    if (keepInParent) {
      return keepInParent({ width, x: left })
    }
    return true
  }, [keepInParent, width, left])

  const calcPositions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current?.clientWidth || 0
      const containerHeight = containerRef.current?.clientHeight || 0

      let leftPosition = left + 8 + xAdj
      if (shouldKeepInParent && leftPosition && leftPosition < 2) {
        leftPosition = 2
      } else if (shouldKeepInParent && left > width / 2) {
        leftPosition = left - containerWidth - 8 - xAdj
      }
      setLeftPos(leftPosition)

      const topPosition =
        top - (position === 'data' ? containerHeight / 2 : 0) - 5 + yAdj
      setTopPos(topPosition)
    }
  }, [width, left, top, position, shouldKeepInParent, xAdj, yAdj])

  useEffect(() => {
    if (wait) {
      const dummyTimeout = setTimeout(() => {
        calcPositions()
      }, 0)
      return () => clearTimeout(dummyTimeout)
    }
    calcPositions()
    return () => undefined
  }, [calcPositions, wait])

  return (
    <YTooltipPortal id={id}>
      <div
        ref={containerRef}
        style={{
          fontFamily: font?.family,
          left: leftPos || -9999,
          top: topPos,
          pointerEvents: 'none',
          position: 'absolute',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
    </YTooltipPortal>
  )
}
