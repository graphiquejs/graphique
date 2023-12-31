import React, { useMemo } from 'react'
import {
  useGG,
  tooltipState,
  themeState,
  TooltipContent,
  XTooltip,
  YTooltip,
  TooltipContainer,
  TooltipProps,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { mean, sum, min, max } from 'd3-array'
import { DefaultTooltip } from './DefaultTooltip'
import type { GeomAes } from '../types'

export { LineMarker } from './LineMarker'

interface Props<Datum> {
  x: (d: Datum) => number | undefined
  y: (d: Datum) => number | undefined
  y0: (d: Datum) => number | undefined
  y1: (d: Datum) => number | undefined
  aes: GeomAes<Datum>
  geomID: string
}

export const Tooltip = <Datum,>({ x, y, y0, y1, aes, geomID }: Props<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { id, scales, copiedScales, width, height, margin } = ggState || {
    height: 0,
  }

  const [{ datum, position, xAxis, xFormat, yFormat, content }] =
    useAtom<TooltipProps<Datum>>(tooltipState)

  const [{ geoms, defaultStroke, defaultFill }] = useAtom(themeState)
  const { area } = geoms || {}

  const left = useMemo(
    () =>
      min([
        datum && x(datum[0]),
        width && margin?.right && width - margin.right,
      ] as number[]),
    [datum, x, width]
  )

  const hasYVal = useMemo(
    () => datum?.some(y1) || datum?.some(y),
    [datum, y, y1]
  )

  const datumInGroups = useMemo(() => {
    const groups = scales?.groups

    return groups
      ? datum?.filter((d) => {
        const group = geoms?.area?.groupAccessor?.(d)
        const inGroups = scales?.groups?.includes(group as string)
            
        return inGroups && group
      })
      : datum
  }, [datum, geoms, scales])

  const meanYVal = useMemo(
    () =>
      (datumInGroups &&
        mean(
          datumInGroups.map((d, i, stacks) => {
            let thisYCoord

            // stacked area (sum)
            if (area?.position === 'stack') {
              const yTotal = stacks
                .slice(0, i + 1)
                // @ts-ignore
                .map(aes.y)
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = scales?.yScale(yTotal)
            } else if (area?.position === 'fill' && aes?.y) {
              const yTotal = stacks
                .slice(0, i + 1)
                .map(
                  (s) =>
                    // @ts-ignore
                    aes.y(s) / sum(stacks, aes.y)
                )
                .reduce((a, b) => (a as number) + (b as number), 0) as number

              thisYCoord = scales?.yScale(yTotal)
            } else if (aes.y0 && aes.y1) {
              thisYCoord = mean([y0(d), y1(d)] as [number, number])
            } else {
              thisYCoord = y(d)
            }
            return thisYCoord
          })
        )) ||
      0,
    [datumInGroups, y, y0, y1]
  )

  const cappedYVal = max([0, min([meanYVal, height]) as number]) as number

  const xVal = useMemo(
    () => datum && datum[0] && aes?.x && aes.x(datum[0]),
    [datum, aes]
  )

  const areaVals = useMemo(() => {
    const vals = datumInGroups?.filter((d) => (
      (aes?.y1 &&
        typeof aes.y1(d) !== 'undefined' &&
        aes.y1(d) !== null) ||
      (aes?.y && typeof aes.y(d) !== 'undefined' && aes.y(d) !== null)
    ))
    .map((md) => {
      const thisGroup = geoms?.area?.groupAccessor?.(md)
      const autoGrouped = thisGroup === '__group'

      let formattedY

      if (aes?.y) {
        formattedY = yFormat ? yFormat(aes.y(md)) : aes.y(md)
      }

      if (aes?.y1) {
        formattedY = yFormat ? yFormat(aes.y1(md)) : aes.y1(md)
      }

      const mark = (
        <svg width={15} height={15}>
          <rect
            transform="translate(1, 1)"
            width={12}
            height={12}
            fill={
              area?.fill ||
              (area?.fillScale && area.fillScale(thisGroup)) ||
              (copiedScales?.fillScale
                ? copiedScales.fillScale(thisGroup)
                : defaultFill)
            }
            stroke={
              area?.stroke ||
              (area?.strokeScale && area.strokeScale(thisGroup)) ||
              (copiedScales?.strokeScale
                ? copiedScales.strokeScale(thisGroup)
                : undefined)
            }
            strokeDasharray={
              area?.strokeDasharray ||
              (copiedScales?.strokeDasharrayScale
                ? copiedScales.strokeDasharrayScale(thisGroup)
                : undefined)
            }
            strokeWidth={0.6}
            fillOpacity={area?.fillOpacity}
            strokeOpacity={area?.strokeOpacity}
          />
        </svg>
      )
      return {
        group: autoGrouped ? undefined : thisGroup,
        mark: thisGroup && !autoGrouped ? mark : undefined,
        datum,
        x: xVal,
        y: (aes?.y1 && aes?.y1(md)) ?? (aes?.y && aes.y(md)),
        formattedY,
        formattedX: xFormat ? xFormat(xVal) : String(xVal),
      }
    })
    return vals as TooltipContent<Datum>[]
  }, [
    datumInGroups,
    xVal,
    aes,
    yFormat,
    xFormat,
    copiedScales,
    geoms,
    defaultStroke,
  ])

  const tooltipValue = content ? (
    <div>{content(areaVals)}</div>
  ) : (
    <DefaultTooltip data={areaVals} hasXAxisTooltip={!!xAxis} geomID={geomID} />
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
