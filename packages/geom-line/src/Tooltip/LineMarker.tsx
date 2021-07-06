import React, { useMemo } from 'react'
import { useGG, tooltipState, themeState } from '@graphique/graphique'
import { useAtom } from 'jotai'

export interface LineMarkerProps {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  markerRadius: number
  markerStroke: string
  onDatumFocus?: (data: unknown) => void
}

export const LineMarker = ({
  x,
  y,
  markerRadius,
  markerStroke,
}: LineMarkerProps) => {
  const { ggState } = useGG() || {}
  const { aes, copiedScales, height, margin } = ggState || {}

  const [{ datum }] = useAtom(tooltipState)
  const [{ defaultStroke, geoms }] = useAtom(themeState) || {}

  const { line } = geoms || {}

  const left = useMemo(() => datum && x(datum[0]), [datum, x])

  return height && margin ? (
    <>
      {left && datum && (
        <>
          <line
            x1={left}
            x2={left}
            y1={height - margin.bottom}
            y2={margin.top}
            strokeDasharray={2}
            stroke="#888"
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
          />
          {datum.map((d, i) => {
            const thisFill =
              line?.stroke ||
              (copiedScales?.strokeScale && aes?.stroke
                ? copiedScales.strokeScale(aes.stroke(d))
                : defaultStroke)
            return (
              x(d) &&
              y(d) && (
                <circle
                  key={
                    copiedScales?.groups ? copiedScales.groups[i] : undefined
                  }
                  style={{ pointerEvents: 'none' }}
                  r={markerRadius}
                  fill={thisFill}
                  stroke={markerStroke}
                  strokeWidth={markerRadius / 3.2}
                  cx={x(d)}
                  cy={y(d)}
                  fillOpacity={line?.strokeOpacity || 0.9}
                  strokeOpacity={0.92}
                />
              )
            )
          })}
        </>
      )}
    </>
  ) : null
}
