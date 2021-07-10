import React, { useMemo, useCallback, useEffect, useRef } from 'react'
import { Delaunay as d3Delaunay } from 'd3-delaunay'
import { useAtom } from 'jotai'
import { pointer } from 'd3-selection'
import { tooltipState } from '../atoms'
import { useGG } from '../gg/GGBase'
import { Aes } from '../gg/types/Aes'

export interface DelaunayProps {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  group?: 'x' | 'y'
  xAdj?: number
  yAdj?: number
  onMouseOver: ({ d, i }: { d: unknown; i: number | number[] }) => void
  onClick?: ({ d, i }: { d: unknown; i: number | number[] }) => void
  onMouseLeave: () => void
  data?: unknown[]
  aes?: Aes
  disabled?: boolean
}

export const Delaunay = ({
  x,
  y,
  group,
  xAdj = 0,
  yAdj = 0,
  onMouseOver,
  onClick,
  onMouseLeave,
  data,
  aes,
  disabled,
}: DelaunayProps) => {
  const { ggState } = useGG() || {}
  const {
    width,
    height,
    margin,
    data: ggData,
    scales,
  } = ggState || {
    width: 0,
    height: 0,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }

  const rectRef = useRef<SVGRectElement>(null)

  const readyToFocusRef = useRef(false)

  useEffect(() => {
    readyToFocusRef.current = false
    const timeout = setTimeout(() => {
      readyToFocusRef.current = true
    }, 1050)
    return () => clearTimeout(timeout)
  }, [ggData, data, scales])

  const [{ datum: ttDatum }, setTooltip] = useAtom(tooltipState)

  const delaunay = useMemo(
    () =>
      d3Delaunay.from(
        data as [],
        (v) => (x(v) as number) + xAdj,
        (v) => (y(v) as number) + yAdj
      ),
    [data, x, y, xAdj, yAdj]
  )

  const handleMouseOver = useCallback(
    (event) => {
      if (readyToFocusRef.current && data) {
        const [posX, posY] = pointer(event, rectRef.current)

        const ind = delaunay.find(posX, posY)
        const datum = data[ind]

        // skip if the data hasn't changed
        if (ttDatum && x(ttDatum[0]) === x(datum) && y(ttDatum[0] === y(datum)))
          return

        if (group === 'x' && aes?.x) {
          const groupDatum: unknown[] = []
          const groupDatumInd: number[] = []

          data.forEach((d, i) => {
            if (aes.x(d)?.toString() === aes.x(datum)?.toString()) {
              groupDatum.push(d)
              groupDatumInd.push(i)
            }
          })

          onMouseOver({ d: groupDatum, i: groupDatumInd })
          setTooltip((prev) => ({
            ...prev,
            datum: groupDatum,
          }))
        } else if (group === 'y' && aes?.y) {
          const groupDatum: unknown[] = []
          const groupDatumInd: number[] = []

          data.forEach((d, i) => {
            if (aes?.y && aes.y(d)?.toString() === aes.y(datum)?.toString()) {
              groupDatum.push(d)
              groupDatumInd.push(i)
            }
          })

          onMouseOver({ d: groupDatum, i: groupDatumInd })
          setTooltip((prev) => ({
            ...prev,
            datum: groupDatum,
          }))
        } else {
          onMouseOver({ d: datum, i: ind })
          setTooltip((prev) => ({
            ...prev,
            datum: [datum],
          }))
        }
      }
    },
    [data, aes, setTooltip, width, delaunay, onMouseOver, group, ttDatum]
  )

  const handleMouseOut = useMemo(
    () => () => {
      if (onMouseLeave) onMouseLeave()
      setTooltip((prev) => ({
        ...prev,
        datum: undefined,
      }))
    },
    [setTooltip, onMouseLeave]
  )

  const handleClick = useCallback(
    (event) => {
      const [posX, posY] = pointer(event, rectRef.current)
      if (onClick && data) {
        const ind = delaunay.find(posX, posY)
        const datum = data[ind]

        if (group === 'x' && aes?.x) {
          const groupDatum: unknown[] = []
          const groupDatumInd: number[] = []

          data.forEach((d, i) => {
            if (aes.x(d) === aes.x(datum)) {
              groupDatum.push(d)
              groupDatumInd.push(i)
            }
          })
          onClick({ d: groupDatum, i: groupDatumInd })
        } else if (group === 'y' && aes?.y) {
          const groupDatum: unknown[] = []
          const groupDatumInd: number[] = []

          data.forEach((d, i) => {
            if (aes?.y && aes.y(d)?.toString() === aes.y(datum)?.toString()) {
              groupDatum.push(d)
              groupDatumInd.push(i)
            }
          })

          onClick({ d: groupDatum, i: groupDatumInd })
        } else {
          onClick({ d: datum, i: ind })
        }
      }
      return width
    },
    [data, width, onClick, delaunay, aes, group]
  )

  return (
    <g>
      {' '}
      {!disabled && (
        <rect
          ref={rectRef}
          width={width - margin.right - margin.left + 4}
          height={height - margin.bottom - margin.top + 4}
          x={margin.left - 2}
          y={margin.top - 2}
          // stroke="tomato"
          fill="transparent"
          onMouseMove={handleMouseOver}
          onMouseLeave={handleMouseOut}
          onTouchStart={(event) => event.preventDefault()}
          onPointerMove={handleMouseOver}
          onPointerLeave={handleMouseOut}
          onClick={handleClick}
          style={{
            cursor: onClick && readyToFocusRef.current ? 'pointer' : undefined,
          }}
        />
      )}
    </g>
  )
}
