import React, { useState, useEffect, useMemo } from 'react'
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
  ignoreDasharray?: boolean
}

export const CategoricalLegend = ({
  legendData,
  legendScales,
  orientation = 'vertical',
  labelFormat,
  fontSize = 12,
  onSelection,
  ignoreDasharray,
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

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    setIsFocused(legendGroups ?? [])
  }, [])

  const getGroup = useMemo(
    () => geoms?.line?.groupAccessor || (() => undefined),
    [geoms]
  )

  useEffect(() => {
    const dataGroups = Array.from(new Set(data!.map(getGroup))) as []
    
    setIsFocused(dataGroups ?? [])
  }, [data, getGroup])

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
        legendGroups?.map((g: string, i, groups) => {
          const strokeOpacity = (
            isFocused.includes(g)
              ? geoms?.line?.strokeOpacity
              : geoms?.line?.strokeOpacity || 1 * 0.5
          )

          return (
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
                      strokeOpacity={firstRender ? 0 : strokeOpacity}
                      strokeDasharray={
                        (legendScales.strokeDasharrayScale && !ignoreDasharray
                          ? legendScales.strokeDasharrayScale(g)
                          : undefined)
                      }
                      style={{
                        transition: 'stroke-opacity 500ms',
                      }}
                    />
                  </svg>
                </div>
                <div style={{ marginLeft: 4, fontSize }}>
                  {labelFormat ? labelFormat(g, i) : formatMissing(g)}
                </div>
              </div>
            </div>
          )
        }
        )}
    </div>
  )
}
