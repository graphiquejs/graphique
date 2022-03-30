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
import { mean } from 'd3-array'
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

  const left = useMemo(() => datum && x(datum[0]), [datum, x])
  const hasYVal = useMemo(() => datum?.some(y), [datum, y])

  const meanYVal = useMemo(() => (datum && mean(datum.map(y))) || 0, [datum, y])
  const xVal = useMemo(
    () => datum && datum[0] && aes?.x && aes.x(datum[0]),
    [datum, aes]
  )

  const lineVals = useMemo(() => {
    const vals =
      datum &&
      datum
        .filter(
          (d) => aes?.y && typeof aes.y(d) !== 'undefined' && aes.y(d) !== null
        )
        .map((md) => {
          const group = copiedScales?.groupAccessor(md)
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
          top={position === 'data' ? -(height - meanYVal) : -height}
          value={tooltipValue}
          wait
        />
      )}
    </>
  ) : null
}
