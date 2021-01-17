import React, { useMemo, useState, useEffect, CSSProperties } from "react"
import { Circle } from "@visx/shape"
import { scaleSqrt, scaleOrdinal } from "@visx/scale"
// import { Drag } from "@visx/drag
import { extent } from "d3-array"
import { defaultCategoricalScheme } from "@graphique/util"
import { useRecoilValue, useRecoilState } from "recoil"
import { dataState, aesState, scalesState, themeState } from "@graphique/gg"
import { Voronoi } from "./Voronoi"
import { Tooltip } from "./Tooltip"

type Props = {
  data?: unknown[]
  stroke?: string
  strokeWidth?: number
  fill?: string
  opacity?: number
  strokeOpacity?: number
  size?: number
  scales?: any
  hideTooltip?: boolean
  focused?: any
  focusedStyle?: CSSProperties
  unfocusedStyle?: CSSProperties
  onFocus?: ({data}: {data: unknown}) => void
  onFocusSelection?: ({data}: {data: unknown}) => void
  onExit?: () => void
}

const GeomPoint: React.FC<Props> = ({
  data,
  stroke,
  strokeWidth,
  fill,
  opacity = 1,
  strokeOpacity,
  size = 2.5,
  scales,
  hideTooltip = false,
  focused,
  focusedStyle,
  unfocusedStyle,
  onFocus,
  onFocusSelection,
  onExit
}) => {

  const ggData = useRecoilValue(dataState)
  const geomData = data || ggData
  const aes = useRecoilValue(aesState)
  const { defaultFill } = useRecoilValue(themeState)
  const [statefulScales, setStatefulScales] = useRecoilState(scalesState)
  const { 
    fill: fillScale,
    stroke: strokeScale,
    size: sizeScale,
    groups
  } = useMemo(() => statefulScales, [statefulScales])

  // const [tooltip] = useRecoilState(tooltipState)
  // const { datum } = useMemo(() => tooltip, [tooltip])

  const { x: xScale, y: yScale } = scales

  const group = useMemo(
    () =>
      aes.group ||
      aes.fill ||
      aes.stroke ||
      aes.size ||
      ((d: any) => "__group"),
    [aes]
  )

  const calculatedGroups: string[] = group
    ? Array.from(new Set(geomData.map(group))).map((g) =>
        g === null ? "[null]" : g
      )
    : ["__group"]

  const radiusScale = useMemo(() => {
    return (
      scaleSqrt({
        domain: (aes.size && extent(geomData, aes.size)) as [number, number],
        range: (sizeScale?.range || [3, 30]) as [number, number],
      })
    )
  }, [geomData, aes.size, sizeScale])

  const r = useMemo(() => {
    return (d: any) => {
      return radiusScale && aes.size ? radiusScale(aes.size(d)) : size
    }
  }, [radiusScale, aes, size])

  const thisStrokeScale = useMemo(() => {
    return (
      scaleOrdinal({
          domain: groups,
          range: (strokeScale?.scheme ||
            (stroke
              ? [stroke]
              : groups?.length === 1
              ? [undefined]
              : defaultCategoricalScheme)) as string[],
      })
    )
  }, [groups, strokeScale, stroke])

  const thisStroke = useMemo(() => {
    return (
      (d: any) => {
        return (
          (thisStrokeScale && aes.stroke) ? thisStrokeScale(aes.stroke(d)) : stroke
        )
      }
    )
  }, [aes, thisStrokeScale, stroke])

  const thisFillScale = useMemo(() => {
    return (
      scaleOrdinal({
        domain: groups,
        range: (fillScale?.scheme ||
          (fill
            ? [fill]
            : groups?.length === 1
            ? [defaultFill]
            : defaultCategoricalScheme)) as string[],
      })
    )
  }, [groups, fillScale, fill, defaultFill])

  const thisFill = useMemo(() => {
    return (
      (d: any) => {
        return (
          (thisFillScale && aes.fill) ? thisFillScale(aes.fill(d)) : (fill || defaultFill)
        )
      }
    )}, [aes, thisFillScale, fill, defaultFill])

  const [focusedData, setFocusedData] = useState(focused || [])

  useEffect(() => {
    setFocusedData(focused || [])
  }, [focused])

  useEffect(() => {
    if (!groups) {
        setStatefulScales((scales: any) => {
        return ({
          ...scales,
          groups: calculatedGroups
        })
      })
    }
  }, [setStatefulScales, calculatedGroups, groups])

  // const [dragStartPos, setDragStartPos] = useState({x: 0, y: 0})
  const [dragDims] = useState({x: 0, y: 0})

  const focusable = useMemo(() => focusedData.length || dragDims.x > 3, [focusedData, dragDims])
  // const isMouseable = true

  const focusedStyles = {
    fillOpacity: 1,
    strokeOpacity: 1,
    ...focusedStyle
  }

  const unfocusedStyles = {
    fillOpacity: 0.15,
    strokeOpacity: 0.15,
    ...unfocusedStyle
  }

  return (
    geomData ?
      <>
        {/* <Drag
          resetOnStart
          width={0}
          height={0}
          onDragStart={({ x = 0, y = 0 }) => {
            if (dragDims.x > 3) setFocused([])

            setDragDims({x: 0, y: 0})
            setDragStartPos({x, y})
          }}
          onDragMove={({ x = 0, y = 0, dx, dy }) => {
            setDragDims({x: dx, y: dy})
          }}
        >
          {({
            x = 0,
            y = 0,
            dx,
            dy,
            isDragging,
            dragStart,
            dragEnd,
            dragMove,
          }) => {

            const isMouseable = !isDragging && dragDims.x === 0 && dragDims.y === 0

            return (
              <g
                onMouseDown={dragStart}
                onMouseUp={dragEnd}
                onMouseMove={dragMove}
                onTouchStart={dragStart}
                onTouchEnd={dragEnd}
                onTouchMove={dragMove}
                style={{
                  cursor:
                    isDragging && dragDims.x > 3 ? "crosshair" : undefined,
                }}
              > */}
        <g>
          {geomData.map((d: any, i: number) => {
            const isFocused = aes.key && focusedData.map(aes.key).includes(aes.key(d))

            return aes.x(d) && aes.y(d) ? (
              <Circle
                style={
                  focusable ?
                  (isFocused ? {...focusedStyles} : {...unfocusedStyles}) :
                  {pointerEvents: "none"}
                }
                key={`point-${i}`}
                fill={thisFill(d)}
                fillOpacity={opacity}
                strokeOpacity={strokeOpacity}
                stroke={thisStroke(d)}
                strokeWidth={strokeWidth}
                r={aes.size ? r(d) : size}
                cx={xScale(aes.x(d))}
                cy={yScale(aes.y(d))}
                // onMouseOver={}
              />
            ) : null
          })}
        </g>
        {!hideTooltip && (
          <>
            <Voronoi
              data={geomData}
              x={xScale}
              y={yScale}
              onMouseOver={({ d, i }: { d: any, i: number }) => {
                setFocusedData([d])
                onFocus && onFocus({data: d})
              }}
              onClick={
                onFocusSelection ? ({d, i}: {d: any, i: number}) => {
                  onFocusSelection({data: d})
                } : undefined}
              onMouseLeave={() => {
                setFocusedData([])
                onExit && onExit()
              }}
            />
            {focusedData && focusedData[0] && (
              <Tooltip group={group} datum={focusedData[0]} scales={scales} />
            )}
          </>
        )}
        {/* {dragDims.x > 3 && (
                  <rect
                    x={dragStartPos.x}
                    y={dragStartPos.y}
                    width={dragDims.x}
                    height={dragDims.y}
                    rx={0.5}
                    fill="#9c9c9c"
                    stroke="#cecece"
                    strokeWidth={1.2}
                    fillOpacity={0.2}
                    style={{ cursor: !isDragging ? "move" : undefined }}
                  />
                )} */}
        {/* </g>
            )
          }}
        </Drag> */}
    </> : null
    )
  }

GeomPoint.displayName = "GeomPoint"
export { GeomPoint }
