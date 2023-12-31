import React, { useMemo } from 'react'
import {
  TooltipProps,
  tooltipState,
  useGG,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

export interface LineMarkerProps<Datum> {
  x: (d: Datum) => number | undefined
  xAdj?: number
}

export const LineMarker = <Datum,>({
  x,
  xAdj = 0,
}: LineMarkerProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
  const { id, height, margin } = ggState || {
    height: 0,
  }

  const [{ datum }] = useAtom<TooltipProps<Datum>>(tooltipState)

  const xCoord = useMemo(
    () => datum?.[0] && (x(datum[0]) ?? 0) + xAdj,
    [datum, x, xAdj]
  )

  return xCoord ? (
    <>
      {datum && (
        <g
          className={`__gg-tooltip-${id}`}
          style={{ transform: `translateX(${xCoord}px)` }}
        >
          <line
            y1={height - (margin?.bottom ?? 0)}
            y2={(margin?.top ?? 0)}
            strokeDasharray={2}
            stroke="#888"
            strokeWidth={1.5}
            style={{ pointerEvents: 'none' }}
            data-testid='__gg_geom_col_marker'
          />
        </g>
      )}
    </>
  ) : null
}
