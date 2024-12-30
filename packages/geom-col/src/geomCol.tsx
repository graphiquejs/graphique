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
  usePageVisibility,
  tooltipState,
  TooltipPosition,
  fillScaleState,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { extent, min, max, sum } from 'd3-array'
import { stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape'
import { Tooltip, LineMarker } from './tooltip'
import { GeomAes, HistogramBin, Position, FocusType, Alignment } from './types'

const STACKED_OR_FILLED: Position[] = [Position.STACK, Position.FILL]

export interface GeomProps<Datum> {
  /**
   * **data used by this Geom**
   *
   * This will overwrite top-level `data` passed to `GG` as it relates to mappings defined in `aes`.
   */
  data?: Datum[]
  /**
   * **functional mapping applied to `data` for this Geom**
   *
   * This extends the top-level `aes` passed to `GG`. Any repeated mappings defined here will take precedence within the Geom.
   */
  aes?: GeomAes<Datum>
  /** attributes passed to the underlying SVG elements */
  attr?: SVGAttributes<SVGRectElement>
  /** determines how grouped elements are positioned relative to each other (_default_: `Position.STACK`) */
  position?: Position
  /** determines where columns are aligned relative to their scaled values (_default_: `Alignment.CENTER`) */
  align?: Alignment
  /** determines how elements within column groups are focused (_default_: `FocusType.GROUP`)  */
  focusType?: FocusType
  /** should this Geom have a tooltip associated with it (_default_: `true`) */
  showTooltip?: boolean
  /** input x domain to use with continuous x scales (unique, sequential values across `[min, max]`).
   * For example, if a column represents a day, `xDomain` should include the full sequence of days between the min and max values. */
  xDomain?: (number | Date)[]
  /** padding value (0-1) that sets the space between columns/column groups (_default_: `0.2`) */
  xPadding?: number
  /** padding value (0-1) that sets the space between elements positioned with `position={POSITION.DODGE}` (_default_: `0.05`) */
  dodgePadding?: number
  /** for continuous x scales, determines what happens when brushing (clicking and dragging) over the drawing area  */
  brushAction?: BrushAction
  /** styles applied to focused elements */
  focusedStyle?: CSSProperties
  /** styles applied to unfocused elements */
  unfocusedStyle?: CSSProperties
  /** callback called for mousemove events on the drawing area when focusing data */
  onDatumFocus?: (data: Datum[], index: number[]) => void
  /** callback called for click events on the drawing area when selecting focused data */
  onDatumSelection?: (data: Datum[], index: number[]) => void
  /** callback called for mouseleave events on the drawing area */
  onExit?: () => void
  /** should elements enter/update/exit with animated transitions (_default_: `true`) */
  isAnimated?: boolean
}

const GeomCol = <Datum,>({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  attr,
  onDatumFocus,
  onDatumSelection,
  onExit,
  xDomain,
  xPadding = 0.2,
  dodgePadding = 0.05,
  showTooltip = true,
  brushAction,
  align = Alignment.CENTER,
  position = Position.STACK,
  focusType = FocusType.GROUP,
  isAnimated = true,
}: GeomProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { data, aes, scales, copiedScales, height, margin, width, id } =
    ggState || {}

  const [theme, setTheme] = useAtom(themeState)
  const [{ xDomain: xZoomDomain }] = useAtom(zoomState)
  const [, setXScale] = useAtom(xScaleState)
  const [, setYScale] = useAtom(yScaleState)
  const [{ position: tooltipPosition, datum: tooltipDatum }] =
    useAtom(tooltipState)
  const [{ domain: fillDomain }] = useAtom(fillScaleState)

  const isVisible = usePageVisibility()

  const isDodged = position === Position.DODGE

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
            typeof xVal !== 'undefined' &&
            xVal <= xZoomDomain.current[1] &&
            xVal >= xZoomDomain.current[0]
        : true
    })
  }, [geomAes, xZoomDomain?.current, data])

  const { defaultFill, animationDuration: duration } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const baseAttr: SVGAttributes<SVGRectElement> = {
    fillOpacity: 1,
    strokeOpacity: 1,
  }

  const geomAttr: SVGAttributes<SVGRectElement> = {
    ...baseAttr,
    ...attr,
  }

  const bottomPos = useMemo(
    () => (height && margin ? height - margin.bottom : 0),
    [height, margin],
  )

  const group = useMemo(
    () => defineGroupAccessor(geomAes),
    [defineGroupAccessor, geomAes],
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        col: {
          position,
          fillOpacity:
            geomAttr.style?.fillOpacity ||
            geomAttr.style?.opacity ||
            geomAttr.opacity ||
            geomAttr.fillOpacity,
          stroke: geomAttr.stroke,
          groupAccessor: group ?? (geomAes?.fill || geomAes?.stroke),
          strokeWidth: geomAttr.style?.strokeWidth || geomAttr.strokeWidth,
          strokeOpacity:
            geomAttr.style?.strokeOpacity || geomAttr.strokeOpacity,
        },
      },
    }))
  }, [setTheme, attr, position])

  const baseStyles: CSSProperties = {
    transition: 'fill-opacity 200ms',
    fillOpacity: geomAttr.fillOpacity,
    strokeOpacity: geomAttr.strokeOpacity,
    ...geomAttr.style,
  }

  const focusedStyles: CSSProperties = {
    ...baseStyles,
    ...focusedStyle,
  }

  const unfocusedStyles: CSSProperties = {
    ...baseStyles,
    fillOpacity: 0.5,
    strokeOpacity: 0.5,
    ...unfocusedStyle,
  }

  const fill = useCallback(
    (d: Datum) =>
      geomAttr.fill ||
      (geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(geomAes.fill(d)) as string | undefined)
        : defaultFill),
    [geomAes, copiedScales, geomAttr, defaultFill],
  )

  const stroke = useCallback(
    (d: Datum) =>
      geomAttr.stroke ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d)) as string | undefined)
        : 'none'),
    [geomAes, copiedScales, geomAttr],
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
    if (position === Position.STACK) {
      const uniqueXs = Array.from(new Set(geomData?.map((d) => geomAes?.x(d))))
      maxVal = max(
        uniqueXs.map((xVal) => {
          const groupData = geomData.filter((d) =>
            isDate(geomAes.x(d))
              ? geomAes.x(d)?.valueOf() === xVal?.valueOf()
              : geomAes.x(d) === xVal,
          )
          const groupTotal = sum(
            groupData,
            (d) => geomAes.y && (geomAes.y(d) as number),
          )
          return groupTotal
        }),
      )
    } else {
      maxVal = 1
    }

    scales.yScale.domain([0, maxVal])
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
  }, [geomData, geomAes, width, scales, margin, xPadding])

  useEffect(() => {
    if (xZoomDomain?.current && geomData) {
      const xExtent = extent(geomData, (d) => geomAes.x(d) as number)
      const yExtent = extent(
        geomData,
        (d) => geomAes?.y && (geomAes.y(d) as number),
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
    const histStart = isHistogram
      ? min(geomData as HistogramBin[], (d) => d.x0)
      : null
    const histEnd = isHistogram
      ? max(geomData as HistogramBin[], (d) => d.x1)
      : null

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

        if (align === Alignment.CENTER) {
          leftAdj = xBandScale.bandwidth() / 2
          rightAdj = xBandScale.bandwidth() / 2
        }
        if (align === Alignment.LEFT && !isHistogram) {
          rightAdj = xBandScale.bandwidth()
        }
        if (align === Alignment.RIGHT && !isHistogram) {
          leftAdj = xBandScale.bandwidth() / 2
        }
        if (align === Alignment.RIGHT) {
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
    [scales, geomAes, geomData, xBandScale, margin, width, align, aes, theme],
  )

  const y = useCallback(
    (d: Datum) => scales?.yScale && geomAes?.y && scales.yScale(geomAes?.y(d)),
    [scales, geomAes],
  )

  const groups = useMemo(
    () =>
      group
        ? (Array.from(new Set(geomData?.map(group))) as string[])
        : undefined,
    [geomData, group],
  )

  const keyAccessor = useCallback(
    (d: Datum) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y &&
          group &&
          `${geomAes?.x(d)}-${geomAes.y(d)}-${group(d)}`) as string,
    [geomAes, group],
  )

  const tooltipDatumKeys = useMemo(
    () => tooltipDatum?.map(keyAccessor) ?? [],
    [tooltipDatum, keyAccessor],
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
        .keys(fillDomain ?? groups)
        .offset(
          position === Position.FILL ? stackOffsetExpand : stackOffsetNone,
        )

      const wideData = widen(geomData, geomAes.x, group, geomAes.y)

      return stackWideData(wideData)
    }
    return null
  }, [geomData, geomAes, group, groups, position, scales, fillDomain])

  const dodgeXScale = useMemo(() => {
    if (isDodged && scales?.groups && xBandScale) {
      return scaleBand()
        .domain(fillDomain ?? scales?.groups)
        .range([0, xBandScale.bandwidth()])
        .padding(dodgePadding)
    }
    return undefined
  }, [scales, position, xBandScale, dodgePadding, fillDomain])

  const resolvedXScale = useCallback(
    (d: Datum) => {
      if (isDodged) {
        return (x(d) ?? 0) + (dodgeXScale?.(group?.(d) as string) ?? 0)
      }
      return x(d)
    },
    [x, dodgeXScale, position, group],
  )

  const groupRef = useRef<SVGGElement>(null)
  const rects = groupRef.current?.getElementsByTagName('rect')

  const getGroupStack = useCallback(
    (d: Datum) => {
      const thisStack =
        stackedData && stackedData.find((sd) => group && sd.key === group(d))
      const groupStack = thisStack?.find(
        (s) => geomAes?.x && s.data.key === geomAes.x(d)?.valueOf(),
      )
      return groupStack
    },
    [stackedData, geomAes, group],
  )

  const stackMidpoints = useMemo(() => {
    const unGrouped = groups?.length === 1 && groups[0] === '__group'
    if (!stackedData || focusType === FocusType.GROUP || unGrouped)
      return undefined

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
    const isGroupFocused = focusType === FocusType.GROUP

    return isDodged && !isGroupFocused
      ? (dodgeXScale?.bandwidth() ?? 0) / 2
      : bw / 2
  }, [groups, xBandScale, dodgePadding, focusType])

  return xBandScale ? (
    <>
      {showTooltip && tooltipPosition === TooltipPosition.TOP && (
        <LineMarker
          x={isDodged && focusType === FocusType.GROUP ? x : resolvedXScale}
          xAdj={
            focusType === FocusType.INDIVIDUAL && isDodged
              ? (dodgeXScale?.bandwidth() ?? 0) / 2
              : dodgeXAdj
          }
        />
      )}
      <g ref={groupRef} clipPath={`url(#__gg_canvas_${id})`}>
        {!firstRender && isVisible && (
          <NodeGroup
            data={[...geomData] as Datum[]}
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

              const thisHeight = typeof y(d) === 'undefined' ? 0 : barHeight
              const thisY = STACKED_OR_FILLED.includes(position) ? thisY1 : y(d)

              return {
                height: isAnimated ? [thisHeight] : thisHeight,
                width: isAnimated
                  ? [dodgeXScale?.bandwidth() || xBandScale.bandwidth()]
                  : dodgeXScale?.bandwidth() || xBandScale.bandwidth(),
                x: isAnimated ? [resolvedXScale(d)] : resolvedXScale(d),
                y: isAnimated ? [thisY] : thisY,
                fill: fill(d),
                stroke: stroke(d),
                fillOpacity: isAnimated
                  ? [geomAttr.fillOpacity]
                  : geomAttr.fillOpacity,
                strokeOpacity: isAnimated
                  ? [geomAttr.strokeOpacity]
                  : geomAttr.strokeOpacity,
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

              const thisHeight = typeof y(d) === 'undefined' ? 0 : barHeight
              const thisY = STACKED_OR_FILLED.includes(position) ? thisY1 : y(d)

              return {
                height: isAnimated ? [thisHeight] : thisHeight,
                width: isAnimated
                  ? [dodgeXScale?.bandwidth() || xBandScale.bandwidth()]
                  : dodgeXScale?.bandwidth() || xBandScale.bandwidth(),
                x: isAnimated ? [resolvedXScale(d)] : resolvedXScale(d),
                y: isAnimated ? [thisY] : thisY,
                fill: fill(d),
                stroke: stroke(d),
                fillOpacity: isAnimated
                  ? [geomAttr.fillOpacity]
                  : geomAttr.fillOpacity,
                strokeOpacity: isAnimated
                  ? [geomAttr.strokeOpacity]
                  : geomAttr.strokeOpacity,
                timing: { duration, ease: easeCubic },
              }
            }}
            leave={() => ({
              fill: isAnimated ? ['transparent'] : 'transparent',
              stroke: isAnimated ? ['transparent'] : 'transparent',
              height: isAnimated ? [0] : 0,
              y: isAnimated ? [bottomPos] : bottomPos,
              timing: { duration, ease: easeCubic },
            })}
            interpolation={(begVal, endVal) => interpolate(begVal, endVal)}
          >
            {(nodes) => (
              <>
                {nodes.map(({ state, key }) => {
                  let styles
                  if (tooltipDatumKeys.includes(key)) styles = focusedStyles
                  if (
                    tooltipDatumKeys?.length > 0 &&
                    !tooltipDatumKeys.includes(key)
                  )
                    styles = unfocusedStyles

                  return (
                    <rect
                      key={key}
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...attr}
                      fill={state.fill}
                      stroke={state.stroke}
                      x={state.x}
                      y={state.y}
                      width={state.width}
                      height={state.height}
                      fillOpacity={state.fillOpacity}
                      strokeOpacity={state.strokeOpacity}
                      style={{
                        pointerEvents: 'none',
                        ...baseStyles,
                        ...styles,
                      }}
                      data-testid="__gg_geom_col"
                    />
                  )
                })}
              </>
            )}
          </NodeGroup>
        )}
      </g>
      {(showTooltip || brushAction) && (
        <>
          <EventArea
            data={geomData}
            aes={geomAes}
            x={isDodged && focusType === FocusType.GROUP ? x : resolvedXScale}
            y={() => 0}
            fill={position === Position.FILL ? 'y' : undefined}
            group={focusType === FocusType.GROUP ? 'x' : undefined}
            xAdj={
              isDodged && focusType === FocusType.INDIVIDUAL
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
              x={focusType === FocusType.GROUP && isDodged ? x : resolvedXScale}
              y={y}
              aes={geomAes}
              stackMidpoints={stackMidpoints}
              xAdj={isDodged ? dodgeXAdj : xBandScale.bandwidth() / 2}
              focusType={focusType}
              position={position}
            />
          )}
        </>
      )}
    </>
  ) : null
}

GeomCol.displayName = 'GeomCol'
export { GeomCol }
