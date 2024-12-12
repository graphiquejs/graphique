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
  usePageVisibility,
} from '@graphique/graphique'
import { NodeGroup } from 'react-move'
import { useAtom } from 'jotai'
import { easeCubic } from 'd3-ease'
import { interpolate } from 'd3-interpolate'
import { Tooltip } from './tooltip'

export type GeomAes<Datum> = Omit<Aes<Datum>, 'x' | 'fill' | 'size'>

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
  /** should this Geom have a tooltip associated with it (_default_: `true`) */
  showTooltip?: boolean
  /** callback called for mousemove events on the drawing area when focusing data */
  onDatumFocus?: (data: Datum[], index: number[]) => void
  /** callback called for click events on the drawing area when selecting focused data */
  onDatumSelection?: (data: Datum[], index: number[]) => void
  /** callback called for mouseleave events on the drawing area */
  onExit?: () => void
}

const GeomHLine = <Datum,>({
  data: localData,
  aes: localAes,
  attr,
  onDatumFocus,
  onDatumSelection,
  onExit,
  showTooltip = true,
}: GeomProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
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

  const { defaultStroke, animationDuration: duration } = theme

  const isVisible = usePageVisibility()

  const baseAttr: SVGAttributes<SVGLineElement> = {
    strokeOpacity: 1,
    strokeWidth: 1.5,
  }

  const geomAttr: SVGAttributes<SVGLineElement> = {
    ...baseAttr,
    ...attr,
  }

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
        hline: {
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
      geomAttr?.stroke ||
      (geomAes?.stroke && copiedScales?.strokeScale
        ? (copiedScales.strokeScale(geomAes.stroke(d) as any) as
            | string
            | undefined)
        : defaultStroke),
    [geomAes, copiedScales, geomAttr, defaultStroke],
  )

  const y = useMemo(
    () => (d: Datum) =>
      (scales?.yScale && geomAes?.y && scales.yScale(geomAes.y(d))) ?? 0,
    [scales, geomAes],
  )

  const yAdj = useMemo(
    () =>
      scales?.yScale?.bandwidth
        ? (scales.yScale.bandwidth() / 2) * scales.yScale.paddingInner()
        : 0,
    [scales],
  )

  const checkIsOutisdeDomain = useMemo(
    () => (d: Datum) => {
      const domain = scales?.yScale && scales.yScale.domain()

      if (
        scales.yScale?.bandwidth?.() &&
        geomAes.y &&
        (domain as unknown as string[]).includes(String(geomAes.y(d)))
      ) {
        return false
      }

      return (
        domain &&
        ((y(d) as number) > scales.yScale(domain[0]) ||
          (y(d) as number) < scales.yScale(domain[1]))
      )
    },
    [scales, y, geomAes],
  )

  const keyAccessor = useMemo(
    () => (d: Datum, i: number) =>
      geomAes?.key
        ? geomAes.key(d)
        : (`${geomAes?.y && geomAes.y(d)}-${
            scales?.groupAccessor && scales.groupAccessor(d)
          }-${i}` as string),
    [geomAes, scales],
  )

  const groupRef = useRef<SVGGElement>(null)

  return (
    <>
      <g ref={groupRef}>
        {!firstRender && width && isVisible && (
          <NodeGroup
            data={[...(geomData as [])]}
            keyAccessor={keyAccessor}
            start={(d) => ({
              x1: margin?.left || 0,
              x2: margin?.left || 0,
              y1: y(d) - yAdj,
              y2: y(d) - yAdj,
              stroke: stroke(d),
              strokeOpacity: 0,
            })}
            enter={(d) => {
              const isOutsideDomain = checkIsOutisdeDomain(d)
              return {
                x1: [(margin?.left || 0) - DEFAULT_TICK_SIZE],
                x2: [width - (margin?.right || 0)],
                y1: [y(d) - yAdj],
                y2: [y(d) - yAdj],
                stroke: [stroke(d)],
                strokeOpacity: [isOutsideDomain ? 0 : geomAttr?.strokeOpacity],
                timing: { duration, ease: easeCubic },
              }
            }}
            update={(d) => {
              const isOutsideDomain = checkIsOutisdeDomain(d)
              return {
                x1: [(margin?.left || 0) - DEFAULT_TICK_SIZE],
                x2: [width - (margin?.right || 0)],
                y1: [y(d) - yAdj],
                y2: [y(d) - yAdj],
                stroke: [stroke(d)],
                strokeOpacity: [isOutsideDomain ? 0 : geomAttr?.strokeOpacity],
                timing: { duration, ease: easeCubic },
              }
            }}
            leave={() => ({
              stroke: ['transparent'],
              x1: [margin?.left || 0],
              x2: [margin?.left || 0],
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
                    data-testid="__gg_geom_hline"
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
            aes={geomAes as Aes<Datum>}
            x={() => 0}
            y={y}
            group="y"
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
          <Tooltip aes={geomAes as Aes<Datum>} />
        </>
      )}
    </>
  )
}

GeomHLine.displayName = 'GeomHLine'
export { GeomHLine }
