import React, { useEffect, useMemo, SVGAttributes, useState } from 'react'
import {
  useGG,
  themeState,
  generateID,
  Delaunay,
  Aes,
  DataValue,
  isDate,
  widen,
  yScaleState,
} from '@graphique/graphique'
import { Animate } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { interpolatePath } from 'd3-interpolate-path'
import {
  area,
  CurveFactory,
  curveLinear,
  stack,
  stackOffsetDiverging,
  stackOffsetExpand,
  stackOffsetWiggle,
  stackOrderInsideOut,
  stackOrderNone,
} from 'd3-shape'
import { min, max, sum, extent } from 'd3-array'
import { useAtom } from 'jotai'
import { LineMarker, Tooltip } from './tooltip'

interface AreaAes {
  /** a functional mapping to `data` representing an initial **y** value */
  y0?: DataValue
  /** a functional mapping to `data` representing a secondary **y** value */
  y1?: DataValue
}

type StackedArea = {
  x: number
  i: number
  y0: number
  y1: number
}

export interface AreaProps extends SVGAttributes<SVGPathElement> {
  data?: unknown[]
  aes?: Aes & AreaAes
  showTooltip?: boolean
  curve?: CurveFactory
  markerRadius?: number
  markerStroke?: string
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  // focus?: "x" | "nearest"
  // onDatumSelection?: (data: unknown, index: number) => void
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
  position?: 'identity' | 'stack' | 'fill' | 'stream'
}

const GeomArea = ({
  data: localData,
  aes: localAes,
  showTooltip = true,
  curve,
  onDatumFocus,
  // focus = "x",
  // onDatumSelection,
  // debugVoronoi,
  // focusedStyle,
  // unfocusedStyle,
  onExit,
  fillOpacity = 1,
  strokeOpacity = 1,
  strokeWidth = 1.2,
  markerRadius = 3.5,
  markerStroke = '#fff',
  position = 'identity',
  ...props
}: AreaProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales } = ggState || {}
  const [theme, setTheme] = useAtom(themeState)
  const [, setYScale] = useAtom(yScaleState)

  const geomData = localData || data
  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      } as Aes & AreaAes
    }
    return aes as Aes & AreaAes
  }, [aes, localAes])

  const {
    fill: fillColor,
    stroke: strokeColor,
    strokeDasharray,
    // strokeWidth,
  } = { ...props }
  const { defaultFill, defaultStroke } = theme

  const geomID = useMemo(() => generateID(), [])

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  // draw an area for each registered group
  // get groups from aes.group || aes.stroke || aes.strokeDasharray?
  const group = scales?.groupAccessor
  const groups = scales?.groups

  const x = useMemo(
    () => (d: unknown) => scales?.xScale && scales.xScale(geomAes?.x(d)),
    [scales, geomAes]
  )
  const y = useMemo(
    () => (d: unknown) =>
      geomAes?.y && scales?.yScale && scales.yScale(geomAes?.y(d)),
    [scales, geomAes]
  )

  const yValExtent = useMemo(() => {
    // reset the yScale based on position
    if (
      ['stack', 'fill', 'stream'].includes(position) &&
      scales?.groups &&
      group &&
      geomData &&
      scales?.xScale &&
      scales.yScale &&
      geomAes?.x &&
      geomAes?.y
    ) {
      if (['stack', 'stream'].includes(position)) {
        const groupYMaximums = scales.groups.map((g) =>
          max(
            geomData.filter((d) => group(d) === g),
            (d) => (geomAes.y ? (geomAes.y(d) as number) : undefined)
          )
        )
        return [0, sum(groupYMaximums)]
      }
      return [0, 1]
    }
    const identityYVals: (number | undefined)[][] | undefined = geomData?.map(
      (d) => {
        const yVal = geomAes?.y ? (geomAes.y(d) as number) : undefined
        const y0Val = geomAes?.y0 ? (geomAes.y0(d) as number) : undefined
        const y1Val = geomAes?.y1 ? (geomAes.y1(d) as number) : undefined
        return [yVal, y0Val, y1Val]
      }
    )
    const yExtent = identityYVals
      ? extent(identityYVals.flat() as number[])
      : [0, 1]
    const yMin =
      geomAes?.y0 && geomAes?.y1 ? yExtent[0] : min([0, yExtent[0] as number])
    return [yMin, yExtent[1]]
  }, [position, scales, geomData, geomAes])

  useEffect(() => {
    setYScale((prev) => ({
      ...prev,
      domain: yValExtent,
    }))
  }, yValExtent)

  const y0 = useMemo(
    () => (d: unknown) =>
      geomAes?.y0 && scales?.yScale && scales.yScale(geomAes.y0(d)),
    [scales, geomAes]
  ) as DataValue

  const y1 = useMemo(
    () => (d: unknown) =>
      geomAes?.y1 && scales?.yScale && scales.yScale(geomAes.y1(d)),
    [scales, geomAes]
  ) as DataValue

  const shouldStack = useMemo(
    () => ['stack', 'fill', 'stream'].includes(position),
    [position]
  )

  const drawStackArea = useMemo(
    () =>
      area()
        .x((d: any) => scales?.xScale(d.x) as number)
        .y0((d: any) => scales?.yScale(d.y0) as number)
        .y1((d: any) => scales?.yScale(d.y1) as number)
        .defined((d: any) => {
          const dataVal: StackedArea = d
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
        .curve(curve || curveLinear),
    [curve, scales, geomAes, localAes, yValExtent]
  )

  const drawArea = useMemo(
    () =>
      area()
        .x((d) => x(d) as number)
        .y0((d) => (localAes?.y0 ? (y0(d) as number) : scales?.yScale(0)))
        .y1((d: any) => (localAes?.y1 ? (y1(d) as number) : (y(d) as number)))
        .defined((d) => {
          const xVal = isDate(geomAes.x(d))
            ? geomAes.x(d)?.valueOf()
            : geomAes.x(d)

          const y0Val =
            geomAes.y0 && geomAes.y1 ? geomAes.y0(d) : geomAes.y && geomAes.y(d)
          const y1Val =
            geomAes.y0 && geomAes.y1 ? geomAes.y1(d) : geomAes.y && geomAes.y(d)
          return (
            !Number.isNaN(xVal) && !Number.isNaN(y0Val) && !Number.isNaN(y1Val)
          )
        })
        .curve(curve || curveLinear),
    [curve, geomAes, localAes, scales, yValExtent]
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        area: {
          position,
          fillOpacity: props.style?.fillOpacity || fillOpacity,
          stroke: strokeColor,
          fill: fillColor,
          y0,
          y1,
          strokeWidth: props.style?.strokeWidth || strokeWidth,
          strokeOpacity: props.style?.strokeOpacity || strokeOpacity,
          strokeDasharray: props.style?.strokeDasharray || strokeDasharray,
        },
      },
    }))
  }, [
    fillOpacity,
    setTheme,
    strokeWidth,
    strokeOpacity,
    strokeDasharray,
    strokeColor,
    fillColor,
    props.style,
    position,
  ])

  const stackOffset = useMemo(() => {
    if (position === 'fill') return stackOffsetExpand
    if (position === 'stream') return stackOffsetWiggle
    return stackOffsetDiverging
  }, [position])

  const stackOrder = useMemo(() => {
    if (position === 'stream') return stackOrderInsideOut
    return stackOrderNone
  }, [position])

  const stackedData = useMemo(() => {
    if (
      geomData &&
      geomAes?.x &&
      geomAes?.y &&
      shouldStack &&
      scales?.groups &&
      scales?.groupAccessor
    ) {
      const stacked = stack()
        .keys(scales.groups)
        .order(stackOrder)
        .offset(stackOffset)(
        widen(geomData, geomAes.x, scales.groupAccessor, geomAes.y)
      )
      return stacked
    }
    return null
  }, [geomData, geomAes, shouldStack, stackOffset, stackOrder])

  const getStackedData = useMemo(
    () => (g: unknown) => {
      const thisStack =
        stackedData &&
        stackedData
          .find((sd) => sd.key === g)
          ?.map((gs) => ({
            x: gs.data.key,
            i: gs.data.i,
            y0: gs[0],
            y1: gs[1],
          }))
          .sort((a, b) => a.x - b.x)

      // console.log(thisStack)

      return thisStack
    },
    [stackedData, scales, geomAes, position]
  )

  // map through groups to draw an area for each group
  return !firstRender ? (
    <>
      {geomData && groups && group ? (
        groups.map((g) => {
          const thisFill =
            fillColor ||
            (copiedScales?.fillScale ? copiedScales.fillScale(g) : defaultFill)

          const thisStroke =
            strokeColor ||
            (copiedScales?.strokeScale
              ? copiedScales.strokeScale(g)
              : defaultStroke)

          const thisDasharray =
            strokeDasharray ||
            (copiedScales?.strokeDasharrayScale
              ? copiedScales.strokeDasharrayScale(g)
              : strokeDasharray)

          const groupData = geomData.filter((d) => group(d) === g)
          const groupStack = getStackedData(g)

          return (
            <Animate
              key={`${geomID}-${g}`}
              start={{
                path: shouldStack
                  ? // @ts-ignore
                    drawStackArea(groupStack)
                  : // @ts-ignore
                    drawArea(groupData),
                fill: 'transparent',
                stroke: 'transparent',
                strokeOpacity: 0,
                fillOpacity: 0,
              }}
              enter={{
                path: shouldStack
                  ? // @ts-ignore
                    [drawStackArea(groupStack)]
                  : // @ts-ignore
                    [drawArea(groupData)],
                fill: [thisFill],
                stroke: [thisStroke],
                fillOpacity: [fillOpacity],
                strokeOpacity: [strokeOpacity],
                timing: { duration: 1000, ease: easeCubic },
              }}
              update={{
                path: shouldStack
                  ? // @ts-ignore
                    [drawStackArea(groupStack)]
                  : // @ts-ignore
                    [drawArea(groupData)],
                fill: firstRender ? thisFill : [thisFill],
                stroke: firstRender ? thisStroke : [thisStroke],
                fillOpacity: [fillOpacity],
                strokeOpacity: [strokeOpacity],
                timing: {
                  duration: 1000,
                  ease: easeCubic,
                },
              }}
              leave={() => ({
                fill: ['transparent'],
                stroke: ['transparent'],
                timing: { duration: 1000, ease: easeCubic },
              })}
              interpolation={(begValue, endValue, attr) => {
                if (attr === 'path') {
                  return interpolatePath(begValue, endValue)
                }
                return interpolate(begValue, endValue)
              }}
            >
              {(state) => (
                <path
                  d={state.path}
                  fill={state.fill}
                  fillOpacity={state.fillOpacity}
                  stroke={state.stroke}
                  strokeOpacity={state.strokeOpacity}
                  strokeWidth={strokeWidth}
                  strokeDasharray={thisDasharray}
                  style={{
                    pointerEvents: 'none',
                  }}
                  // eslint-disable-next-line react/jsx-props-no-spreading
                  {...props}
                />
              )}
            </Animate>
          )
        })
      ) : (
        <Animate
          start={{
            // @ts-ignore
            path: drawArea(geomData),
            fill: 'transparent',
            stroke: 'transparent',
            strokeOpacity: 0,
            fillOpacity: 0,
          }}
          enter={{
            // @ts-ignore
            path: [drawArea(geomData)],
            fill: [fillColor || defaultFill],
            stroke: [strokeColor || defaultStroke],
            fillOpacity: [fillOpacity],
            strokeOpacity: [strokeOpacity],
            timing: { duration: 1000 },
          }}
          update={{
            // @ts-ignore
            path: [drawArea(geomData)],
            fill: [fillColor || defaultFill],
            stroke: [strokeColor || defaultStroke],
            fillOpacity: firstRender ? fillOpacity : [fillOpacity],
            strokeOpacity: firstRender ? strokeOpacity : [strokeOpacity],
            timing: { duration: 1000, ease: easeCubic },
          }}
          leave={() => ({
            fill: ['transparent'],
            stroke: ['transparent'],
            timing: { duration: 1000, ease: easeCubic },
          })}
          interpolation={(begValue, endValue, attr) => {
            if (attr === 'path') {
              return interpolatePath(begValue, endValue)
            }
            return interpolate(begValue, endValue)
          }}
        >
          {(state) => (
            <path
              d={state.path}
              fill={state.fill}
              fillOpacity={state.fillOpacity}
              stroke={state.stroke}
              strokeWidth={strokeWidth}
              strokeOpacity={state.strokeOpacity}
              style={{
                pointerEvents: 'none',
              }}
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...props}
            />
          )}
        </Animate>
      )}
      {showTooltip && (
        <>
          <Delaunay
            data={geomData}
            aes={aes}
            group="x"
            x={x}
            y={() => 0}
            onMouseOver={({ d, i }: { d: unknown; i: number | number[] }) => {
              if (onDatumFocus) onDatumFocus(d, i)
            }}
            onMouseLeave={() => {
              if (onExit) onExit()
            }}
          />
          <LineMarker
            x={x}
            y={y}
            markerRadius={markerRadius}
            markerStroke={markerStroke}
          />
          <Tooltip x={x} y={y} />
        </>
      )}
    </>
  ) : null
}

GeomArea.displayName = 'GeomArea'
export { GeomArea }
