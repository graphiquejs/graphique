import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useGG,
  tooltipState,
  TooltipContent,
  YTooltip,
} from '@graphique/graphique'
import { DefaultTooltip } from './DefaultTooltip'

export interface TooltipProps {
  x: (d: unknown) => number | undefined
  y: (d: unknown) => number | undefined
  xAdj: number
  yAdj: number
}

export const Tooltip = ({ x, y, xAdj, yAdj }: TooltipProps) => {
  const { ggState } = useGG() || {}
  const { id, aes, scales, height, width } = ggState || { width: 0, height: 0 }

  const [
    { datum: tooltipDatum, position, xFormat, yFormat, measureFormat, content },
  ] = useAtom(tooltipState)

  const datum = useMemo(() => tooltipDatum && tooltipDatum[0], [tooltipDatum])

  const label = useMemo(() => {
    const labelResolution = {
      given: datum && aes?.label && aes.label(datum),
      keyed: datum && aes?.key && aes.key(datum),
    }

    return labelResolution.given || labelResolution.keyed
  }, [aes, datum])

  const thisGroup = useMemo(
    () => datum && scales?.groupAccessor && scales?.groupAccessor(datum),
    [datum, scales]
  )

  const thisLabel = useMemo(
    () => (label ? label.toString() : undefined),
    [label]
  )

  const tooltipContents: TooltipContent[] = [
    {
      x: datum && (x(datum) as number),
      y: datum && (y(datum) as number),
      formattedX:
        datum &&
        aes?.x &&
        ((xFormat ? xFormat(aes.x(datum)) : aes.x(datum)) as string),
      formattedY:
        datum &&
        aes?.y &&
        ((yFormat ? yFormat(aes.y(datum)) : aes.y(datum)) as string),
      group: thisGroup,
      label: thisLabel,
      formattedMeasure:
        measureFormat &&
        (thisLabel || thisGroup) &&
        measureFormat(thisLabel || thisGroup),
      datum,
      containerWidth: width,
    },
  ]

  const tooltipValue = content
    ? datum && <div>{content(tooltipContents)}</div>
    : datum && <DefaultTooltip data={tooltipContents} />

  return datum ? (
    <div>
      <YTooltip
        id={id as string}
        left={(tooltipContents[0].x || 0) + xAdj}
        top={
          position === 'data'
            ? -(height - (tooltipContents[0].y || 0) - yAdj)
            : -height
        }
        value={tooltipValue}
      />
    </div>
  ) : null
}
