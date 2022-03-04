import React, {
  useState,
  useEffect,
  useMemo,
  CSSProperties,
  SVGAttributes,
  useRef,
} from 'react'
import { NodeGroup } from 'react-move'
import { easeCubic } from 'd3-ease'
import { scaleSqrt } from 'd3-scale'
import { extent } from 'd3-array'
import { interpolate } from 'd3-interpolate'
import { useAtom } from 'jotai'
import {
  useGG,
  focusNodes,
  unfocusNodes,
  Delaunay,
  themeState,
  radiusScaleState,
  isDate,
} from '@graphique/graphique'
import { Tooltip } from './tooltip'

export interface PointProps extends SVGAttributes<SVGCircleElement> {
  data?: unknown[]
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  showTooltip?: boolean
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  onDatumSelection?: (data: unknown, index: number | number[]) => void
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
}

const GeomPoint = ({
  data: localData,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  onExit,
  showTooltip = true,
  fillOpacity = 1,
  strokeOpacity = 1,
  r = 3.5,
  ...props
}: PointProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, height, margin } = ggState || {}
  const [theme, setTheme] = useAtom(themeState)
  const [radiusScale] = useAtom(radiusScaleState)
  const { domain: sizeDomain, range: sizeRange } = radiusScale || {}
  const { fill: fillColor, stroke: strokeColor, strokeWidth } = { ...props }
  const { defaultFill } = theme

  let geomData = localData || data
  const undefinedX = useMemo(
    () =>
      geomData
        ? geomData.filter(
            (d) =>
              aes?.x(d) === null ||
              typeof aes?.x(d) === 'undefined' ||
              (isDate(aes?.x(d)) && Number.isNaN(aes?.x(d)?.valueOf()))
          )
        : [],
    [geomData]
  )
  const undefinedY = useMemo(
    () =>
      geomData
        ? geomData.filter(
            (d) =>
              aes?.y && (aes.y(d) === null || typeof aes.y(d) === 'undefined')
          )
        : [],
    [geomData]
  )

  geomData = geomData?.filter(
    (d) =>
      aes?.x(d) !== null &&
      !(typeof aes?.x(d) === 'undefined') &&
      (isDate(aes?.x(d)) ? !Number.isNaN(aes?.x(d)?.valueOf()) : true) &&
      aes.y &&
      aes.y(d) !== null &&
      !(typeof aes.y(d) === 'undefined')
  )

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  useEffect(() => {
    if (firstRender && undefinedX.length > 0) {
      console.warn(
        `Ignoring ${undefinedX.length} points with missing x values.`
      )
    }

    if (firstRender && undefinedY.length > 0) {
      console.warn(
        `Ignoring ${undefinedY.length} points with missing y values.`
      )
    }
  }, [firstRender])

  const bottomPos = useMemo(
    () => (height && margin ? height - margin.bottom : undefined),
    [height, margin]
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        point: {
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
    fillOpacity: 0.2,
    strokeOpacity: 0.2,
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

  // if (scales?.yScale?.bandwidth) {
  //   scales.yScale.padding(1)
  // }
  // if (scales?.xScale?.bandwidth) {
  //   scales.xScale?.padding(1)
  // }

  const x = useMemo(() => {
    if (scales?.xScale.bandwidth) {
      return (d: unknown) =>
        (scales?.xScale(aes?.x(d)) || 0) + scales?.xScale.bandwidth() / 2
    }
    return (d: unknown) =>
      scales?.xScale && (scales.xScale(aes?.x(d)) || 0) + 0.5
  }, [scales, aes])
  const y = useMemo(() => {
    if (scales?.yScale.bandwidth) {
      return (d: unknown) =>
        (scales?.yScale(aes?.y && aes.y(d)) || 0) +
        scales?.yScale.bandwidth() / 2
    }
    return (d: unknown) =>
      scales?.yScale && aes?.y && (scales.yScale(aes.y(d)) || 0) + 0.5
  }, [scales, aes])

  const radius = useMemo(() => {
    if (geomData && aes?.size && sizeRange && sizeDomain) {
      const domain =
        sizeDomain[0] && sizeDomain[1]
          ? sizeDomain
          : (extent(geomData, aes.size as () => number) as number[])
      return scaleSqrt()
        .domain(domain)
        .range(sizeRange as [number, number])
        .unknown([r])
    }
    return () => r
  }, [r, aes, geomData, sizeRange, sizeDomain])

  const keyAccessor = useMemo(
    () => (d: unknown) =>
      aes?.key
        ? aes.key(d)
        : (`${aes?.x(d)}-${aes?.y && aes.y(d)}-${
            scales?.groupAccessor && scales.groupAccessor(d)
          }` as string),
    [aes, scales]
  )

  const groupRef = useRef<SVGGElement>(null)
  const points = groupRef.current?.getElementsByTagName('circle')

  return (
    <>
      <g ref={groupRef}>
        {!firstRender && (
          <NodeGroup
            data={[...(geomData as [])]}
            keyAccessor={keyAccessor}
            start={(d) => ({
              cx: x(d),
              cy: bottomPos,
              fill: fill(d),
              stroke: stroke(d),
              r: 0,
              fillOpacity: 0,
              strokeOpacity: 0,
            })}
            enter={(d) => ({
              cx: [x(d)],
              cy: [y(d)],
              r: [aes?.size ? radius(aes.size(d) as number) : r],
              fill: [fill(d)],
              stroke: [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration: 1000, ease: easeCubic },
            })}
            update={(d) => ({
              cx: [x(d)],
              cy: [y(d)],
              fill: firstRender ? fill(d) : [fill(d)],
              stroke: firstRender ? stroke(d) : [stroke(d)],
              r: [aes?.size ? radius(aes.size(d) as number) : r],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration: 1000, ease: easeCubic },
            })}
            leave={() => ({
              fill: ['transparent'],
              stroke: ['transparent'],
              cy: [bottomPos],
              timing: { duration: 1000, ease: easeCubic },
            })}
            interpolation={(begVal, endVal) => interpolate(begVal, endVal)}
          >
            {(nodes) => (
              <>
                {nodes.map(({ state, key }) => (
                  <circle
                    key={key}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    r={state.r >= 0 ? state.r : r}
                    fill={state.fill}
                    stroke={state.stroke}
                    cx={state.cx}
                    cy={state.cy}
                    fillOpacity={state.fillOpacity}
                    strokeOpacity={state.strokeOpacity}
                  />
                ))}
              </>
            )}
          </NodeGroup>
        )}
      </g>
      {geomData && showTooltip && (
        <>
          <Delaunay
            data={geomData}
            x={x}
            y={y}
            onMouseOver={({ d, i }: { d: unknown; i: number | number[] }) => {
              if (points) {
                focusNodes({
                  nodes: points,
                  focusedIndex: i,
                  focusedStyles,
                  unfocusedStyles,
                })
              }

              if (onDatumFocus) onDatumFocus(d, i)
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: any; i: number | number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onMouseLeave={() => {
              if (points) {
                unfocusNodes({ nodes: points, baseStyles })
              }

              if (onExit) onExit()
            }}
          />
          <Tooltip />
        </>
      )}
    </>
  )
}

GeomPoint.displayName = 'GeomPoint'
export { GeomPoint }
