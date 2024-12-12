import React, {
  useEffect,
  useMemo,
  useRef,
  SVGAttributes,
  useState,
  CSSProperties,
} from 'react'
import {
  useGG,
  themeState,
  tooltipState,
  generateID,
  EventArea,
  BrushAction,
  isDate,
  focusNodes,
  unfocusNodes,
  strokeScaleState,
  VisualEncodingTypes,
  defaultScheme,
  usePageVisibility,
  defaultDasharrays,
  strokeDasharrayState,
} from '@graphique/graphique'
import { Animate } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { interpolatePath } from 'd3-interpolate-path'
import { line, CurveFactory, curveLinear } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { useAtom } from 'jotai'
import { LineMarker, Tooltip } from './tooltip'
import { Entrance, FocusType, type GeomAes } from './types'

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
  attr?: SVGAttributes<SVGPathElement>
  /** should this Geom have a tooltip associated with it (_default_: `true`) */
  showTooltip?: boolean
  /** determines what happens when brushing (clicking and dragging) over the drawing area  */
  brushAction?: BrushAction
  /** used for programmatic zooming, should the zoom out button be hidden */
  isZoomedOut?: boolean
  /** [d3 curve](https://d3js.org/d3-shape/curve) factory imported from `d3-shape` (_default_: `curveLinear`) */
  curve?: CurveFactory
  /** should this Geom have a line marker for its focused data (_default_: `true`) */
  showLineMarker?: boolean
  /** radius in px of the line marker's points (_default_: `3.5`) */
  markerRadius?: number
  /** stroke color of the line marker's points (_default_: `"#ffffff"`) */
  markerStroke?: string
  /** where elements should start as they enter the drawing area (_default_: `Entrance.MIDPOINT`) */
  entrance?: Entrance
  /** determines how pointer events focus data (_default_: `FocusType.X`) */
  focusType?: FocusType
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
}

const GeomLine = <Datum,>({
  data: localData,
  aes: localAes,
  showTooltip = true,
  showLineMarker = true,
  brushAction,
  isZoomedOut,
  curve = curveLinear,
  entrance = Entrance.MIDPOINT,
  onDatumSelection,
  onDatumFocus,
  onExit,
  focusedStyle,
  unfocusedStyle,
  attr,
  markerRadius = 3.5,
  markerStroke = '#fff',
  focusType = FocusType.X,
}: GeomProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { data, aes, scales, copiedScales, copiedData, height, id } =
    ggState || {}
  const [theme, setTheme] = useAtom(themeState)
  const [{ datum: tooltipDatum }] = useAtom(tooltipState)
  const [{ values: strokeScaleColors, domain: strokeDomain }] =
    useAtom(strokeScaleState)

  const [{ values: strokeDasharrays, domain: strokeDasharrayDomain }] =
    useAtom(strokeDasharrayState)

  const isVisible = usePageVisibility()

  const geomData = localData || data
  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes as GeomAes<Datum>
  }, [aes, localAes])

  const allXUndefined = useMemo(() => {
    const undefinedX = geomData
      ? geomData.filter(
          (d) =>
            geomAes?.x &&
            (geomAes.x(d) === null ||
              typeof geomAes.x(d) === 'undefined' ||
              Number.isNaN(geomAes.x(d)?.valueOf()) ||
              (isDate(geomAes.x(d)) && geomAes.x(d)?.valueOf() === 0)),
        )
      : []
    return geomData && undefinedX.length === geomData.length
  }, [geomData, geomAes])

  const allYUndefined = useMemo(() => {
    const undefinedY = geomData
      ? geomData.filter(
          (d) =>
            geomAes?.y &&
            (geomAes.y(d) === null ||
              typeof geomAes.y(d) === 'undefined' ||
              Number.isNaN(geomAes.y(d)?.valueOf())),
        )
      : []
    return geomData && undefinedY.length === geomData.length
  }, [geomData])

  const { defaultStroke, animationDuration: duration } = theme

  const geomID = useMemo(() => generateID(), [])

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const strokeGroups = useMemo(
    () =>
      geomAes?.stroke
        ? (Array.from(new Set(copiedData?.map(geomAes.stroke))) as string[])
        : undefined,
    [copiedData, geomAes],
  )

  const strokeDasharrayGroups = useMemo(
    () =>
      geomAes?.strokeDasharray
        ? (Array.from(
            new Set(copiedData?.map(geomAes?.strokeDasharray)),
          ) as string[])
        : undefined,
    [copiedData, geomAes],
  )

  const group = useMemo(
    () =>
      geomAes?.group ??
      geomAes?.stroke ??
      geomAes?.strokeDasharray ??
      scales?.groupAccessor,
    [geomAes, scales],
  )

  const groups = useMemo(
    () =>
      group
        ? (Array.from(new Set(geomData?.map(group))) as string[])
        : undefined,
    [geomData, group],
  )

  const geomStrokeScale = useMemo(() => {
    if (groups && geomAes.stroke) {
      return scaleOrdinal()
        .domain(strokeDomain || strokeGroups || groups)
        .range(
          (strokeScaleColors as string[]) || defaultScheme,
        ) as VisualEncodingTypes
    }
    return undefined
  }, [geomAes, strokeGroups, strokeScaleColors])

  const geomStrokeDasharrayScale = useMemo(() => {
    if (groups && geomAes.strokeDasharray) {
      return scaleOrdinal()
        .domain(strokeDasharrayDomain || strokeDasharrayGroups || groups)
        .range(
          (strokeDasharrays as string[]) || defaultDasharrays,
        ) as VisualEncodingTypes
    }
    return undefined
  }, [geomAes, strokeDasharrayGroups, strokeScaleColors])

  const baseAttr: SVGAttributes<SVGCircleElement> = {
    strokeWidth: 2.5,
    strokeOpacity: 1,
  }

  const geomAttr: SVGAttributes<SVGCircleElement> = {
    ...baseAttr,
    ...attr,
  }

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        line: {
          strokeWidth: geomAttr.style?.strokeWidth || geomAttr.strokeWidth,
          strokeOpacity:
            geomAttr.style?.strokeOpacity || geomAttr.strokeOpacity,
          stroke: geomAttr.stroke,
          strokeScale: geomStrokeScale,
          strokeDasharrayScale: geomStrokeDasharrayScale,
          groupAccessor:
            geomAes.stroke ?? geomAes.strokeDasharray ?? geomAes?.group,
          usableGroups: strokeGroups ?? strokeDasharrayGroups,
        },
      },
    }))
  }, [setTheme, attr, geomStrokeScale, strokeGroups, geomAes])

  const x = useMemo(
    () => (d: Datum) =>
      scales?.xScale && geomAes?.x && scales.xScale(geomAes.x(d)),
    [scales, geomAes],
  )
  const y = useMemo(
    () => (d: Datum) =>
      geomAes?.y && scales?.yScale && scales.yScale(geomAes?.y(d)),
    [scales, geomAes],
  )

  const drawLine = useMemo(
    () =>
      line()
        .defined((d) => {
          const areDefined =
            typeof d[0] !== 'undefined' && typeof d[1] !== 'undefined'
          const areNumbers = !Number.isNaN(d[0]) && !Number.isNaN(d[1])
          return areDefined && areNumbers
        })
        .curve(curve),
    [curve],
  )

  const groupRef = useRef<SVGGElement>(null)
  const lines = groupRef.current?.getElementsByTagName('path')

  const baseStyles: CSSProperties = {
    transition: 'stroke-opacity 200ms',
    strokeOpacity: geomAttr.strokeOpacity,
    ...geomAttr.style,
  }

  const focusedStyles: CSSProperties = {
    ...baseStyles,
    ...focusedStyle,
  }

  const unfocusedStyles: CSSProperties = {
    ...baseStyles,
    fillOpacity: 0.2,
    strokeOpacity: 0.2,
    ...unfocusedStyle,
  }

  const isClosestFocusType = focusType === FocusType.CLOSEST

  const focusGroups = useMemo(() => {
    const hasStrokeGrouping = geomAes?.stroke || geomAes?.strokeDasharray
    if (geomAes.focusGroup && isClosestFocusType && hasStrokeGrouping) {
      const groupStroke =
        geomAes?.group ?? geomAes?.stroke ?? geomAes.strokeDasharray

      const expandedGroups = Array.from(
        new Set(
          geomData?.map((d) => `${geomAes.focusGroup!(d)}-${groupStroke?.(d)}`),
        ),
      )

      return expandedGroups
    }
    return groups
  }, [groups, strokeGroups, geomData, geomAes, isClosestFocusType])

  useEffect(() => {
    const thisDatum = tooltipDatum?.[0]

    if (
      thisDatum &&
      group &&
      groups &&
      focusGroups &&
      focusGroups?.length > 1 &&
      lines &&
      lines?.length > 0 &&
      isClosestFocusType
    ) {
      const datumGroup = `${
        geomAes.focusGroup ? geomAes.focusGroup(thisDatum) : group(thisDatum)
      }`

      const focusedIndex = focusGroups
        ?.map((g, i) => (g.includes(datumGroup) ? i : -1))
        .filter((v) => v >= 0)

      focusNodes({
        nodes: lines,
        focusedIndex,
        focusedStyles,
        unfocusedStyles,
      })
    } else if (lines && isClosestFocusType) {
      unfocusNodes({ nodes: lines, baseStyles })
    }
  }, [
    tooltipDatum,
    group,
    groups,
    focusGroups,
    geomAes,
    lines,
    focusType,
    firstRender,
    isClosestFocusType,
  ])

  // map through groups to draw a line for each group
  return (
    <>
      <g ref={groupRef}>
        {isVisible && !firstRender && !allXUndefined && !allYUndefined && (
          <>
            {geomData && groups && group ? (
              groups.map((g) => {
                const groupData = geomData.filter((d) => group(d) === g)

                const groupLineData = groupData.map((d) => [x(d), y(d)]) as []

                const thisKey = geomAes?.key?.(groupData[0]) ?? `${geomID}-${g}`

                const thisStrokeGroups =
                  geomStrokeScale && geomAes?.stroke
                    ? Array.from(
                        new Set(
                          groupData.map(
                            (gd) => geomAes.stroke && geomAes.stroke(gd),
                          ),
                        ),
                      )
                    : undefined

                let thisStroke =
                  geomAttr.stroke ||
                  (geomStrokeScale && geomStrokeScale(g)) ||
                  (copiedScales?.strokeScale
                    ? copiedScales.strokeScale(g)
                    : defaultStroke)

                if (thisStrokeGroups && geomStrokeScale) {
                  thisStrokeGroups.forEach((fg) => {
                    thisStroke = geomAttr.stroke || geomStrokeScale(fg)
                  })
                }

                const thisDasharray =
                  geomAttr.strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(
                        geomAes?.strokeDasharray?.(groupData[0]),
                      )
                    : geomAttr.strokeDasharray)

                return (
                  <Animate
                    key={thisKey}
                    start={{
                      path: drawLine(
                        groupLineData.map((d: [any, any]) => {
                          const yEntrancePos =
                            entrance === Entrance.MIDPOINT
                              ? (height || 0) / 2
                              : d[1]
                          const hasMissingY =
                            d[1] === null || typeof d[1] === 'undefined'
                          return [d[0], hasMissingY ? NaN : yEntrancePos]
                        }),
                      ),
                      opacity: 0,
                    }}
                    enter={{
                      path: [drawLine(groupLineData)],
                      opacity: [geomAttr.opacity ?? 1],
                      timing: { duration, ease: easeCubic },
                    }}
                    update={{
                      path: [drawLine(groupLineData)],
                      opacity: [geomAttr.opacity ?? 1],
                      timing: {
                        duration,
                        ease: easeCubic,
                      },
                    }}
                    leave={() => ({
                      opacity: [0],
                      timing: { duration, ease: easeCubic },
                    })}
                    interpolation={(begValue, endValue, a) => {
                      if (a === 'path') {
                        return interpolatePath(begValue, endValue)
                      }
                      return interpolate(begValue, endValue)
                    }}
                  >
                    {(state) => (
                      <path
                        d={state.path}
                        opacity={state.opacity}
                        stroke={thisStroke}
                        strokeWidth={geomAttr.strokeWidth}
                        strokeOpacity={geomAttr.strokeOpacity}
                        strokeDasharray={thisDasharray}
                        fill="none"
                        data-testid="__gg_geom_line"
                        style={{
                          pointerEvents: 'none',
                        }}
                        clipPath={`url(#__gg_canvas_${id})`}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...attr}
                      />
                    )}
                  </Animate>
                )
              })
            ) : (
              <Animate
                start={{
                  path: drawLine(geomData?.map((d) => [x(d), y(d)]) as []),
                  opacity: 0,
                }}
                enter={{
                  path: [drawLine(geomData?.map((d) => [x(d), y(d)]) as [])],
                  opacity: [1],
                  timing: { duration },
                }}
                update={{
                  path: [drawLine(geomData?.map((d) => [x(d), y(d)]) as [])],
                  opacity: [1],
                  timing: { duration, ease: easeCubic },
                }}
                leave={() => ({
                  opacity: [0],
                  timing: { duration, ease: easeCubic },
                })}
                interpolation={(begValue, endValue, a) => {
                  if (a === 'path') {
                    return interpolatePath(begValue, endValue)
                  }
                  return interpolate(begValue, endValue)
                }}
              >
                {(state) => (
                  <path
                    d={state.path}
                    opacity={state.opacity}
                    stroke={geomAttr.stroke || defaultStroke}
                    strokeWidth={geomAttr.strokeWidth}
                    strokeOpacity={geomAttr.strokeOpacity}
                    fill="none"
                    data-testid="__gg_geom_line"
                    clipPath={`url(#__gg_canvas_${id})`}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...attr}
                  />
                )}
              </Animate>
            )}
          </>
        )}
      </g>
      {(showTooltip || brushAction) && (
        <>
          <EventArea
            data={geomData}
            aes={geomAes}
            group={isClosestFocusType ? undefined : 'x'}
            x={(v: Datum) => x(v)}
            y={isClosestFocusType ? y : () => 0}
            onMouseLeave={() => {
              if (lines) {
                unfocusNodes({ nodes: lines, baseStyles })
              }

              if (onExit) onExit()
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: Datum[]; i: number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onDatumFocus={onDatumFocus}
            showTooltip={showTooltip}
            brushAction={brushAction}
            isZoomedOut={isZoomedOut}
          />
          {showTooltip && (
            <>
              {showLineMarker && (
                <LineMarker
                  x={x}
                  y={y}
                  markerRadius={markerRadius}
                  markerStroke={markerStroke}
                  aes={geomAes}
                />
              )}
              <Tooltip x={x} y={y} aes={geomAes} />
            </>
          )}
        </>
      )}
    </>
  )
}

GeomLine.displayName = 'GeomLine'
export { GeomLine }
