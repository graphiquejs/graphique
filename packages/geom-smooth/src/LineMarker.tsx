import React from "react"
import { Line } from "@visx/shape"
import { useRecoilValue } from "recoil"
import { themeState, layoutState } from "@graphique/gg"

type Props = {
  left: number
  y: (d: any) => number
  markerRadius: number
  markerFill: (g: string) => string
  lineVals: any[]
  strokeOpacity: number
}

export const LineMarker: React.FC<Props> = ({
  left,
  y,
  lineVals,
  markerFill,
  markerRadius,
  strokeOpacity,
}) => {
  const { markerStroke } = useRecoilValue(themeState)
  const { height, margin } = useRecoilValue(layoutState)

  return (
    <>
      <g>
        <Line
          from={{ x: left, y: 0 }}
          to={{
            x: left,
            y: height - margin.top - margin.bottom,
          }}
          stroke="#888"
          strokeWidth={1.5}
          style={{ pointerEvents: "none" }}
          strokeDasharray="2,2"
        />
      </g>
      {lineVals.map((line) => {
        const { group, isOutsideBounds, y: yVal } = line
        return group && !isOutsideBounds ? (
          <g key={`linemarker-${group}`}>
            <circle
              cx={left}
              cy={y({y: yVal})}
              r={markerRadius}
              fill={markerFill(group)}
              fillOpacity={strokeOpacity || 0.9}
              stroke={markerStroke}
              strokeOpacity={0.92}
              strokeWidth={markerRadius / 3.2}
              style={{ pointerEvents: "none" }}
            />
            {/* <circle
              cx={left}
              cy={y(groupY)}
              r={markerRadius + markerRadius / 2.4 - 0.5}
              fill="none"
              stroke="#aaa"
              strokeWidth={0.5}
              style={{ pointerEvents: "none" }}
            /> */}
          </g>
        ) : null
      })}
    </>
  )
}
