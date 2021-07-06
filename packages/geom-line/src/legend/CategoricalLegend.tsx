import React, { useState, useEffect } from 'react'
import {
  useGG,
  themeState,
  fillScaleState,
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

  const [{ geoms, defaultStroke }] = useAtom(themeState)
  const [{ domain }] = useAtom(fillScaleState)

  const legendGroups = (domain as string[]) || legendScales.groups

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
      {geoms?.line &&
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
              tabIndex={i}
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
                <svg width={18} height={8}>
                  <line
                    x1={0}
                    x2={18}
                    y1={4}
                    y2={4}
                    stroke={
                      geoms?.line?.stroke ||
                      (legendScales.strokeScale
                        ? legendScales.strokeScale(g)
                        : defaultStroke)
                    }
                    strokeWidth={geoms?.line?.strokeWidth}
                    strokeOpacity={
                      isFocused.includes(g)
                        ? geoms?.line?.strokeOpacity
                        : geoms?.line?.strokeOpacity || 1 * 0.5
                    }
                    strokeDasharray={
                      geoms?.line?.strokeDasharray ||
                      (legendScales.strokeDasharrayScale
                        ? legendScales.strokeDasharrayScale(g)
                        : undefined)
                    }
                    style={{
                      transition: 'stroke-opacity 200ms',
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
