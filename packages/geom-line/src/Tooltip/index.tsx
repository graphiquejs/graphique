import React, { useMemo } from "react"
import { useRecoilValue } from "recoil"
import { 
  layoutState,
  tooltipState,
  aesState,
  TooltipContainer,
  XTooltip,
  YTooltip,
} from "@graphique/gg"
import { Line } from "@visx/shape"
import { bisector, mean } from "d3-array"
import { DefaultTooltip } from "./DefaultTooltip"
import { LineMarker } from "../LineMarker"

type Props = {
  data: any[]
  group: (d: any) => string
  x: (d: any) => number
  y: (d: any) => number
  b: (d: any) => number
  markerRadius: number
  strokeOpacity: number
  thisStrokeScale: (d: any) => string
  thisSizeScale: (d: any) => number
  thisDashArrayScale: (d: any) => string
  stroke: string
}

export const Tooltip: React.FC<Props> = ({
  data,
  group,
  x,
  y,
  b,
  markerRadius,
  strokeOpacity,
  thisStrokeScale,
  thisSizeScale,
  thisDashArrayScale,
  stroke
}) => {

  const { x0, position, xAxis, content, yFormat, xFormat } = useRecoilValue(tooltipState)
  const { id, margin, height } = useRecoilValue(layoutState)
  const { y: yAcc } = useRecoilValue(aesState)

  const bisectX = bisector(b).left
  const xIndex = useMemo(() => bisectX(data, x0, 1), [data, x0, bisectX])
  const tooltipData = useMemo(() => data[xIndex - 1], [data, xIndex])
  const tooltipLeft = useMemo(() => x(tooltipData), [x, tooltipData])

  const markerData = useMemo(() => tooltipData && 
    data.filter((d: any) => +x(d) === x(tooltipData))
      .map((d: any) => {
        return {...d, group: group(d)}
      }),
    [data, x, tooltipData, group]
  )
    
  const meanYval = useMemo(() => mean(markerData.map(y)) || 0, [markerData, y])
  const xVal = useMemo(() => b(tooltipData), [b, tooltipData])

  const lineVals = useMemo(() => {
    const vals = (
      markerData.filter((d: any) => yAcc(d)).map((md: any) => {
        const mark = (
          <svg height={8} width={24}>
            <Line
              from={{ x: 0, y: 4 }}
              to={{ x: 24, y: 4}}
              stroke={thisStrokeScale(group(md))}
              strokeWidth={thisSizeScale(group(md))}
              strokeDasharray={thisDashArrayScale(group(md))}
            />
          </svg>
        )
        return { 
          group: group(md),
          mark,
          x: xVal,
          y: yAcc(md),
          formattedY: yFormat ? yFormat(yAcc(md)) : yAcc(md),
          formattedX: xFormat ? xFormat(xVal) : xVal.toString()
        }
      })
    )
    return vals

  }, [
    markerData,
    group,
    xVal,
    yAcc,
    thisDashArrayScale,
    thisStrokeScale,
    thisSizeScale,
    yFormat,
    xFormat
  ])
  
  return x0 ? (
    <>
      <LineMarker
        left={tooltipLeft}
        y={y}
        markerData={markerData}
        markerFill={(g) => (g === "__group" ? stroke : thisStrokeScale(g))}
        markerRadius={markerRadius}
        strokeOpacity={strokeOpacity}
      />
      {xAxis && (
        <XTooltip
          id={id}
          left={tooltipLeft}
          top={-margin.bottom - 5}
          value={
            typeof xAxis === "boolean" ? (
              <TooltipContainer>
                {xFormat ? xFormat(xVal) : xVal.toString()}
              </TooltipContainer>
            ) : (
              xAxis({ x: xVal })
            )
          }
        />
      )}
      {markerData.some(yAcc) && (
        <YTooltip
          id={id}
          left={tooltipLeft}
          top={position === "data" ? -(height - meanYval) : -height}
          value={
            content ? (
              content({ data: lineVals })
            ) : (
              <DefaultTooltip
                data={lineVals}
                hasXAxisTooltip={xAxis ? true : false}
              />
            )
          }
        />
      )}
    </>
  ) : null
}