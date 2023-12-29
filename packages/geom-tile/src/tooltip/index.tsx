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

export interface TooltipProps<Datum> {
  x: (d: Datum) => number | undefined
  y: (d: Datum) => number | undefined
  xAdj: number
  yAdj: number
  datum?: Datum[]
  group: DataValue<Datum>
  aes: Aes<Datum>
}

export const Tooltip = <Datum,>({
  x,
  y,
  xAdj,
  yAdj,
  datum,
  group,
  aes,
}: TooltipProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { id, height, width } = ggState || { width: 0, height: 0 }

  const [
    { datum: tooltipDatum, position, xFormat, yFormat, measureFormat, content },
  ] = useAtom(tooltipState)

  const thisDatum = useMemo(
    () => datum ?? (tooltipDatum && tooltipDatum[0]),
    [tooltipDatum]
  )

  const label = useMemo(() => {
    const labelResolution = {
      given: thisDatum && aes?.label && aes.label(thisDatum),
      keyed: thisDatum && aes?.key && aes.key(thisDatum),
    }

    return labelResolution.given || labelResolution.keyed
  }, [aes, thisDatum])

  const thisGroup = useMemo(
    () => thisDatum && group && group(thisDatum),
    [thisDatum, group]
  )

  const thisLabel = useMemo(
    () => (label ? label.toString() : undefined),
    [label]
  )

  const tooltipContents: TooltipContent<Datum>[] = [
    {
      x: thisDatum && (x(thisDatum) as number),
      y: thisDatum && (y(thisDatum) as number),
      formattedX:
        thisDatum &&
        aes?.x &&
        ((xFormat ? xFormat(aes.x(thisDatum)) : aes.x(thisDatum)) as string),
      formattedY:
        thisDatum &&
        aes?.y &&
        ((yFormat ? yFormat(aes.y(thisDatum)) : aes.y(thisDatum)) as string),
      group: thisGroup,
      label: thisLabel,
      formattedMeasure:
        measureFormat &&
        (thisLabel || thisGroup) &&
        measureFormat(thisLabel || thisGroup),
      datum: thisDatum,
      containerWidth: width,
    },
  ]

  const tooltipValue = content
    ? thisDatum && <div>{content(tooltipContents)}</div>
    : thisDatum && <DefaultTooltip data={tooltipContents} />

  return thisDatum ? (
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
        wait
      />
    </div>
  ) : null
}
