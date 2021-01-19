import React, {
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react"
import { LinePath } from "@visx/shape"
import { scaleOrdinal } from "@visx/scale"
import { defaultCategoricalScheme } from "@graphique/util"
import { dataState, aesState, scalesState, themeState, EventField } from "@graphique/gg"
import { useRecoilValue, useRecoilState } from "recoil"
import { Tooltip } from "./Tooltip"
import { useSpring, animated } from "react-spring"
import { range } from "d3-array"

export type LineProps = {
  data?: unknown[],
  stroke?: string
  strokeOpacity?: number
  strokeDashArray?: string
  size?: number
  scales?: any // cloned from ggBase
  id?: string // cloned from ggBase
  curve?: any
  markerRadius?: number
  hideTooltip?: boolean
  animate?: boolean
  onMouseOver?: ({ x0 }: any) => void
  onMouseOut?: () => void
}

const GeomLine: React.FC<LineProps> = ({
  data,
  stroke,
  strokeOpacity = 1,
  strokeDashArray,
  size,
  scales,
  id,
  curve,
  markerRadius = 5,
  hideTooltip = false,
  animate = false,
  onMouseOver,
  onMouseOut
}) => {

  const { x: xScale, y: yScale } = useMemo(() => scales, [scales])

  const ggData = useRecoilValue(dataState)

  const geomData = useMemo(() => data || ggData, [data, ggData])
  const aes = useRecoilValue(aesState)
  const { defaultStroke } = useRecoilValue(themeState)

  const [statefulScales, setStatefulScales] = useRecoilState(scalesState)
  const {
    stroke: strokeScale,
    size: sizeScale,
    dashArray: dashArrayScale,
    groups,
  } = useMemo(() => statefulScales, [statefulScales])

  const defaultSize = 2.5

  const x = useCallback((d: any) => xScale && aes.x(d) ? xScale(aes.x(d)) : 0, [xScale, aes])
  const y = useCallback((d: any) => yScale && aes.y(d) ? yScale(aes.y(d)) : undefined, [yScale, aes])

  const group = useMemo(() => aes.group || aes.stroke || aes.size || ((d: any) => "__group"), [aes])

  const calculatedGroups: string[] = useMemo(() => {
    return (
      group
      ? Array.from(new Set(ggData.map(group))).map(g => g === null ? "[null]" : g).sort()
      : ["__group"]
    )
  }, [group, ggData])

  useEffect(() => {
    setStatefulScales((scales: any) => {
      return {
        ...scales,
        groups: calculatedGroups,
      }
    })
    if (animate) {
      setShouldAnimate(true)
      return () => setShouldAnimate(false)
    }
  }, [setStatefulScales, calculatedGroups, animate])

  const [pathLengths, setPathLengths] = useState<{group: string, pathLength: number}[] | null>(null)

  const [shouldAnimate, setShouldAnimate] = useState<boolean>(false)
  const [finishedAnimating, setFinishedAnimating] = useState<boolean>(false)
  const spring = useSpring({
    frame: shouldAnimate ? 0 : 1,
    // config: config.molasses,
    config: { duration: 1500 },
    delay: 200,
    onRest: () => {
      setFinishedAnimating(true)
    }
  })

  useLayoutEffect(() => {
    if (animate) {
      const pathLengths = groups?.map((g: string) => {
        const lineData = geomData.filter((d: any) => group(d) === g)
        if (lineData.length) {
          const path = document.getElementById(`geom-line-${id}-${g}`) as unknown as (SVGPathElement | null)
          return { group: g, pathLength: path?.getTotalLength() as number }
        }
      })
      .filter((pl: { group: string, pathLength: number }) => pl)

      setPathLengths(pathLengths)
      setShouldAnimate(true)
    }
  }, [geomData, xScale, yScale])

  const thisStrokeScale = strokeScale?.scale ||
    scaleOrdinal({
      domain: calculatedGroups,
      range: (strokeScale?.scheme ||
        (stroke
          ? [stroke]
          // : groups?.length === 1
          : aes.stroke
          ? defaultCategoricalScheme
          : [defaultStroke])) as string[],
    })

  const thisSizeScale = scaleOrdinal({
    domain: calculatedGroups,
    range: (
      sizeScale?.values ||
        (size
          ? [size]
          : aes.size
          ? range(2, 10)
          : [defaultSize]
        )) as number[]
  })

  const thisDashArrayScale = scaleOrdinal({
    domain: groups,
    range: dashArrayScale?.values as string[]
  })

  return (
    <>
      {groups?.map((g: string, i: number) => {

        const lineData = geomData.filter((d: any) => group(d) === g)
        const lineLength = pathLengths?.find(pl => pl.group === g)?.pathLength
    
        return lineData.length ? (
          <LinePath
            style={{ pointerEvents: "none" }}
            key={`${g}-line`}
            data={lineData}
            curve={curve}
            x={x}
            y={y}
            defined={(d: any) => {
              const un = [undefined, NaN, null]
              return !un.includes(aes.y(d)) && !un.includes(group(d))
            }}
          >
            {({ path }) => {
              const d = path(lineData) || ''
              
              return (
                <>
                  <path id={`geom-line-${id}-${g}`} d={d} fill="none" />
                  {
                    <animated.path
                      d={d}
                      fill="none"
                      stroke={
                        // g !== "__group" ? stroke : thisStrokeScale(g) || defaultStroke
                        thisStrokeScale(g)
                      }
                      strokeOpacity={strokeOpacity}
                      strokeWidth={thisSizeScale(g)}
                      strokeDashoffset={
                        animate && spring ?
                        spring?.frame?.interpolate(
                          (v: any) => v * (lineLength || 0)
                        )
                        :
                        undefined
                      }
                      strokeDasharray={
                        (animate && !finishedAnimating) ? lineLength :
                          g !== "__group" && dashArrayScale?.values
                          ? thisDashArrayScale(g)
                          : strokeDashArray
                      }
                    />
                  }
                </>
              )
            }}
          </LinePath>
        ) : null
      })}
      {!hideTooltip && geomData && aes.x && (
        <>
          <Tooltip
            data={geomData}
            group={group}
            x={x}
            y={y}
            b={aes.x}
            markerRadius={markerRadius}
            strokeOpacity={strokeOpacity}
            thisStrokeScale={thisStrokeScale}
            thisSizeScale={thisSizeScale}
            thisDashArrayScale={thisDashArrayScale}
            stroke={(stroke || defaultStroke) as string}
          />
          <EventField
            xScale={xScale}
            yScale={yScale}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
          />
        </>
      )}
    </>
  )
}

GeomLine.displayName = "GeomLine"
export { GeomLine }
