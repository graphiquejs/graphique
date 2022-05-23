import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { Delaunay } from 'd3-delaunay'
import { useAtom } from 'jotai'
import { pointer } from 'd3-selection'
import { extent, max, min } from 'd3-array'
import {
  tooltipState,
  themeState,
  xScaleState,
  yScaleState,
  zoomState,
} from '../atoms'
import { useGG, Aes, DataValue, BrushAction } from '../gg'
import { ZoomOutButton } from '../gg/zoom'
import {
  BrushCoords,
  isBetween,
  ExclusionArea,
  BrushExclusion,
} from './brushing'

interface EventAreaProps {
  x: (d: any) => number | undefined
  y: (d: any) => number | undefined
  group?: 'x' | 'y'
  xAdj?: number
  yAdj?: number
  onMouseOver: ({ d, i }: { d: any; i: number | number[] }) => void
  onClick?: ({ d, i }: { d: any; i: number | number[] }) => void
  onMouseLeave: () => void
  data?: unknown[]
  aes?: Omit<Aes, 'x'> & {
    x?: DataValue
    y0?: DataValue
    y1?: DataValue
  }
  disabled?: boolean
  showTooltip?: boolean
  brushAction?: BrushAction
}

export const EventArea = ({
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
  showTooltip = true,
  brushAction,
}: EventAreaProps) => {
  const { ggState } = useGG() || {}
  const {
    width,
    height,
    margin,
    data: ggData,
    scales,
    id,
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

  const [{ datum: ttDatum }, setTooltip] = useAtom(tooltipState)
  const [{ animationDuration }] = useAtom(themeState)
  const [{ domain: givenYDomain }, setYScale] = useAtom(yScaleState)
  const [, setXScale] = useAtom(xScaleState)
  const [{ xDomain: xZoomDomain, yDomain: yZoomDomain }, setZoom] =
    useAtom(zoomState)

  const rectRef = useRef<SVGRectElement>(null)
  const readyToFocusRef = useRef(false)
  const isHeldDownRef = useRef(false)
  const heldDownTimeout = useRef<NodeJS.Timeout | null>(null)
  const brushCoords = useRef<BrushCoords>()

  const exclusionTopRef = useRef<SVGRectElement | null>(null)
  const exclusionRightRef = useRef<SVGRectElement | null>(null)
  const exclusionBottomRef = useRef<SVGRectElement | null>(null)
  const exclusionLeftRef = useRef<SVGRectElement | null>(null)

  const xGrouped = useMemo(() => group === 'x', [group])
  const yGrouped = useMemo(() => group === 'y', [group])

  const [isBrushing, setIsBrushing] = useState(false)

  useEffect(() => {
    readyToFocusRef.current = false
    const duration = animationDuration ?? 1000
    const timeout = setTimeout(() => {
      readyToFocusRef.current = true
    }, duration + 50)
    return () => clearTimeout(timeout)
  }, [ggData, data, scales, animationDuration])

  const delaunay = useMemo(
    () =>
      Delaunay.from(
        data as [],
        (v) => (x(v) as number) + xAdj,
        (v) => (y(v) as number) + yAdj
      ),
    [data, x, y, xAdj, yAdj]
  )

  const resetTooltip = useCallback(() => {
    setTooltip((prev) => ({
      ...prev,
      datum: undefined,
    }))
  }, [setTooltip])

  const resetBrush = useCallback(() => {
    if (exclusionLeftRef.current) {
      exclusionLeftRef.current.setAttribute('width', '0px')
    }
    setIsBrushing(false)
  }, [setIsBrushing])

  const handleBrush = useCallback(
    (posX: number, posY: number) => {
      if (isHeldDownRef.current && brushCoords.current) {
        brushCoords.current = {
          ...brushCoords.current,
          x1: posX,
          y1: posY,
        }

        const { x0, x1, y0, y1 } = brushCoords.current

        const xRange = scales?.xScale.range()
        const yRange = scales?.yScale.range()

        const xStart = yGrouped && xRange ? xRange[0] : Math.min(x0, x1)
        const xEnd = yGrouped && xRange ? xRange[1] : Math.max(x0, x1)
        const yStart = xGrouped && yRange ? yRange[1] - 2 : Math.min(y0, y1)
        const yEnd = xGrouped && yRange ? yRange[0] + 2 : Math.max(y0, y1)

        if (exclusionLeftRef.current) {
          exclusionLeftRef.current.setAttribute('x', `${margin.left - 2}px`)
          exclusionLeftRef.current.setAttribute('y', `${yStart}px`)
          exclusionLeftRef.current.setAttribute(
            'width',
            `${Math.max(xStart - margin.left + 2, 0)}px`
          )
          exclusionLeftRef.current.setAttribute('height', `${yEnd - yStart}px`)
        }
        if (exclusionRightRef.current) {
          exclusionRightRef.current.setAttribute('x', `${xEnd}px`)
          exclusionRightRef.current.setAttribute('y', `${yStart}px`)
          exclusionRightRef.current.setAttribute(
            'width',
            `${Math.max(width - margin.right - xEnd + 2, 0)}px`
          )
          exclusionRightRef.current.setAttribute('height', `${yEnd - yStart}px`)
        }
        if (exclusionTopRef.current) {
          exclusionTopRef.current.setAttribute('x', `${margin.left - 2}px`)
          exclusionTopRef.current.setAttribute('y', `${margin.top - 2}px`)
          exclusionTopRef.current.setAttribute(
            'width',
            `${width - margin.right - margin.left + 4}px`
          )
          exclusionTopRef.current.setAttribute(
            'height',
            `${Math.max(yStart - margin.top + 2, 0)}px`
          )
        }
        if (exclusionBottomRef.current) {
          exclusionBottomRef.current.setAttribute('x', `${margin.left - 2}px`)
          exclusionBottomRef.current.setAttribute('y', `${yEnd}px`)
          exclusionBottomRef.current.setAttribute(
            'width',
            `${width - margin.right - margin.left + 4}px`
          )
          exclusionBottomRef.current.setAttribute(
            'height',
            `${Math.max(height - yEnd - margin.bottom + 2, 0)}px`
          )
        }
      }
    },
    [xGrouped, yGrouped, margin, scales]
  )

  const handleBrushStop = useCallback(
    (event) => {
      event.preventDefault()
      if (isHeldDownRef.current && brushCoords.current) {
        const { x0, x1, y0, y1 } = brushCoords.current

        resetTooltip()
        resetBrush()

        const brushedData = ggData?.filter((d) => {
          const xVal = x(d)
          const yVal = y(d)

          if (xGrouped) return isBetween(xVal, x0, x1)
          if (yGrouped) return isBetween(yVal, y0, y1)
          return isBetween(xVal, x0, x1) && isBetween(yVal, y0, y1)
        })

        if (brushedData && brushedData.length) {
          const newXDomain = [
            scales?.xScale.invert(Math.min(x0, x1)),
            scales?.xScale.invert(Math.max(x0, x1)),
          ] as [number, number]

          const brushedYExtent = extent(
            brushedData
              .map((d) => {
                const yVal = (aes?.y && aes.y(d)) as number
                const y0Val = (aes?.y0 && aes.y0(d)) as number
                const y1Val = (aes?.y1 && aes.y1(d)) as number

                return extent([yVal, y0Val, y1Val])
              })
              .flat() as number[]
          )

          const reconciledYExtent = givenYDomain
            ? [
                max([brushedYExtent[0], givenYDomain[0]]),
                min([brushedYExtent[1], givenYDomain[1]]),
              ]
            : brushedYExtent

          const newYDomain = xGrouped
            ? reconciledYExtent
            : [
                scales?.yScale.invert(Math.max(y0, y1)),
                scales?.yScale.invert(Math.min(y0, y1)),
              ]

          // TODO: do nothing if sufficiently zoomed in already
          // e.g. 50-100X in either x/y directions

          setXScale((prev) => ({
            ...prev,
            domain: newXDomain,
          }))
          setYScale((prev) => ({
            ...prev,
            domain: newYDomain,
          }))
          setZoom((prev) => ({
            ...prev,
            isZooming: false,
            xDomain: {
              ...prev.xDomain,
              current: newXDomain,
            },
            yDomain: {
              ...prev.yDomain,
              current: newYDomain,
            },
          }))
        }
      }
      isHeldDownRef.current = false
      if (heldDownTimeout.current) clearTimeout(heldDownTimeout.current)
    },
    [
      resetTooltip,
      resetBrush,
      ggData,
      xGrouped,
      yGrouped,
      aes,
      scales,
      y,
      xZoomDomain,
      yZoomDomain,
    ]
  )

  const handleMouseOver = useCallback(
    (event) => {
      if (readyToFocusRef.current && data && data.length) {
        const [posX, posY] = pointer(event, rectRef.current)

        if (isHeldDownRef.current && brushAction) {
          handleBrush(posX, posY)
        } else if (showTooltip) {
          const ind = delaunay.find(posX, posY)
          const datum = data[ind]

          const xDomain = scales?.xScale.domain()
          const yDomain = scales?.yScale.domain()

          const datumInRange =
            aes?.x &&
            (aes?.y || (aes?.y0 && aes?.y1)) &&
            xDomain &&
            yDomain &&
            isBetween(aes?.x(datum) as number, xDomain[0], xDomain[1]) &&
            (aes?.y
              ? isBetween(aes.y(datum) as number, yDomain[0], yDomain[1])
              : aes?.y0 &&
                aes?.y1 &&
                (isBetween(aes?.y0(datum) as number, yDomain[0], yDomain[1]) ||
                  isBetween(aes?.y1(datum) as number, yDomain[0], yDomain[1])))

          if (xGrouped && aes?.x && datumInRange) {
            const left = x(datum)

            // skip if the data hasn't changed
            if (ttDatum && x(ttDatum[0]) === left) return

            const groupDatum: unknown[] = []
            const groupDatumInd: number[] = []

            data.forEach((d, i) => {
              if (aes.x && aes.x(d)?.toString() === aes.x(datum)?.toString()) {
                groupDatum.push(d)
                groupDatumInd.push(i)
              }
            })

            const tooltips = document.getElementsByClassName(
              `__gg-tooltip-${id}`
            ) as HTMLCollectionOf<SVGGElement>
            Array.from(tooltips).forEach((m) => {
              const thisTooltip = m
              thisTooltip.style.transform = `translate(${left}px, 0)`
            })

            onMouseOver({ d: groupDatum, i: groupDatumInd })
            setTooltip((prev) => ({
              ...prev,
              datum: groupDatum,
            }))
          } else if (yGrouped && aes?.y && datumInRange) {
            // skip if the data hasn't changed
            if (ttDatum && y(ttDatum[0] === y(datum))) return

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
          } else if (datumInRange) {
            onMouseOver({ d: datum, i: ind })
            setTooltip((prev) => ({
              ...prev,
              datum: [datum],
            }))
          }
        }
      }
    },
    [
      data,
      aes,
      setTooltip,
      width,
      delaunay,
      onMouseOver,
      xGrouped,
      yGrouped,
      ttDatum,
      scales,
      handleBrush,
      brushAction,
    ]
  )

  const handleMouseOut = useCallback(() => {
    if (readyToFocusRef.current) {
      if (onMouseLeave) onMouseLeave()
      if (showTooltip) resetTooltip()
    }
  }, [showTooltip, resetTooltip, onMouseLeave])

  const handleUnbrush = useCallback(() => {
    handleMouseOut()

    if (brushAction === 'zoom') {
      setYScale((prev) => ({
        ...prev,
        domain: yZoomDomain?.original,
      }))
      setXScale((prev) => ({
        ...prev,
        domain: xZoomDomain?.original,
      }))
      setZoom((prev) => ({
        ...prev,
        xDomain: {
          ...prev.xDomain,
          current: undefined,
        },
        yDomain: {
          ...prev.yDomain,
          current: undefined,
        },
      }))
    }

    if (showTooltip) resetTooltip()
    if (brushAction) resetBrush()
  }, [
    handleMouseOut,
    resetTooltip,
    resetBrush,
    setYScale,
    setXScale,
    setZoom,
    yZoomDomain?.original,
    xZoomDomain,
    brushAction,
    showTooltip,
  ])

  const handleClick = useCallback(
    (event) => {
      const [posX, posY] = pointer(event, rectRef.current)

      if (event.detail > 1) event.preventDefault()

      if (data && data.length && brushAction) {
        heldDownTimeout.current = setTimeout(() => {
          onMouseLeave()
          resetTooltip()
          setIsBrushing(true)
          isHeldDownRef.current = true
          brushCoords.current = {
            x0: posX,
            x1: posX,
            y0: posY,
            y1: posY,
          }
        }, 300)
      }

      if (onClick && data && data.length) {
        const ind = delaunay.find(posX, posY)
        const datum = data[ind]

        if (xGrouped && aes?.x) {
          const groupDatum: unknown[] = []
          const groupDatumInd: number[] = []

          data.forEach((d, i) => {
            if (aes.x && aes.x(d) === aes.x(datum)) {
              groupDatum.push(d)
              groupDatumInd.push(i)
            }
          })
          onClick({ d: groupDatum, i: groupDatumInd })
        } else if (yGrouped && aes?.y) {
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
    [
      data,
      width,
      onClick,
      delaunay,
      aes,
      group,
      onMouseLeave,
      resetTooltip,
      brushAction,
    ]
  )

  return (
    <>
      <g>
        {!disabled && (
          <>
            <clipPath id={`__gg_canvas_${id}`}>
              <rect
                width={width - margin.right - margin.left + 4}
                height={height - margin.bottom - margin.top + 4}
                x={margin.left - 2}
                y={margin.top - 2}
                fill="transparent"
              />
            </clipPath>
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
              onMouseDown={handleClick}
              onMouseUp={handleBrushStop}
              onDoubleClick={handleUnbrush}
              style={{
                cursor:
                  onClick && readyToFocusRef.current ? 'pointer' : undefined,
              }}
            />
            {isBrushing && (
              <BrushExclusion id={id}>
                {[
                  exclusionTopRef,
                  exclusionRightRef,
                  exclusionBottomRef,
                  exclusionLeftRef,
                ].map((ref, i) => (
                  <ExclusionArea ref={ref} key={`exclusion-${i.toString()}`} />
                ))}
              </BrushExclusion>
            )}
            {(xZoomDomain?.current || yZoomDomain?.current) && (
              <ZoomOutButton
                id={id}
                x={width - margin.right}
                y={height}
                onClick={handleUnbrush}
                isBrushing={isBrushing}
              />
            )}
          </>
        )}
      </g>
    </>
  )
}
