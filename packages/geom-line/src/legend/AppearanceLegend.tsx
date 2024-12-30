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
  /** additional styles passed to legend container */
  style?: CSSProperties
  /** determines vertical/horizontal orientation of legend members (_default_: `LegendOrientation.V`) */
  orientation?: LegendOrientation
  /** function for formatting legend member labels */
  format?: (v: string, i?: number) => string
  /** callback called for click events on legend members */
  onSelection?: (v: string) => void
  /** should legend member stroke symbols include stroke dasharrays (_default_: `true`) */
  ignoreDasharray?: boolean
}

export const Legend = <Datum,>({
  title,
  style,
  orientation = LegendOrientation.V,
  format,
  onSelection,
  ignoreDasharray = false,
}: LegendProps) => {
  const { ggState } = useGG<Datum>() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font, geoms }] = useAtom(themeState)

  const { line } = geoms || {}
  const { groups } = copiedScales || {}

  const hasAppearanceAes =
    line?.strokeScale ||
    line?.strokeDasharrayScale ||
    aes?.fill ||
    aes?.stroke ||
    aes?.strokeDasharray

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
      (copiedScales || line?.strokeScale) &&
      (groups || line?.usableGroups) ? (
        <CategoricalLegend
          legendData={copiedData}
          orientation={orientation}
          legendScales={
            {
              ...copiedScales,
              strokeScale: line ? line.strokeScale : copiedScales?.strokeScale,
              groups: line?.usableGroups,
            } as IScale<Datum>
          }
          labelFormat={format}
          fontSize={fontSize}
          onSelection={onSelection}
          ignoreDasharray={ignoreDasharray}
        />
      ) : null}
    </div>
  ) : null
}
