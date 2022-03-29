import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useGG,
  tooltipState,
  TooltipContent,
  YTooltip,
  Aes,
  DataValue,
} from '@graphique/graphique'
import { DefaultTooltip } from './DefaultTooltip'

interface Props {
  aes: Aes
  group?: DataValue
}

export const Tooltip = ({ aes, group }: Props) => {
  const { ggState } = useGG() || {}
  const { id, scales, height, width } = ggState || {
    width: 0,
    height: 0,
  }

  const [{ datum: tooltipDatum, xFormat, yFormat, measureFormat, content }] =
    useAtom(tooltipState)

  const datum = useMemo(() => tooltipDatum && tooltipDatum[0], [tooltipDatum])

  const label = useMemo(() => {
    const labelResolution = {
      given: datum && aes?.label && aes.label(datum),
      keyed: datum && aes?.key && aes.key(datum),
    }

    return labelResolution?.given ?? labelResolution?.keyed
  }, [aes, datum])

  const xScale: any = scales?.xScale
  const yScale: any = scales?.yScale

  const xAdj = useMemo(
    () => (scales?.xScale.bandwidth ? scales?.xScale.bandwidth() / 2 : 0),
    [scales]
  )

  const thisGroup = useMemo(
    () => datum && group && group(datum),
    [datum, group]
  )

  const tooltipContents: TooltipContent[] = [
    {
      x: datum && aes?.x && xScale && xScale(aes.x(datum)),
      y: datum && aes?.y && yScale && yScale(aes.y(datum)),
      formattedX:
        datum &&
        aes?.x &&
        ((xFormat ? xFormat(aes.x(datum)) : aes.x(datum)) as string),
      formattedY:
        datum &&
        aes?.y &&
        ((yFormat ? yFormat(aes.y(datum)) : aes.y(datum)) as string),
      group: thisGroup,
      label,
      formattedMeasure:
        measureFormat &&
        (label || thisGroup) &&
        measureFormat(label || thisGroup),
      datum,
      containerWidth: width,
    },
  ]

  const tooltipValue = content
    ? datum && <div>{content(tooltipContents)}</div>
    : datum && <DefaultTooltip data={tooltipContents} />

  const shouldShow = datum && tooltipContents[0].x !== undefined

  return shouldShow ? (
    <div>
      <YTooltip
        id={id as string}
        left={(tooltipContents[0].x || 0) + xAdj}
        top={-height}
        value={tooltipValue}
      />
    </div>
  ) : null
}
