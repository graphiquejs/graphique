import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useGG,
  tooltipState,
  labelsState,
  TooltipContent,
  YTooltip,
  DataValue,
  TooltipProps,
} from '@graphique/graphique'
import { DefaultTooltip } from './DefaultTooltip'
import { type GeomAes } from '../types'

interface Props<Datum> {
  aes: GeomAes<Datum>
  group?: DataValue<Datum>
}

export const Tooltip = <Datum,>({ aes, group }: Props<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { id, scales, height, width } = ggState || { width: 0, height: 0 }

  const [
    { datum: tooltipDatum, position, xFormat, yFormat, measureFormat, content },
  ] = useAtom<TooltipProps<Datum>>(tooltipState)

  const [{ x: xLab, y: yLab }] = useAtom(labelsState)

  const datum = useMemo(() => tooltipDatum && tooltipDatum[0], [tooltipDatum])

  const label = useMemo(() => {
    const labelResolution = {
      given: datum && aes?.label && aes.label(datum),
      keyed: datum && aes?.key && aes.key(datum),
    }

    return labelResolution?.given || labelResolution?.keyed
  }, [aes, datum])

  const xScale = scales?.xScale
  const yScale = scales?.yScale

  const xAdj = useMemo(
    () => (scales?.xScale.bandwidth ? scales?.xScale.bandwidth() / 2 : 0),
    [scales]
  )
  const yAdj = useMemo(
    () => (scales?.yScale?.bandwidth ? scales.yScale.bandwidth() / 2 : 0),
    [scales]
  )

  const thisGroup = useMemo(
    () => datum && group && group(datum),
    [datum, group]
  )

  const tooltipContents: TooltipContent<Datum>[] = [
    {
      x: datum && aes?.x && xScale && xScale(aes.x(datum)),
      y: datum && aes?.y && yScale && yScale(aes.y(datum)),
      xLab: xLab?.toString(),
      yLab: yLab?.toString(),
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
        (label || String(thisGroup)) &&
        measureFormat(label || thisGroup),
      datum: tooltipDatum,
      containerWidth: width,
    },
  ]

  const tooltipValue = content
    ? datum && <div>{content(tooltipContents)}</div>
    : datum && <DefaultTooltip data={tooltipContents} />

  const shouldShow =
    datum &&
    tooltipContents[0].x !== undefined &&
    tooltipContents[0].y !== undefined

  return shouldShow ? (
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
