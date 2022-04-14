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
  isDate,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { scaleBand } from 'd3-scale'
import { max, sum } from 'd3-array'
import { stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape'
import { Tooltip } from './tooltip'

export interface GeomColProps extends SVGAttributes<SVGRectElement> {
  data?: unknown[]
  aes?: Aes
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  xPadding?: number
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
  align?: 'center' | 'left'
  position?: 'identity' | 'stack' | 'dodge' | 'fill'
}

const GeomCol = ({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  onExit,
  xDomain,
  yDomain,
  xPadding = 0.2,
  dodgePadding = 0.05,
  showTooltip = true,
  fillOpacity = 1,
  strokeOpacity = 1,
  freeBaseLine,
  align = 'center',
  position = 'stack',
  ...props
}: GeomColProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, height, margin, width } =
    ggState || {}

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

  const { fill: fillColor, stroke: strokeColor, strokeWidth } = { ...props }
  const { defaultFill, animationDuration: duration } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  const bottomPos = useMemo(
    () => (height && margin ? height - margin.bottom : 0),
    [height, margin]
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        col: {
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

  // reset the yScale based on position
  if (
    ['stack', 'fill'].includes(position) &&
    scales?.groups &&
    geomData &&
    scales?.xScale &&
    scales.yScale &&
    geomAes?.x &&
    geomAes?.y
  ) {
    let maxVal
    if (position === 'stack') {
      const uniqueXs = Array.from(new Set(geomData?.map((d) => geomAes?.x(d))))
      maxVal = max(
        uniqueXs.map((xVal) => {
          const groupData = geomData.filter((d) =>
            isDate(geomAes.x(d))
              ? geomAes.x(d)?.valueOf() === xVal?.valueOf()
              : geomAes.x(d) === xVal
          )
          const groupTotal = sum(
            groupData,
            (d) => geomAes.y && (geomAes.y(d) as number)
          )
          return groupTotal
        })
      )
    } else {
      // position === "fill"
      maxVal = 1
    }

    if (!yDomain) {
      scales.yScale.domain([0, maxVal])
    }
  }

  const xBandScale = useMemo(() => {
    if (margin && width) {
      if (scales?.xScale.bandwidth) {
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

  const x = useMemo(() => {
    if (!scales?.xScale.bandwidth && margin && width && xBandScale) {
      const leftAdj = align === 'center' ? xBandScale.bandwidth() / 2 : 0
      const rightAdj =
        align === 'center' ? xBandScale.bandwidth() / 2 : xBandScale.bandwidth()
      scales?.xScale.range([
        margin.left + leftAdj,
        width - margin.right - rightAdj - 0.5,
      ])
      return (d: unknown) =>
        (scales?.xScale(geomAes?.x(d)) || 0) - leftAdj + 0.5
    }
    return (d: unknown) => scales?.xScale && scales.xScale(geomAes?.x(d))
  }, [scales, geomAes, xBandScale, margin, width, align])

  const y = useMemo(
    () => (d: unknown) =>
      scales?.yScale && geomAes?.y && scales.yScale(geomAes?.y(d)),
    [scales, geomAes]
  )

  const keyAccessor = useMemo(
    () => (d: unknown) =>
      (geomAes?.key
        ? geomAes.key(d)
        : geomAes?.y &&
          `${geomAes?.x(d)}-${geomAes.y(d)}-
          ${
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
      return stack()
        .keys(scales.groups)
        .offset(position === 'fill' ? stackOffsetExpand : stackOffsetNone)(
        widen(geomData, geomAes.x, scales.groupAccessor, geomAes.y)
      )
    }
    return null
  }, [geomData, geomAes, scales, position])

  // const sortedData = useMemo(() => {
  //   // if (geomData && geomAes?.y) {
  //   //   return geomData.sort((a, b) => {
  //   //     return (geomAes.y(b) as number) - (geomAes.y(a) as number)
  //   //   })
  //   // } else {
  //   //   return geomData
  //   // }
  //   return geomData
  // }, [geomData])

  const dodgeXScale = useMemo(() => {
    if (position === 'dodge' && scales?.groups && xBandScale) {
      return scaleBand()
        .domain(scales?.groups.reverse())
        .range([xBandScale.bandwidth(), 0])
        .padding(dodgePadding)
    }
    return null
  }, [scales, position, xBandScale, dodgePadding])

  const groupRef = useRef<SVGGElement>(null)
  const rects = groupRef.current?.getElementsByTagName('rect')

  const getGroupY = useMemo(
    () => (d: unknown) => {
      const thisStack =
        stackedData &&
        stackedData.find(
          (sd) => scales?.groupAccessor && sd.key === scales?.groupAccessor(d)
        )
      const groupStack = thisStack?.find(
        (s) => aes?.x && s.data.key === aes.x(d)?.valueOf()
      )
      return groupStack
    },
    [stackedData, scales, aes]
  )

  return xBandScale ? (
    <>
      <g ref={groupRef}>
        {!firstRender && (
          <NodeGroup
            data={[...(geomData as [])]}
            keyAccessor={keyAccessor}
            start={(d) => {
              const xAdj =
                dodgeXScale && scales?.groupAccessor
                  ? dodgeXScale(scales.groupAccessor(d) as string) || 0
                  : 0
              return {
                width: dodgeXScale?.bandwidth() || xBandScale.bandwidth(),
                height: 0,
                x: (x(d) || 0) + xAdj,
                y: bottomPos,
                fill: 'transparent',
                stroke: 'transparent',
                fillOpacity: 0,
                strokeOpacity: 0,
              }
            }}
            enter={(d) => {
              const xAdj =
                dodgeXScale && scales?.groupAccessor
                  ? dodgeXScale(scales.groupAccessor(d) as string) || 0
                  : 0
              const groupData = getGroupY(d)
              const thisY1 = groupData
                ? scales?.yScale(groupData[1])
                : bottomPos
              const thisY0 = groupData && scales?.yScale(groupData[0])
              const barHeight = stackedData
                ? thisY0 - thisY1
                : bottomPos - (y(d) || 0)
              return {
                height: [typeof y(d) === 'undefined' ? 0 : barHeight],
                width: [dodgeXScale?.bandwidth() || xBandScale.bandwidth()],
                x: [(x(d) || 0) + xAdj],
                y: [['stack', 'fill'].includes(position) ? thisY1 : y(d)],
                fill: [fill(d)],
                stroke: [stroke(d)],
                fillOpacity: [fillOpacity],
                strokeOpacity: [strokeOpacity],
                timing: { duration, ease: easeCubic },
              }
            }}
            update={(d) => {
              const xAdj =
                dodgeXScale && scales?.groupAccessor
                  ? dodgeXScale(scales.groupAccessor(d) as string) || 0
                  : 0
              const groupData = getGroupY(d)
              const thisY1 = groupData
                ? scales?.yScale(groupData[1])
                : bottomPos
              const thisY0 = groupData && scales?.yScale(groupData[0])
              const barHeight = stackedData
                ? thisY0 - thisY1
                : bottomPos - (y(d) || 0)
              return {
                height: [typeof y(d) === 'undefined' ? 0 : barHeight],
                width: [dodgeXScale?.bandwidth() || xBandScale.bandwidth()],
                x: [(x(d) || 0) + xAdj],
                y: [['stack', 'fill'].includes(position) ? thisY1 : y(d)],
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
              height: [0],
              y: [bottomPos],
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
            data={geomData}
            aes={geomAes}
            x={x}
            y={() => 0}
            group="x"
            xAdj={xBandScale.bandwidth() / 2}
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
          <Tooltip
            y={y}
            xAdj={
              !scales?.xScale.bandwidth && align === 'center'
                ? 0
                : xBandScale.bandwidth() / 2
            }
            aes={geomAes}
          />
        </>
      )}
    </>
  ) : null
}

GeomCol.displayName = 'GeomCol'
export { GeomCol }
