import React, { useEffect, useState, CSSProperties } from 'react'
import { useGG, themeState, IScale } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
import { ColorBandLegend } from './ColorBandLegend'

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
  numTicks,
  width,
  onSelection,
}: AppearanceLegendProps) => {
  const { ggState } = useGG() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font, legend }] = useAtom(themeState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  const { groups } = copiedScales || {}

  // include aes?.strokeDasharray
  const hasAppearanceAes = aes?.fill || aes?.stroke

  const { fontSize } = { ...style }

  return hasAppearanceAes && !firstRender ? (
    <div
      style={{
        marginTop: 12,
        fontFamily: font?.family,
        ...style,
      }}
    >
      <div style={{ color: legend?.titleColor }}>{title}</div>
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
          scales={copiedScales as IScale}
          tickFormat={format}
          numTicks={numTicks}
          fontSize={fontSize}
          width={width}
        />
      )}
    </div>
  ) : null
}
