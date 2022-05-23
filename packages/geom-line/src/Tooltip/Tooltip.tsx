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
import { mean, min, max } from 'd3-array'
import { DefaultTooltip } from './DefaultTooltip'
import { type GeomAes } from '../types'

export { LineMarker } from './LineMarker'

interface Props {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  aes: GeomAes
}

export const Tooltip = ({ x, y, aes }: Props) => {
  const { ggState } = useGG() || {}
  const { id, copiedScales, width, height, margin } = ggState || {
    height: 0,
  }

  const [{ datum, position, xAxis, xFormat, yFormat, content }] =
    useAtom(tooltipState)
  const [{ geoms, defaultStroke }] = useAtom(themeState)

  const left = useMemo(
    () =>
      min([
        datum && x(datum[0]),
        width && margin?.right && width - margin.right,
      ] as number[]),
    [datum, x, width]
  )
  const hasYVal = useMemo(() => datum?.some(y), [datum, y])

  const meanYVal = useMemo(() => (datum && mean(datum.map(y))) || 0, [datum, y])
  const xVal = useMemo(
    () => datum && datum[0] && aes?.x && aes.x(datum[0]),
    [datum, aes]
  )

  const cappedYVal = max([0, min([meanYVal, height]) as number]) as number

  const lineVals = useMemo(() => {
    const vals =
      datum &&
      datum
        .filter(
          (d) => aes?.y && typeof aes.y(d) !== 'undefined' && aes.y(d) !== null
        )
        .map((md) => {
          const group =
            copiedScales?.groupAccessor && copiedScales.groupAccessor(md)
          const mark = (
            <svg width={18} height={8}>
              <line
                x1={0}
                x2={18}
                y1={4}
                y2={4}
                stroke={
                  geoms?.line?.stroke ||
                  (copiedScales?.strokeScale
                    ? copiedScales.strokeScale(group)
                    : defaultStroke)
                }
                strokeDasharray={
                  geoms?.line?.strokeDasharray ||
                  (copiedScales?.strokeDasharrayScale
                    ? copiedScales.strokeDasharrayScale(group)
                    : undefined)
                }
                strokeWidth={geoms?.line?.strokeWidth}
                strokeOpacity={geoms?.line?.strokeOpacity}
              />
            </svg>
          )
          return {
            group,
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
    <div>{content(lineVals)}</div>
  ) : (
    <DefaultTooltip data={lineVals} hasXAxisTooltip={!!xAxis} />
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
          top={position === 'data' ? -(height - cappedYVal) : -height}
          value={tooltipValue}
          wait
        />
      )}
    </>
  ) : null
}
