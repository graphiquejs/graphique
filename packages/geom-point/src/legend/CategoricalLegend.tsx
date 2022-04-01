import React, { useState, useEffect } from 'react'
import {
  useGG,
  themeState,
  fillScaleState,
  strokeScaleState,
  formatMissing,
  IScale,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

export interface CategoricalLegendProps {
  legendData: unknown[]
  legendScales: IScale
  orientation?: 'vertical' | 'horizontal'
  labelFormat?: (v: unknown, i: number) => string
  fontSize?: string | number
  onSelection?: (v: unknown) => void
}

export const CategoricalLegend = ({
  legendData,
  legendScales,
  orientation = 'vertical',
  labelFormat,
  fontSize = 12,
  onSelection,
}: CategoricalLegendProps) => {
  const [isFocused, setIsFocused] = useState<string[]>(
    legendScales.groups || []
  )

  const [{ geoms }] = useAtom(themeState)
  const [{ domain: fillDomain }] = useAtom(fillScaleState)
  const [{ domain: strokeDomain }] = useAtom(strokeScaleState)

  const legendGroups =
    ((fillDomain || strokeDomain) as string[]) || legendScales.groups

  const { ggState, updateData } = useGG() || {}
  const { scales, data } = ggState || {}

  useEffect(() => {
    setIsFocused(scales?.groups || [])
  }, [scales, data])

  const getGroup: any = legendScales.groupAccessor
    ? legendScales.groupAccessor
    : () => legendScales.groups && legendScales.groups[0]

  const isHorizontal = orientation === 'horizontal'

  const toggleLegendGroup = (g: string) => {
    const prevFocused = isFocused
    let focusedGroups
    if (prevFocused.includes(g)) {
      if (prevFocused.length === 1) {
        focusedGroups = legendScales.groups as string[]
      } else {
        focusedGroups = prevFocused.filter((p) => p !== g)
      }
    } else {
      focusedGroups = [...prevFocused, g]
    }
    setIsFocused(focusedGroups)

    const includedGroups = Array.from(new Set(data?.map((d) => getGroup(d))))

    if (onSelection) {
      onSelection(g)
    }
    if (data && updateData) {
      let updatedData
      if (includedGroups.includes(g)) {
        if (includedGroups.length === 1) {
          updatedData = legendData as unknown[]
        } else {
          updatedData = data.filter((d) => getGroup(d) !== g)
        }
      } else {
        updatedData = legendData.filter(
          (d) => includedGroups.includes(getGroup(d)) || getGroup(d) === g
        )
      }
      updateData(updatedData)
    }
  }

  return (
    <div
      style={{
        marginTop: 8,
        display: 'flex',
        flexDirection: !isHorizontal ? 'column' : 'row',
        flexWrap: 'wrap',
        alignItems: isHorizontal ? 'center' : undefined,
      }}
    >
      {geoms?.point?.fillOpacity &&
        legendGroups?.map((g: string, i, groups) => (
          <div
            key={g}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: isHorizontal ? 6 : 2,
            }}
          >
            <div
              tabIndex={0}
              role="button"
              style={{
                cursor: 'pointer',
                // scales?.fillScale?.domain().includes(g) ||
                // legendScales.groups?.includes(g)
                //   ? "pointer"
                //   : "not-allowed",
                marginRight: i < groups.length - 1 && isHorizontal ? 12 : 2,
                fontSize,
                opacity: isFocused.includes(g) ? 1 : 0.5,
                transition: 'opacity 200ms',
                display: 'flex',
                alignItems: 'center',
              }}
              onKeyPress={(e) => {
                if (['Enter', ' '].includes(e.key)) {
                  toggleLegendGroup(g)
                }
              }}
              onClick={() => toggleLegendGroup(g)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width={12} height={12}>
                  <circle
                    r={4}
                    cx={6}
                    cy={6}
                    fill={
                      geoms?.point?.fill ||
                      (legendScales.fillScale
                        ? legendScales.fillScale(g)
                        : 'none')
                    }
                    stroke={
                      geoms?.point?.stroke ||
                      (legendScales.strokeScale
                        ? legendScales.strokeScale(g)
                        : 'none')
                    }
                    strokeWidth={1.8}
                    fillOpacity={
                      isFocused.includes(g) ? geoms?.point?.fillOpacity : 0.5
                    }
                    strokeOpacity={
                      isFocused.includes(g) ? geoms?.point?.strokeOpacity : 0.5
                    }
                    style={{
                      transition: 'fill-opacity 200ms',
                    }}
                  />
                </svg>
              </div>
              <div style={{ marginLeft: 4, fontSize }}>
                {labelFormat ? labelFormat(g, i) : formatMissing(g)}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
