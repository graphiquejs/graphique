import React, { CSSProperties } from 'react'
import { useGG, themeState, IScale } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface AppearanceLegendProps<Datum> {
  title?: React.ReactNode
  style?: CSSProperties
  orientation?: 'horizontal' | 'vertical'
  format?: (v: string, i: number) => string
  onSelection?: (v: string) => void
  ignoreDasharray?: boolean
}

export const Legend = <Datum,>({
  title,
  style,
  orientation = 'vertical',
  format,
  onSelection,
  ignoreDasharray = false,
}: AppearanceLegendProps<Datum>) => {
  const { ggState } = useGG<Datum>() || {}
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
                } as IScale<Datum>
              }
              labelFormat={format}
              fontSize={fontSize}
              onSelection={onSelection}
              ignoreDasharray={ignoreDasharray}  
            />
        ) : null
      }
    </div>
  ) : null
}
