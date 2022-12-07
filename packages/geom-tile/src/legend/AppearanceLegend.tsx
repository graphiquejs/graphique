import React, { CSSProperties, useEffect, useState } from 'react'
import { useGG, themeState, IScale } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
import { ColorBandLegend } from './ColorBandLegend'

export interface LegendProps {
  title?: React.ReactNode
  style?: CSSProperties
  orientation?: 'horizontal' | 'vertical'
  format?: (v: any, i: number) => string
  numTicks?: number
  width?: number
  onSelection?: (v: string) => void
}

export const Legend = ({
  title,
  style,
  orientation = 'vertical',
  format,
  numTicks,
  width,
  onSelection,
}: LegendProps) => {
  const { ggState } = useGG() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font, legend }] = useAtom(themeState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
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
