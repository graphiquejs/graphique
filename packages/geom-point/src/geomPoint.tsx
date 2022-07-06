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
  EventArea,
  themeState,
  radiusScaleState,
  zoomState,
  xScaleState,
  yScaleState,
  isDate,
  defineGroupAccessor,
  Aes,
  BrushAction,
  usePageVisibility,
} from '@graphique/graphique'
import { type GeomAes } from './types'
import { Tooltip } from './tooltip'

export interface PointProps extends SVGAttributes<SVGCircleElement> {
  data?: unknown[]
  aes?: GeomAes
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  showTooltip?: boolean
  brushAction?: BrushAction
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  onDatumSelection?: (data: unknown, index: number | number[]) => void
  entrance?: 'data' | 'midpoint'
  onExit?: () => void
  fillOpacity?: number
  strokeOpacity?: number
  isClipped?: boolean
}

const GeomPoint = ({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  entrance = 'midpoint',
  onExit,
  showTooltip = true,
  brushAction,
  fillOpacity = 1,
  strokeOpacity = 1,
  isClipped = true,
  r = 3.5,
  ...props
}: PointProps) => {
  const { ggState } = useGG() || {}
  const { id, data, aes, scales, copiedScales, height, margin } = ggState || {}

  const [theme, setTheme] = useAtom(themeState)
  const [radiusScale] = useAtom(radiusScaleState)
  const [{ xDomain: xZoomDomain, yDomain: yZoomDomain }] = useAtom(zoomState)
  const [{ isFixed: isFixedX }] = useAtom(xScaleState)
  const [{ isFixed: isFixedY }] = useAtom(yScaleState)

  const { domain: sizeDomain, range: sizeRange } = radiusScale || {}
  const { fill: fillColor, stroke: strokeColor, strokeWidth } = { ...props }
  const { defaultFill, animationDuration: duration } = theme

  const isVisible = usePageVisibility()

  const initialGeomData = useMemo(() => localData || data, [data, localData])

  const geomAes = useMemo(() => {
    if (localAes) {
      return {
        ...aes,
        ...localAes,
      }
    }
    return aes
  }, [aes, localAes])

  const group = useMemo(
    () => geomAes && defineGroupAccessor(geomAes as Aes),
    [geomAes, defineGroupAccessor]
  )

  const keyAccessor = useMemo(
    () => (d: unknown) =>
      geomAes?.key
        ? geomAes.key(d)
        : (`${geomAes?.x && geomAes.x(d)}-${geomAes?.y && geomAes.y(d)}-${
            group && group(d)
          }` as string),
    [geomAes, group]
  )

  const undefinedX = useMemo(
    () =>
      initialGeomData
        ? initialGeomData.filter(
            (d) =>
              geomAes?.x &&
              (geomAes.x(d) === null ||
                typeof geomAes.x(d) === 'undefined' ||
                (isDate(geomAes.x(d)) && Number.isNaN(geomAes.x(d)?.valueOf())))
          )
        : [],
    [initialGeomData, geomAes]
  )
  const undefinedY = useMemo(
    () =>
      initialGeomData
        ? initialGeomData.filter(
            (d) =>
              geomAes?.y &&
              (geomAes.y(d) === null || typeof geomAes.y(d) === 'undefined')
          )
        : [],
    [initialGeomData]
  )

  const geomData = useMemo(() => {
    const presentData = initialGeomData?.filter(
      (d) =>
        geomAes?.x &&
        geomAes?.x(d) !== null &&
        !(typeof geomAes?.x(d) === 'undefined') &&
        (isDate(geomAes?.x(d))
          ? !Number.isNaN(geomAes?.x(d)?.valueOf())
          : true) &&
        geomAes.y &&
        geomAes.y(d) !== null &&
        !(typeof geomAes.y(d) === 'undefined')
    )

    const uniqueKeyVals = Array.from(
      new Set(presentData?.map((d) => keyAccessor(d)))
    )

    return uniqueKeyVals.flatMap((k) => {
      const dataWithKey = presentData?.filter((d) => keyAccessor(d) === k)
      if (dataWithKey && dataWithKey.length > 1) {
        return dataWithKey.map((dk: any, i) => ({
          ...dk,
          gg_gen_index: i,
        }))
      }
      return dataWithKey?.flat()
    })
  }, [initialGeomData, keyAccessor])

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
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
  }, [firstRender, undefinedX, undefinedY])

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
      (geomAes?.fill && copiedScales?.fillScale
        ? (copiedScales.fillScale(
            geomAes.fill(d)
            // aes.fill(d) === null ? "[null]" : (aes.fill(d) as any)
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

  // if (scales?.yScale?.bandwidth) {
  //   scales.yScale.padding(1)
  // }
  // if (scales?.xScale?.bandwidth) {
  //   scales.xScale?.padding(1)
  // }
  const radius = useMemo(() => {
    if (geomData && geomAes?.size && sizeRange && sizeDomain) {
      const domain =
        sizeDomain[0] && sizeDomain[1]
          ? sizeDomain
          : (extent(geomData, geomAes.size as () => number) as number[])
      return scaleSqrt()
        .domain(domain)
        .range(sizeRange as [number, number])
        .unknown([r])
    }
    return () => r
  }, [r, geomAes, geomData, sizeRange, sizeDomain])

  const x = useMemo(() => {
    if (scales?.xScale.bandwidth) {
      return (d: unknown) =>
        (scales?.xScale(geomAes?.x && geomAes.x(d)) || 0) +
        scales?.xScale.bandwidth() / 2 +
        0.9
    }
    return (d: unknown) =>
      scales?.xScale && geomAes?.x && (scales.xScale(geomAes.x(d)) || 0)
  }, [scales, geomAes])

  const y = useMemo(() => {
    if (scales?.yScale.bandwidth) {
      return (d: unknown) =>
        (scales?.yScale(geomAes?.y && geomAes.y(d)) || 0) +
        scales?.yScale.bandwidth() / 2
    }
    return (d: unknown) =>
      scales?.yScale && geomAes?.y && (scales.yScale(geomAes.y(d)) || 0)
  }, [scales, geomAes])

  const groupRef = useRef<SVGGElement>(null)
  const points = groupRef.current?.getElementsByTagName('circle')

  const [shouldClip, setShouldClip] = useState(
    isClipped || isFixedX || isFixedY
  )
  useEffect(() => {
    if (xZoomDomain?.current || yZoomDomain?.current) {
      setShouldClip(true)
    } else {
      const timeout = setTimeout(() => setShouldClip(isClipped), duration)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [isFixedX, isFixedY, xZoomDomain?.current, yZoomDomain?.current, duration])

  return (
    <>
      <g
        ref={groupRef}
        clipPath={shouldClip ? `url(#__gg_canvas_${id})` : undefined}
      >
        {!firstRender && isVisible && (
          <NodeGroup
            data={[...(geomData as any[])]}
            keyAccessor={(d) =>
              d.gg_gen_index
                ? `${keyAccessor(d)}-${d.gg_gen_index}`
                : keyAccessor(d)
            }
            start={(d) => ({
              cx: x(d),
              cy: entrance === 'data' ? y(d) : bottomPos,
              fill: fill(d),
              stroke: stroke(d),
              r: 0,
              fillOpacity: 0,
              strokeOpacity: 0,
            })}
            enter={(d) => ({
              cx: [x(d)],
              cy: [y(d)],
              r: [geomAes?.size ? radius(geomAes.size(d) as number) : r],
              fill: [fill(d)],
              stroke: [stroke(d)],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration, ease: easeCubic },
            })}
            update={(d) => ({
              cx: [x(d)],
              cy: [y(d)],
              fill: firstRender ? fill(d) : [fill(d)],
              stroke: firstRender ? stroke(d) : [stroke(d)],
              r: [geomAes?.size ? radius(geomAes.size(d) as number) : r],
              fillOpacity: [fillOpacity],
              strokeOpacity: [strokeOpacity],
              timing: { duration, ease: easeCubic },
            })}
            leave={() => ({
              fill: ['transparent'],
              stroke: ['transparent'],
              cy: [bottomPos],
              timing: { duration, ease: easeCubic },
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
                    style={{ pointerEvents: 'none' }}
                    data-testid="__gg_geom_point"
                  />
                ))}
              </>
            )}
          </NodeGroup>
        )}
      </g>
      {(showTooltip || brushAction) && geomAes && (
        <>
          <EventArea
            data={geomData}
            showTooltip={showTooltip}
            brushAction={brushAction}
            aes={geomAes}
            x={x}
            y={y}
            onDatumFocus={onDatumFocus}
            onMouseOver={({ i }: { d: unknown; i: number | number[] }) => {
              if (points) {
                focusNodes({
                  nodes: points,
                  focusedIndex: i,
                  focusedStyles,
                  unfocusedStyles,
                })
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
              if (points) {
                unfocusNodes({ nodes: points, baseStyles })
              }

              if (onExit) onExit()
            }}
          />
          {showTooltip && <Tooltip aes={geomAes} group={group} />}
        </>
      )}
    </>
  )
}

GeomPoint.displayName = 'GeomPoint'
export { GeomPoint }
