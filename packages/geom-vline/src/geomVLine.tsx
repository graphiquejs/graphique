import React, {
  useEffect,
  useMemo,
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
  usePageVisibility,
} from '@graphique/graphique'
import { NodeGroup } from 'react-move'
import { useAtom } from 'jotai'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { Tooltip } from './tooltip'

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'y' | 'fill' | 'size'> & {
  x?: DataValue<Datum>
}

const DEFAULT_TICK_SIZE = 6

export interface GeomProps<Datum> {
  /**
   * **data used by this Geom**
   *
   * This will overwrite top-level `data` passed to `GG` as it relates to mappings defined in `aes`.
   */
  data?: Datum[]
  /**
   * **functional mapping applied to `data` for this Geom**
   *
   * This extends the top-level `aes` passed to `GG`. Any repeated mappings defined here will take precedence within the Geom.
   */
  aes?: GeomAes<Datum>
  /** attributes passed to the underlying SVG elements */
  attr?: SVGAttributes<SVGLineElement>
  /** should this Geom have a tooltip associated with it (defaults to `true`) */
  showTooltip?: boolean
  /** callback called for mousemove events on the drawing area when focusing data */
  onDatumFocus?: (data: Datum[], index: number[]) => void
  /** callback called for click events on the drawing area when selecting focused data */
  onDatumSelection?: (data: Datum[], index: number[]) => void
  /** callback called for mouseleave events on the drawing area */
  onExit?: () => void
}

const GeomVLine = <Datum,>({
  data: localData,
  aes: localAes,
  attr,
  showTooltip = true,
  onDatumFocus,
  onDatumSelection,
  onExit,
}: GeomProps<Datum>) => {
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

  const isVisible = usePageVisibility()

  const baseAttr: SVGAttributes<SVGLineElement> = {
    strokeOpacity: 1,
    strokeWidth: 1.5,
  }

  const geomAttr: SVGAttributes<SVGLineElement> = {
    ...baseAttr,
    ...attr,
  }

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
    [height, margin],
  )

  useEffect(() => {
    setTheme((prev) => ({
      ...prev,
      geoms: {
        ...prev.geoms,
        vline: {
          strokeWidth: geomAttr?.style?.strokeWidth || geomAttr?.strokeWidth,
          strokeOpacity:
            geomAttr?.style?.strokeOpacity || geomAttr?.strokeOpacity,
          strokeDasharray: geomAttr?.strokeDasharray,
          stroke: geomAttr?.stroke,
        },
      },
    }))
  }, [setTheme, attr])

  const stroke = useMemo(
    () => (d: Datum) =>
      geomAttr.stroke ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : defaultStroke),
    [geomAes, copiedScales, geomAttr, defaultStroke],
  )

  const x = useMemo(
    () => (d: Datum) =>
      (scales?.xScale && geomAes?.x && scales.xScale(geomAes.x(d))) ?? 0,
    [scales, geomAes],
  )

  const xAdj = useMemo(
    () =>
      scales?.xScale?.bandwidth
        ? (scales.xScale.bandwidth() * scales.xScale.paddingInner()) / 2
        : 0,
    [scales],
  )

  const checkIsOutisdeDomain = useMemo(
    () => (d: Datum) => {
      const domain = scales?.xScale && scales.xScale.domain()

      if (
        scales.xScale?.bandwidth?.() &&
        geomAes.x &&
        (domain as unknown as string[]).includes(String(geomAes.x(d)))
      ) {
        return false
      }

      return (
        domain &&
        ((x(d) as number) < scales.xScale(domain[0]) ||
          (x(d) as number) > scales.xScale(domain[1]))
      )
    },
    [scales, x, geomAes],
  )

  const keyAccessor = useMemo(
    () => (d: Datum, i: number) =>
      geomAes?.key
        ? geomAes.key(d)
        : (`${geomAes?.x && geomAes.x(d)}-${geomAes?.y && geomAes.y(d)}-${
            scales?.groupAccessor && scales.groupAccessor(d)
          }-${i}` as string),
    [geomAes, scales],
  )

  const groupRef = useRef<SVGGElement>(null)

  return (
    <>
      <g ref={groupRef}>
        {!firstRender && isVisible && (
          <NodeGroup
            data={[...geomData]}
            keyAccessor={keyAccessor}
            start={(d) => ({
              x1: x(d) - xAdj,
              x2: x(d) - xAdj,
              y1: bottomPos,
              y2: bottomPos,
              stroke: stroke(d),
              strokeOpacity: 0,
            })}
            enter={(d) => {
              const isOutsideDomain = checkIsOutisdeDomain(d)
              return {
                x1: [x(d) - xAdj],
                x2: [x(d) - xAdj],
                y1: [bottomPos],
                y2: [(margin?.top || 0) - DEFAULT_TICK_SIZE],
                stroke: [stroke(d)],
                strokeOpacity: [isOutsideDomain ? 0 : geomAttr?.strokeOpacity],
                timing: { duration, ease: easeCubic },
              }
            }}
            update={(d) => {
              const isOutsideDomain = checkIsOutisdeDomain(d)
              return {
                x1: [x(d) - xAdj],
                x2: [x(d) - xAdj],
                y1: [bottomPos],
                y2: [(margin?.top || 0) - DEFAULT_TICK_SIZE],
                stroke: [stroke(d)],
                strokeOpacity: [isOutsideDomain ? 0 : geomAttr?.strokeOpacity],
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
                    {...attr}
                    x1={state.x1}
                    x2={state.x2}
                    y1={state.y1}
                    y2={state.y2}
                    stroke={state.stroke}
                    strokeWidth={geomAttr?.strokeWidth}
                    strokeOpacity={state.strokeOpacity}
                    style={{ pointerEvents: 'none' }}
                    data-testid="__gg_geom_vline"
                  />
                ))}
              </>
            )}
          </NodeGroup>
        )}
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
