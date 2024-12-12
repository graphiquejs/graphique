import React, { CSSProperties } from 'react'
import {
  useGG,
  themeState,
  IScale,
  LegendOrientation,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'

export interface LegendProps {
  /** title of legend */
  title?: React.ReactNode
  /** determines vertical/horizontal orientation of legend members (_default_: `LegendOrientation.V`) */
  orientation?: LegendOrientation
  /** function for formatting legend member labels */
  format?: (v: string, i: number) => string
  /** callback called for click events on legend members */
  onSelection?: (v: string) => void
  /** additional styles passed to legend container */
  style?: CSSProperties
}

export const Legend = <Datum,>({
  title,
  orientation = LegendOrientation.V,
  format,
  onSelection,
  style,
}: LegendProps) => {
  const { ggState } = useGG<Datum>() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font, geoms }] = useAtom(themeState)

  const { area } = geoms || {}

  const { groups } = copiedScales || {}

  const hasAppearanceAes =
    area?.fillScale || aes?.fill || aes?.stroke || aes?.strokeDasharray

  const { fontSize } = { ...style }

  return hasAppearanceAes ? (
    <div
      style={{
        marginTop: 12,
        fontFamily: font?.family,
        ...style,
      }}
    >
      {title}
      {copiedData &&
      (copiedScales || area?.fillScale) &&
      (groups || area?.usableGroups) ? (
        <CategoricalLegend
          legendData={copiedData}
          orientation={orientation}
          legendScales={
            {
              ...copiedScales,
              strokeScale: area ? area.strokeScale : copiedScales?.strokeScale,
              fillScale: area ? area.fillScale : copiedScales?.fillScale,
            } as IScale<Datum>
          }
          labelFormat={format}
          fontSize={fontSize}
          onSelection={onSelection}
        />
      ) : null}
    </div>
  ) : null
}
