import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import { max, sum } from 'd3-array'
import {
  useGG,
  tooltipState,
  TooltipContent,
  XTooltip,
  YTooltip,
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
  yAdj?: number
  aes?: Aes
  focusType: 'group' | 'individual'
  align: 'left' | 'center' | 'right'
  stackMidpoints?: StackMidpoint[]
}

export const Tooltip = ({
  x,
  y,
  yAdj = 0,
  aes,
  focusType,
  align,
  stackMidpoints,
}: TooltipProps) => {
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
    () => datum?.[0] && (y(datum[0]) ?? 0) + (focusType === 'group' ? yAdj : 0),
    [yAdj, datum, y, focusType]
  )

  const group = useMemo(
    () => scales?.groupAccessor || (() => '__group'),
    [scales]
  )

  const xVal = useMemo(() => {
    if (focusType === 'individual' && stackMidpoints && datum) {
      const datumGroup = group(datum[0])
      const focusedStack = stackMidpoints.find(
        ({ yVal: stackY, groupVal }) =>
          stackY === yVal && groupVal === datumGroup
      )

      return focusedStack ? scales?.xScale(focusedStack.xVal) : undefined
    }

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
  }, [datum, scales, geoms, aes, focusType, stackMidpoints, yVal, group])

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

  if (datum && groupVals[0] && focusType === 'individual')
    return (
      <div>
        <XTooltip
          id={id as string}
          left={groupVals[0].x ?? 0}
          top={-(height - yCoord)}
          value={tooltipValue}
          yPosition="above"
          align={align}
        />
      </div>
    )

  return datum && groupVals[0] ? (
    <div>
      <YTooltip
        id={id as string}
        left={groupVals[0].x ?? 0}
        top={-(height - yCoord)}
        value={tooltipValue}
        wait
      />
    </div>
  ) : null
}
