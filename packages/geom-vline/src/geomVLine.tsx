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
  Delaunay,
  Aes,
  DataValue,
} from '@graphique/graphique'
import { NodeGroup } from 'react-move'
import { useAtom } from 'jotai'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { Tooltip } from './tooltip'

type GeomAes = Omit<Aes, 'x' | 'y' | 'fill' | 'size'> & {
  x?: DataValue
}

const DEFAULT_TICK_SIZE = 6

export interface GeomVLineProps extends SVGAttributes<SVGLineElement> {
  data?: unknown[]
  aes?: GeomAes
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  showTooltip?: boolean
  onDatumFocus?: (data: unknown, index: number | number[]) => void
  onDatumSelection?: (data: unknown, index: number | number[]) => void
  onExit?: () => void
  strokeOpacity?: number
}

const GeomVLine = ({
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
}: GeomVLineProps) => {
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

  const { stroke: strokeColor, strokeDasharray } = { ...props }
  const { defaultStroke } = theme

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
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
    () => (d: unknown) =>
      strokeColor ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : defaultStroke),
    [geomAes, copiedScales, strokeColor, defaultStroke]
  )

  const x = useMemo(
    () => (d: unknown) =>
      scales?.xScale && geomAes?.x && scales.xScale(geomAes.x(d)),
    [scales, geomAes]
  )

  const checkIsOutisdeDomain = useMemo(
    () => (d: unknown) => {
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
    () => (d: unknown) =>
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
        {!firstRender && (
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
                timing: { duration: 1000, ease: easeCubic },
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
                timing: { duration: 1000, ease: easeCubic },
              }
            }}
            leave={() => ({
              stroke: ['transparent'],
              y1: [bottomPos],
              y2: [bottomPos],
              timing: { duration: 1000, ease: easeCubic },
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
            data={geomData?.filter((d) => !checkIsOutisdeDomain(d))}
            aes={geomAes as Aes}
            x={x}
            y={() => 0}
            group="x"
            onMouseOver={({ d, i }: { d: unknown; i: number | number[] }) => {
              if (onDatumFocus) onDatumFocus(d, i)
            }}
            onClick={
              onDatumSelection
                ? ({ d, i }: { d: unknown; i: number | number[] }) => {
                    onDatumSelection(d, i)
                  }
                : undefined
            }
            onMouseLeave={() => {
              if (onExit) onExit()
            }}
          />
          <Tooltip aes={geomAes as Aes} />
        </>
      )}
    </>
  )
}

GeomVLine.displayName = 'GeomVLine'
export { GeomVLine }
