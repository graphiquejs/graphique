import React, {
  useEffect,
  useMemo,
  CSSProperties,
  SVGAttributes,
  useRef,
  useState,
} from 'react'
import {
  useGG,
  themeState,
  focusNodes,
  unfocusNodes,
  Delaunay,
  Aes,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { Tooltip } from './tooltip'

export { Legend } from './legend'

export interface GeomTileProps extends SVGAttributes<SVGRectElement> {
  data?: unknown[]
  aes?: Aes
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  xPadding?: number
  yPadding?: number
  xDomain?: unknown[]
  yDomain?: unknown[]
  showTooltip?: boolean
  focusedDatum?: any
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  onDatumSelection?: (data: unknown, index: number | number[]) => void
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
}

const GeomTile = ({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  onExit,
  xDomain,
  yDomain,
  xPadding = 0,
  yPadding = 0,
  showTooltip = true,
  focusedDatum,
  fillOpacity = 1,
  strokeOpacity = 1,
  ...props
}: GeomTileProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, height, width, margin } =
    ggState || {}

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

  const { fill: fillColor, stroke: strokeColor, strokeWidth } = { ...props }
  const { defaultFill } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        tile: {
          fillOpacity: props.style?.fillOpacity || fillOpacity,
          stroke: strokeColor,
          strokeWidth: props.style?.strokeWidth || strokeWidth,
          strokeOpacity: props.style?.strokeOpacity || strokeOpacity,
        },
      },
    }))
  }, [
    fillOpacity,
    setTheme,
    strokeColor,
    strokeOpacity,
    strokeWidth,
    props.style,
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

  const fill = useMemo(
    () => (d: unknown) =>
      fillColor ||
      (aes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(
            aes.fill(d)
            // aes.fill(d) === null ? "[null]" : (aes.fill(d) as any)
          ) as string | undefined)
        : defaultFill),
    [aes, copiedScales, fillColor, defaultFill]
  )

  const stroke = useMemo(
    () => (d: unknown) =>
      strokeColor ||
      (aes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(aes.stroke(d) as any) as string | undefined)
        : 'none'),
    [aes, copiedScales, strokeColor]
  )

  const xBandScale = useMemo(() => {
    if (margin && width) {
      if (scales?.xScale.bandwidth) {
        return scales.xScale.paddingInner(xPadding)
      }
      const uniqueXs = Array.from(new Set(data?.map((d) => aes?.x(d))))
      return scaleBand()
        .range([margin.left, width - margin.right])
        .domain((xDomain || uniqueXs) as string[])
        .paddingInner(xPadding)
    }
    return null
  }, [data, aes, width, scales, margin, xPadding, xDomain])

  const yBandScale = useMemo(() => {
    if (margin && height) {
      if (scales?.yScale.bandwidth) {
        return scales.yScale.paddingInner(yPadding)
      }
      const uniqueYs = Array.from(new Set(data?.map((d) => aes?.y && aes.y(d))))
      return scaleBand()
        .range([margin.bottom, height - margin.bottom])
        .domain((yDomain || uniqueYs) as string[])
        .paddingInner(yPadding)
    }
    return null
  }, [data, aes, height, scales, margin, yPadding, yDomain])

  const x = useMemo(() => {
    if (!scales?.xScale.bandwidth && margin && width && xBandScale) {
      scales?.xScale.range([
        margin.left + xBandScale.bandwidth() / 2,
        width - margin.right - xBandScale.bandwidth() / 2 - 0.5,
      ])
      return (d: unknown) =>
        (scales?.xScale(aes?.x(d)) || 0) - xBandScale.bandwidth() / 2 + 0.5
    }
    return (d: unknown) => scales?.xScale && scales.xScale(aes?.x(d))
  }, [scales, aes, xBandScale, margin, width])

  const y = useMemo(() => {
    if (!scales?.yScale.bandwidth && margin && height && yBandScale) {
      scales?.yScale.range([
        height - margin.bottom - yBandScale.bandwidth() / 2 - 0.5,
        margin.top + yBandScale.bandwidth() / 2,
      ])
      return (d: unknown) =>
        (scales?.yScale(aes?.y && aes.y(d)) || 0) -
        yBandScale.bandwidth() / 2 +
        0.5
    }
    return (d: unknown) => scales?.yScale && aes?.y && scales.yScale(aes.y(d))
  }, [scales, aes, margin, height, yBandScale])

  const keyAccessor = useMemo(
    () => (d: unknown) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y &&
          `${geomAes?.x(d)}-${geomAes?.y(d)}-${scales?.groupAccessor(
            d
          )}`) as string,
    [geomAes, scales]
  )

  const groupRef = useRef<SVGGElement>(null)
  // const rects = useMemo(() => groupRef.current?.getElementsByTagName("rect"), [])
  const rects = groupRef.current?.getElementsByTagName('rect')

  return xBandScale && yBandScale ? (
    <>
      <g ref={groupRef}>
        {!firstRender && (
          <NodeGroup
            data={[...(data as [])]}
            keyAccessor={keyAccessor}
            start={(d) => ({
              x: margin?.left,
              y: y(d) || 0,
              fill: 'transparent',
              stroke: 'transparent',
              fillOpacity: 0,
              strokeOpacity: 0,
            })}
            enter={(d) => ({
              x: [typeof x(d) === 'undefined' ? margin?.left : x(d)],
              y: [y(d) || 0],
              fill: [fill(d)],
              stroke: [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration: 1000, ease: easeCubic },
            })}
            update={(d) => ({
              x: [typeof x(d) === 'undefined' ? margin?.left : x(d)],
              y: [typeof y(d) === 'undefined' ? height : y(d)],
              fill: firstRender ? fill(d) : [fill(d)],
              stroke: firstRender ? stroke(d) : [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration: 1000, ease: easeCubic },
            })}
            leave={() => ({
              fill: ['transparent'],
              stroke: ['transparent'],
              y: [height],
              timing: { duration: 1000, ease: easeCubic },
            })}
            interpolation={(begVal, endVal) => interpolate(begVal, endVal)}
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
                    width={xBandScale.bandwidth()}
                    height={yBandScale.bandwidth()}
                    fillOpacity={state.fillOpacity}
                    strokeOpacity={state.strokeOpacity}
                  />
                ))}
              </>
            )}
          </NodeGroup>
        )}
      </g>
      {showTooltip && (
        <>
          <Delaunay
            x={x}
            y={y}
            data={data}
            xAdj={xBandScale.bandwidth() / 2}
            yAdj={yBandScale.bandwidth() / 2}
            onMouseOver={({ d, i }: { d: unknown; i: number | number[] }) => {
              if (rects) {
                focusNodes({
                  nodes: rects,
                  focusedIndex: i,
                  focusedStyles,
                  unfocusedStyles,
                })

                if (onDatumFocus) onDatumFocus(d, i)
              }
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: any; i: number | number[] }) => {
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
            y={y}
            xAdj={xBandScale.bandwidth() / 2}
            yAdj={yBandScale.bandwidth() / 2}
            datum={focusedDatum}
          />
        </>
      )}
    </>
  ) : null
}

GeomTile.displayName = 'GeomTile'
export { GeomTile }
