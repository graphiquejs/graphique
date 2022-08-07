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

interface StackMidpoint {
  groupVal: string
  yVal: string | number
  xVal: number
}

export interface TooltipProps {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  xAdj?: number
  aes?: Aes
  focusType: 'group' | 'individual'
  stackMidpoints?: StackMidpoint[]
}

export const Tooltip = ({
  x,
  y,
  xAdj = 0,
  aes,
  focusType,
  stackMidpoints,
}: TooltipProps) => {
  const { ggState } = useGG() || {}
  const { data, id, scales, copiedScales, height, margin } = ggState || {
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
    () => datum?.[0] && (x(datum[0]) ?? 0) + xAdj,
    [datum, x, xAdj]
  )

  const group = useMemo(
    () => scales?.groupAccessor || (() => '__group'),
    [scales]
  )

  const yVal = useMemo(() => {
    const isYFilled = geoms?.col?.position === 'fill'

    if (focusType === 'individual' && stackMidpoints && datum) {
      const datumGroup = group(datum[0])
      const focusedStack = stackMidpoints.find(
        ({ xVal: stackX, groupVal }) =>
          stackX === xVal && groupVal === datumGroup
      )

      const yAesVal = aes?.y?.(datum[0]) as number
      const yAesTotal = sum(
        data?.filter((d) => aes?.x(d) === focusedStack?.xVal) as [],
        (d) => aes?.y?.(d) as number
      )

      const dy = isYFilled ? yAesVal / yAesTotal / 2 : yAesVal / 2
      const stackYVal = focusedStack?.yVal as number

      return focusedStack ? scales?.yScale(stackYVal + dy) ?? 0 : undefined
    }

    if (isYFilled) return scales?.yScale(1)
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
  }, [data, datum, scales, geoms, aes, y])

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
            datum,
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
    focusType,
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
