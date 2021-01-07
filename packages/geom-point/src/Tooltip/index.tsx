import React from "react"
import { useRecoilValue } from "recoil"
import {
  TooltipContent,
  TooltipContainer,
  tooltipState,
  YTooltip,
  XTooltip,
  layoutState,
  aesState
} from "@graphique/gg"
import { DefaultTooltip } from "./DefaultTooltip"

type Props = {
  scales: { x: any, y: any }
  group: (d: any) => string
  datum?: { _id?: number }
}

export const Tooltip: React.FC<Props> = ({
  scales,
  group,
  datum
}) => {

  const { position, content, yFormat, xFormat, xAxis } = useRecoilValue(tooltipState)
  const aes = useRecoilValue(aesState)
  const { id, height, margin } = useRecoilValue(layoutState)
  const { x, y } = scales

  const labelResolution = {
    given: aes.label && aes.label(datum),
    keyed: aes.key && aes.key(datum),
    default: datum?._id
  }

  const tooltipContents = [{
    x: aes.x && x(aes.x(datum)),
    y: aes.y && y(aes.y(datum)),
    formattedX: aes.x && (xFormat ? xFormat(aes.x(datum)) : aes.x(datum)),
    formattedY: aes.y && (yFormat ? yFormat(aes.y(datum)) : aes.y(datum)),
    group: group(datum),
    label: labelResolution.given === labelResolution.default ?
      labelResolution.keyed :
      labelResolution.given,
    datum
  }] as TooltipContent[]

  return (
    <>
      {xAxis && (
        <XTooltip
          id={id}
          left={tooltipContents[0].x}
          top={-margin.bottom - 5}
          value={
            typeof xAxis === "boolean" ? (
              <TooltipContainer>
                {xFormat ? xFormat(aes.x(datum)) : aes.x(datum)}
              </TooltipContainer>
            ) : (
              xAxis({ x: aes.x(datum) })
            )
          }
        />
      )}
      <YTooltip
        id={id}
        left={tooltipContents[0].x}
        top={position === "data" ? -(height - tooltipContents[0].y) : -height}
        value={content ? content({ data: tooltipContents }) : <DefaultTooltip data={tooltipContents} />}
      />
    </>
  )
}