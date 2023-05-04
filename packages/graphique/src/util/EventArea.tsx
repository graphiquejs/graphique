import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react'
import { ScaleBand } from 'd3-scale'
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
import type { Aes, DataValue, BrushAction } from '../gg'
import { useGG } from '../gg/GGBase'
import { ZoomOutButton } from '../gg/zoom'
import {
  BrushCoords,
  isBetween,
  ExclusionArea,
  BrushExclusion,
} from './brushing'

interface StackMidpoint<X, Y> {
  groupVal: string
  xVal: X
  yVal: Y
}

interface EventAreaProps {
  x: (d: any) => number | undefined
  y: (d: any) => number | undefined
  group?: 'x' | 'y'
  xAdj?: number
  yAdj?: number
  onMouseOver?: ({ d, i }: { d: any; i: number[] }) => void
  onClick?: ({ d, i }: { d: any; i: number[] }) => void
  onMouseLeave: () => void
  onDatumFocus?: (data: any, index: number[]) => void
  data?: unknown[]
  stackXMidpoints?: StackMidpoint<string | number, string | number>[]
  stackYMidpoints?: StackMidpoint<string | number, string | number>[]
  xBandScale?: ScaleBand<string>
  yBandScale?: ScaleBand<string>
  aes?: Omit<Aes, 'x'> & {
    x?: DataValue
    y0?: DataValue
    y1?: DataValue
  }
  positionKeys?: string
  disabled?: boolean
  fill?: 'x' | 'y'
  showTooltip?: boolean
  brushAction?: BrushAction
}

const BUFFER = 2

export const EventArea = ({
  x,
  y,
  group,
  xAdj = 0,
  yAdj = 0,
  onMouseOver,
  onClick,
  onMouseLeave,
  onDatumFocus,
  data,
  aes,
  positionKeys,
  disabled,
  showTooltip = true,
  brushAction,
  stackXMidpoints,
  stackYMidpoints,
  xBandScale,
  yBandScale,
  fill,
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
  const [{ domain: givenYDomain, reverse: reverseY }, setYScale] =
    useAtom(yScaleState)
  const [{ reverse: reverseX }, setXScale] = useAtom(xScaleState)
  const [
    { xDomain: xZoomDomain, yDomain: yZoomDomain, onZoom, onUnzoom },
    setZoom,
  ] = useAtom(zoomState)

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

  const isVoronoi = useMemo(() => !!onDatumFocus, [onDatumFocus])

  const [isBrushing, setIsBrushing] = useState(false)

  useEffect(() => {
    readyToFocusRef.current = false
    const duration = animationDuration ?? 1000
    const timeout = setTimeout(() => {
      readyToFocusRef.current = true
    }, duration + 50)
    return () => clearTimeout(timeout)
  }, [
    ggData?.length,
    data?.length,
    width,
    animationDuration,
    xZoomDomain,
    yZoomDomain,
    positionKeys,
  ])

  const hasCategoricalAxis = useMemo(
    () =>
      typeof scales?.xScale.domain()[0] === 'string' ||
      typeof scales?.yScale.domain()[0] === 'string',
    [scales?.xScale, scales?.yScale]
  )

  const delaunayData = useMemo(() => data as [], [data])
  const delaunayX = useCallback((v: any) => (x(v) ?? 0) + xAdj, [x, xAdj])
  const delaunayY = useCallback((v: any) => (y(v) ?? 0) + yAdj, [y, yAdj])

  const delaunay = useMemo(
    () => Delaunay.from(delaunayData, delaunayX, delaunayY),
    [data, delaunayX, delaunayY]
  )

  const xDelaunays = useMemo(() => {
    if (!stackYMidpoints) return undefined

    const delaunays = xBandScale?.domain().map((xVal) => {
      const thisX = scales?.xScale(xVal)
      const xGroupData = stackYMidpoints.filter((s) => s.xVal === xVal)

      return {
        delaunay: Delaunay.from(
          xGroupData,
          (v) => scales?.xScale(v.xVal) ?? 0,
          (v) => scales?.yScale(v.yVal) as number
        ),
        xVal: thisX,
        data: xGroupData,
      }
    })
    if (!hasCategoricalAxis) {
      return delaunays?.sort((a, b) => (a.xVal ?? 0) - (b.xVal ?? 0))
    }
    return delaunays
  }, [
    stackYMidpoints,
    scales?.yScale,
    xBandScale,
    hasCategoricalAxis,
    scales?.xScale,
    xAdj,
  ])

  const xVoronois = useMemo(() => {
    if (!xDelaunays || !isVoronoi) return undefined

    const dx = (xBandScale?.step?.() ?? 0) / 2

    return xDelaunays.map((xd) => ({
      voronoi: xd.delaunay.voronoi([
        (xd?.xVal ?? 0) + xAdj - dx,
        margin.top,
        (xd?.xVal ?? 0) + dx + xAdj,
        height - margin.bottom,
      ]),
      data: xd.data,
    }))
  }, [xDelaunays, scales?.xScale, xBandScale, xAdj, width, margin])

  const yDelaunays = useMemo(() => {
    if (!stackXMidpoints) return undefined

    const delaunays = yBandScale?.domain().map((yVal) => {
      const thisY = scales?.yScale(yVal)
      const yGroupData = stackXMidpoints.filter((s) => s.yVal === yVal)

      return {
        delaunay: Delaunay.from(
          [...yGroupData],
          (v) => scales?.xScale(v.xVal) as number,
          (v) => scales?.yScale(v.yVal) as number
        ),
        yVal: thisY,
        data: yGroupData,
      }
    })
    if (!hasCategoricalAxis) {
      return delaunays?.sort((a, b) => (a.yVal ?? 0) - (b.yVal ?? 0))
    }
    return delaunays
  }, [
    stackXMidpoints,
    scales?.yScale,
    scales?.xScale,
    yBandScale,
    hasCategoricalAxis,
  ])

  const yVoronois = useMemo(() => {
    if (!yDelaunays || !isVoronoi) return undefined

    const dy = (yBandScale?.step?.() ?? 0) / 2

    return yDelaunays.map((yd) => ({
      voronoi: yd.delaunay.voronoi([
        margin.left,
        (yd.yVal ?? 0) - dy + yAdj,
        width - margin.right,
        (yd.yVal ?? 0) + dy + yAdj,
      ]),
      data: yd.data,
    }))
  }, [yDelaunays, scales?.yScale, yAdj, width, margin])

  const voronoi = useMemo(() => {
    if (!isVoronoi) return undefined

    return delaunay.voronoi([
      margin.left,
      margin.top,
      width - margin.right,
      height - margin.bottom,
    ])
  }, [delaunay, isVoronoi])

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

        const xStart =
          (yDelaunays || yGrouped) && xRange ? xRange[0] : Math.min(x0, x1)
        const xEnd =
          (yDelaunays || yGrouped) && xRange ? xRange[1] : Math.max(x0, x1)
        const yStart =
          (xDelaunays || xGrouped) && yRange
            ? yRange[1] - BUFFER
            : Math.min(y0, y1)
        const yEnd =
          (xDelaunays || xGrouped) && yRange
            ? yRange[0] + BUFFER
            : Math.max(y0, y1)

        if (exclusionLeftRef.current) {
          exclusionLeftRef.current.setAttribute(
            'x',
            `${margin.left - BUFFER}px`
          )
          exclusionLeftRef.current.setAttribute('y', `${yStart}px`)
          exclusionLeftRef.current.setAttribute(
            'width',
            `${Math.max(xStart - margin.left + BUFFER, 0)}px`
          )
          exclusionLeftRef.current.setAttribute('height', `${yEnd - yStart}px`)
        }
        if (exclusionRightRef.current) {
          exclusionRightRef.current.setAttribute('x', `${xEnd}px`)
          exclusionRightRef.current.setAttribute('y', `${yStart}px`)
          exclusionRightRef.current.setAttribute(
            'width',
            `${Math.max(width - margin.right - xEnd + BUFFER, 0)}px`
          )
          exclusionRightRef.current.setAttribute('height', `${yEnd - yStart}px`)
        }
        if (exclusionTopRef.current) {
          exclusionTopRef.current.setAttribute('x', `${margin.left - BUFFER}px`)
          exclusionTopRef.current.setAttribute('y', `${margin.top - BUFFER}px`)
          exclusionTopRef.current.setAttribute(
            'width',
            `${width - margin.right - margin.left + BUFFER * 2}px`
          )
          exclusionTopRef.current.setAttribute(
            'height',
            `${Math.max(yStart - margin.top + BUFFER, 0)}px`
          )
        }
        if (exclusionBottomRef.current) {
          exclusionBottomRef.current.setAttribute(
            'x',
            `${margin.left - BUFFER}px`
          )
          exclusionBottomRef.current.setAttribute('y', `${yEnd}px`)
          exclusionBottomRef.current.setAttribute(
            'width',
            `${width - margin.right - margin.left + BUFFER * 2}px`
          )
          exclusionBottomRef.current.setAttribute(
            'height',
            `${Math.max(height - yEnd - margin.bottom + BUFFER, 0)}px`
          )
        }
      }
    },
    [xGrouped, yGrouped, margin, scales, xDelaunays, yDelaunays]
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

          if (xGrouped || xDelaunays) return isBetween(xVal, x0, x1)
          if (yGrouped || yDelaunays) return isBetween(yVal, y0, y1)
          return isBetween(xVal, x0, x1) && isBetween(yVal, y0, y1)
        })

        if (brushedData && brushedData.length) {
          let newXDomain = [
            scales?.xScale.invert(Math.min(x0, x1)),
            scales?.xScale.invert(Math.max(x0, x1)),
          ]

          newXDomain = reverseX ? newXDomain.reverse() : newXDomain

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

          let reconciledYExtent = givenYDomain
            ? [
                max([brushedYExtent[0], givenYDomain[0]]),
                min([brushedYExtent[1], givenYDomain[1]]),
              ]
            : brushedYExtent

          reconciledYExtent = reverseY
            ? reconciledYExtent
            : reconciledYExtent.reverse()

          let newYDomain = xGrouped
            ? reconciledYExtent
            : [
                scales?.yScale.invert(Math.min(y0, y1)),
                scales?.yScale.invert(Math.max(y0, y1)),
              ]

          newYDomain = reverseY ? newYDomain : newYDomain.reverse()

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
            xDomain: {
              ...prev.xDomain,
              current: newXDomain,
            },
            yDomain: {
              ...prev.yDomain,
              current: newYDomain,
            },
          }))

          if (onZoom) onZoom({ x: newXDomain, y: newYDomain })
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
      xDelaunays,
      yDelaunays,
      reverseX,
      reverseY,
      aes,
      scales,
      y,
      xZoomDomain,
      yZoomDomain,
      onZoom,
    ]
  )

  const handleMouseOver = useCallback(
    (event) => {
      if (readyToFocusRef.current && data && data.length) {
        const [posX, posY] = pointer(event, rectRef.current)

        if (isHeldDownRef.current && brushAction && !hasCategoricalAxis) {
          handleBrush(posX, posY)
        } else if (showTooltip) {
          let ind = delaunay.find(posX, posY)

          if (xDelaunays) {
            const xGroupWidth = xBandScale?.step?.() ?? 1
            const adjPosX =
              (posX -
                margin.left +
                ((xBandScale?.padding?.() ?? 0) * xGroupWidth) / 2) /
              xGroupWidth
            const xGroupIndex = Math.min(
              Math.floor(Math.max(0, adjPosX)),
              xDelaunays.length - 1
            )
            const xStackIndex = xDelaunays[xGroupIndex].delaunay.find(
              posX,
              posY
            )
            const xStackDatum = xDelaunays[xGroupIndex].data[xStackIndex]
            ind = data.findIndex(
              (d) =>
                aes?.x?.(d) === xStackDatum.xVal &&
                scales?.groupAccessor?.(d) === xStackDatum.groupVal
            )
          }

          if (yDelaunays) {
            const yGroupHeight = yBandScale?.step?.() ?? 1
            const adjPosY =
              posY +
              margin.top -
              yAdj +
              ((yBandScale?.padding?.() ?? 0) * yGroupHeight) / 2
            const yGroupIndex = Math.min(
              Math.floor(Math.max(0, adjPosY) / yGroupHeight),
              yDelaunays.length - 1
            )
            const yStackIndex = yDelaunays[yGroupIndex].delaunay.find(
              posX,
              posY
            )
            const yStackDatum = yDelaunays[yGroupIndex].data[yStackIndex]
            ind = data.findIndex(
              (d) =>
                aes?.y?.(d) === yStackDatum.yVal &&
                scales?.groupAccessor?.(d) === yStackDatum.groupVal
            )
          }

          const datum = data[ind]

          const xDomain = scales?.xScale.domain() as any[]
          const yDomain = scales?.yScale.domain() as any[]
          const datumInXRange =
            ['x', 'y'].includes(fill ?? '') ||
            (aes?.x &&
              xDomain &&
              (xDomain.includes(aes?.x(datum)) ||
                isBetween(aes?.x(datum) as number, xDomain[0], xDomain[1])))

          const datumInYRange =
            ['x', 'y'].includes(fill ?? '') ||
            (aes?.y &&
              yDomain &&
              (yDomain.includes(aes?.y(datum)) ||
                isBetween(aes?.y(datum) as number, yDomain[0], yDomain[1])))

          if (xGrouped && aes?.x && datumInXRange) {
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

            if (onMouseOver) onMouseOver({ d: groupDatum, i: groupDatumInd })
            setTooltip((prev) => ({
              ...prev,
              datum: groupDatum,
            }))
          } else if (yGrouped && aes?.y && datumInYRange) {
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

            if (onMouseOver) onMouseOver({ d: groupDatum, i: groupDatumInd })
            setTooltip((prev) => ({
              ...prev,
              datum: groupDatum,
            }))
          } else if (datumInXRange && datumInYRange) {
            if (onMouseOver) onMouseOver({ d: [datum], i: [ind] })
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
      yDelaunays,
      xDelaunays,
      onMouseOver,
      xGrouped,
      yGrouped,
      ttDatum,
      scales,
      xBandScale,
      yBandScale,
      handleBrush,
      brushAction,
      hasCategoricalAxis,
      fill,
      margin.top,
      margin.left,
    ]
  )

  const handleMouseOut = useCallback(
    (event) => {
      if (readyToFocusRef.current) {
        if (onMouseLeave) onMouseLeave()
        if (showTooltip) resetTooltip()
        if (isBrushing) handleBrushStop(event)
      }
      document.onselectstart = () => true
    },
    [showTooltip, resetTooltip, onMouseLeave, isBrushing]
  )

  const handleUnbrush = useCallback(
    (event) => {
      handleMouseOut(event)

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
      if (onUnzoom) onUnzoom()
    },
    [
      handleMouseOut,
      resetTooltip,
      resetBrush,
      setYScale,
      setXScale,
      setZoom,
      yZoomDomain?.original,
      xZoomDomain?.original,
      brushAction,
      showTooltip,
      onUnzoom,
    ]
  )

  const handleClick = useCallback(
    (event) => {
      const [posX, posY] = pointer(event, rectRef.current)

      document.onselectstart = () => false

      if (event.detail > 1) event.preventDefault()

      if (data && data.length && brushAction && !hasCategoricalAxis) {
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
        }, 180)
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
          onClick({ d: datum, i: [ind] })
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
      hasCategoricalAxis,
    ]
  )

  const handleVoronoiMouseOver = useCallback(
    (voronoiData: unknown[], i) => {
      if (
        readyToFocusRef.current &&
        voronoiData &&
        voronoiData.length &&
        !isBrushing
      ) {
        const datum = voronoiData[i]
        const focusedData: unknown[] = []
        const focusedIndexes: number[] = []

        if (xGrouped && aes?.x) {
          voronoiData.forEach((vd, ind) => {
            if (aes?.x && aes.x(vd)?.toString() === aes.x(datum)?.toString()) {
              focusedData.push(vd)
              focusedIndexes.push(ind)
            }
          })
        } else if (yGrouped && aes?.y) {
          voronoiData.forEach((vd, ind) => {
            if (aes?.y && aes.y(vd)?.toString() === aes.y(datum)?.toString()) {
              focusedData.push(vd)
              focusedIndexes.push(ind)
            }
          })
        } else if (data && yDelaunays) {
          const vd = datum as StackMidpoint<string | number, string | number>

          data.forEach((d, ind) => {
            if (
              aes?.y?.(d) === vd.yVal &&
              scales?.groupAccessor?.(d) === vd.groupVal
            ) {
              focusedData.push(d)
              focusedIndexes.push(ind)
            }
          })
        } else if (data && xDelaunays) {
          const vd = datum as StackMidpoint<string | number, string | number>

          data.forEach((d, ind) => {
            if (
              aes?.x?.(d) === vd.xVal &&
              scales?.groupAccessor?.(d) === vd.groupVal
            ) {
              focusedData.push(d)
              focusedIndexes.push(ind)
            }
          })
        } else {
          focusedData.push(datum)
          focusedIndexes.push(i)
        }

        if (onMouseOver) onMouseOver({ d: focusedData, i: focusedIndexes })
        if (onDatumFocus) onDatumFocus(focusedData, focusedIndexes)
      }
    },
    [
      isBrushing,
      onMouseOver,
      onDatumFocus,
      yGrouped,
      yDelaunays,
      aes?.y,
      scales?.groupAccessor,
    ]
  )

  return (
    <>
      <g>
        {!disabled && (
          <>
            <clipPath id={`__gg_canvas_${id}`}>
              <rect
                width={width - margin.right - margin.left + BUFFER * 2}
                height={height - margin.bottom - margin.top + BUFFER * 2 }
                x={margin.left - BUFFER}
                y={margin.top - BUFFER}
                fill="transparent"
              />
            </clipPath>
            <rect
              ref={rectRef}
              width={width - margin.right - margin.left + BUFFER * 2}
              height={height - margin.bottom - margin.top + BUFFER}
              x={margin.left - BUFFER}
              y={margin.top - BUFFER}
              // stroke="tomato"
              fill="transparent"
              onMouseMove={handleMouseOver}
              onMouseLeave={handleMouseOut}
              onPointerMove={handleMouseOver}
              onPointerLeave={handleMouseOut}
              onMouseDown={handleClick}
              onMouseUp={handleBrushStop}
              onDoubleClick={handleUnbrush}
              style={{
                pointerEvents: isVoronoi ? 'none' : undefined,
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
      {!xVoronois && !yVoronois && voronoi && delaunayData && !brushAction && (
        <g onMouseLeave={handleMouseOut} onPointerLeave={handleMouseOut}>
          {delaunayData.map((_, i) => (
            <path
              key={`cell-${i.toString()}`}
              style={{ pointerEvents: 'all' }}
              d={voronoi.renderCell(i)}
              fill="none"
              // stroke="tomato"
              onMouseOver={() => handleVoronoiMouseOver(delaunayData, i)}
              onMouseDown={handleClick}
              onMouseUp={handleBrushStop}
              onDoubleClick={handleUnbrush}
            />
          ))}
        </g>
      )}
      {xVoronois &&
        !brushAction &&
        xVoronois.map((v, i) => (
          <g
            key={`xGroup-voronoi-${i.toString()}`}
            onMouseLeave={handleMouseOut}
            onPointerLeave={handleMouseOut}
          >
            {v.data.map((_, j) => (
              <path
                key={`cell-${i.toString()}-${j.toString()}`}
                style={{ pointerEvents: 'all' }}
                d={v.voronoi.renderCell(j)}
                fill="none"
                // stroke="tomato"
                onMouseOver={() => handleVoronoiMouseOver(v.data, j)}
              />
            ))}
          </g>
        ))}
      {yVoronois &&
        !brushAction &&
        yVoronois.map((v, i) => (
            <g
              key={`yGroup-voronoi-${i.toString()}`}
              onMouseLeave={handleMouseOut}
              onPointerLeave={handleMouseOut}
            >
              {v.data.map((_, j) => (
                <path
                  key={`cell-${i.toString()}-${j.toString()}`}
                  style={{ pointerEvents: 'all' }}
                  d={v.voronoi.renderCell(j)}
                  fill="none"
                  // stroke="tomato"
                  onMouseOver={() => handleVoronoiMouseOver(v.data, j)}
                />
              ))}
            </g>
          ))}
    </>
  )
}
