import React, { CSSProperties } from 'react'
import { useGG, themeState, IScale } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
// import { ColorBandLegend } from "./ColorBandLegend"
// import { IScale } from "util/autoScale"

interface AppearanceLegendProps {
  title?: React.ReactNode
  style?: CSSProperties
  orientation?: 'horizontal' | 'vertical'
  format?: (v: any, i: number) => string
  // numTicks?: number
  // width?: number
  onSelection?: (v: string) => void
  ignoreDasharray?: boolean
}

export const Legend = ({
  title,
  style,
  orientation = 'vertical',
  format,
  // numTicks,
  // width,
  onSelection,
  ignoreDasharray = false,
}: AppearanceLegendProps) => {
  const { ggState } = useGG() || {}
  const { copiedScales, copiedData, aes } = ggState || {}
  const [{ font, geoms }] = useAtom(themeState)

  const { line } = geoms || {}
  const { groups } = copiedScales || {}

  const hasAppearanceAes =
    line?.strokeScale || aes?.fill || aes?.stroke || aes?.strokeDasharray

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
          (copiedScales || line?.strokeScale) &&
          (groups || line?.usableGroups) ? (
            <CategoricalLegend
              legendData={copiedData}
              orientation={orientation}
              legendScales={
                {
                  ...copiedScales,
                  strokeScale: line
                    ? line.strokeScale
                    : copiedScales?.strokeScale,
                  groups: line?.usableGroups,
                } as IScale
              }
              labelFormat={format}
              fontSize={fontSize}
              onSelection={onSelection}
              ignoreDasharray={ignoreDasharray}  
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
