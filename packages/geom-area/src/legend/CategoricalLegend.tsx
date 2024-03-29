import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  useGG,
  themeState,
  fillScaleState,
  formatMissing,
  IScale,
} from '@graphique/graphique'
import { useAtom } from 'jotai'

export interface CategoricalLegendProps<Datum> {
  legendData: Datum[]
  legendScales: IScale<Datum>
  orientation?: 'vertical' | 'horizontal'
  labelFormat?: (v: any, i: number) => string
  fontSize?: string | number
  onSelection?: (v: string) => void
}

export const CategoricalLegend = <Datum,>({
  legendData,
  legendScales,
  orientation = 'vertical',
  labelFormat,
  fontSize = 12,
  onSelection,
}: CategoricalLegendProps<Datum>) => {
  const [focused, setFocused] = useState<string[]>(
    legendScales.groups || legendScales.fillScale?.domain() || []
  )

  const [{ geoms, defaultFill }] = useAtom(themeState)
  const [{ domain }] = useAtom(fillScaleState)

  const legendGroups = useMemo(
    () =>
      (domain as string[]) ||
      legendScales.groups ||
      legendScales.fillScale?.domain(),
    [domain, legendScales]
  )

  const { ggState, updateData } = useGG<Datum>() || {}
  const { scales, data } = ggState || {}

  useEffect(() => {
    setFocused(scales?.groups || [])
  }, [scales, data])

  const getGroup = useMemo(
    () => geoms?.area?.groupAccessor || undefined,
    [geoms]
  )

  const isHorizontal = orientation === 'horizontal'

  const toggleLegendGroup = useCallback(
    (g: string) => {
      const prevFocused = focused
      let focusedGroups
      if (prevFocused.includes(g)) {
        if (prevFocused.length === 1) {
          focusedGroups = legendGroups as string[]
        } else {
          focusedGroups = prevFocused.filter((p) => p !== g)
        }
      } else {
        focusedGroups = [...prevFocused, g]
      }
      setFocused(focusedGroups)

      const includedGroups = Array.from(
        new Set(data?.map((d) => (getGroup ? getGroup(d) : undefined)))
      )

      if (onSelection) {
        onSelection(g)
      }
      if (data && updateData && getGroup) {
        let updatedData
        if (includedGroups.includes(g)) {
          if (includedGroups.length === 1) {
            updatedData = legendData
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
    [legendGroups, getGroup]
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
      {geoms?.area &&
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
                marginRight: i < groups.length - 1 && isHorizontal ? 12 : 2,
                fontSize,
                opacity: focused.includes(g) ? 1 : 0.5,
                transition: 'opacity 200ms',
                display: 'flex',
                alignItems: 'center',
              }}
              onKeyDown={(e) => {
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
                <svg width={14} height={14}>
                  <rect
                    width={14}
                    height={14}
                    fill={
                      geoms?.area?.fill ||
                      (legendScales.fillScale
                        ? legendScales.fillScale(g)
                        : defaultFill)
                    }
                    stroke={
                      geoms?.area?.stroke ||
                      (legendScales.strokeScale
                        ? legendScales.strokeScale(g)
                        : 'none')
                    }
                    strokeWidth={1.8}
                    fillOpacity={
                      focused.includes(g) ? geoms?.area?.fillOpacity : 0.5
                    }
                    strokeOpacity={
                      focused.includes(g) ? geoms?.area?.strokeOpacity : 0.5
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
