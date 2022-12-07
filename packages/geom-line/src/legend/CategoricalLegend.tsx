import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  useGG,
  themeState,
  strokeScaleState,
  strokeDasharrayState,
  formatMissing,
  IScale,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

export interface CategoricalLegendProps {
  legendData: unknown[]
  legendScales: IScale
  orientation?: 'vertical' | 'horizontal'
  labelFormat?: (v: any, i: number) => string
  fontSize?: string | number
  onSelection?: (v: string) => void
}

export const CategoricalLegend = ({
  legendData,
  legendScales,
  orientation = 'vertical',
  labelFormat,
  fontSize = 12,
  onSelection,
}: CategoricalLegendProps) => {
  const [{ geoms, defaultStroke }] = useAtom(themeState)
  const [{ domain: strokeDomain }] = useAtom(strokeScaleState)
  const [{ domain: dashArrayDomain }] = useAtom(strokeDasharrayState)

  const legendGroups = useMemo(
    () =>
      strokeDomain ||
      dashArrayDomain ||
      legendScales.groups ||
      legendScales.strokeScale?.domain(),
    [legendScales, strokeDomain, dashArrayDomain]
  )

  const [isFocused, setIsFocused] = useState<string[]>(
    geoms?.line?.usableGroups ?? []
  )

  const { ggState, updateData } = useGG() || {}
  const { data } = ggState || {}

  useEffect(() => setIsFocused(geoms?.line?.usableGroups ?? []), [legendData])

  const getGroup = useMemo(
    () => geoms?.line?.groupAccessor || (() => undefined),
    [geoms]
  )

  const isHorizontal = orientation === 'horizontal'

  const toggleLegendGroup = useCallback(
    (g: string) => {
      const includedGroups = Array.from(new Set(data?.map((d) => getGroup(d))))

      let focusedGroups
      if (includedGroups.includes(g)) {
        if (includedGroups.length === 1) {
          focusedGroups = legendGroups
        } else {
          focusedGroups = includedGroups.filter((p) => p !== g)
        }
      } else {
        focusedGroups = [...includedGroups, g]
      }

      setIsFocused(focusedGroups as string[])

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
    },
    [legendGroups, getGroup, data]
  )

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
