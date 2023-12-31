import React, { useMemo } from 'react'
import { useAtom } from 'jotai'
import {
  useGG,
  tooltipState,
  TooltipContent,
  YTooltip,
  Aes,
  DataValue,
  TooltipProps,
} from '@graphique/graphique'
import { DefaultTooltip } from './DefaultTooltip'

interface Props<Datum> {
  aes: Aes<Datum>
  group?: DataValue<Datum>
}

export const Tooltip = <Datum,>({ aes, group }: Props<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { id, scales, width, height, margin } = ggState || {
    width: 0,
    height: 0,
  }

  const [{ datum: tooltipDatum, xFormat, yFormat, measureFormat, content }] =
    useAtom<TooltipProps<Datum>>(tooltipState)

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

  const yAdj = useMemo(
    () => (scales?.yScale.bandwidth ? scales?.yScale.bandwidth() / 2 : 0),
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
        measureFormat ? measureFormat(label ?? thisGroup) : undefined,
      datum: tooltipDatum,
      containerWidth: width,
    },
  ]

  const tooltipValue = content
    ? tooltipDatum && <div>{content(tooltipContents)}</div>
    : tooltipDatum && <DefaultTooltip data={tooltipContents} />

  const shouldShow = tooltipDatum && tooltipContents[0].y !== undefined

  return shouldShow ? (
    <div>
      <YTooltip
        id={id as string}
        left={width - (margin?.right || 0)}
        top={(tooltipContents[0].y || 0) -height + yAdj}
        value={tooltipValue}
      />
    </div>
  ) : null
}
