import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import { max, sum } from 'd3-array'
import {
  useGG,
  tooltipState,
  TooltipContent,
  YTooltip,
  Aes,
  themeState,
} from '@graphique/graphique'
import { DefaultTooltip } from './DefaultTooltip'

export interface TooltipProps {
  x: (d: unknown) => number | undefined
  yAdj?: number
  aes?: Aes
}

export const Tooltip = ({ x, yAdj = 0, aes }: TooltipProps) => {
  const { ggState } = useGG() || {}
  const { id, scales, copiedScales, height } = ggState || {
    height: 0,
  }

  const [{ datum, xFormat, yFormat, content }] = useAtom(tooltipState)

  const [{ geoms }] = useAtom(themeState)

  const yVal = useMemo(
    () => datum && datum[0] && aes?.y && aes.y(datum[0]),
    [datum, aes]
  )

  const yCoord = useMemo(
    () => (scales?.yScale(yVal) as number) + yAdj,
    [scales, yAdj, yVal]
  )

  const group = useMemo(
    () => scales?.groupAccessor || (() => '__group'),
    [scales]
  )

  const xVal = useMemo(() => {
    if (geoms?.bar?.position === 'fill') return scales?.xScale(1)
    if (
      geoms?.bar?.position === 'stack' &&
      datum &&
      scales?.groups &&
      aes?.x &&
      scales.xScale
    ) {
      return scales.xScale(sum(datum.map((d) => aes.x(d) as number)))
    }
    return datum ? max(datum, (d) => x(d)) : null
  }, [datum, scales, geoms, aes])

  const groupVals = useMemo(() => {
    const vals =
      datum &&
      datum
        .filter((d) => aes?.x(d))
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
                  geoms?.bar?.fill ||
                  (copiedScales?.fillScale
                    ? copiedScales.fillScale(thisGroup)
                    : 'none')
                }
                stroke={
                  geoms?.bar?.stroke ||
                  (copiedScales?.strokeScale
                    ? copiedScales.strokeScale(thisGroup)
                    : 'none')
                }
                strokeDasharray={
                  geoms?.bar?.strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(thisGroup)
                    : undefined)
                }
                strokeWidth={geoms?.bar?.strokeWidth}
                fillOpacity={geoms?.bar?.fillOpacity}
                strokeOpacity={geoms?.bar?.strokeOpacity}
              />
            </svg>
          )
          return {
            group: thisGroup,
            mark,
            x: xVal,
            y: yVal,
            formattedX: xFormat ? xFormat(aes?.x(md)) : aes?.x(md),
            formattedY: yFormat ? yFormat(yVal) : yVal.toString(),
          }
        })
    return vals as TooltipContent[]
  }, [
    datum,
    yVal,
    group,
    x,
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

  return datum && groupVals[0] ? (
    <div>
      <YTooltip
        id={id as string}
        left={groupVals[0].x || 0}
        top={-(height - yCoord)}
        value={tooltipValue}
      />
    </div>
  ) : null
}
