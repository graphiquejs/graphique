import React, {
  CSSProperties,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'
import { useAtom } from 'jotai'
import { select } from 'd3-selection'
import { extent, max } from 'd3-array'
import { useGG, radiusScaleState, themeState } from '@graphique/graphique'
import { scaleSqrt } from 'd3-scale'

export interface SizeLegendProps {
  labelDirection?: 'left' | 'right'
  numCircles?: 2 | 3
  radiiVals?:
    | [number, number]
    | [number, number, number]
    | [undefined, undefined]
  format?: (v: any, i: number) => string
  width?: number
  style?: CSSProperties
  title?: React.ReactNode
}

export const SizeLegend = ({
  labelDirection = 'right',
  radiiVals,
  width = 120,
  numCircles = 3,
  format,
  style,
  title,
}: SizeLegendProps) => {
  const [{ domain: sizeDomain, range: sizeRange }] =
    useAtom(radiusScaleState) || {}

  const [{ font, legend, animationDuration }] = useAtom(themeState) || {}

  const { ggState } = useGG() || {}
  const { aes, data } = ggState || {}

  const legendRef = useRef<SVGGElement | null>(null)

  const domain = useMemo(() => {
    if (sizeDomain && sizeDomain[0] && sizeDomain[1]) {
      return sizeDomain
    }
    if (data && aes?.size) {
      return extent(data, aes.size) as [number, number]
    }
    return []
  }, [data, aes, sizeDomain])

  const scale = useMemo(
    () =>
      scaleSqrt()
        .domain(domain)
        .range(sizeRange as [number, number]),
    [domain, sizeRange]
  )

  const tickVals = useMemo(() => {
    const ticks = scale.ticks()
    return (
      radiiVals || numCircles === 3
        ? [ticks[0], ticks[3], ticks[ticks.length - 1]]
        : extent(ticks)
    ) as [number, number, number] | [number, number]
  }, [radiiVals, numCircles, scale])

  const maxVal = useMemo(() => max(tickVals) || 0, [tickVals])

  const { fontSize, color } = { ...style }

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const legendData = tickVals.map((v) => ({
      value: v,
      r: scale(v),
    }))

    const duration = animationDuration ?? 1000

    // circles
    select(legendRef.current)
      .selectAll('circle')
      .attr('fill', 'transparent')
      .attr('stroke', 'currentColor')
      .style('opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '0 4')
      .attr('stroke-linecap', 'round')
      .attr('cx', 0)
      .data(legendData, (_, i) => i)
      .join(
        (enter) =>
          enter.append('circle').attr('r', 0).attr('cy', scale(maxVal)),
        (update) =>
          update.call((toUpdate) =>
            toUpdate
              .transition()
              .duration(duration)
              .attr('r', (d) => d.r)
              .attr('cy', (d) => (d.value === maxVal ? 0 : scale(maxVal) - d.r))
          )
      )

    // tick marks
    select(legendRef.current)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('x1', (d: any, i) =>
        labelDirection === 'right'
          ? d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2
          : -(d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2)
      )
      .attr(
        'x2',
        labelDirection === 'right' ? scale(maxVal) + 15 : -scale(maxVal) - 12
      )
      .data(legendData, (_, i) => i)
      .join(
        (enter) =>
          enter
            .append('line')
            .attr('y1', scale(maxVal))
            .attr('y2', scale(maxVal))
            .style('opacity', 0),
        (update) =>
          update.call((toUpdate) =>
            toUpdate
              .transition()
              .duration(duration)
              .attr('x1', (d, i) =>
                labelDirection === 'right'
                  ? d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2
                  : -(d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2)
              )
              .attr('y1', (d) => scale(maxVal) - 2 * d.r + 3)
              .attr('y2', (d) => scale(maxVal) - 2 * d.r + 3)
              .style('opacity', 0.25)
          )
      )

    // labels
    select(legendRef.current)
      .selectAll('text')
      .data(legendData, (_, i) => i)
      .attr(
        'x',
        labelDirection === 'right' ? scale(maxVal) + 18 : -scale(maxVal) - 15
      )
      .style('font-size', fontSize || 10)
      .attr('dominant-baseline', 'central')
      .attr('text-anchor', labelDirection === 'right' ? 'start' : 'end')
      .attr('fill', color || 'currentColor')
      .text((d: any, i) =>
        format ? format(d.value, i) : d.value.toLocaleString()
      )
      .join(
        (enter) =>
          enter.append('text').attr('y', scale(maxVal)).style('opacity', 0),
        (update) =>
          update.call((toUpdate) =>
            toUpdate
              .transition()
              .duration(duration)
              .attr(
                'x',
                labelDirection === 'right'
                  ? scale(maxVal) + 18
                  : -scale(maxVal) - 15
              )
              .attr('y', (d) => scale(maxVal) - 2 * d.r + 3)
              .style('opacity', 0.85)
          )
      )
  }, [
    firstRender,
    scale,
    tickVals,
    font,
    format,
    labelDirection,
    maxVal,
    fontSize,
    color,
    animationDuration,
  ])

  const xTranslation =
    labelDirection === 'right' ? scale(maxVal) + 2 : width - scale(maxVal) - 2

  const yTranslation = scale(maxVal) + 2

  return scale.domain()[0] && scale.domain()[1] ? (
    <div style={{ fontFamily: font?.family, ...style }}>
      <div style={{ color: legend?.titleColor }}>{title}</div>
      <div style={{ marginTop: 8 }}>
        <svg height={scale(maxVal) * 2 + 4} width={width}>
          <g
            style={{
              transform: `translate(${xTranslation}px, ${yTranslation}px)`,
            }}
            ref={legendRef}
          />
        </svg>
      </div>
    </div>
  ) : null
}
