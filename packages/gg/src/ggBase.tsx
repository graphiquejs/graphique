import React, { cloneElement, useEffect, useMemo } from "react"
import flattenChildren from "react-flatten-children"
import { scaleLinear, scaleTime, scaleBand } from "@visx/scale"
import { extent } from "d3-array"
import { isDate } from "@graphique/util"
import { AxisLeft, AxisBottom } from "@visx/axis"
import { Grid } from "@visx/grid"
// import { Scale } from "@visx/grid/lib/types"
// import { GenericScale } from "@visx/axis/lib/types"
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil"
import {
  dataState,
  aesState,
  labelsState,
  scalesState,
  themeState,
  layoutState,
} from "./"

export type Aes = {
  x: (d: any) => any
  y: (d: any) => any
  stroke?: (d: any) => any
  size?: (d: any) => any
  fill?: (d: any) => any
  group?: (d: any) => any
  label?: (d: any) => string
  key?: (d: any) => unknown
}

export type GGProps = {
  /** the data used to create the base, an array of objects */
  data: unknown[]
  /** the mapping of data characteristics to visual characteristics */
  aes: Aes
  width?: number
  height?: number
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  parentWidth?: number
  useParentWidth?: boolean
  onMouseOver?: ({ x0, y0 }: { x0?: any; y0?: any }) => void
  onMouseOut?: () => void
  id?: string
}

export const GGBase: React.FC<GGProps> = ({
  data,
  aes,
  width,
  height,
  margin,
  parentWidth,
  useParentWidth = false,
  onMouseOver,
  onMouseOut,
  id,
  children,
}) => {
  const setDataState = useSetRecoilState(dataState)
  const setAesState = useSetRecoilState(aesState)
  const [layout, setLayoutState] = useRecoilState(layoutState)

  const ggData = useMemo(() => {
    return (
      aes.key ?
      data : 
      data.map((d: any, i) => {
        return ({
          ...d,
          key: i
        })
      })
    )
  }, [data, aes])

  useEffect(() => setDataState(ggData as []), [setDataState, ggData])
  useEffect(() => {
    setAesState(prevAes => {
      return ({
        ...prevAes,
        ...aes
      })
    })
  }, [setAesState, aes])

  const labels = useRecoilValue(labelsState)
  const { 
    font,
    grid,
    axis,
    axisX,
    axisY,
    titleColor
   } = useRecoilValue(themeState)
  const scales = useRecoilValue(scalesState)

  useEffect(() => {
    setLayoutState((l: any) => {
      return {
        width: useParentWidth ? parentWidth : width || l.width,
        height: height || l.height,
        margin: margin ? {...l.margin, ...margin} : l.margin,
        parentWidth: parentWidth || l.parentWidth,
        id,
      } as any
    })
  }, [setLayoutState, width, height, margin, useParentWidth, parentWidth, id])

  const { height: ggHeight, margin: ggMargin } = layout
  let ggWidth
  if (useParentWidth) {
    ggWidth = layout.parentWidth
  } else {
    ggWidth = layout.width
  }

  // const {
  // tooltipData,
  // tooltipLeft,
  // tooltipTop,
  // tooltipOpen,
  // showTooltip,
  // hideTooltip,
  // } = useTooltip()

  let geoms: React.ReactNode[] = []
  let otherChildren: React.ReactNode[] = []

  flattenChildren(children).forEach((child) => {
    const childName = (child as any)?.type?.displayName
    if (childName && childName.includes("Geom")) {
      geoms.push(child)
    } else {
      otherChildren.push(child)
    }
  })

  let xScale: any
  const firstX = data.map(aes.x).find((d: any) => d !== null && d !== undefined)
  if (isDate(firstX)) {
    xScale = scaleTime({
      range: [ggMargin.left, ggWidth - ggMargin.right],
      domain: scales?.x?.domain || extent(data, aes.x) as [Date, Date] || [0, 1],
    })
  } else if (!firstX || typeof firstX === "number") {
    const xScaleType = scales?.x?.type || scaleLinear
    xScale = xScaleType({
      range: [ggMargin.left, ggWidth - ggMargin.right],
      domain: scales?.x?.domain || extent(data, aes.x) as [number, number],
    })
  } else if (typeof firstX === "string") {
    xScale = scaleBand({
      range: [ggMargin.left, ggWidth - ggMargin.right],
      domain: scales?.x?.domain || data.map(aes.x),
      padding: 0.4,
    })
  }

  let yScale: any
  if (aes.y) {
    const firstY = data.map(aes.y).find((d) => d !== null && d !== undefined)

    if (!firstY || typeof firstY === "number") {
      yScale = scaleLinear({
        range: [ggHeight - ggMargin.top - ggMargin.bottom, ggMargin.bottom],
        domain: scales?.y?.domain || extent(data, aes.y) as [number, number] || [0, 1],
        nice: true,
      })
    } else if (typeof firstY === "string") {
      yScale = scaleBand({
        range: [ggMargin.bottom, ggHeight - ggMargin.top - ggMargin.bottom],
        domain: scales?.y?.domain || data.map(aes.y),
        padding: 0.2,
      })
    }
  } else {
    yScale = scaleLinear({
      range: [ggHeight - ggMargin.top - ggMargin.bottom, ggMargin.bottom],
      domain: scales?.y?.domain || [0, 1],
    })
  }


  return ggWidth > 0 ? (
    <div style={{ position: "relative" }}>
      {/* {labels?.title && ( */}
      <div
        style={{
          marginBottom: 4,
          color: titleColor,
          fontFamily: font?.family,
        }}
      >
        {labels?.title}
      </div>
      {/* )} */}
      {/* {labels.y !== null && ( */}
      <div
        style={{
          marginLeft: 8,
          marginBottom: 2,
          fontSize: 11.5,
          fontFamily: font?.family,
          lineHeight: 1.2,
          color: axis?.labelColor || axisY?.labelColor,
          minHeight: 20,
          fontWeight: 600,
        }}
      >
        {labels?.y}
      </div>
      {/* )} */}
      <svg width={ggWidth} height={ggHeight}>
        <g>
          {data.length && (
            <Grid
              top={0}
              left={ggMargin.left}
              xScale={xScale}
              yScale={yScale}
              stroke={grid?.stroke ? grid?.stroke : "transparent"}
              width={ggWidth - ggMargin.left - ggMargin.right}
              height={ggHeight - ggMargin.bottom}
              numTicksRows={
                // aes.y ?
                scales?.y?.numTicks ||
                (ggHeight > 500 ? 5 : ggHeight > 220 ? 4 : 2)
                // : 0
              }
              // numTicksColumns={
              //   scales?.x?.numTicks || ggWidth > 500
              //     ? 4
              //     : ggWidth > 200
              //     ? 2
              //     : ggWidth > 100
              //     ? 1
              //     : 0
              // }
              numTicksColumns={0}
            />
          )}
          <>
            <g>
              <AxisBottom
                top={ggHeight - ggMargin.top - ggMargin.bottom}
                left={0}
                scale={xScale}
                hideAxisLine={
                  axisX
                    ? typeof axisX?.hideAxisLine !== "undefined"
                      ? axisX.hideAxisLine
                      : undefined
                    : axis?.hideAxisLines
                }
                // numTicks={0}
                stroke={axisX?.stroke || axis?.stroke}
                numTicks={
                  scales?.x?.numTicks || ggWidth > 500
                    ? 4
                    : ggWidth > 200
                    ? 2
                    : ggWidth > 100
                    ? 1
                    : 0
                }
                tickStroke={
                  grid?.stroke || axisX?.tickStroke || axis?.tickStroke
                }
                tickLength={grid?.stroke ? ggHeight : 8}
                tickTransform={`translate(0, ${
                  grid?.stroke ? -(ggHeight - 2) : 0
                })`}
                tickFormat={
                  scales?.x?.format
                    ? (v: any) => {
                        return scales.x.format(v)
                      }
                    : undefined
                }
                tickLabelProps={() => {
                  return {
                    fill: axis?.tickLabelColor || axisX?.tickLabelColor,
                    textAnchor: "middle",
                    fontSize: 11,
                    fontFamily: font?.family,
                    dy: "0.25em",
                  }
                }}
                tickComponent={({ formattedValue, ...tickProps }) => {
                  return <text {...tickProps}>{formattedValue}</text>
                }}
              />
              {/* {labels.x !== null && ( */}
              <g>
                <text
                  style={{
                    transform: `translate(${ggMargin.left + 2}px, ${
                      ggHeight - 4
                    }px)`,
                    pointerEvents: "none",
                    fontFamily: font?.family,
                    fontSize: 11.5,
                    fill: axis?.labelColor || axisX?.labelColor,
                    fontWeight: 600,
                  }}
                >
                  {labels?.x}
                </text>
              </g>
              {/* )} */}
            </g>
            {/* {data.length &&  */}
            <g>
              <AxisLeft
                top={0}
                left={ggMargin.left}
                scale={yScale}
                // hideZero
                numTicks={
                  // aes.y ?
                  scales?.y?.numTicks ||
                  (ggHeight > 500 ? 5 : ggHeight > 220 ? 4 : 2)
                  // : 0
                }
                hideAxisLine={
                  axisY
                    ? typeof axisY?.hideAxisLine !== "undefined"
                      ? axisY.hideAxisLine
                      : undefined
                    : axis?.hideAxisLines
                }
                stroke={axisY?.stroke || axis?.stroke}
                tickStroke={axisY?.tickStroke || axis?.tickStroke}
                tickFormat={
                  scales?.y?.format
                    ? (v: any) => {
                        return scales.y.format(v)
                      }
                    : undefined
                }
                tickLabelProps={
                  // (value, index) =>
                  () => ({
                    fill: axis?.tickLabelColor || axisY?.tickLabelColor,
                    textAnchor: "end",
                    fontSize: 11,
                    fontFamily: font?.family,
                    dx: "-0.25em",
                    dy: "0.25em",
                  })
                }
                tickComponent={({ formattedValue, ...tickProps }) => (
                  <text {...tickProps}>{formattedValue}</text>
                )}
              />
            </g>
          </>
        </g>
        <g>
          {geoms.map((c: any, i: number) => {
            return cloneElement(c, {
              key: `geom-${i}`,
              scales: { x: xScale, y: yScale },
              id: id,
            })
          })}
        </g>
      </svg>
      {/* tooltip portals */}
      <div style={{ position: "relative" }}>
        <div id={`__gg-tooltip-x-${id}`} />
        <div id={`__gg-tooltip-y-${id}`} />
      </div>

      {/* other types of children */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: ggHeight,
          pointerEvents: "none",
        }}
      >
        {otherChildren}
      </div>
    </div>
  ) : null
}
