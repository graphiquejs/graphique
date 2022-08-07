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
  focusNodes,
  unfocusNodes,
  EventArea,
  widen,
  Aes,
  usePageVisibility,
  defineGroupAccessor,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { max, sum } from 'd3-array'
import { stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape'
import { Tooltip } from './tooltip'

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
  animateOnEnter?: boolean
  focusType?: 'group' | 'individual'
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
  animateOnEnter = true,
  focusType = 'group',
  ...props
}: BarProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, height, margin } = ggState || {}

  const isVisible = usePageVisibility()

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

  const fill = useCallback(
    (d: unknown) =>
      fillColor ||
      (geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(
            geomAes.fill(d)
            // geomAes.fill(d) === null ? "[null]" : (geomAes.fill(d) as any)
          ) as string | undefined)
        : defaultFill),
    [geomAes, copiedScales, fillColor, defaultFill]
  )

  const stroke = useCallback(
    (d: unknown) =>
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

  const x = useCallback(
    (d: unknown) => scales?.xScale && (scales.xScale(geomAes?.x(d)) || 0),
    [scales, geomAes]
  )

  const yBandScale = useMemo(() => {
    if (margin && height) {
      const usedYPadding = geomData ? yPadding : 0

      if (scales?.yScale.bandwidth) {
        return scales.yScale.paddingInner(usedYPadding)
      }
      const uniqueYs = Array.from(
        new Set(geomData?.map((d) => geomAes?.y && geomAes.y(d)))
      )
      return scaleBand()
        .range([margin.bottom, height - margin.bottom])
        .domain((yDomain || uniqueYs) as string[])
        .paddingInner(usedYPadding)
    }
    return null
  }, [height, scales, margin, yPadding, yDomain, geomData, geomAes])

  const y = useCallback(
    (d: unknown) => {
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
    [scales, geomAes, margin, height, yBandScale]
  )

  const group = useMemo(
    () => defineGroupAccessor(geomAes as Aes),
    [defineGroupAccessor, geomAes]
  )

  const keyAccessor = useCallback(
    (d: unknown) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y &&
          `${geomAes?.x(d)}-${geomAes.y(d)}-${
            scales?.groupAccessor ? scales.groupAccessor(d) : '__group'
          }`) as string,
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
      const stackWideData = stack()
        .keys(scales.groups)
        .offset(position === 'fill' ? stackOffsetExpand : stackOffsetNone)

      const wideData = widen(
        geomData,
        geomAes.y,
        scales.groupAccessor,
        geomAes.x
      )

      return stackWideData(wideData)
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

  const resolvedYScale = useCallback(
    (d) => {
      if (position === 'dodge') {
        return (y(d) ?? 0) + (dodgeYScale?.(group?.(d) as string) ?? 0)
      }
      return y(d)
    },
    [y, dodgeYScale, position, group]
  )

  const groupRef = useRef<SVGGElement>(null)
  const rects = groupRef.current?.getElementsByTagName('rect')

  const leftEdge = useMemo(() => margin?.left || 0, [margin])

  const getGroupStack = useMemo(
    () => (d: unknown) => {
      const thisStack =
        stackedData &&
        stackedData.find(
          (sd: any) =>
            scales?.groupAccessor && sd.key === scales.groupAccessor(d)
        )
      const groupStack = thisStack?.find(
        (s: any) => aes?.y && s.data.key === aes.y(d)
      )
      return groupStack
    },
    [stackedData, scales, aes]
  )

  const stackMidpoints = useMemo(() => {
    if (!stackedData || focusType === 'group') return undefined

    return stackedData.map((sd) => {
      const groupVal = sd.key
      const dataStack = sd.filter((d) => !d.flat().some(Number.isNaN))
      const xVal = (dataStack[0][0] + dataStack[0][1]) / 2
      const yVal = dataStack[0].data.key

      return {
        groupVal,
        yVal,
        xVal,
      }
    })
  }, [stackedData, geomData, focusType])

  return yBandScale && isVisible ? (
    <>
      <g ref={groupRef}>
        {/* {!firstRender && ( */}
        <NodeGroup
          data={[...(geomData as [])]}
          keyAccessor={keyAccessor}
          start={(d) => {
            const groupData = getGroupStack(d)
            const thisX0 = groupData ? scales?.xScale(groupData[0]) : leftEdge
            const thisX1 = groupData && scales?.xScale(groupData[1])
            const barWidth = stackedData
              ? thisX1 - (thisX0 || 0)
              : (x(d) || 0) - leftEdge
            const actualWidth =
              typeof x(d) === 'undefined' ? leftEdge : barWidth
            return {
              width: animateOnEnter ? 0 : actualWidth,
              height: dodgeYScale?.bandwidth() || yBandScale.bandwidth(),
              x: leftEdge,
              y: resolvedYScale(d),
              fill: 'transparent',
              stroke: 'transparent',
              fillOpacity: 0,
              strokeOpacity: 0,
            }
          }}
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
              width: animateOnEnter ? [actualWidth] : actualWidth,
              height: [dodgeYScale?.bandwidth() || yBandScale.bandwidth()],
              x: [thisX0],
              y: [resolvedYScale(d)],
              fill: [fill(d)],
              stroke: [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
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

            return {
              width: [typeof x(d) === 'undefined' ? leftEdge : barWidth],
              height: [dodgeYScale?.bandwidth() || yBandScale.bandwidth()],
              x: [thisX0],
              y: [
                typeof resolvedYScale(d) === 'undefined'
                  ? height
                  : resolvedYScale(d),
              ],
              fill: firstRender ? fill(d) : [fill(d)],
              stroke: firstRender ? stroke(d) : [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration, ease: easeCubic },
            }
          }}
          leave={() => ({
            fill: ['transparent'],
            stroke: ['transparent'],
            width: [0],
            timing: { duration, ease: easeCubic },
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
                  data-testid="__gg_geom_bar"
                />
              ))}
            </>
          )}
        </NodeGroup>
        {/* )} */}
      </g>
      {showTooltip && (
        <>
          <EventArea
            data={geomData}
            aes={geomAes}
            x={() => 0}
            y={resolvedYScale}
            yBandScale={yBandScale}
            fill={position === 'fill' ? 'x' : undefined}
            group={focusType === 'group' ? 'y' : undefined}
            yAdj={
              position === 'dodge'
                ? (dodgeYScale?.bandwidth() ?? 0) / 2
                : yBandScale.bandwidth() / 2
            }
            stackXMidpoints={stackMidpoints}
            onDatumFocus={onDatumFocus}
            onMouseOver={({ i }: { d: unknown; i: number | number[] }) => {
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
          <Tooltip
            x={x}
            y={resolvedYScale}
            aes={geomAes}
            stackMidpoints={stackMidpoints}
            yAdj={
              position === 'dodge'
                ? (dodgeYScale?.bandwidth() ?? 0) / 2
                : yBandScale.bandwidth() / 2
            }
            focusType={focusType}
            align={position === 'dodge' ? 'left' : 'center'}
          />
        </>
      )}
    </>
  ) : null
}

GeomBar.displayName = 'GeomBar'
export { GeomBar }
