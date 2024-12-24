import React, { CSSProperties } from 'react'
import {
  useGG,
  themeState,
  IScale,
  LegendOrientation,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
import { ColorBandLegend } from './ColorBandLegend'

export interface LegendProps {
  /** title of legend */
  title?: React.ReactNode
  /** determines vertical/horizontal orientation of categorical legend members (_default_: `LegendOrientation.V`) */
  orientation?: LegendOrientation
  /** function for formatting legend member labels (categorical) or tick labels (continuous) */
  format?: (v: string, i?: number) => string
  /** width of continuous legend in pixels (_default_: `320`) */
  width?: number
  /** approximate number of ticks for continuous legend (_default_: `width / 64`) */
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
  width = 320,
  numTicks = width / 64,
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
          scales={copiedScales as IScale<Datum>}
          tickFormat={format}
          numTicks={numTicks}
          fontSize={fontSize}
          width={width}
        />
      )}
    </div>
  ) : null
}
