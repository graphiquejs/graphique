import React, { useEffect, useMemo, SVGAttributes, useState } from 'react'
import {
  useGG,
  themeState,
  generateID,
  Delaunay,
  Aes,
  DataValue,
} from '@graphique/graphique'
import { Animate } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { interpolatePath } from 'd3-interpolate-path'
import { line, CurveFactory, curveLinear } from 'd3-shape'
import { useAtom } from 'jotai'
import { LineMarker, Tooltip } from './tooltip'

type GeomAes = Omit<Aes, 'x' | 'fill' | 'size'> & {
  x?: DataValue
}

export interface LineProps extends SVGAttributes<SVGPathElement> {
  data?: unknown[]
  aes?: GeomAes
  showTooltip?: boolean
  curve?: CurveFactory
  markerRadius?: number
  markerStroke?: string
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  // focus?: "x" | "nearest"
  // onDatumSelection?: (data: unknown, index: number) => void
  onExit?: () => void
}

const GeomLine = ({
  data: localData,
  aes: localAes,
  showTooltip = true,
  curve,
  onDatumFocus,
  //  focus = "x",
  // onDatumSelection,
  // debugVoronoi,
  //  focusedStyle,
  //  unfocusedStyle,
  onExit,
  strokeWidth = 2.5,
  strokeOpacity = 1,
  markerRadius = 3.5,
  markerStroke = '#fff',
  ...props
}: LineProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, height } = ggState || {}
  const [theme, setTheme] = useAtom(themeState)

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

  const { stroke: strokeColor, strokeDasharray } = { ...props }
  const { defaultStroke } = theme

  const geomID = useMemo(() => generateID(), [])

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        line: {
          strokeWidth: props.style?.strokeWidth || strokeWidth,
          strokeOpacity: props.style?.strokeOpacity || strokeOpacity,
          strokeDasharray,
          stroke: strokeColor,
        },
      },
    }))
  }, [
    setTheme,
    strokeWidth,
    strokeOpacity,
    strokeDasharray,
    strokeColor,
    props.style,
  ])

  // draw a line for each registered group
  // get groups from aes.group || aes.stroke || aes.strokeDasharray?
  const group = scales?.groupAccessor
  const groups = scales?.groups

  const x = useMemo(
    () => (d: unknown) => scales?.xScale && geomAes?.x && scales.xScale(geomAes.x(d)),
    [scales, geomAes]
  )
  const y = useMemo(
    () => (d: unknown) =>
      geomAes?.y && scales?.yScale && scales.yScale(geomAes?.y(d)),
    [scales, geomAes]
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
        .curve(curve || curveLinear),
    [curve]
  )

  // map through groups to draw a line for each group

  return !firstRender ? (
    <>
      {geomData && groups && group ? (
        groups.map((g) => {
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

          const groupData = geomData
            .filter((d) => group(d) === g)
            .map((d) => [x(d), y(d)]) as []

          return (
            <Animate
              key={`${geomID}-${g}`}
              start={{
                path: drawLine(
                  groupData.map((d: [any, any]) => {
                    const hasMissingY =
                      d[1] === null || typeof d[1] === 'undefined'
                    return [d[0], hasMissingY ? NaN : (height || 0) / 2]
                  })
                ),
                opacity: 0,
              }}
              enter={{
                path: [drawLine(groupData)],
                opacity: [1],
                timing: { duration: 1000, ease: easeCubic },
              }}
              update={{
                path: [drawLine(groupData)],
                opacity: [1],
                timing: {
                  duration: 1000,
                  ease: easeCubic,
                },
              }}
              leave={() => ({
                opacity: [0],
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
                  opacity={state.opacity}
                  stroke={thisStroke}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  strokeDasharray={thisDasharray}
                  fill="none"
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
            path: drawLine(geomData?.map((d) => [x(d), y(d)]) as []),
            opacity: 0,
          }}
          enter={{
            path: [drawLine(geomData?.map((d) => [x(d), y(d)]) as [])],
            opacity: [1],
            timing: { duration: 1000 },
          }}
          update={{
            path: [drawLine(geomData?.map((d) => [x(d), y(d)]) as [])],
            opacity: [1],
            timing: { duration: 1000, ease: easeCubic },
          }}
          leave={() => ({
            opacity: [0],
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
              opacity={state.opacity}
              stroke={strokeColor || defaultStroke}
              strokeWidth={strokeWidth}
              strokeOpacity={strokeOpacity}
              fill="none"
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
            aes={geomAes}
            group="x"
            x={(v) => x(v)}
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

GeomLine.displayName = 'GeomLine'
export { GeomLine }
