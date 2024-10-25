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
  EventArea,
  defineGroupAccessor,
  usePageVisibility,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { Tooltip } from './tooltip'
import { type GeomAes } from './types'

export interface GeomTileProps<Datum> extends SVGAttributes<SVGRectElement> {
  data?: Datum[]
  aes?: GeomAes<Datum>
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  focusedKeys?: (string | number)[]
  xPadding?: number
  yPadding?: number
  xDomain?: unknown[]
  yDomain?: unknown[]
  showTooltip?: boolean
  onDatumFocus?: (data: Datum[], index: number[]) => void
  onDatumSelection?: (data: Datum[], index: number[]) => void
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
}

const GeomTile = <Datum,>({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  focusedKeys = [],
  onDatumFocus,
  onDatumSelection,
  onExit,
  xDomain,
  yDomain,
  xPadding = 0,
  yPadding = 0,
  showTooltip = true,
  fillOpacity = 1,
  strokeOpacity = 1,
  ...props
}: GeomTileProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
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

  const isVisible = usePageVisibility()

  const { fill: fillColor, stroke: strokeColor, strokeWidth } = { ...props }
  const { defaultFill, animationDuration: duration } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
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
          aes: geomAes,
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
    geomAes,
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
    () => (d: Datum) => {
      if (fillColor) return fillColor

      return geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(geomAes.fill(d)) as string | undefined)
        : defaultFill
    },
    [geomAes, copiedScales, fillColor, defaultFill],
  )

  const stroke = useMemo(
    () => (d: Datum) =>
      strokeColor ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : 'none'),
    [geomAes, copiedScales, strokeColor],
  )

  const validFocusedKeys = useMemo(
    () => focusedKeys.filter((v) => v),
    [focusedKeys],
  )

  const geomData = (localData || data).filter((d) => {
    const hasMissingFillValue =
      geomAes.fill &&
      (geomAes.fill(d) === null || typeof geomAes.fill(d) === 'undefined')
    const hasMissingXValue =
      geomAes.x &&
      (geomAes.x(d) === null || typeof geomAes.x(d) === 'undefined')
    const hasMissingYValue =
      geomAes.y &&
      (geomAes.y(d) === null || typeof geomAes.y(d) === 'undefined')

    return !hasMissingFillValue && !hasMissingXValue && !hasMissingYValue
  })

  const xBandScale = useMemo(() => {
    if (margin && width) {
      if (typeof scales?.xScale.bandwidth !== 'undefined') {
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

  const yBandScale = useMemo(() => {
    if (margin && height) {
      if (typeof scales?.yScale.bandwidth !== 'undefined') {
        return scales.yScale.paddingInner(yPadding)
      }
      const uniqueYs = Array.from(
        new Set(geomData?.map((d) => geomAes?.y && geomAes.y(d))),
      )
      return scaleBand()
        .range([margin.bottom, height - margin.top])
        .domain((yDomain || uniqueYs) as string[])
        .paddingInner(yPadding)
    }
    return null
  }, [geomData, geomAes, height, scales, margin, yPadding, yDomain])

  const x = useMemo(() => {
    if (!scales?.xScale.bandwidth && margin && width && xBandScale) {
      scales?.xScale.range([
        margin.left + xBandScale.bandwidth() / 2,
        width - margin.right - xBandScale.bandwidth() / 2 - 0.5,
      ])
      return (d: Datum) =>
        (scales?.xScale(geomAes?.x(d)) || 0) - xBandScale.bandwidth() / 2 + 0.5
    }
    return (d: Datum) => scales?.xScale && scales.xScale(geomAes?.x(d))
  }, [scales, geomAes, xBandScale, margin, width])

  const y = useMemo(() => {
    if (!scales?.yScale.bandwidth && margin && height && yBandScale) {
      scales?.yScale.range([
        height - margin.bottom - yBandScale.bandwidth() / 2 - 0.5,
        margin.top + yBandScale.bandwidth() / 2,
      ])
      return (d: Datum) =>
        (scales?.yScale(geomAes?.y && geomAes.y(d)) || 0) -
        yBandScale.bandwidth() / 2 +
        0.5
    }
    return (d: Datum) =>
      scales?.yScale && geomAes?.y && scales.yScale(geomAes.y(d))
  }, [scales, geomAes, margin, height, yBandScale])

  const group = useMemo(
    () =>
      geomAes?.group || geomAes?.fill || geomAes?.stroke
        ? defineGroupAccessor(geomAes, true)
        : scales?.groupAccessor,
    [geomAes, defineGroupAccessor],
  )

  const keyAccessor = useMemo(
    () => (d: Datum) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y && `${geomAes?.x(d)}-${geomAes?.y(d)}`) as string,
    [geomAes, scales],
  )

  const groupRef = useRef<SVGGElement>(null)
  const rects = groupRef.current?.getElementsByTagName('rect')

  return xBandScale && yBandScale ? (
    <>
      <g ref={groupRef}>
        {!firstRender && isVisible && (
          <NodeGroup
            data={[...geomData]}
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
              timing: { duration, ease: easeCubic },
            })}
            update={(d) => ({
              x: [typeof x(d) === 'undefined' ? margin?.left : x(d)],
              y: [typeof y(d) === 'undefined' ? height : y(d)],
              fill: firstRender ? fill(d) : [fill(d)],
              stroke: firstRender ? stroke(d) : [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration, ease: easeCubic },
            })}
            leave={() => ({
              fill: ['transparent'],
              stroke: ['transparent'],
              y: [height],
              timing: { duration, ease: easeCubic },
            })}
            interpolation={(begVal, endVal) => interpolate(begVal, endVal)}
          >
            {(nodes) => (
              <>
                {nodes.map(({ state, key }) => {
                  let styles = {}
                  if (validFocusedKeys.includes(key)) styles = focusedStyles
                  if (
                    validFocusedKeys?.length > 0 &&
                    !validFocusedKeys.includes(key)
                  )
                    styles = unfocusedStyles
                  return (
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
                      style={{
                        pointerEvents: 'none',
                        ...styles,
                      }}
                      data-testid="__gg_geom_tile"
                    />
                  )
                })}
              </>
            )}
          </NodeGroup>
        )}
      </g>
      {geomAes && group && showTooltip && (
        <>
          <EventArea
            x={x}
            y={y}
            data={geomData}
            aes={geomAes}
            xAdj={xBandScale.bandwidth() / 2}
            yAdj={yBandScale.bandwidth() / 2}
            onDatumFocus={onDatumFocus}
            onMouseOver={({ i }: { d: Datum[]; i: number[] }) => {
              const focusedIndexes = geomData.flatMap((gd, fi) =>
                validFocusedKeys.includes(keyAccessor(gd)) ? fi : [],
              )

              if (rects) {
                focusNodes({
                  nodes: rects,
                  focusedIndex: [...focusedIndexes, ...[i].flat()],
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
                if (validFocusedKeys && validFocusedKeys.length) {
                  focusNodes({
                    nodes: rects,
                    focusedIndex: geomData.flatMap((d, i) =>
                      validFocusedKeys.includes(keyAccessor(d)) ? i : [],
                    ),
                    focusedStyles,
                    unfocusedStyles,
                  })
                }
              }

              if (onExit) onExit()
            }}
          />
          <Tooltip
            x={x}
            y={y}
            xAdj={xBandScale.bandwidth() / 2}
            yAdj={yBandScale.bandwidth() / 2}
            group={group}
            aes={geomAes}
          />
        </>
      )}
    </>
  ) : null
}

GeomTile.displayName = 'GeomTile'
export { GeomTile }
