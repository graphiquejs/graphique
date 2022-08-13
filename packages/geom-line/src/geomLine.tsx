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
  generateID,
  EventArea,
  BrushAction,
  isDate,
  usePageVisibility,
  focusNodes,
  unfocusNodes,
  strokeScaleState,
  VisualEncodingTypes,
  defaultScheme,
} from '@graphique/graphique'
import { Animate } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { interpolatePath } from 'd3-interpolate-path'
import { line, CurveFactory, curveLinear } from 'd3-shape'
import { scaleOrdinal } from 'd3-scale'
import { useAtom } from 'jotai'
import { LineMarker, Tooltip } from './tooltip'
import { type GeomAes } from './types'

export interface LineProps extends SVGAttributes<SVGPathElement> {
  data?: unknown[]
  aes?: GeomAes
  showTooltip?: boolean
  showLineMarker?: boolean
  brushAction?: BrushAction
  curve?: CurveFactory
  markerRadius?: number
  markerStroke?: string
  entrance?: 'data' | 'midpoint'
  focusType?: 'x' | 'closest'
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  onDatumFocus?: (data: unknown, index: number[]) => void
  onDatumSelection?: (data: unknown, index: number[]) => void
  onExit?: () => void
}

const GeomLine = ({
  data: localData,
  aes: localAes,
  showTooltip = true,
  showLineMarker = true,
  brushAction,
  curve,
  entrance = 'midpoint',
  onDatumSelection,
  onDatumFocus,
  onExit,
  focusedStyle,
  unfocusedStyle,
  strokeWidth = 2.5,
  strokeOpacity = 1,
  markerRadius = 3.5,
  markerStroke = '#fff',
  focusType = 'x',
  ...props
}: LineProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, copiedData, height, id } =
    ggState || {}
  const [theme, setTheme] = useAtom(themeState)
  const [{ values: strokeScaleColors, domain: strokeDomain }] =
    useAtom(strokeScaleState)

  const isVisible = usePageVisibility()

  const geomData = localData || data
  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes as GeomAes
  }, [aes, localAes])

  const allXUndefined = useMemo(() => {
    const undefinedX = geomData
      ? geomData.filter(
          (d) =>
            geomAes?.x &&
            (geomAes.x(d) === null ||
              typeof geomAes.x(d) === 'undefined' ||
              Number.isNaN(geomAes.x(d)?.valueOf()) ||
              (isDate(geomAes.x(d)) && geomAes.x(d)?.valueOf() === 0))
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
              Number.isNaN(geomAes.y(d)?.valueOf()))
        )
      : []
    return geomData && undefinedY.length === geomData.length
  }, [geomData])

  const { stroke: strokeColor, strokeDasharray } = { ...props }
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
    [copiedData, geomAes]
  )

  const group = useMemo(
    () => geomAes?.group ?? geomAes?.stroke ?? scales?.groupAccessor,
    [geomAes, scales]
  )

  const groups = useMemo(
    () =>
      group
        ? (Array.from(new Set(geomData?.map(group))) as string[])
        : undefined,
    [geomData, group]
  )

  const geomStrokeScale = useMemo(() => {
    if (groups && geomAes.stroke) {
      return scaleOrdinal()
        .domain(strokeDomain || strokeGroups || groups)
        .range(
          (strokeScaleColors as string[]) || defaultScheme
        ) as VisualEncodingTypes
    }
    return undefined
  }, [geomAes, strokeGroups])

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
          strokeScale: geomStrokeScale,
          groupAccessor: geomAes.stroke,
          usableGroups: strokeGroups,
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
    geomStrokeScale,
    strokeGroups,
    geomAes,
  ])

  const x = useMemo(
    () => (d: unknown) =>
      scales?.xScale && geomAes?.x && scales.xScale(geomAes.x(d)),
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

  const groupRef = useRef<SVGGElement>(null)
  const lines = groupRef.current?.getElementsByTagName('path')

  const baseStyles = {
    transition: 'fill-opacity 200ms',
    strokeOpacity,
    ...props.style,
  }

  const focusedStyles = {
    ...baseStyles,
    strokeOpacity,
    ...focusedStyle,
  }

  const unfocusedStyles = {
    ...baseStyles,
    fillOpacity: 0.2,
    strokeOpacity: 0.2,
    ...unfocusedStyle,
  }

  // map through groups to draw a line for each group

  return (
    <>
      <g ref={groupRef}>
        {!firstRender && !allXUndefined && !allYUndefined && isVisible && (
          <>
            {geomData && groups && group ? (
              groups.map((g) => {
                const groupData = geomData.filter((d) => group(d) === g)

                const groupLineData = groupData.map((d) => [x(d), y(d)]) as []

                const thisStrokeGroups =
                  geomStrokeScale && geomAes?.stroke
                    ? Array.from(
                        new Set(
                          groupData.map(
                            (gd) => geomAes.stroke && geomAes.stroke(gd)
                          )
                        )
                      )
                    : undefined

                let thisStroke =
                  strokeColor ||
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
                  strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(g)
                    : strokeDasharray)

                return (
                  <Animate
                    key={`${geomID}-${g}`}
                    start={{
                      path: drawLine(
                        groupLineData.map((d: [any, any]) => {
                          const yEntrancePos =
                            entrance === 'midpoint' ? (height || 0) / 2 : d[1]
                          const hasMissingY =
                            d[1] === null || typeof d[1] === 'undefined'
                          return [d[0], hasMissingY ? NaN : yEntrancePos]
                        })
                      ),
                      opacity: 0,
                    }}
                    enter={{
                      path: [drawLine(groupLineData)],
                      opacity: [1],
                      timing: { duration, ease: easeCubic },
                    }}
                    update={{
                      path: [drawLine(groupLineData)],
                      opacity: [1],
                      timing: {
                        duration,
                        ease: easeCubic,
                      },
                    }}
                    leave={() => ({
                      opacity: [0],
                      timing: { duration, ease: easeCubic },
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
                        data-testid="__gg_geom_line"
                        style={{
                          pointerEvents: 'none',
                        }}
                        clipPath={`url(#__gg_canvas_${id})`}
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
                    data-testid="__gg_geom_line"
                    clipPath={`url(#__gg_canvas_${id})`}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
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
            group={focusType === 'x' ? 'x' : undefined}
            x={(v: unknown) => x(v)}
            y={focusType === 'x' ? () => 0 : y}
            onMouseLeave={() => {
              if (lines) {
                unfocusNodes({ nodes: lines, baseStyles })
              }

              if (onExit) onExit()
            }}
            onMouseOver={({ d }) => {
              if (
                lines &&
                groups &&
                groups.length > 1 &&
                focusType === 'closest'
              ) {
                const datumGroup = group?.(d[0])
                const focusedIndex = groups
                  ?.map((g, i) => (g === datumGroup ? i : -1))
                  .filter((v) => v >= 0)

                focusNodes({
                  nodes: lines,
                  focusedIndex,
                  focusedStyles,
                  unfocusedStyles,
                })
              }
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: any; i: number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onDatumFocus={onDatumFocus}
            showTooltip={showTooltip}
            brushAction={brushAction}
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
