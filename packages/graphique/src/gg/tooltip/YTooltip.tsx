import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useAtom } from 'jotai'
import { YTooltipPortal } from './TooltipPortals'
import { useGG } from '../GGBase'
import { tooltipState, themeState, TooltipPosition } from '../../atoms'

export interface YTooltipProps {
  id: string
  left: number
  top: number
  value: React.ReactNode
  wait?: boolean
}

const MIN_X = 2
const X_BUFFER = 8
const Y_BUFFER = 5

export const YTooltip = ({ id, left, top, value, wait }: YTooltipProps) => {
  const { ggState } = useGG() || {}
  const { width, height } = ggState || { width: 0, height: 0 }
  const [{ position, keepInParent, dx, dy }] = useAtom(tooltipState)
  const [{ font }] = useAtom(themeState)

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

      let leftPosition = left + X_BUFFER + xAdj
      if (shouldKeepInParent && leftPosition && leftPosition < MIN_X) {
        leftPosition = MIN_X
      } else if (shouldKeepInParent && left > width / 2) {
        leftPosition = left - containerWidth - X_BUFFER - xAdj
      }
      setLeftPos(leftPosition)

      const topPosition =
        top -
        (position === TooltipPosition.DATA ? containerHeight / 2 : 0) -
        Y_BUFFER +
        yAdj
      setTopPos(topPosition)
    }
  }, [width, left, top, position, shouldKeepInParent, xAdj, yAdj])

  useEffect(() => {
    const dummyTimeout = setTimeout(() => {
      calcPositions()
    }, 10)
    return () => clearTimeout(dummyTimeout)
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
