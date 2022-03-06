import React, { useMemo } from 'react'
import {
  useGG,
  tooltipState,
  themeState,
  TooltipContent,
  XTooltip,
  YTooltip,
  TooltipContainer,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { mean, sum } from 'd3-array'
import { DefaultTooltip } from './DefaultTooltip'

export { LineMarker } from './LineMarker'

interface Props {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
}

export const Tooltip = ({ x, y }: Props) => {
  const { ggState } = useGG() || {}
  const { id, copiedScales, height, margin, aes } = ggState || {
    height: 0,
  }

  const [{ datum, position, xAxis, xFormat, yFormat, content }] =
    useAtom(tooltipState)

  const [{ geoms, defaultStroke }] = useAtom(themeState)
  const { area } = geoms || {}

  const left = useMemo(() => datum && x(datum[0]), [datum, x])
  const hasYVal = useMemo(() => datum?.some(y), [datum, y])

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

              thisYCoord = copiedScales?.yScale(yTotal)
            } else if (area?.position === 'fill' && aes?.y) {
              const yTotal = stacks
                .slice(0, i + 1)
                .map(
                  (s) =>
                    // @ts-ignore
                    aes.y(s) / sum(stacks, aes.y)
                )
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = copiedScales?.yScale(yTotal)
            } else {
              thisYCoord = y(d)
            }
            return thisYCoord
          })
        )) ||
      0,
    [datum, y]
  )

  const xVal = useMemo(
    () => datum && datum[0] && aes?.x && aes.x(datum[0]),
    [datum, aes]
  )

  const group = useMemo(
    () =>
      aes?.group ||
      aes?.fill ||
      aes?.stroke ||
      aes?.strokeDasharray ||
      (() => '__group'),
    [aes]
  )

  const areaVals = useMemo(() => {
    const vals =
      datum &&
      datum
        .filter((d) => aes?.y && aes.y(d))
        .map((md) => {
          const thisGroup = group(md)

          const mark = (
            <svg width={15} height={15}>
              <rect
                transform="translate(1, 1)"
                width={12}
                height={12}
                fill={
                  area?.fill ||
                  (copiedScales?.fillScale
                    ? copiedScales.fillScale(thisGroup)
                    : 'none')
                }
                stroke={
                  area?.stroke ||
                  (copiedScales?.strokeScale
                    ? copiedScales.strokeScale(thisGroup)
                    : 'none')
                }
                strokeDasharray={
                  area?.strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(thisGroup)
                    : undefined)
                }
                strokeWidth={area?.strokeWidth}
                fillOpacity={area?.fillOpacity}
                strokeOpacity={area?.strokeOpacity}
              />
            </svg>
          )
          return {
            group: copiedScales?.groupAccessor(md),
            mark,
            x: xVal,
            y: aes?.y && aes.y(md),
            formattedY: aes?.y && (yFormat ? yFormat(aes.y(md)) : aes.y(md)),
            formattedX: xFormat ? xFormat(xVal) : xVal.toString(),
          }
        })
    return vals as TooltipContent[]
  }, [datum, xVal, aes, yFormat, xFormat, copiedScales, geoms, defaultStroke])

  const tooltipValue = content ? (
    <div>{content(areaVals)}</div>
  ) : (
    <DefaultTooltip data={areaVals} hasXAxisTooltip={!!xAxis} />
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