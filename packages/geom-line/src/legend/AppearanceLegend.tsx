import React, { CSSProperties } from 'react'
import { useGG, themeState } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
// import { ColorBandLegend } from "./ColorBandLegend"
// import { IScale } from "util/autoScale"

export interface AppearanceLegendProps {
  title?: React.ReactNode
  style?: CSSProperties
  orientation?: 'horizontal' | 'vertical'
  format?: (v: unknown, i: number) => string
  numTicks?: number
  width?: number
  onSelection?: (v: unknown) => void
}

export const Legend = ({
  title,
  style,
  orientation = 'vertical',
  format,
  // numTicks,
  // width,
  onSelection,
}: AppearanceLegendProps) => {
  const { ggState } = useGG() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font, legend }] = useAtom(themeState)

  const { groups } = copiedScales || {}

  const hasAppearanceAes = aes?.fill || aes?.stroke || aes?.strokeDasharray

  const { fontSize } = { ...style }

  return hasAppearanceAes ? (
    <div
      style={{
        marginTop: 12,
        fontFamily: font?.family,
        ...style,
      }}
    >
      <div style={{ color: legend?.titleColor }}>{title}</div>
      {
        copiedData && copiedScales && groups ? (
          <CategoricalLegend
            legendData={copiedData}
            orientation={orientation}
            legendScales={copiedScales}
            labelFormat={format}
            fontSize={fontSize}
            onSelection={onSelection}
          />
        ) : null
        // <ColorBandLegend
        //   scales={copiedScales as IScale}
        //   tickFormat={format}
        //   numTicks={numTicks}
        //   fontSize={fontSize}
        //   width={width}
        // />
      }
    </div>
  ) : null
}
