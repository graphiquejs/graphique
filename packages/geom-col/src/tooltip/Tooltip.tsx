import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import { min, sum } from 'd3-array'
import {
  useGG,
  tooltipState,
  TooltipContent,
  XTooltip,
  Aes,
  themeState,
} from '@graphique/graphique'
import { DefaultTooltip } from './DefaultTooltip'

export interface TooltipProps {
  y: (d: unknown) => number | undefined
  xAdj?: number
  aes?: Aes
}

export const Tooltip = ({ y, xAdj = 0, aes }: TooltipProps) => {
  const { ggState } = useGG() || {}
  const { id, scales, copiedScales, height, margin } = ggState || {
    width: 0,
    height: 0,
  }

  const [{ datum, xAxis, xFormat, yFormat, content }] = useAtom(tooltipState)

  const [{ geoms }] = useAtom(themeState)

  const xVal = useMemo(
    () => datum && datum[0] && aes?.x && aes.x(datum[0]),
    [datum, aes]
  )

  const xCoord = useMemo(
    () => (scales?.xScale(xVal) as number) + xAdj,
    [scales, xAdj, xVal]
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

  const yVal = useMemo(() => {
    if (geoms?.col?.position === 'fill') return scales?.yScale(1)
    if (
      geoms?.col?.position === 'stack' &&
      datum &&
      scales?.groups &&
      scales?.yScale
    ) {
      return scales.yScale(
        sum(datum.map((d) => aes?.y && (aes.y(d) as number)))
      )
    }
    return datum ? min(datum, (d) => y(d)) : null
  }, [datum, scales, geoms, aes])

  const groupVals = useMemo(() => {
    const vals =
      datum &&
      datum
        .filter((d) => aes?.y && aes.y(d))
        // .sort((a, b) =>
        //   (group(a)?.toString() || 0) < (group(b)?.toString() || 0) ? -1 : 1
        // )
        .map((md) => {
          const thisGroup = group(md)

          const mark = (
            <svg width={12} height={12}>
              <rect
                transform="translate(1, 1)"
                width={12}
                height={12}
                fill={
                  geoms?.col?.fill ||
                  (copiedScales?.fillScale
                    ? copiedScales.fillScale(thisGroup)
                    : 'none')
                }
                stroke={
                  geoms?.col?.stroke ||
                  (copiedScales?.strokeScale
                    ? copiedScales.strokeScale(thisGroup)
                    : 'none')
                }
                strokeDasharray={
                  geoms?.col?.strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(thisGroup)
                    : undefined)
                }
                strokeWidth={geoms?.col?.strokeWidth}
                fillOpacity={geoms?.col?.fillOpacity}
                strokeOpacity={geoms?.col?.strokeOpacity}
              />
            </svg>
          )
          return {
            group: thisGroup,
            mark,
            x: xVal,
            y: yVal,
            formattedY: aes?.y && (yFormat ? yFormat(aes.y(md)) : aes.y(md)),
            formattedX: xFormat ? xFormat(xVal) : xVal.toString(),
          }
        })
    return vals as TooltipContent[]
  }, [
    datum,
    xVal,
    group,
    y,
    aes,
    yFormat,
    xFormat,
    copiedScales,
    geoms,
    scales,
  ])

  const tooltipValue = content
    ? datum && <div>{content(groupVals)}</div>
    : datum && <DefaultTooltip data={groupVals} />

  return datum && margin && groupVals[0] && xCoord ? (
    <XTooltip
      id={id as string}
      left={xCoord}
      top={-(height - (groupVals[0].y || 0))}
      value={typeof xAxis === 'function' ? xAxis(xVal) : tooltipValue}
      yPosition="above"
    />
  ) : null
}
