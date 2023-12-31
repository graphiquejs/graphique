import React, {
  useEffect,
  useMemo,
  CSSProperties,
  SVGAttributes,
  useRef,
  useState,
  useCallback,
} from 'react'
import {
  useGG,
  xScaleState,
  yScaleState,
  themeState,
  zoomState,
  focusNodes,
  unfocusNodes,
  EventArea,
  widen,
  BrushAction,
  isDate,
  defineGroupAccessor,
  PageVisibility,
  tooltipState,
  BarColPositions,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { extent, min, max, sum } from 'd3-array'
import { stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape'
import { Tooltip, LineMarker } from './tooltip'
import { GeomAes, HistogramBin } from './types'

const STACKED_OR_FILLED: BarColPositions[] = ['stack', 'fill']

export interface GeomColProps<Datum> extends SVGAttributes<SVGRectElement> {
  data?: Datum[]
  aes?: GeomAes<Datum>
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  xPadding?: number
  dodgePadding?: number
  xDomain?: unknown[]
  yDomain?: unknown[]
  showTooltip?: boolean
  brushAction?: BrushAction
  onDatumFocus?: (data: Datum[], index: number[]) => void
  onDatumSelection?: (data: Datum[], index: number[]) => void
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
  freeBaseLine?: boolean
  align?: 'center' | 'left' | 'right'
  position?: BarColPositions
  focusType?: 'group' | 'individual'
}

const GeomCol = <Datum,>({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  onExit,
  xDomain,
  yDomain,
  xPadding = 0.2,
  dodgePadding = 0.05,
  showTooltip = true,
  brushAction,
  fillOpacity = 1,
  strokeOpacity = 1,
  freeBaseLine,
  align = 'center',
  position = 'stack',
  focusType = 'group',
  ...props
}: GeomColProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { data, aes, scales, copiedScales, height, margin, width, id } =
    ggState || {}

  const [theme, setTheme] = useAtom(themeState)
  const [{ xDomain: xZoomDomain }] = useAtom(zoomState)
  const [, setXScale] = useAtom(xScaleState)
  const [, setYScale] = useAtom(yScaleState)
  const [{ position: tooltipPosition }] = useAtom(tooltipState)

  const isDodged = position === 'dodge'

  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes
  }, [aes, localAes])

  const geomData = useMemo(() => {
    const thisData = localData || data
    return thisData?.filter((d) => {
      const xVal = geomAes.x(d)
      return xZoomDomain?.current
        ? xVal !== null &&
            xVal <= xZoomDomain.current[1] &&
            xVal >= xZoomDomain.current[0]
        : true
    })
  }, [geomAes, xZoomDomain?.current, data])

  const { fill: fillColor, stroke: strokeColor, strokeWidth, opacity } = { ...props }
  const { defaultFill, animationDuration: duration } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const bottomPos = useMemo(
    () => (height && margin ? height - margin.bottom : 0),
    [height, margin]
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        col: {
          position,
          fillOpacity: props.style?.fillOpacity || props.style?.opacity || opacity || fillOpacity,
          stroke: strokeColor,
          groupAccessor: geomAes?.fill || geomAes?.stroke,
          strokeWidth: props.style?.strokeWidth || strokeWidth,
          strokeOpacity: props.style?.strokeOpacity || strokeOpacity,
        },
      },
    }))
  }, [
    fillOpacity,
    opacity,
    setTheme,
    strokeColor,
    strokeOpacity,
    strokeWidth,
    props.style,
    position,
  ])

  const baseStyles = {
    transition: 'fill-opacity 200ms',
    fillOpacity,
    strokeOpacity,
    ...props.style,
  }

  const focusedStyles = {
    ...baseStyles,
    fillOpacity,
    strokeOpacity,
    ...focusedStyle,
  }

  const unfocusedStyles = {
    ...baseStyles,
    fillOpacity: 0.5,
    strokeOpacity: 0.5,
    ...unfocusedStyle,
  }

  const fill = useCallback(
    (d: Datum) =>
      fillColor ||
      (geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(
            geomAes.fill(d)
          ) as string | undefined)
        : defaultFill),
    [geomAes, copiedScales, fillColor, defaultFill]
  )

  const stroke = useCallback(
    (d: Datum) =>
      strokeColor ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d)) as
            | string
            | undefined)
        : 'none'),
    [geomAes, copiedScales, strokeColor]
  )

  // reset the yScale based on position
  if (
    STACKED_OR_FILLED.includes(position) &&
    scales?.groups &&
    geomData &&
    geomAes?.x &&
    geomAes?.y
  ) {
    let maxVal
    if (position === 'stack') {
      const uniqueXs = Array.from(new Set(geomData?.map((d) => geomAes?.x(d))))
      maxVal = max(
        uniqueXs.map((xVal) => {
          const groupData = geomData.filter((d) =>
            isDate(geomAes.x(d))
              ? geomAes.x(d)?.valueOf() === xVal?.valueOf()
              : geomAes.x(d) === xVal
          )
          const groupTotal = sum(
            groupData,
            (d) => geomAes.y && (geomAes.y(d) as number)
          )
          return groupTotal
        })
      )
    } else {
      maxVal = 1
    }

    if (!yDomain) {
      scales.yScale.domain([0, maxVal])
    }
  }

  const xBandScale = useMemo(() => {
    if (margin && width) {
      if (typeof scales?.xScale?.bandwidth !== 'undefined') {
        return scales.xScale.paddingInner(xPadding)
      }
      const uniqueXs = Array.from(new Set(geomData?.map((d) => geomAes?.x(d))))

      return scaleBand()
        .range([margin.left, width - margin.right])
        .domain((xDomain || uniqueXs) as string[])
        .paddingInner(xPadding)
    }
    return null
  }, [geomData, geomAes, width, scales, margin, xPadding, xDomain])

  useEffect(() => {
    if (xZoomDomain?.current && geomData) {
      const xExtent = extent(geomData, (d) => geomAes.x(d) as number)
      const yExtent = extent(
        geomData,
        (d) => geomAes?.y && (geomAes.y(d) as number)
      )

      const isHistogram = !!theme?.geoms?.histogram

      if (!isHistogram) {
        setXScale((prev) => ({
          ...prev,
          domain: xExtent,
        }))
      }

      setYScale((prev) => ({
        ...prev,
        domain: [0, yExtent[1]],
      }))
    }
  }, [xZoomDomain?.current, theme])

  useEffect(() => {
    const isHistogram = !!theme?.geoms?.histogram
    const histStart = isHistogram ? min(geomData as HistogramBin[], d => d.x0) : null
    const histEnd = isHistogram ? max(geomData as HistogramBin[], d => d.x1) : null

    if (isHistogram) {
      setXScale((prev) => ({
        ...prev,
        domain: [histStart, histEnd],
      }))
    }
  }, [theme, setXScale, xZoomDomain])

  const x = useCallback(
    (d: Datum) => {
      if (!scales?.xScale.bandwidth && margin && width && xBandScale) {
        let leftAdj = 0
        let rightAdj = 0

        const isHistogram = !!theme?.geoms?.histogram

        if (align === 'center') {
          leftAdj = xBandScale.bandwidth() / 2
          rightAdj = xBandScale.bandwidth() / 2
        }
        if (align === 'left' && !isHistogram) {
          rightAdj = xBandScale.bandwidth()
        }
        if (align === 'right' && !isHistogram) {
          leftAdj = xBandScale.bandwidth() / 2
        }
        if (align === 'right') {
          leftAdj = xBandScale.bandwidth()
        }
        
        scales?.xScale.range([
          margin.left + (isHistogram ? 0 : leftAdj),
          width - margin.right - rightAdj,
        ])
        return (scales?.xScale(geomAes?.x(d) ?? aes?.x(d)) || 0) - leftAdj
      }
      return scales?.xScale && scales.xScale(geomAes?.x(d))
    },
    [scales, geomAes, geomData, xBandScale, margin, width, align, aes, theme]
  )

  const y = useCallback(
    (d: Datum) =>
      scales?.yScale && geomAes?.y && scales.yScale(geomAes?.y(d)),
    [scales, geomAes]
  )

  const group = useMemo(
    () => defineGroupAccessor(geomAes),
    [defineGroupAccessor, geomAes]
  )

  const groups = useMemo(
    () =>
      group
        ? (Array.from(new Set(geomData?.map(group))) as string[])
        : undefined,
    [geomData, group]
  )

  const keyAccessor = useCallback(
    (d: Datum) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y &&
          group &&
          `${geomAes?.x(d)}-${geomAes.y(d)}-${group(d)}`) as string,
    [geomAes, group]
  )

  const stackedData = useMemo(() => {
    if (
      geomData &&
      geomAes?.y &&
      STACKED_OR_FILLED.includes(position) &&
      groups &&
      group
    ) {
      const stackWideData = stack()
        .keys(groups)
        .offset(position === 'fill' ? stackOffsetExpand : stackOffsetNone)

      const wideData = widen(geomData, geomAes.x, group, geomAes.y)

      return stackWideData(wideData)
    }
    return null
  }, [geomData, geomAes, group, groups, position])

  // const sortedData = useMemo(() => {
  //   // if (geomData && geomAes?.y) {
  //   //   return geomData.sort((a, b) => {
  //   //     return (geomAes.y(b) as number) - (geomAes.y(a) as number)
  //   //   })
  //   // } else {
  //   //   return geomData
  //   // }
  //   return geomData
  // }, [geomData])

  const dodgeXScale = useMemo(() => {
    if (isDodged && scales?.groups && xBandScale) {
      return scaleBand()
        .domain(scales?.groups)
        .range([0, xBandScale.bandwidth()])
        .padding(dodgePadding)
    }
    return undefined
  }, [scales, position, xBandScale, dodgePadding])

  const resolvedXScale = useCallback(
    (d) => {
      if (isDodged) {
        return (x(d) ?? 0) + (dodgeXScale?.(group?.(d) as string) ?? 0)
      }
      return x(d)
    },
    [x, dodgeXScale, position, group]
  )

  const groupRef = useRef<SVGGElement>(null)
  const rects = groupRef.current?.getElementsByTagName('rect')

  const getGroupStack = useCallback(
    (d: Datum) => {
      const thisStack =
        stackedData && stackedData.find((sd) => group && sd.key === group(d))
      const groupStack = thisStack?.find(
        (s) => geomAes?.x && s.data.key === geomAes.x(d)?.valueOf()
      )
      return groupStack
    },
    [stackedData, geomAes, group]
  )

  const stackMidpoints = useMemo(() => {
    const unGrouped = groups?.length === 1 && groups[0] === '__group'
    if (!stackedData || focusType === 'group' || unGrouped) return undefined

    return stackedData.flatMap((sd) => {
      const groupVal = sd.key
      const dataStack = sd.filter((d) => !d.flat().some(Number.isNaN))
      
      return dataStack.map((ds) => {
        const yVal = (ds[0] + ds[1]) / 2
        const xVal = ds.data.key

        return {
          groupVal,
          yVal,
          xVal,
        }
      })
    })
  }, [stackedData, geomData, focusType, groups])

  const dodgeXAdj = useMemo(() => {
    const bw = xBandScale?.bandwidth() ?? 0
    const isGroupFocused = focusType === 'group'
    
    return isDodged && !isGroupFocused
      ? (dodgeXScale?.bandwidth() ?? 0)/2
      : bw / 2 
  }, [groups, xBandScale, dodgePadding, focusType])

  return xBandScale ? (
    <>
      {showTooltip && tooltipPosition === 'top' && (
        <LineMarker
          x={isDodged && focusType === 'group' ? x : resolvedXScale}
          xAdj={
            ((focusType === 'individual' && isDodged)
              ? (dodgeXScale?.bandwidth() ?? 0)/2
              : dodgeXAdj)
          }
        />
      )}
      <g ref={groupRef} clipPath={`url(#__gg_canvas_${id})`}>
        <PageVisibility>
          {(isVisible) =>
            !firstRender &&
            isVisible && (
              <NodeGroup
                data={[...(geomData)]}
                keyAccessor={keyAccessor}
                start={(d) => ({
                  width: dodgeXScale?.bandwidth() || xBandScale.bandwidth(),
                  height: 0,
                  x: resolvedXScale(d),
                  y: bottomPos,
                  fill: 'transparent',
                  stroke: 'transparent',
                  fillOpacity: 0,
                  strokeOpacity: 0,
                })}
                enter={(d) => {
                  const groupData = getGroupStack(d)
                  const thisY1 = groupData
                    ? scales?.yScale(groupData[1])
                    : bottomPos
                  const thisY0 = groupData && scales?.yScale(groupData[0])
                  const barHeight = stackedData
                    ? thisY0 - thisY1
                    : bottomPos - (y(d) || 0)

                  return {
                    height: [typeof y(d) === 'undefined' ? 0 : barHeight],
                    width: [dodgeXScale?.bandwidth() || xBandScale.bandwidth()],
                    x: [resolvedXScale(d)],
                    y: [STACKED_OR_FILLED.includes(position) ? thisY1 : y(d)],
                    fill: fill(d),
                    stroke: stroke(d),
                    fillOpacity: [fillOpacity],
                    strokeOpacity: [strokeOpacity],
                    timing: { duration, ease: easeCubic },
                  }
                }}
                update={(d) => {
                  const groupData = getGroupStack(d)
                  const thisY1 = groupData
                    ? scales?.yScale(groupData[1])
                    : bottomPos
                  const thisY0 = groupData && scales?.yScale(groupData[0])
                  const barHeight = stackedData
                    ? thisY0 - thisY1
                    : bottomPos - (y(d) || 0)
                  return {
                    height: [typeof y(d) === 'undefined' ? 0 : barHeight],
                    width: [dodgeXScale?.bandwidth() || xBandScale.bandwidth()],
                    x: [resolvedXScale(d)],
                    y: [STACKED_OR_FILLED.includes(position) ? thisY1 : y(d)],
                    fill: fill(d),
                    stroke: stroke(d),
                    fillOpacity: [fillOpacity],
                    strokeOpacity: [strokeOpacity],
                    timing: { duration, ease: easeCubic },
                  }
                }}
                leave={() => ({
                  fill: ['transparent'],
                  stroke: ['transparent'],
                  height: [0],
                  y: [bottomPos],
                  timing: { duration, ease: easeCubic },
                })}
                interpolation={(begVal, endVal) => interpolate(begVal, endVal)
                }
              >
                {(nodes) => (
                  <>
                    {nodes.map(({ state, key }) => (
                      <rect
                        key={key}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        fill={state.fill}
                        stroke={state.stroke}
                        x={state.x}
                        y={state.y}
                        width={state.width}
                        height={state.height}
                        fillOpacity={state.fillOpacity}
                        strokeOpacity={state.strokeOpacity}
                        data-testid="__gg_geom_col"
                      />
                    ))}
                  </>
                )}
              </NodeGroup>
            )
          }
        </PageVisibility>
      </g>
      {(showTooltip || brushAction) && (
        <>
          <EventArea
            data={geomData}
            aes={geomAes}
            x={(isDodged && focusType === 'group') ? x : resolvedXScale}
            y={() => 0}
            fill={position === 'fill' ? 'y' : undefined}
            group={focusType === 'group' ? 'x' : undefined}
            xAdj={
              isDodged && focusType === 'individual'
                ? (dodgeXScale?.bandwidth() ?? 0) / 2
                : xBandScale.bandwidth() / 2
            }
            xBandScale={xBandScale}
            stackYMidpoints={stackMidpoints}
            showTooltip={showTooltip}
            brushAction={brushAction}
            onDatumFocus={onDatumFocus}
            onMouseOver={({ i }: { d: Datum[]; i: number[] }) => {
              if (rects) {
                focusNodes({
                  nodes: rects,
                  focusedIndex: i,
                  focusedStyles,
                  unfocusedStyles,
                })
              }
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: Datum[]; i: number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onMouseLeave={() => {
              if (rects) {
                unfocusNodes({ nodes: rects, baseStyles })
              }

              if (onExit) onExit()
            }}
          />
          {showTooltip && (
            <Tooltip
              x={focusType === 'group' && isDodged ? x : resolvedXScale}
              y={y}
              aes={geomAes}
              stackMidpoints={stackMidpoints}
              xAdj={
                isDodged
                  ? dodgeXAdj
                  : xBandScale.bandwidth() / 2
              }
              focusType={focusType}
            />
          )}
        </>
      )}
    </>
  ) : null
}

GeomCol.displayName = 'GeomCol'
export { GeomCol }
