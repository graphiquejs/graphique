import React, { CSSProperties, useEffect, useRef } from 'react'
import { useGG, themeState, LegendOrientation } from '@graphique/graphique'
import { useAtom } from 'jotai'
import { CategoricalLegend } from './CategoricalLegend'
import { ColorBandLegend } from './ColorBandLegend'

export interface LegendProps {
  /** title of legend */
  title?: React.ReactNode
  /** determines vertical/horizontal orientation of categorical legend members (defaults to `LegendOrientation.V`) */
  orientation?: LegendOrientation
  /** function for formatting legend member labels (categorical) or tick labels (continuous/ordinal) */
  format?: (v: any, i: number) => string
  /** width of continuous/ordinal legend in px (defaults to `320`) */
  width?: number
  /** approximate number of ticks for continuous legend (defaults to `width / 64`) */
  numTicks?: number
  /** callback called for click events on legend members */
  onSelection?: (
    v: string | [number, number],
    event: PointerEvent | React.MouseEvent | React.KeyboardEvent,
  ) => void
  /** when using ordinal [fill scales](https://graphique.dev/docs/graphique/scales/fill), an array of thresholds for programatically focusing legend members */
  focusedThresholds?: [number, number][]
  /** additional styles passed to legend container */
  style?: CSSProperties
}

export const Legend = <Datum,>({
  title,
  style,
  orientation = LegendOrientation.V,
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
