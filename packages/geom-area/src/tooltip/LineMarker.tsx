import React, { useMemo } from 'react'
import {
  useGG,
  tooltipState,
  themeState,
  DataValue,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { sum, min } from 'd3-array'
import type { GeomAes } from '../types'

export interface LineMarkerProps {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  y0: DataValue
  y1: DataValue
  aes: GeomAes
  markerRadius: number
  markerStroke: string
  // onDatumFocus?: (data: unknown) => void
}

export const LineMarker = ({
  x,
  y,
  y0,
  y1,
  aes,
  markerRadius,
  markerStroke,
}: LineMarkerProps) => {
  const { ggState } = useGG() || {}
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
  // const shouldStack = useMemo(
  //   () => area?.position && ['stack', 'fill', 'stream'].includes(area.position),
  //   [area]
  // )
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
          />
          {datum.map((d, i, stacks) => {
            let thisYCoord

            // stacked area (sum)
            if (area?.position === 'stack') {
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
              area?.fill ||
              (area?.fillScale && aes.fill && area.fillScale(aes.fill(d))) ||
              (copiedScales?.fillScale && aes?.fill
                ? copiedScales.fillScale(aes.fill(d))
                : defaultFill)

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
