import React, { CSSProperties, useEffect, useRef } from 'react'
import { useGG, themeState } from '@graphique/graphique'
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
  onSelection?: (
    v: string | [number, number],
    event: PointerEvent | React.MouseEvent | React.KeyboardEvent,
  ) => void
  focusedThresholds?: [number, number][]
}

export const Legend = <Datum,>({
  title,
  style,
  orientation = 'vertical',
  format = (v: number) => v.toLocaleString(),
  numTicks,
  width,
  onSelection,
  focusedThresholds,
}: LegendProps) => {
  const { ggState } = useGG<Datum>() || {}
  const { copiedScales, copiedData } = ggState || {}
  const [{ font, geoms, animationDuration }] = useAtom(themeState)

  const geomAes = geoms?.tile?.aes
  const { groups } = copiedScales || {}

  const hasAppearanceAes = geomAes?.fill || geomAes?.stroke

  const { fontSize } = { ...style }

  const legendRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (legendRef.current) {
        legendRef.current.style.pointerEvents = 'all'
      }
    }, animationDuration)

    return () => clearTimeout(timeout)
  }, [animationDuration])

  return hasAppearanceAes ? (
    <div
      style={{
        marginTop: 12,
        fontFamily: font?.family,
        pointerEvents: 'none',
        ...style,
      }}
      ref={legendRef}
      data-testid="__gg_geom_tile_legend"
    >
      {title}
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
          scales={copiedScales}
          tickFormat={format}
          numTicks={numTicks}
          fontSize={fontSize}
          width={width}
          onSelection={onSelection}
          focusedThresholds={focusedThresholds}
        />
      )}
    </div>
  ) : null
}
