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
  themeState,
  tooltipState,
  focusNodes,
  unfocusNodes,
  EventArea,
  widen,
  Aes,
  usePageVisibility,
  defineGroupAccessor,
  fillScaleState,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { max, sum } from 'd3-array'
import { stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape'
import { Tooltip } from './tooltip'
import { FocusType, Position } from './types'

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
  aes?: Aes<Datum>
  /** attributes passed to the underlying SVG elements */
  attr?: SVGAttributes<SVGRectElement>
  /** determines how grouped elements are positioned relative to each other (_default_: `Position.STACK`) */
  position?: Position
  /** determines how elements within bar groups are focused (_default_: `FocusType.GROUP`)  */
  focusType?: FocusType
  /** should this Geom have a tooltip associated with it (_default_: `true`) */
  showTooltip?: boolean
  /** padding value (0-1) that sets the space between bars/bar groups (_default_: `0.2`) */
  yPadding?: number
  /** padding value (0-1) that sets the space between elements positioned with `position={POSITION.DODGE}` (_default_: `0.05`) */
  dodgePadding?: number
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

const GeomBar = <Datum,>({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  attr,
  onDatumFocus,
  onDatumSelection,
  onExit,
  yPadding = 0.2,
  dodgePadding = 0.05,
  showTooltip = true,
  position = Position.STACK,
  focusType = FocusType.GROUP,
  isAnimated = true,
}: GeomProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { data, aes, scales, copiedScales, height, margin } = ggState || {}

  const geomData = localData || data
  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes
  }, [aes, localAes])

  const [theme, setTheme] = useAtom(themeState)
  const [{ datum: tooltipDatum }] = useAtom(tooltipState)
  const [{ domain: fillDomain }] = useAtom(fillScaleState)

  const isVisible = usePageVisibility()

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

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        bar: {
          fillOpacity:
            geomAttr.style?.fillOpacity ||
            geomAttr.style?.opacity ||
            geomAttr.opacity ||
            geomAttr.fillOpacity,
          stroke: geomAttr.stroke,
          strokeWidth: geomAttr.style?.strokeWidth || geomAttr.strokeWidth,
          strokeOpacity:
            geomAttr.style?.strokeOpacity || geomAttr.strokeOpacity,
        },
      },
    }))
  }, [setTheme, attr])

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
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : 'none'),
    [geomAes, copiedScales, geomAttr],
  )

  // reset the xScale based on position
  if (
    [Position.STACK, Position.FILL].includes(position) &&
    scales?.groups &&
    geomData &&
    geomAes?.x &&
    geomAes?.y
  ) {
    const uniqueYs = Array.from(
      new Set(geomData?.map((d) => geomAes?.y && geomAes.y(d))),
    )
    let maxVal
    if (position === Position.STACK) {
      maxVal = max(
        uniqueYs.map((yVal) => {
          const groupData = geomData.filter(
            (d) => geomAes.y && geomAes.y(d) === yVal,
          )
          const groupTotal = sum(groupData, (d) => geomAes.x(d) as number)
          return groupTotal
        }),
      )
    } else {
      maxVal = 1
    }

    scales.xScale.domain([0, maxVal])
  }

  const x = useCallback(
    (d: Datum) => scales?.xScale && (scales.xScale(geomAes?.x(d)) || 0),
    [scales, geomAes],
  )

  const yBandScale = useMemo(() => {
    if (margin && height) {
      const usedYPadding = geomData ? yPadding : 0

      if (typeof scales?.yScale.bandwidth !== 'undefined') {
        return scales.yScale.paddingInner(usedYPadding)
      }
      const uniqueYs = Array.from(
        new Set(geomData?.map((d) => geomAes?.y && geomAes.y(d))),
      )

      const givenDomain = scales.yScale.domain() as unknown

      return scaleBand()
        .range([margin.bottom, height - margin.bottom])
        .domain((givenDomain || uniqueYs) as string[])
        .paddingInner(usedYPadding)
    }
    return null
  }, [height, scales, margin, yPadding, geomData, geomAes])

  const y = useCallback(
    (d: Datum) => {
      if (!scales?.yScale.bandwidth && margin && height && yBandScale) {
        scales?.yScale.range([
          height - margin.bottom - yBandScale.bandwidth() / 2 - 0.5,
          margin.top + yBandScale.bandwidth() / 2,
        ])
        return (
          (scales?.yScale(geomAes?.y && geomAes.y(d)) || 0) -
          yBandScale.bandwidth() / 2 +
          0.5
        )
      }
      return scales?.yScale && scales.yScale(geomAes?.y && geomAes.y(d))
    },
    [scales, geomAes, margin, height, yBandScale],
  )

  const group = useMemo(
    () => defineGroupAccessor(geomAes),
    [defineGroupAccessor, geomAes],
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
          `${geomAes?.x(d)}-${geomAes.y(d)}-${
            scales?.groupAccessor ? scales.groupAccessor(d) : '__group'
          }`) as string,
    [geomAes, scales],
  )

  const tooltipDatumKeys = useMemo(
    () => tooltipDatum?.map(keyAccessor) ?? [],
    [tooltipDatum, keyAccessor],
  )

  const stackedData = useMemo(() => {
    if (
      geomData &&
      geomAes?.x &&
      geomAes?.y &&
      [Position.STACK, Position.FILL].includes(position) &&
      scales?.groups &&
      scales?.groupAccessor
    ) {
      const stackWideData = stack()
        .keys(fillDomain ?? scales.groups)
        .offset(
          position === Position.FILL ? stackOffsetExpand : stackOffsetNone,
        )

      const wideData = widen(
        geomData,
        geomAes.y,
        scales.groupAccessor,
        geomAes.x,
      )

      return stackWideData(wideData)
    }
    return null
  }, [geomData, geomAes, scales, position, fillDomain])

  const dodgeYScale = useMemo(() => {
    if (position === Position.DODGE && scales?.groups && yBandScale) {
      return scaleBand()
        .domain(fillDomain ?? scales?.groups)
        .range([0, yBandScale.bandwidth()])
        .padding(dodgePadding)
    }
    return null
  }, [scales, position, yBandScale, dodgePadding, fillDomain])

  const resolvedYScale = useCallback(
    (d: Datum) => {
      if (position === Position.DODGE) {
        return (y(d) ?? 0) + (dodgeYScale?.(group?.(d) as string) ?? 0)
      }
      return y(d)
    },
    [y, dodgeYScale, position, group],
  )

  const groupRef = useRef<SVGGElement>(null)
  const rects = groupRef.current?.getElementsByTagName('rect')

  const leftEdge = useMemo(() => margin?.left || 0, [margin])

  const getGroupStack = useMemo(
    () => (d: Datum) => {
      const thisStack =
        stackedData &&
        stackedData.find(
          (sd: any) =>
            scales?.groupAccessor && sd.key === scales.groupAccessor(d),
        )
      const groupStack = thisStack?.find(
        (s: any) => aes?.y && s.data.key === aes.y(d),
      )
      return groupStack
    },
    [stackedData, scales, aes],
  )

  const stackMidpoints = useMemo(() => {
    if (!stackedData || focusType === FocusType.GROUP) return undefined

    return stackedData.flatMap((sd) => {
      const groupVal = sd.key
      const dataStack = sd.filter((d) => !d.flat().some(Number.isNaN))

      return dataStack.map((ds) => {
        const xVal = (ds[0] + ds[1]) / 2
        const yVal = ds.data.key

        return {
          groupVal,
          yVal,
          xVal,
        }
      })
    })
  }, [stackedData, geomData, focusType])

  const dodgeYAdj = useMemo(() => {
    const isDodged = position === Position.DODGE
    const bw = yBandScale?.bandwidth() ?? 0
    const paddingAdj =
      (isDodged ? dodgePadding : 0) / (groups ? groups.length : 1)
    const isGroupFocused = focusType === FocusType.GROUP

    return isDodged && !isGroupFocused
      ? (dodgeYScale?.bandwidth() ?? 0) / 2
      : bw / 2 - paddingAdj * bw
  }, [groups, yBandScale, dodgePadding, focusType])

  const yAdj = useMemo(() => {
    if (position === Position.DODGE && focusType === FocusType.INDIVIDUAL)
      return (dodgeYScale?.bandwidth() ?? 0) / 2

    if (focusType === FocusType.INDIVIDUAL) return margin.top * 2

    return (yBandScale?.bandwidth() ?? 0) / 2
  }, [position, focusType, dodgeYScale, margin, yBandScale])

  return yBandScale && !firstRender ? (
    <>
      <g ref={groupRef}>
        {isVisible && (
          <NodeGroup
            data={[...geomData] as Datum[]}
            keyAccessor={keyAccessor}
            start={(d) => ({
              width: 0,
              height: dodgeYScale?.bandwidth() || yBandScale.bandwidth(),
              x: leftEdge,
              y: resolvedYScale(d),
              fill: 'transparent',
              stroke: 'transparent',
              fillOpacity: 0,
              strokeOpacity: 0,
            })}
            enter={(d) => {
              const groupData = getGroupStack(d)
              const thisX0 = groupData ? scales?.xScale(groupData[0]) : leftEdge
              const thisX1 = groupData && scales?.xScale(groupData[1])
              const barWidth = stackedData
                ? thisX1 - (thisX0 || 0)
                : (x(d) || 0) - leftEdge
              const actualWidth =
                typeof x(d) === 'undefined' ? leftEdge : barWidth

              return {
                width: isAnimated ? [actualWidth] : actualWidth,
                height: isAnimated
                  ? [dodgeYScale?.bandwidth() || yBandScale.bandwidth()]
                  : dodgeYScale?.bandwidth() || yBandScale.bandwidth(),
                x: isAnimated ? [thisX0] : thisX0,
                y: isAnimated ? [resolvedYScale(d)] : resolvedYScale(d),
                fill: isAnimated ? [fill(d)] : fill(d),
                stroke: isAnimated ? [stroke(d)] : stroke(d),
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
              const thisX0 = groupData ? scales?.xScale(groupData[0]) : leftEdge
              const thisX1 = groupData && scales?.xScale(groupData[1])
              const barWidth = stackedData
                ? thisX1 - (thisX0 || 0)
                : (x(d) || 0) - leftEdge

              const thisWidth =
                typeof x(d) === 'undefined' ? leftEdge : barWidth
              const thisY =
                typeof resolvedYScale(d) === 'undefined'
                  ? height
                  : resolvedYScale(d)

              return {
                width: isAnimated ? [thisWidth] : thisWidth,
                height: isAnimated
                  ? [dodgeYScale?.bandwidth() || yBandScale.bandwidth()]
                  : dodgeYScale?.bandwidth() || yBandScale.bandwidth(),
                x: isAnimated ? [thisX0] : thisX0,
                y: isAnimated ? [thisY] : thisY,
                fill: isAnimated ? [fill(d)] : fill(d),
                stroke: isAnimated ? [stroke(d)] : stroke(d),
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
              width: isAnimated ? [0] : 0,
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
                      data-testid="__gg_geom_bar"
                    />
                  )
                })}
              </>
            )}
          </NodeGroup>
        )}
      </g>
      {showTooltip && (
        <>
          <EventArea
            data={geomData}
            aes={geomAes}
            x={() => 0}
            y={
              position === Position.DODGE && focusType === FocusType.GROUP
                ? y
                : resolvedYScale
            }
            yBandScale={yBandScale}
            fill={position === Position.FILL ? 'x' : undefined}
            group={focusType === FocusType.GROUP ? 'y' : undefined}
            yAdj={yAdj}
            stackXMidpoints={stackMidpoints}
            onDatumFocus={onDatumFocus}
            onMouseOver={({ i }: { d: Datum[]; i: number[] }) => {
              if (rects) {
                focusNodes({
                  nodes: rects,
                  focusedIndex: i ?? [],
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
          <Tooltip
            x={x}
            y={focusType === FocusType.GROUP ? y : resolvedYScale}
            aes={geomAes}
            stackMidpoints={stackMidpoints}
            yAdj={
              position === Position.DODGE
                ? dodgeYAdj
                : yBandScale.bandwidth() / 2
            }
            focusType={focusType}
            position={position}
          />
        </>
      )}
    </>
  ) : null
}

GeomBar.displayName = 'GeomBar'
export { GeomBar }
