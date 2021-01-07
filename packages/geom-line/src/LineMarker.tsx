import React from "react"
import { Line } from "@visx/shape"
import { useRecoilValue } from "recoil"
import { themeState, layoutState } from "@graphique/gg"

type Props = {
  left: number
  y: (d: any) => number
  markerRadius: number
  markerFill: (g: string) => string
  markerData: any[]
  strokeOpacity: number
}

export const LineMarker: React.FC<Props> = ({
  left,
  y,
  markerData,
  markerFill,
  markerRadius,
  strokeOpacity
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
      {markerData.map((g, i) => {
        const groupY = markerData.find((d: any) => d.group === g.group)
        const yVal = groupY ? y(groupY) : undefined
        return (
          g.group && yVal ? 
          <g key={`linemarker-${i}`}>
            <circle
              cx={left}
              cy={y(groupY)}
              r={markerRadius}
              fill={markerFill(g.group)}
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
          :
          null
        )
      })}
    </>
  )
}