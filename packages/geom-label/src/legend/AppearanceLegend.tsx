import React, { CSSProperties } from 'react'
import { useGG, themeState, LegendOrientation } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
import { ColorBandLegend } from './ColorBandLegend'

export interface LegendProps {
  /** title of legend */
  title?: React.ReactNode
  /** determines vertical/horizontal orientation of categorical legend members (defaults to `LegendOrientation.V`) */
  orientation?: LegendOrientation
  /** function for formatting legend member labels (categorical) or tick labels (continuous) */
  format?: (v: string, i: number) => string
  /** width of continuous legend in px (defaults to `320`) */
  width?: number
  /** approximate number of ticks for continuous legend (defaults to `width / 64`) */
  numTicks?: number
  /** callback called for click events on legend members */
  onSelection?: (v: string) => void
  /** additional styles passed to legend container */
  style?: CSSProperties
}

export const Legend = <Datum,>({
  title,
  style,
  orientation = LegendOrientation.V,
  format,
  numTicks,
  width,
  onSelection,
}: LegendProps) => {
  const { ggState } = useGG<Datum>() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font }] = useAtom(themeState)

  const { groups } = copiedScales || {}

  // include aes?.strokeDasharray
  const hasAppearanceAes = aes?.fill || aes?.stroke

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
      {copiedData && copiedScales && groups ? (
        <CategoricalLegend
          legendData={copiedData}
          orientation={orientation}
          legendScales={copiedScales}
          labelFormat={format}
          fontSize={fontSize}
          onSelection={onSelection}
        />
      ) : (
        <ColorBandLegend
          scales={copiedScales}
          tickFormat={format}
          numTicks={numTicks}
          fontSize={fontSize}
          width={width}
        />
      )}
    </div>
  ) : null
}
