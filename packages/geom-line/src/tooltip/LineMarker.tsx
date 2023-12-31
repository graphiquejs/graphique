import React, { useMemo } from 'react'
import {
  useGG,
  tooltipState,
  themeState,
  formatMissing,
} from '@graphique/graphique'
import { min } from 'd3-array'
import { useAtom } from 'jotai'
import { type GeomAes } from '../types'

export interface LineMarkerProps<Datum> {
  x: (d: Datum) => number | undefined
  y: (d: Datum) => number | undefined
  markerRadius: number
  markerStroke: string
  aes: GeomAes<Datum>
}

export const LineMarker = <Datum,>({
  x,
  y,
  markerRadius,
  markerStroke,
  aes,
}: LineMarkerProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { copiedScales, width, height, margin, id, scales } = ggState || {}

  const [{ datum }] = useAtom(tooltipState)
  const [{ defaultStroke, geoms }] = useAtom(themeState) || {}

  const { line } = geoms || {}

  const left = useMemo(
    () =>
      min([
        datum && x(datum[0]),
        width && margin?.right && width - margin.right,
      ] as number[]),
    [datum, x, width]
  )

  return height && margin ? (
    <>
      {left && datum && (
        <g
          className={`__gg-tooltip-${id}`}
          style={{ transform: `translateX(${left}px)` }}
        >
          <line
            y1={height - margin.bottom}
            y2={margin.top}
            strokeDasharray={2}
            stroke="#888"
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
            data-testid='__gg_geom_line_marker'
          />
          {datum.map((d, i) => {
            const formattedGroup = copiedScales?.groupAccessor
              ? formatMissing(copiedScales?.groupAccessor(d))
              : '__group'

            const inRange =
              (y(d) as number) <= copiedScales?.yScale.range()[0] &&
              (y(d) as number) >= copiedScales?.yScale.range()[1]
            
            const inGroups = scales?.groups
              ? scales.groups.includes(formattedGroup)
              : true

            const thisFill =
              line?.stroke ||
              (copiedScales?.strokeScale && aes?.stroke
                ? copiedScales.strokeScale(aes.stroke(d))
                : defaultStroke)
            return (
              typeof y(d) !== 'undefined' &&
              inRange && inGroups && (
                <g
                  key={`group-marker-${
                    d.label || formattedGroup
                  }-${i.toString()}`}
                  style={{ pointerEvents: 'none' }}
                >
                  <circle
                    r={markerRadius * 2 + 0.5}
                    fill={thisFill}
                    cy={y(d)}
                    fillOpacity={Math.min(
                      0.5,
                      Math.max(
                        ((line?.strokeOpacity || 0.9) as number) - 0.35,
                        0
                      )
                    )}
                  />
                  <circle
                    r={markerRadius}
                    fill={thisFill}
                    stroke={markerStroke}
                    strokeWidth={markerRadius / 3.2}
                    cy={y(d)}
                    fillOpacity={line?.strokeOpacity || 0.9}
                    strokeOpacity={0.7}
                    data-testid='__gg_geom_line_marker_point'
                  />
                </g>
              )
            )
          })}
        </g>
      )}
    </>
  ) : null
}
