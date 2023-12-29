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
  EventArea,
  Aes,
  DataValue,
  PageVisibility,
} from '@graphique/graphique'
import { NodeGroup } from 'react-move'
import { useAtom } from 'jotai'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { Tooltip } from './tooltip'

type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'y' | 'fill' | 'size'> & {
  x?: DataValue<Datum>
}

const DEFAULT_TICK_SIZE = 6

export interface GeomVLineProps<Datum> extends SVGAttributes<SVGLineElement> {
  data?: Datum[]
  aes?: GeomAes<Datum>
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  showTooltip?: boolean
  onDatumFocus?: (data: Datum[], index: number[]) => void
  onDatumSelection?: (data: Datum[], index: number[]) => void
  onExit?: () => void
  strokeOpacity?: number
}

const GeomVLine = <Datum,>({
  data: localData,
  aes: localAes,
  focusedStyle,
  unfocusedStyle,
  onDatumFocus,
  onDatumSelection,
  onExit,
  showTooltip = true,
  strokeWidth = 1.5,
  strokeOpacity = 1,
  ...props
}: GeomVLineProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
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

  const { stroke: strokeColor, strokeDasharray } = { ...props }
  const { defaultStroke, animationDuration: duration } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const bottomPos = useMemo(
    () =>
      height && margin
        ? height - margin.bottom + DEFAULT_TICK_SIZE
        : DEFAULT_TICK_SIZE,
    [height, margin]
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        vline: {
          strokeWidth: props.style?.strokeWidth || strokeWidth,
          strokeOpacity: props.style?.strokeOpacity || strokeOpacity,
          strokeDasharray,
          stroke: strokeColor,
        },
      },
    }))
  }, [setTheme, strokeColor, strokeOpacity, strokeWidth, props.style])

  const stroke = useMemo(
    () => (d: Datum) =>
      strokeColor ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : defaultStroke),
    [geomAes, copiedScales, strokeColor, defaultStroke]
  )

  const x = useMemo(
    () => (d: Datum) =>
      scales?.xScale && geomAes?.x && scales.xScale(geomAes.x(d)),
    [scales, geomAes]
  )

  const checkIsOutisdeDomain = useMemo(
    () => (d: Datum) => {
      const domain = scales?.xScale && scales.xScale.domain()

      return (
        domain &&
        ((x(d) as number) < scales.xScale(domain[0]) ||
          (x(d) as number) > scales.xScale(domain[1]))
      )
    },
    [scales, x]
  )

  const keyAccessor = useMemo(
    () => (d: Datum) =>
      geomAes?.key
        ? geomAes.key(d)
        : (`${geomAes?.x && geomAes.x(d)}-${geomAes?.y && geomAes.y(d)}-${
            scales?.groupAccessor && scales.groupAccessor(d)
          }` as string),
    [geomAes, scales]
  )

  const groupRef = useRef<SVGGElement>(null)

  return (
    <>
      <g ref={groupRef}>
        <PageVisibility>
          {(isVisible) =>
            !firstRender &&
            isVisible && (
              <NodeGroup
                data={[...(geomData as [])]}
                keyAccessor={keyAccessor}
                start={(d) => ({
                  x1: x(d),
                  x2: x(d),
                  y1: bottomPos,
                  y2: bottomPos,
                  stroke: stroke(d),
                  strokeOpacity: 0,
                })}
                enter={(d) => {
                  const isOutsideDomain = checkIsOutisdeDomain(d)
                  return {
                    x1: [x(d)],
                    x2: [x(d)],
                    y1: [bottomPos],
                    y2: [(margin?.top || 0) - DEFAULT_TICK_SIZE],
                    stroke: [stroke(d)],
                    strokeOpacity: [isOutsideDomain ? 0 : strokeOpacity],
                    timing: { duration, ease: easeCubic },
                  }
                }}
                update={(d) => {
                  const isOutsideDomain = checkIsOutisdeDomain(d)
                  return {
                    x1: [x(d)],
                    x2: [x(d)],
                    y1: [bottomPos],
                    y2: [(margin?.top || 0) - DEFAULT_TICK_SIZE],
                    stroke: [stroke(d)],
                    strokeOpacity: [isOutsideDomain ? 0 : strokeOpacity],
                    timing: { duration, ease: easeCubic },
                  }
                }}
                leave={() => ({
                  stroke: ['transparent'],
                  y1: [bottomPos],
                  y2: [bottomPos],
                  timing: { duration, ease: easeCubic },
                })}
                interpolation={(begVal, endVal) => interpolate(begVal, endVal)}
              >
                {(nodes) => (
                  <>
                    {nodes.map(({ state, key }) => (
                      <line
                        key={key}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...props}
                        x1={state.x1}
                        x2={state.x2}
                        y1={state.y1}
                        y2={state.y2}
                        stroke={state.stroke}
                        strokeWidth={strokeWidth}
                        strokeOpacity={state.strokeOpacity}
                        style={{ pointerEvents: 'none' }}
                        data-testid="__gg_geom_vline"
                      />
                    ))}
                  </>
                )}
              </NodeGroup>
            )
          }
        </PageVisibility>
      </g>
      {showTooltip && (
        <>
          <EventArea
            data={geomData?.filter((d) => !checkIsOutisdeDomain(d))}
            aes={geomAes}
            x={x}
            y={() => 0}
            group="x"
            onDatumFocus={onDatumFocus}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: Datum[]; i: number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onMouseLeave={() => {
              if (onExit) onExit()
            }}
          />
          <Tooltip aes={geomAes} />
        </>
      )}
    </>
  )
}

GeomVLine.displayName = 'GeomVLine'
export { GeomVLine }
