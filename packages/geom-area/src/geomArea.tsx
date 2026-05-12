import React, {
  useEffect,
  useMemo,
  SVGAttributes,
  useState,
  useCallback,
} from 'react'
import {
  useGG,
  themeState,
  generateID,
  EventArea,
  isDate,
  widen,
  yScaleState,
  zoomState,
  defaultScheme,
  fillScaleState,
  strokeScaleState,
  VisualEncodingTypes,
  BrushAction,
} from '@graphique/graphique'
import { Animate } from 'react-move'
import { easeCubic } from 'd3-ease'
import { scaleOrdinal } from 'd3-scale'
import { interpolate } from 'd3-interpolate'
import { interpolatePath } from 'd3-interpolate-path'
import {
  area,
  CurveFactory,
  curveLinear,
  stack,
  stackOffsetDiverging,
  stackOffsetWiggle,
  stackOffsetExpand,
  stackOrderNone,
} from 'd3-shape'
import { min, max, sum, extent } from 'd3-array'
import { useAtom } from 'jotai'
import { GeomAes, Position, StackedArea } from './types'
import { LineMarker, Tooltip } from './tooltip'
import { useHandleSpecificationErrors } from './hooks/useHandleSpecificationErrors'

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
  /** determines how grouped elements are positioned relative to each other (_default_: `Position.IDENTITY`) */
  position?: Position
  /** should this Geom have a tooltip associated with it (_default_: `true`) */
  showTooltip?: boolean
  /** determines what happens when brushing (clicking and dragging) over the drawing area  */
  brushAction?: BrushAction
  /** [d3 curve](https://d3js.org/d3-shape/curve) factory imported from `d3-shape` (_default_: `curveLinear`) */
  curve?: CurveFactory
  /** should this Geom have a line marker for its focused data (_default_: `true`) */
  showLineMarker?: boolean
  /** radius in px of the line marker's points (_default_: `3.5`) */
  markerRadius?: number
  /** stroke color of the line marker's points (_default_: `"#ffffff"`) */
  markerStroke?: string
  /** callback called for mousemove events on the drawing area when focusing data */
  onDatumFocus?: (data: Datum[], index: number[]) => void
  /** callback called for click events on the drawing area when selecting focused data */
  onDatumSelection?: (data: Datum[], index: number[]) => void
  /** callback called for mouseleave events on the drawing area */
  onExit?: () => void
  /** should elements enter/update/exit with animated transitions (_default_: `true`) */
  isAnimated?: boolean
}

const GeomArea = <Datum,>({
  data: localData,
  aes: localAes,
  brushAction,
  curve = curveLinear,
  onDatumFocus,
  onDatumSelection,
  onExit,
  attr,
  showTooltip = true,
  showLineMarker = true,
  markerRadius = 3.5,
  markerStroke = '#fff',
  position = Position.IDENTITY,
  isAnimated = true,
}: GeomProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { id, data, aes, scales, copiedScales } = ggState || {}
  const [theme, setTheme] = useAtom(themeState)
  const [{ values: fillScaleColors, domain: fillDomain }] =
    useAtom(fillScaleState)
  const [{ values: strokeScaleColors, domain: strokeDomain }] =
    useAtom(strokeScaleState)
  const [, setYScale] = useAtom(yScaleState)
  const [{ xDomain: xZoomDomain, yDomain: yZoomDomain }] = useAtom(zoomState)

  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes as GeomAes<Datum>
  }, [aes, localAes])

  const geomData = localData || data

  const zoomedData = useMemo(
    () =>
      geomData?.filter((d) => {
        if (!xZoomDomain?.current) return true

        const xVal = geomAes?.x?.(d)
        return (
          xVal &&
          xVal >= xZoomDomain?.current?.[0] &&
          xVal <= xZoomDomain?.current?.[1]
        )
      }),
    [geomData, xZoomDomain?.current, geomAes.x],
  )

  const allXUndefined = useMemo(() => {
    const undefinedX = geomData
      ? geomData.filter(
          (d) =>
            geomAes?.x &&
            (geomAes?.x(d) === null ||
              typeof geomAes?.x(d) === 'undefined' ||
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
            (!geomAes.y0 &&
              !geomAes.y1 &&
              geomAes?.y &&
              (geomAes.y(d) === null ||
                typeof geomAes.y(d) === 'undefined' ||
                Number.isNaN(geomAes.y(d)?.valueOf()))) ||
            (geomAes.y0 &&
              (geomAes.y0(d) === null ||
                typeof geomAes.y0(d) === 'undefined' ||
                Number.isNaN(geomAes.y0(d)?.valueOf()))) ||
            (geomAes.y1 &&
              (geomAes.y1(d) === null ||
                typeof geomAes.y1(d) === 'undefined' ||
                Number.isNaN(geomAes.y1(d)?.valueOf()))),
        )
      : []
    return geomData && undefinedY.length === geomData.length
  }, [geomData])

  const { defaultFill, defaultStroke, animationDuration: duration } = theme

  const geomID = useMemo(() => generateID(), [])

  const [firstRender, setFirstRender] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const shouldStack = useMemo(
    () => [Position.STACK, Position.FILL, Position.STREAM].includes(position),
    [position],
  )

  // draw an area for each registered group
  const group = useMemo(
    () =>
      geomAes?.group ?? geomAes?.fill
        ? geomAes?.group ?? geomAes?.fill
        : scales?.groupAccessor ?? (() => '__group'),
    [geomAes],
  )

  const groups = useMemo(() => {
    if (group) {
      const g = Array.from(new Set(geomData?.map(group))) as string[]

      return g
    }

    return undefined
  }, [geomData, group])

  const fillGroups = useMemo(
    () => copiedScales?.fillScale?.domain(),
    [copiedScales],
  )

  const strokeGroups = useMemo(
    () => copiedScales?.strokeScale?.domain(),
    [copiedScales],
  )

  const x = useMemo(
    () => (d: Datum) =>
      geomAes?.x && scales?.xScale && scales.xScale(geomAes?.x(d)),
    [scales, geomAes],
  )
  const y = useMemo(
    () => (d: Datum) =>
      geomAes?.y && scales?.yScale && scales.yScale(geomAes?.y(d)),
    [scales, geomAes],
  )

  const stackOffset = useMemo(() => {
    if (position === Position.FILL) return stackOffsetExpand
    if (position === Position.STREAM) return stackOffsetWiggle

    return stackOffsetDiverging
  }, [position])

  const stackOrder = useMemo(() => stackOrderNone, [position])

  // error checking for missing y-related aes
  useHandleSpecificationErrors({ geomAes, position, shouldStack })

  const geomFillScale = useMemo(() => {
    if (groups && geomAes.fill) {
      return scaleOrdinal()
        .domain(fillDomain || fillGroups || groups)
        .range(
          (fillScaleColors as string[]) || defaultScheme,
        ) as VisualEncodingTypes
    }
    return undefined
  }, [geomAes, fillScaleColors, fillDomain])

  const geomStrokeScale = useMemo(() => {
    if (groups && geomAes.stroke) {
      return scaleOrdinal()
        .domain(strokeDomain || strokeGroups || groups)
        .range(
          (strokeScaleColors as string[]) || defaultScheme,
        ) as VisualEncodingTypes
    }
    return undefined
  }, [geomAes, strokeDomain])

  const stackedData = useMemo(() => {
    if (
      geomData &&
      geomAes?.x &&
      geomAes?.y &&
      // geomFillScale &&
      group &&
      groups
    ) {
      const stacked = stack()
        .keys([...(fillDomain || groups)]?.reverse())
        .order(stackOrder)
        .offset(stackOffset)(widen(geomData, geomAes.x, group, geomAes.y))

      const formattedStacked = stacked
        .map((s) => {
          const thisGroup = s.key
          return s
            .map((thisStack) => ({
              group: thisGroup,
              x: thisStack.data.key,
              y0: thisStack[0],
              y1: thisStack[1],
            }))
            .flat()
        })
        .flat()
        .sort((a, b) => a.x - b.x)

      return formattedStacked
    }
    return null
  }, [geomData, geomAes, stackOffset, stackOrder])

  const isStream = useMemo(
    () => position === Position.STREAM && !!stackedData,
    [stackedData, position],
  )

  const getYValExtent = useCallback(
    (areaData: Datum[]) => {
      // reset the yScale based on position
      const existingYExtent = [0, 1]

      let resolvedYExtent = [0, 1]
      if (!group && !groups && !geomAes.y0 && !geomAes.y1)
        resolvedYExtent = [0, existingYExtent[1]]
      if (!group && !groups) resolvedYExtent = existingYExtent
      if (group && groups && areaData && geomAes?.x) {
        const groupYMaximums = groups.map((g) =>
          max(
            areaData.filter((d) => group(d) === g),
            (d) => {
              const thisYAcc = !shouldStack
                ? geomAes.y1 || geomAes.y || (() => undefined)
                : geomAes.y || (() => undefined)
              return thisYAcc(d) as number
            },
          ),
        )

        const groupYMinimums = groups.map((g) =>
          min(
            areaData.filter((d) => group(d) === g),
            (d) => {
              const thisYAcc = geomAes.y0 || (() => undefined)
              return thisYAcc(d) as number
            },
          ),
        )

        if ([Position.STACK].includes(position)) {
          const totalGroupYMaximums = max([
            sum(groupYMaximums),
            existingYExtent[1],
          ])

          return [0, totalGroupYMaximums]
        }
        if (position === Position.FILL) return [0, 1]

        if (isStream) {
          const zoomedStackData = xZoomDomain?.current
            ? stackedData!.filter(
                (d) =>
                  d.x >= xZoomDomain?.current?.[0] &&
                  d.x <= xZoomDomain?.current?.[1],
              )
            : stackedData!

          const groupYMinimum = min(zoomedStackData, (d) => d.y0)
          const groupYMaximum = max(zoomedStackData, (d) => d.y1)

          return [groupYMinimum, groupYMaximum]
        }

        if (position === Position.IDENTITY) {
          const identityYVals: (number | undefined)[][] | undefined =
            areaData?.map((d) => {
              const yVal = geomAes?.y ? (geomAes.y(d) as number) : undefined
              const y0Val = geomAes?.y0 ? (geomAes.y0(d) as number) : undefined
              const y1Val = geomAes?.y1 ? (geomAes.y1(d) as number) : undefined
              return [yVal, y0Val, y1Val]
            })

          const yExtent = identityYVals
            ? (extent(identityYVals.flat() as number[]) as [number, number])
            : [0, 1]

          const yMin =
            geomAes?.y0 && geomAes?.y1 && !geomAes.y
              ? min([groupYMinimums as number[]].flat())
              : min([0, yExtent[0] as number])

          const yMax = max([
            !geomAes.y0 && !geomAes.y1 && 0,
            max(
              [groupYMaximums as number[], existingYExtent[1] as number].flat(),
            ),
          ] as number[])

          resolvedYExtent = [yMin, yMax] as [number, number]
        }
      }

      return resolvedYExtent
    },
    [
      position,
      geomAes,
      shouldStack,
      groups,
      isStream,
      stackedData,
      xZoomDomain?.current,
    ],
  )

  const yValExtent = useMemo(() => {
    if (yZoomDomain?.original && !yZoomDomain?.current)
      return yZoomDomain?.original

    if (yZoomDomain?.current)
      return yZoomDomain.current

    return zoomedData ? getYValExtent(zoomedData) : [0, 1]
  }, [zoomedData, yZoomDomain])

  useEffect(() => {
    setYScale((prev) => ({
      ...prev,
      domain: yValExtent,
    }))
  }, [yValExtent])

  const y0 = useMemo(
    () => (d: Datum) =>
      geomAes?.y0 && scales?.yScale && scales.yScale(geomAes.y0(d)),
    [scales, geomAes],
  )

  const y1 = useMemo(
    () => (d: Datum) =>
      geomAes?.y1 && scales?.yScale && scales.yScale(geomAes.y1(d)),
    [scales, geomAes],
  )

  const drawStackArea = useMemo(
    () =>
      area<StackedArea>()
        .x((d) => scales?.xScale(d.x) as number)
        .y0((d) => scales?.yScale?.(d.y0) as number)
        .y1((d) => scales?.yScale?.(d.y1) as number)
        .defined((d) => {
          const dataVal = d
          const xVal = isDate(dataVal.x) ? dataVal.x.valueOf() : dataVal.x

          const areDefined =
            typeof xVal !== 'undefined' &&
            typeof dataVal.y0 !== 'undefined' &&
            typeof dataVal.y1 !== 'undefined'

          const areNumbers =
            !Number.isNaN(xVal) &&
            !Number.isNaN(dataVal.y0) &&
            !Number.isNaN(dataVal.y1)

          return areDefined && areNumbers
        })
        .curve(curve),
    [curve, scales, geomAes, localAes, yValExtent],
  )

  const drawArea = useMemo(
    () =>
      area<Datum>()
        .x((d) => x(d) as number)
        .y0((d) => (localAes?.y0 ? (y0(d) as number) : scales?.yScale(0)))
        .y1((d) => (localAes?.y1 ? (y1(d) as number) : (y(d) as number)))
        .defined((d) => {
          const xVal =
            geomAes.x &&
            (isDate(geomAes.x(d)) ? geomAes.x(d)?.valueOf() : geomAes.x(d))

          const y0Val =
            geomAes.y0 && geomAes.y1 ? geomAes.y0(d) : geomAes.y && geomAes.y(d)
          const y1Val =
            geomAes.y0 && geomAes.y1 ? geomAes.y1(d) : geomAes.y && geomAes.y(d)

          const areDefined =
            typeof xVal !== 'undefined' &&
            typeof y0Val !== 'undefined' &&
            y0Val !== null &&
            typeof y1Val !== 'undefined' &&
            y1Val !== null

          const areNumbers =
            !Number.isNaN(xVal) && !Number.isNaN(y0Val) && !Number.isNaN(y1Val)

          return areDefined && areNumbers
        })
        .curve(curve || curveLinear),
    [curve, geomAes, localAes, scales, yValExtent],
  )

  // merge GG-level scales with Geom-level scales
  const baseAttr: SVGAttributes<SVGPathElement> = {
    fillOpacity: 1,
    strokeOpacity: 1,
    strokeWidth: 0,
  }

  const geomAttr: SVGAttributes<SVGPathElement> = {
    ...baseAttr,
    ...attr,
  }

  const resolvedOpacity = useMemo(
    () =>
      attr?.style?.fillOpacity ||
      attr?.style?.opacity ||
      attr?.opacity ||
      attr?.fillOpacity,
    [attr],
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        area: {
          position,
          fillOpacity: resolvedOpacity,
          stroke: geomAttr.stroke,
          fill: geomAttr.fill,
          fillScale: geomFillScale,
          strokeScale: geomStrokeScale,
          groupAccessor: group ?? geomAes?.fill ?? geomAes?.group,
          usableGroups: groups,
          y0,
          y1,
          strokeWidth: geomAttr?.style?.strokeWidth || geomAttr?.strokeWidth,
          strokeOpacity:
            geomAttr?.style?.strokeOpacity || geomAttr?.strokeOpacity,
          strokeDasharray:
            geomAttr?.style?.strokeDasharray || geomAttr?.strokeDasharray,
        },
      },
    }))
  }, [
    resolvedOpacity,
    setTheme,
    attr,
    position,
    shouldStack,
    group,
    geomFillScale,
    geomStrokeScale,
  ])

  const isAbleToDrawArea = useMemo(
    () => (shouldStack ? !!stackedData : true),
    [stackedData, shouldStack],
  )

  const getStackedData = useMemo(
    () => (g: unknown) => {
      const thisStack = stackedData
        ? stackedData.filter((sd) => sd.group === g)
        : []

      return thisStack
    },
    [stackedData, scales, geomAes, position],
  )

  // map through groups to draw an area for each group
  return !firstRender &&
    !allXUndefined &&
    !allYUndefined &&
    isAbleToDrawArea ? (
    <>
      {geomData && groups && group ? (
        groups.map((g) => {
          const groupData = geomData.filter((d) => group(d) === g)
          const groupStack = getStackedData(g)

          const thisFillGroups =
            geomFillScale && geomAes?.fill
              ? Array.from(
                  new Set(
                    groupData.map((gd) => geomAes.fill && geomAes.fill(gd)),
                  ),
                )
              : undefined

          let thisFill =
            geomAttr.fill ||
            (geomFillScale && geomFillScale(g)) ||
            (copiedScales?.fillScale ? copiedScales.fillScale(g) : defaultFill)

          if (thisFillGroups && geomFillScale) {
            thisFillGroups.forEach((fg) => {
              thisFill = geomFillScale(fg)
            })
          }

          const thisStrokeGroups =
            geomStrokeScale && geomAes?.stroke
              ? Array.from(
                  new Set(
                    groupData.map((gd) => geomAes.stroke && geomAes.stroke(gd)),
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
              thisStroke = geomStrokeScale(fg)
            })
          }

          const thisDasharray =
            geomAttr.strokeDasharray ||
            (copiedScales?.strokeDasharrayScale
              ? copiedScales.strokeDasharrayScale(g)
              : undefined)

          return (
            <Animate
              key={`${geomID}-${g}`}
              start={{
                path: shouldStack
                  ? drawStackArea(groupStack)
                  : drawArea(groupData),
                fill: 'transparent',
                stroke: 'transparent',
                strokeOpacity: 0,
                fillOpacity: 0,
              }}
              enter={() => {
                const path = shouldStack
                  ? drawStackArea(groupStack)
                  : drawArea(groupData)

                return {
                  path: isAnimated ? [path] : path,
                  fill: thisFill,
                  stroke: thisStroke,
                  fillOpacity: isAnimated
                    ? [geomAttr.fillOpacity]
                    : geomAttr.fillOpacity,
                  strokeOpacity: isAnimated
                    ? [geomAttr.strokeOpacity]
                    : geomAttr.strokeOpacity,
                  timing: { duration, ease: easeCubic },
                }
              }}
              update={() => {
                const path = shouldStack
                  ? drawStackArea(groupStack)
                  : drawArea(groupData)

                return {
                  path: isAnimated ? [path] : path,
                  fill: thisFill,
                  stroke: thisStroke,
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
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...attr}
                  d={state.path}
                  fill={state.fill}
                  fillOpacity={state.fillOpacity}
                  stroke={state.stroke}
                  strokeOpacity={state.strokeOpacity}
                  strokeWidth={geomAttr.strokeWidth}
                  strokeDasharray={thisDasharray}
                  style={{
                    pointerEvents: 'none',
                    ...geomAttr?.style,
                  }}
                  data-testid="__gg_geom_area"
                  clipPath={`url(#__gg_canvas_${id})`}
                />
              )}
            </Animate>
          )
        })
      ) : (
        <></>
      )}
      {(showTooltip || brushAction) && (
        <>
          <EventArea
            data={geomData}
            aes={geomAes}
            group="x"
            x={x}
            y={() => 0}
            onDatumFocus={onDatumFocus}
            onMouseLeave={() => {
              if (onExit) onExit()
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: Datum[]; i: number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            showTooltip={showTooltip}
            brushAction={brushAction}
            customYExtent={yValExtent}
            getYValExtent={getYValExtent}
          />
          {showTooltip && (
            <>
              {showLineMarker && (
                <LineMarker
                  x={x}
                  y={y}
                  y0={y0}
                  y1={y1}
                  aes={geomAes}
                  markerRadius={markerRadius}
                  markerStroke={markerStroke}
                  stackedData={stackedData}
                  position={position}
                />
              )}
              <Tooltip
                x={x}
                y={y}
                y0={y0}
                y1={y1}
                aes={geomAes}
                geomID={geomID}
                position={position}
              />
            </>
          )}
        </>
      )}
    </>
  ) : null
}

GeomArea.displayName = 'GeomArea'
export { GeomArea }
