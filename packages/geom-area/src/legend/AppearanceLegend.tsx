import React, { CSSProperties } from 'react'
import { useGG, themeState, IScale } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
// import { ColorBandLegend } from "./ColorBandLegend"
// import { IScale } from "util/autoScale"

export interface AppearanceLegendProps {
  title?: React.ReactNode
  style?: CSSProperties
  orientation?: 'horizontal' | 'vertical'
  format?: (v: any, i: number) => string
  // numTicks?: number
  // width?: number
  onSelection?: (v: string) => void
}

export const Legend = <Datum,>({
  title,
  style,
  orientation = 'vertical',
  format,
  // numTicks,
  // width,
  onSelection,
}: AppearanceLegendProps) => {
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
      {
        copiedData &&
        (copiedScales || area?.fillScale) &&
        (groups || area?.usableGroups) ? (
          <CategoricalLegend
            legendData={copiedData}
            orientation={orientation}
            legendScales={
              {
                ...copiedScales,
                strokeScale: area
                  ? area.strokeScale
                  : copiedScales?.strokeScale,
                fillScale: area ? area.fillScale : copiedScales?.fillScale,
              } as IScale<Datum>
            }
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
