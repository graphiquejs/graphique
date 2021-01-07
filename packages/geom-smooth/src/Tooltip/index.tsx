import React, { useMemo } from "react"
import { Line } from "@visx/shape"
import { useRecoilValue } from "recoil"
import {
  tooltipState,
  layoutState,
  TooltipContainer,
  XTooltip,
  YTooltip
} from "@graphique/gg"
import { extent, mean } from "d3-array"
import { LineMarker } from "../LineMarker"
import { DefaultTooltip } from "./DefaultTooltip"

type Props = {
  data: any[]
  method: "loess" | "linear"
  // group: (d: any) => string
  x: (d: any) => number
  y: (d: any) => number
  b: (d: any) => number
  markerRadius: number
  strokeOpacity: number
  fillOpacity: number
  thisStrokeScale: (d: any) => string
  thisSizeScale: (d: any) => number
  thisDashArrayScale: (d: any) => string
  stroke: string
  size: number
  dashArray?: string
  models?: any
  position?: "data" | "top"
}

export const Tooltip: React.FC<Props> = ({
  data,
  method,
  x,
  y,
  b,
  markerRadius,
  strokeOpacity,
  fillOpacity,
  thisStrokeScale,
  thisSizeScale,
  thisDashArrayScale,
  stroke,
  size,
  dashArray,
  models
}) => {
  const { x0, content, xAxis, position, yFormat, xFormat } = useRecoilValue(tooltipState)
  const { height, id, margin } = useRecoilValue(layoutState)

  const xExtent = useMemo(() => extent(data, b) as [number, number], [data, b])
  const outsideX = useMemo(() => +x0 < xExtent[0] || +x0 > xExtent[1], [x0, xExtent])

  const lineVals = useMemo(() => x0 && 
    models.map((m: any) => {

      const modelBounds = extent(
        m.model.x[0] as number[]
      ) as [number, number]

      const isOutsideBounds =
        +x0 < modelBounds[0] || +x0 > modelBounds[1]

      const yVal = method === "loess" ? m.model.predict({ x: [+x0] }).fitted[0] : m.model.predict(+x0)

      const mark = (
        <svg height={20} width={20}>
          <rect
            width={20}
            height={20}
            fill={thisStrokeScale(m.group)}
            fillOpacity={fillOpacity}
          />
          <Line
            from={{ x: 0, y: 10 }}
            to={{ x: 24, y: 10 }}
            stroke={thisStrokeScale(m.group)}
            strokeWidth={thisSizeScale(m.group)}
            strokeDasharray={thisDashArrayScale(m.group)}
          />
        </svg>
      )

      return {
        group: m.group,
        mark,
        x: x({ x: x0 }),
        y: yVal,
        formattedY: yFormat ? yFormat(yVal) : yVal,
        formattedX: xFormat ? xFormat(x0) : x0.toString(),
        isOutsideBounds,
      }
    }).filter((line: any) => !line.isOutsideBounds),
    [
      models,
      x,
      x0,
      dashArray,
      fillOpacity,
      size,
      thisStrokeScale,
      thisSizeScale,
      thisStrokeScale,
      yFormat,
      method
    ]
  )

  const meanYval = useMemo(() => {
    return (
      lineVals && mean(
        lineVals.filter((l: any) => !l.isOutsideBounds)
          .map((l: any) => y({y: l.y}))
      )
    )
  }, [lineVals, y])

  return x0 && !outsideX ? (
    <>
      <LineMarker
        left={x({ x: x0 })}
        y={y}
        markerRadius={markerRadius}
        markerFill={(g) => (g === "__group" ? stroke : thisStrokeScale(g))}
        strokeOpacity={strokeOpacity}
        lineVals={lineVals}
      />
      {xAxis && (
        <XTooltip
          id={id}
          left={x({ x: x0 })}
          top={-margin.bottom - 5}
          value={
            typeof xAxis === "boolean" ? (
              <TooltipContainer>
                {xFormat ? xFormat(x0) : x0.toString()}
              </TooltipContainer>
            ) : (
              xAxis({ x: x0 })
            )
          }
        />
      )}
      {lineVals && lineVals.length && (
        <YTooltip
          id={id}
          left={x({ x: +x0 })}
          top={position === "data" && meanYval ? -(height - meanYval) : -height}
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