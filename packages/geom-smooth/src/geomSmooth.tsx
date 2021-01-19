import React, { useMemo, useCallback, useEffect, useRef } from "react"
import { LinePath, Area } from "@visx/shape"
import { scaleOrdinal } from "@visx/scale"
import { curveMonotoneX } from "@visx/curve"
import { useRecoilValue, useSetRecoilState } from "recoil"
import { dataState, aesState, scalesState, themeState, EventField } from "@graphique/gg"
import { defaultCategoricalScheme } from "@graphique/util"
import Loess from "loess"
import { regressionLinear } from "d3-regression"
import { Tooltip } from "./Tooltip"
import { mean, sum, min, max } from "d3-array"
import { studentt } from "jstat"

type Props = {
  stroke?: string
  strokeOpacity?: number
  strokeDashArray?: string
  size?: number
  scales?: any
  fill?: string
  fillOpacity?: number
  method?: "loess" | "linear"
  span?: number
  band?: number
  bins?: number
  level?: number
  se?: boolean
  hideTooltip?: boolean
  markerRadius?: number
  onMouseOver?: ({ x0 }: any) => void
  onMouseOut?: () => void
}

const GeomSmooth: React.FC<Props> = (
  {
    stroke,
    strokeOpacity = 1,
    strokeDashArray,
    size = 2.5,
    scales,
    se = false,
    fill,
    fillOpacity = 0.2,
    method = "loess",
    span = 0.75,
    band = 0.8,
    bins = 80,
    level = 0.95,
    hideTooltip = false,
    markerRadius = 5,
    onMouseOver,
    onMouseOut
  }
) => {
  
  // state mgmt
  const { x: xScale, y: yScale } = scales
  const aes = useRecoilValue(aesState)
  const data = useRecoilValue(dataState)
  const { defaultStroke } = useRecoilValue(themeState)
  const {
    stroke: strokeScale,
    size: sizeScale,
    dashArray: dashArrayScale
  } = useRecoilValue(scalesState)
  const setScalesState = useSetRecoilState(scalesState)

  const levelRef = useRef(level)
  const validateInputs = useCallback(() => {
    if (level <= 0 || level >= 1) {
      levelRef.current = 0.95
      console.warn("level should be between 0 and 1. Using default level of 0.95")
    }
  }, [level])

  validateInputs()

  // useful functions
  const resetYScale = useCallback((type: "min" | "max", val: number) => {
    setScalesState((scales: any) => {
      return {
        ...scales,
        y: {
          ...scales.y,
          domain: type === "min" ? [val, yScale.domain()[1]] : [yScale.domain()[0], val]
        },
      }
    })
  }, [setScalesState, yScale])

  const x = (d: any) => xScale && xScale(d.x)
  const y = (d: any) => yScale && yScale(d.y)
  const y0 = (d: any) => yScale && yScale(d.y0)
  const y1 = (d: any) => yScale && yScale(d.y1)

  const group = useMemo(() => aes.group || aes.stroke || aes.fill || aes.size || ((d: any) => "__group"), [aes])

  let groups: string[] = useMemo(() => {
    let usableGroups = (
      group
        ? Array.from(new Set(data.map(group))).map(g => g === null ? "[null]" : g)
        : ["__group"]
    )

    const unusableGroups = usableGroups.filter(
      (g) => data.filter(d => group(d) === g)
        .filter((d, _, groupVals) => +aes.x(d) !== +aes.x(groupVals[0]) || aes.y(d) !== aes.y(groupVals[0]))
        .length <= 2
    )

    if (unusableGroups.length) {
      console.warn(
        `Excluding ${method} smoother for groups with not enough (unique) points: ${unusableGroups.map(ug => `'${ug}'`).join(", ")}`
      )
    }
    usableGroups = usableGroups.filter(usable => !unusableGroups.includes(usable))
    return usableGroups
  }, [data, group, method, aes])

  const thisStrokeScale = useMemo(() => {
    return (
      strokeScale?.scale ||
      scaleOrdinal({
        domain: group ? Array.from(new Set(data.map(group))).sort() : ["__group"],
        range: (strokeScale?.scheme || defaultCategoricalScheme) as string[],
      })
  )}, [strokeScale?.scale, strokeScale?.scheme])

  const thisSizeScale = scaleOrdinal({
    domain: groups,
    range: sizeScale ? sizeScale?.values as number[] : [size]
  })

  const thisDashArrayScale = scaleOrdinal({
    domain: groups,
    range: dashArrayScale?.values as string[]
  })

  let models: any[] = useMemo(() => [], [])

  const linReg = useMemo(() => {
    return (
      regressionLinear()
        .x((d: any) => +(aes.x(d)))
        .y((d: any) => parseFloat(aes.y(d)))
    )
  }, [aes])

  const getLinear = useCallback((dataGroup: any[]) => {

    const model = linReg(dataGroup)

    const dataGroupLabel = dataGroup
      .map((d) => group(d))
      .filter((d) => d)[0]

    models.push(
      { group: dataGroupLabel, model: {
        predict: model.predict,
        x: [[model[0][0], model[1][0]]],
      }}
    )

    const allXY: any[] = dataGroup
      .filter(
        (d: any) =>
          ![undefined, null, NaN].includes(aes.x(d)) &&
          ![undefined, null, NaN].includes(aes.y(d))
      )
      .map((d) => {
        return {x: +aes.x(d), y: aes.y(d)}
      })

    const allX = allXY.map(xy => xy.x)
    const allY = allXY.map(xy => xy.y)

    const fittedY: any[] = allX.map(x => model.predict(x))
    const rmse: any = Math.sqrt(
      sum(allX.map((_, i) => Math.pow(allY[i] - fittedY[i], 2))) / (allX.length - 2)
    )
    const tVal = studentt.inv(1 - (1 - levelRef.current)/2, allX.length - 2)
    const xSSE = sum(allX.map((x, i, xs) => Math.pow(x - (mean(xs) as number), 2)))

    let smoothedData: any[] = []
    allX.sort((a, b) => a < b ? -1 : 1).forEach((x: any, i: number, xs) => {

      const fittedY = model.predict(x)
      
      const standardError = rmse * Math.sqrt(
       (1 / allX.length + Math.pow(x - (mean(xs) as number), 2) / xSSE)
      )

      const bound = tVal * standardError

      const xY = {
        x,
        y: fittedY,
        y0: fittedY - bound,
        y1: fittedY + bound,
        group: dataGroupLabel,
      }
      smoothedData.push(xY)
    })

    return smoothedData

  }, [linReg, models, aes, group])

  const getLoess = useCallback((dataGroup: any[]) => {

    const allX: any[] = dataGroup.map((d: any) => +(aes.x(d)))
    const allY: any[] = dataGroup.map((d: any) => parseFloat(aes.y(d)))

    const dataGroupLabel = dataGroup.map(d => group(d)).filter(d => d)[0]

    const model: any = new Loess(
      // get rid of points with either missing x or y
      {
        x: allX.filter(
          (x: any, i: number) =>
            ![undefined, null, NaN].includes(x) &&
            ![undefined, null, NaN].includes(allY[i])
        ),
        y: allY.filter(
          (y: any, i: number) =>
            ![undefined, null, NaN].includes(y) &&
            ![undefined, null, NaN].includes(allX[i])
        ),
      },
      {
        span,
        band,
      }
    )

    models.push({ group: dataGroupLabel, model })

    const newX: any = model.grid([allX.length - 1 >= bins ? bins : allX.length - 1])
    const fit: any = model.predict(newX)

    let smoothedData: any[] = []
    newX.x.forEach((x: any, i: number) => {
      const xY = {
        x,
        y: fit.fitted[i],
        y0: fit.fitted[i] - fit.halfwidth[i],
        y1: fit.fitted[i] + fit.halfwidth[i],
        group: dataGroupLabel
      }
      smoothedData.push(xY)
    })

    return smoothedData

  }, [aes, band, bins, span, models, group])

  const smoothedData = useMemo(() => {
    return (
      groups.map(g => {
        const lineData = data.filter((d: any) => group(d) === g)

        let smoothed
        if (method === "loess") {
          smoothed = getLoess(lineData)
        } else if (method === "linear") {
          smoothed = getLinear(lineData)
        }
        return smoothed
      })
    ).flat()
  }, [data, groups, group, method, getLoess, getLinear])

  useEffect(() => {
    // reset y scales if necessary
    if (se && min(smoothedData, d => d.y0) < yScale.domain()[0]) {
      resetYScale("min", min(smoothedData, d => d.y0))
    } else if (se && max(smoothedData, d => d.y1) > yScale.domain()[1]) {
      resetYScale("max", max(smoothedData, d => d.y1))
    }
  }, [resetYScale, yScale, smoothedData, se])

  return (
    <>
      {groups.map((g, i) => {
        const thisSmoothedData = smoothedData.filter((d: any) => d.group === g)

        return (
          <g key={`smoother-${i}`} style={{pointerEvents: "none"}}>
            {se && (
              <Area
                data={thisSmoothedData}
                curve={curveMonotoneX}
                x={x}
                y0={y0}
                y1={y1}
                fill={
                  fill ||
                  (g !== "__group"
                    ? thisStrokeScale(g)
                    : stroke || defaultStroke)
                }
                fillOpacity={fillOpacity}
              />
            )}
            <LinePath
              data={thisSmoothedData}
              curve={curveMonotoneX}
              x={x}
              y={y}
              stroke={
                g !== "__group" ? thisStrokeScale(g) : stroke || defaultStroke
              }
              strokeOpacity={strokeOpacity}
              strokeWidth={thisSizeScale(g)}
              strokeDasharray={
                g !== "__group" && dashArrayScale?.values
                  ? thisDashArrayScale(g)
                  : strokeDashArray
              }
            />
          </g>
        )
      })}
      {!hideTooltip && (
        <>
          <Tooltip
            data={method === "loess" ? smoothedData : models}
            method={method}
            // group={(d: any) => d.group}
            x={x}
            y={y}
            b={(d: any) => d.x}
            models={models}
            markerRadius={markerRadius}
            strokeOpacity={strokeOpacity}
            fillOpacity={se ? fillOpacity : 0}
            stroke={stroke || defaultStroke as string}
            thisStrokeScale={thisStrokeScale}
            thisSizeScale={thisSizeScale}
            thisDashArrayScale={thisDashArrayScale}
            size={size}
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

GeomSmooth.displayName = "GeomSmooth"
export { GeomSmooth }
