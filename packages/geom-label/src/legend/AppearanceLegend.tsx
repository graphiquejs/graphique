import React, { CSSProperties } from 'react'
import { useGG, themeState, LegendOrientation } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
import { ColorBandLegend } from './ColorBandLegend'

export interface LegendProps {
  title?: React.ReactNode
  style?: CSSProperties
  orientation?: LegendOrientation
  format?: (v: string, i: number) => string
  numTicks?: number
  width?: number
  onSelection?: (v: string) => void
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
