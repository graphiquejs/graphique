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
  widen,
  Aes,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { max, sum } from 'd3-array'
import { stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape'
import { Tooltip } from './tooltip'

export { Legend } from './legend'

export interface BarProps extends SVGAttributes<SVGRectElement> {
  data?: unknown[]
  aes?: Aes
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  yPadding?: number
  dodgePadding?: number
  xDomain?: unknown[]
  yDomain?: unknown[]
  showTooltip?: boolean
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  onDatumSelection?: (data: unknown, index: number | number[]) => void
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
  freeBaseLine?: boolean
  position?: 'identity' | 'stack' | 'dodge' | 'fill'
}

const GeomBar = ({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  onExit,
  xDomain,
  yDomain,
  yPadding = 0.2,
  dodgePadding = 0.05,
  showTooltip = true,
  fillOpacity = 1,
  strokeOpacity = 1,
  freeBaseLine,
  position = 'stack',
  ...props
}: BarProps) => {
  const { ggState } = useGG() || {}
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

  const {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth,
  } = {
    ...props,
  }
  const { defaultFill } = theme

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
        bar: {
          position,
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

  const fill = useMemo(
    () => (d: unknown) =>
      fillColor ||
      (geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(
            geomAes.fill(d)
            // geomAes.fill(d) === null ? "[null]" : (geomAes.fill(d) as any)
          ) as string | undefined)
        : defaultFill),
    [geomAes, copiedScales, fillColor, defaultFill]
  )

  const stroke = useMemo(
    () => (d: unknown) =>
      strokeColor ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : 'none'),
    [geomAes, copiedScales, strokeColor]
  )

  // reset the xScale based on position
  if (
    ['stack', 'fill'].includes(position) &&
    scales?.groups &&
    geomData &&
    scales?.xScale &&
    scales.yScale &&
    geomAes?.x &&
    geomAes?.y
  ) {
    const uniqueYs = Array.from(
      new Set(geomData?.map((d) => geomAes?.y && geomAes.y(d)))
    )
    let maxVal
    if (position === 'stack') {
      maxVal = max(
        uniqueYs.map((yVal) => {
          const groupData = geomData.filter(
            (d) => geomAes.y && geomAes.y(d) === yVal
          )
          const groupTotal = sum(groupData, (d) => geomAes.x(d) as number)
          return groupTotal
        })
      )
    } else {
      // position === "fill"
      maxVal = 1
    }

    if (!xDomain) {
      scales.xScale.domain([0, maxVal])
    }
  }

  const x = useMemo(
    () => (d: unknown) => scales?.xScale && (scales.xScale(geomAes?.x(d)) || 0),
    [scales, geomAes]
  )

  const yBandScale = useMemo(() => {
    if (margin && height) {
      if (scales?.yScale.bandwidth) {
        return scales.yScale.paddingInner(yPadding)
      }
      const uniqueYs = Array.from(
        new Set(geomData?.map((d) => geomAes?.y && geomAes.y(d)))
      )
      return scaleBand()
        .range([margin.bottom, height - margin.bottom])
        .domain((yDomain || uniqueYs) as string[])
        .paddingInner(yPadding)
    }
    return null
  }, [height, scales, margin, yPadding, yDomain, geomData, geomAes])

  const y = useMemo(() => {
    if (!scales?.yScale.bandwidth && margin && height && yBandScale) {
      scales?.yScale.range([
        height - margin.bottom - yBandScale.bandwidth() / 2 - 0.5,
        margin.top + yBandScale.bandwidth() / 2,
      ])
      return (d: unknown) =>
        (scales?.yScale(geomAes?.y && geomAes.y(d)) || 0) -
        yBandScale.bandwidth() / 2 +
        0.5
    }
    return (d: unknown) =>
      scales?.yScale && scales.yScale(geomAes?.y && geomAes.y(d))
  }, [scales, geomAes, margin, height, yBandScale])

  const keyAccessor = useMemo(
    () => (d: unknown) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y &&
          `${geomAes?.x(d)}-${geomAes.y(d)}-${scales?.groupAccessor(
            d
          )}`) as string,
    [geomAes, scales]
  )

  const stackedData = useMemo(() => {
    if (
      geomData &&
      geomAes?.x &&
      geomAes?.y &&
      ['stack', 'fill'].includes(position) &&
      scales?.groups &&
      scales?.groupAccessor
    ) {
      return stack()
        .keys(scales.groups)
        .offset(position === 'fill' ? stackOffsetExpand : stackOffsetNone)(
        widen(geomData, geomAes.y, scales.groupAccessor, geomAes.x)
      )
    }
    return null
  }, [geomData, geomAes, scales, position])

  // const sortedData = useMemo(() => {
  //   if (geomData && geomAes?.x) {
  //     return geomData.sort((a, b) => {
  //       return (geomAes.x(b) as number) - (geomAes.x(a) as number)
  //     })
  //   } else {
  //     return geomData
  //   }
  // }, [geomData, geomAes])

  const dodgeYScale = useMemo(() => {
    if (position === 'dodge' && scales?.groups && yBandScale) {
      return scaleBand()
        .domain(scales?.groups.reverse())
        .range([yBandScale.bandwidth(), 0])
        .padding(dodgePadding)
    }
    return null
  }, [scales, position, yBandScale, dodgePadding])

  const groupRef = useRef<SVGGElement>(null)
  // const rects = useMemo(() => groupRef.current?.getElementsByTagName("rect"), [])
  const rects = groupRef.current?.getElementsByTagName('rect')

  const leftEdge = useMemo(() => margin?.left || 0, [margin])

  const getGroupX = useMemo(
    () => (d: unknown) => {
      const thisStack =
        stackedData &&
        stackedData.find((sd: any) => sd.key === scales?.groupAccessor(d))
      const groupStack = thisStack?.find(
        (s: any) => aes?.y && s.data.key === aes.y(d)
      )
      return groupStack
    },
    [stackedData, scales, aes]
  )

  return yBandScale ? (
    <>
      <g ref={groupRef}>
        {/* {!firstRender && ( */}
        <NodeGroup
          data={[...(geomData as [])]}
          keyAccessor={keyAccessor}
          start={(d) => {
            const yAdj =
              dodgeYScale && scales?.groupAccessor
                ? dodgeYScale(scales.groupAccessor(d) as string) || 0
                : 0
            return {
              width: 0,
              height: dodgeYScale?.bandwidth() || yBandScale.bandwidth(),
              x: leftEdge,
              y: (y(d) || 0) + yAdj,
              fill: 'transparent',
              stroke: 'transparent',
              fillOpacity: 0,
              strokeOpacity: 0,
            }
          }}
          enter={(d) => {
            const groupData = getGroupX(d)
            const thisX0 = groupData ? scales?.xScale(groupData[0]) : leftEdge
            const thisX1 = groupData && scales?.xScale(groupData[1])
            const barWidth = stackedData
              ? thisX1 - (thisX0 || 0)
              : (x(d) || 0) - leftEdge
            const yAdj =
              dodgeYScale && scales?.groupAccessor
                ? dodgeYScale(scales.groupAccessor(d) as string) || 0
                : 0
            return {
              width: [typeof x(d) === 'undefined' ? leftEdge : barWidth],
              height: [dodgeYScale?.bandwidth() || yBandScale.bandwidth()],
              x: [thisX0],
              y: [(y(d) || 0) + yAdj],
              fill: [fill(d)],
              stroke: [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration: 1000, ease: easeCubic },
            }
          }}
          update={(d) => {
            const groupData = getGroupX(d)
            const thisX0 = groupData ? scales?.xScale(groupData[0]) : leftEdge
            const thisX1 = groupData && scales?.xScale(groupData[1])
            const barWidth = stackedData
              ? thisX1 - (thisX0 || 0)
              : (x(d) || 0) - leftEdge
            const yAdj =
              dodgeYScale && scales?.groupAccessor
                ? dodgeYScale(scales.groupAccessor(d) as string) || 0
                : 0
            return {
              width: [typeof x(d) === 'undefined' ? leftEdge : barWidth],
              height: [dodgeYScale?.bandwidth() || yBandScale.bandwidth()],
              x: [thisX0],
              y: [typeof y(d) === 'undefined' ? height : (y(d) || 0) + yAdj],
              fill: firstRender ? fill(d) : [fill(d)],
              stroke: firstRender ? stroke(d) : [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration: 1000, ease: easeCubic },
            }
          }}
          leave={() => ({
            fill: ['transparent'],
            stroke: ['transparent'],
            width: [0],
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
                  width={state.width}
                  height={state.height}
                  fillOpacity={state.fillOpacity}
                  strokeOpacity={state.strokeOpacity}
                />
              ))}
            </>
          )}
        </NodeGroup>
        {/* )} */}
      </g>
      {showTooltip && (
        <>
          <Delaunay
            x={() => 0}
            y={y}
            group="y"
            yAdj={yBandScale.bandwidth() / 2}
            data={geomData}
            aes={geomAes}
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
                ? ({ d, i }: { d: unknown; i: number | number[] }) => {
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
          <Tooltip x={x} aes={geomAes} yAdj={yBandScale.bandwidth() / 2} />
        </>
      )}
    </>
  ) : null
}

GeomBar.displayName = 'GeomBar'
export { GeomBar }
