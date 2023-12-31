import React, { useMemo } from 'react'
import {
  useGG,
  tooltipState,
  themeState,
  formatMissing,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { sum, min } from 'd3-array'
import type { GeomAes } from '../types'

export interface LineMarkerProps<Datum> {
  x: (d: Datum) => number | undefined
  y: (d: Datum) => number | undefined
  y0: (d: Datum) => number | undefined
  y1: (d: Datum) => number | undefined
  aes: GeomAes<Datum>
  markerRadius: number
  markerStroke: string
}

export const LineMarker = <Datum,>({
  x,
  y,
  y0,
  y1,
  aes,
  markerRadius,
  markerStroke,
}: LineMarkerProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { scales, copiedScales, width, height, margin, id } = ggState || {}

  const [{ datum }] = useAtom(tooltipState)
  const [{ defaultFill, geoms }] = useAtom(themeState) || {}

  const { area } = geoms || {}

  const left = useMemo(
    () =>
      min([
        datum && x(datum[0]),
        width && margin?.right && width - margin.right,
      ] as number[]),
    [datum, x, width]
  )

  const getY = useMemo(() => (aes?.y1 ? y1 : y), [y1, y, aes])

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
            data-testid='__gg_geom_area_marker'
          />
          {datum.map((d, i, stacks) => {
            const formattedGroup = copiedScales?.groupAccessor
              ? formatMissing(copiedScales?.groupAccessor(d))
              : '__group'
            
            const inGroups = scales?.groups
              ? scales.groups.includes(formattedGroup)
              : true
            
            let thisYCoord: any[]

            // not in groups
            if (!inGroups) {
              thisYCoord = []
            }

            // stacked area (sum)
            else if (area?.position === 'stack') {
              const yTotal = stacks
                .slice(0, i + 1)
                // @ts-ignore
                .map(aes.y)
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = [scales?.yScale(yTotal)]
            } else if (area?.position === 'fill' && aes?.y) {
              const yTotal = stacks
                .slice(0, i + 1)
                .map(
                  (s) =>
                    // @ts-ignore
                    aes.y(s) / sum(stacks, aes.y)
                )
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = [scales?.yScale(yTotal)]
            } else if (aes.y0 && aes.y1) {
              thisYCoord = [y0(d), y1(d)]
            } else {
              thisYCoord = [y(d)]
            }

            const thisFill =
              area?.fill && !['none', 'transparent'].includes(area?.fill ?? '') ? area.fill : 
              (area?.fillScale && aes.fill && area.fillScale(aes.fill(d))) ||
              (copiedScales?.fillScale && aes?.fill
                ? (copiedScales.fillScale(aes.fill(d)))
                : ((area?.stroke ||
                  (area?.strokeScale && aes.stroke && area.strokeScale(aes.stroke(d))) ||
                    (copiedScales?.strokeScale?.(aes?.stroke?.(d)))
                ) ?? defaultFill)
              )

            return thisYCoord?.map((c, j) => {
              const inRange =
                c <= copiedScales?.yScale.range()[0] &&
                c >= copiedScales?.yScale.range()[1]
              
              return (
                getY(d) &&
                inRange && (
                  <g
                    key={`marker-${
                      copiedScales?.groups ? copiedScales.groups[i] : i
                    }-${j.toString()}`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <circle
                      r={markerRadius * 2 + 0.5}
                      fill={thisFill}
                      cy={c as number}
                      fillOpacity={Math.min(
                        0.5,
                        Math.max(
                          ((area?.strokeOpacity || 0.9) as number) - 0.35,
                          0
                        )
                      )}
                    />
                    <circle
                      r={markerRadius}
                      fill={thisFill}
                      stroke={markerStroke}
                      strokeWidth={markerRadius / 3.2}
                      cy={c as number}
                      fillOpacity={area?.strokeOpacity || 0.9}
                      strokeOpacity={0.7}
                      data-testid='__gg_geom_area_marker_point'
                    />
                  </g>
                )
              )
            })
          })}
        </g>
      )}
    </>
  ) : null
}
