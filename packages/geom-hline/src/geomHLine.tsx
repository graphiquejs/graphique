import React, {
  useEffect,
  useMemo,
  CSSProperties,
  SVGAttributes,
  useRef,
  useState,
} from 'react'
import { useGG, themeState, Delaunay, Aes } from '@graphique/graphique'
import { NodeGroup } from 'react-move'
import { useAtom } from 'jotai'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { Tooltip } from './tooltip'

type GeomAes = Omit<Aes, 'x' | 'fill' | 'size'>

const DEFAULT_TICK_SIZE = 6

export interface GeomHLineProps extends SVGAttributes<SVGLineElement> {
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

const GeomHLine = ({
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
}: GeomHLineProps) => {
  const { ggState } = useGG() || {}
  const { data, aes, scales, copiedScales, width, margin } = ggState || {}

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

  const y = useMemo(
    () => (d: unknown) =>
      scales?.yScale && geomAes?.y && scales.yScale(geomAes.y(d)),
    [scales, geomAes]
  )

  const checkIsOutisdeDomain = useMemo(
    () => (d: unknown) => {
      const domain = scales?.yScale && scales.yScale.domain()

      return (
        domain &&
        ((y(d) as number) > scales.yScale(domain[0]) ||
          (y(d) as number) < scales.yScale(domain[1]))
      )
    },
    [scales, y]
  )

  const keyAccessor = useMemo(
    () => (d: unknown) =>
      geomAes?.key
        ? geomAes.key(d)
        : (`${geomAes?.y && geomAes.y(d)}-${
            scales?.groupAccessor && scales.groupAccessor(d)
          }` as string),
    [geomAes, scales]
  )

  const groupRef = useRef<SVGGElement>(null)

  return (
    <>
      <g ref={groupRef}>
        {!firstRender && width && (
          <NodeGroup
            data={[...(geomData as [])]}
            keyAccessor={keyAccessor}
            start={(d) => ({
              x1: margin?.left || 0,
              x2: margin?.left || 0,
              y1: y(d),
              y2: y(d),
              stroke: stroke(d),
              strokeOpacity: 0,
            })}
            enter={(d) => {
              const isOutsideDomain = checkIsOutisdeDomain(d)
              return {
                x1: [(margin?.left || 0) - DEFAULT_TICK_SIZE],
                x2: [width - (margin?.right || 0)],
                y1: [y(d)],
                y2: [y(d)],
                stroke: [stroke(d)],
                strokeOpacity: [isOutsideDomain ? 0 : strokeOpacity],
                timing: { duration: 1000, ease: easeCubic },
              }
            }}
            update={(d) => {
              const isOutsideDomain = checkIsOutisdeDomain(d)
              return {
                x1: [(margin?.left || 0) - DEFAULT_TICK_SIZE],
                x2: [width - (margin?.right || 0)],
                y1: [y(d)],
                y2: [y(d)],
                stroke: [stroke(d)],
                strokeOpacity: [isOutsideDomain ? 0 : strokeOpacity],
                timing: { duration: 1000, ease: easeCubic },
              }
            }}
            leave={() => ({
              stroke: ['transparent'],
              x1: [margin?.left || 0],
              x2: [margin?.left || 0],
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
            x={() => 0}
            y={y}
            group="y"
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

GeomHLine.displayName = 'GeomHLine'
export { GeomHLine }
