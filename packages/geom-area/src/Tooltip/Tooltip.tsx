import React, { useMemo } from 'react'
import {
  useGG,
  tooltipState,
  themeState,
  TooltipContent,
  XTooltip,
  YTooltip,
  TooltipContainer,
  DataValue,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { mean, sum, min } from 'd3-array'
import { DefaultTooltip } from './DefaultTooltip'
import type { GeomAes } from '../types'

export { LineMarker } from './LineMarker'

interface Props {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  y0: DataValue
  y1: DataValue
  aes: GeomAes
  group?: DataValue
  geomID: string
}

export const Tooltip = ({ x, y, y0, y1, aes, group, geomID }: Props) => {
  const { ggState } = useGG() || {}
  const { id, scales, copiedScales, width, height, margin } = ggState || {
    height: 0,
  }

  const [{ datum, position, xAxis, xFormat, yFormat, content }] =
    useAtom(tooltipState)

  const [{ geoms, defaultStroke, defaultFill }] = useAtom(themeState)
  const { area } = geoms || {}

  const left = useMemo(
    () =>
      min([
        datum && x(datum[0]),
        width && margin?.right && width - margin.right,
      ] as number[]),
    [datum, x, width]
  )

  const hasYVal = useMemo(
    () => datum?.some(y1) || datum?.some(y),
    [datum, y, y1]
  )

  const meanYVal = useMemo(
    () =>
      (datum &&
        mean(
          datum.map((d, i, stacks) => {
            let thisYCoord

            // stacked area (sum)
            if (area?.position === 'stack') {
              const yTotal = stacks
                .slice(0, i + 1)
                // @ts-ignore
                .map(aes.y)
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = scales?.yScale(yTotal)
            } else if (area?.position === 'fill' && aes?.y) {
              const yTotal = stacks
                .slice(0, i + 1)
                .map(
                  (s) =>
                    // @ts-ignore
                    aes.y(s) / sum(stacks, aes.y)
                )
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = scales?.yScale(yTotal)
            } else if (aes.y0 && aes.y1) {
              thisYCoord = mean([y0(d), y1(d)] as [number, number])
            } else {
              thisYCoord = y(d)
            }
            return thisYCoord
          })
        )) ||
      0,
    [datum, y, y0, y1]
  )

  const xVal = useMemo(
    () => datum && datum[0] && aes?.x && aes.x(datum[0]),
    [datum, aes]
  )

  const areaVals = useMemo(() => {
    const vals =
      datum &&
      datum
        .filter(
          (d) =>
            (aes?.y1 &&
              typeof aes.y1(d) !== 'undefined' &&
              aes.y1(d) !== null) ||
            (aes?.y && typeof aes.y(d) !== 'undefined' && aes.y(d) !== null)
        )
        .map((md) => {
          const thisGroup = group ? group(md) : undefined

          let formattedY

          if (aes?.y) {
            formattedY = yFormat ? yFormat(aes.y(md)) : aes.y(md)
          }

          if (aes?.y1) {
            formattedY = yFormat ? yFormat(aes.y1(md)) : aes.y1(md)
          }

          const mark = (
            <svg width={15} height={15}>
              <rect
                transform="translate(1, 1)"
                width={12}
                height={12}
                fill={
                  area?.fill ||
                  (area?.fillScale && area.fillScale(thisGroup)) ||
                  (copiedScales?.fillScale
                    ? copiedScales.fillScale(thisGroup)
                    : defaultFill)
                }
                stroke={
                  area?.stroke ||
                  (area?.strokeScale && area.strokeScale(thisGroup)) ||
                  (copiedScales?.strokeScale
                    ? copiedScales.strokeScale(thisGroup)
                    : defaultStroke)
                }
                strokeDasharray={
                  area?.strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(thisGroup)
                    : undefined)
                }
                strokeWidth={0.6}
                fillOpacity={area?.fillOpacity}
                strokeOpacity={area?.strokeOpacity}
              />
            </svg>
          )
          return {
            group:
              (group && group(md)) ||
              (copiedScales?.groupAccessor && copiedScales.groupAccessor(md)),
            mark: group ? mark : undefined,
            x: xVal,
            y: (aes?.y1 && aes?.y1(md)) || (aes?.y && aes.y(md)),
            formattedY,
            formattedX: xFormat ? xFormat(xVal) : xVal.toString(),
          }
        })
    return vals as TooltipContent[]
  }, [
    datum,
    xVal,
    aes,
    yFormat,
    xFormat,
    copiedScales,
    geoms,
    defaultStroke,
    group,
  ])

  const tooltipValue = content ? (
    <div>{content(areaVals)}</div>
  ) : (
    <DefaultTooltip data={areaVals} hasXAxisTooltip={!!xAxis} geomID={geomID} />
  )

  return datum ? (
    <>
      {xAxis && margin && left && (
        <XTooltip
          id={id as string}
          left={left}
          top={-margin.bottom}
          value={
            typeof xAxis === 'boolean' ? (
              <TooltipContainer>{xFormat && xFormat(xVal)}</TooltipContainer>
            ) : (
              xAxis(xVal)
            )
          }
        />
      )}
      {left && hasYVal && (
        <YTooltip
          id={id as string}
          left={left}
          top={position === 'data' ? -(height - meanYVal) : -height}
          value={tooltipValue}
          wait
        />
      )}
    </>
  ) : null
}
