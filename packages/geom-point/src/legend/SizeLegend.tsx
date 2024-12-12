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
import { transition } from 'd3-transition'
import { SizeLabelDirection } from '../types'

export interface SizeLegendProps {
  /** title of legend */
  title?: React.ReactNode
  /** which side of legend to draw labels (_default_: `SizeLabelDirection.R`) */
  labelDirection?: SizeLabelDirection
  /** number of circles to use as references in legend (_default_: `3`) */
  numCircles?: 2 | 3
  /** fixed breakpoints within size range for circle references (takes precedence over `numCircles`) */
  radiiVals?: [number, number] | [number, number, number]
  /** function for formatting labels */
  format?: (v: string, i: number) => string
  /** width of legend in px (_default_: `120`) */
  width?: number
  /** additional styles passed to legend container */
  style?: CSSProperties
}

export const SizeLegend = ({
  labelDirection = SizeLabelDirection.R,
  radiiVals,
  width = 120,
  numCircles = 3,
  format,
  style,
  title,
}: SizeLegendProps) => {
  const [{ domain: sizeDomain, range: sizeRange }] =
    useAtom(radiusScaleState) || {}

  const [{ font, animationDuration, geoms }] = useAtom(themeState) || {}

  const { ggState } = useGG() || {}
  const { data } = ggState || {}

  const legendRef = useRef<SVGGElement | null>(null)

  const domain = useMemo(() => {
    if (sizeDomain && sizeDomain[0] && sizeDomain[1]) {
      return sizeDomain
    }
    if (data && geoms?.point?.size) {
      return extent(data, geoms.point.size) as [number, number]
    }
    return []
  }, [data, geoms, sizeDomain])

  const scale = useMemo(
    () =>
      scaleSqrt()
        .domain(domain)
        .range(sizeRange as [number, number]),
    [domain, sizeRange],
  )

  const tickVals = useMemo(() => {
    const ticks = scale.ticks()
    return (
      radiiVals ||
      (numCircles === 3
        ? [ticks[0], ticks[3], ticks[ticks.length - 1]]
        : (extent(ticks) as [number, number]))
    ).filter((v) => v >= domain[0]) as
      | [number, number, number]
      | [number, number]
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
      r: scale(v) < 0 ? 0 : scale(v),
    }))

    const duration = animationDuration ?? 1000
    const t = transition().duration(duration)

    // circles
    select(legendRef.current)
      .selectAll('circle')
      .attr('fill', 'transparent')
      .attr('stroke', 'currentColor')
      .style('opacity', 0.6)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '0.05 4')
      .attr('stroke-linecap', 'round')
      .attr('cx', 0)
      .data(legendData, (_, i) => i)
      .join(
        (enter) =>
          enter.append('circle').attr('r', 0).attr('cy', scale(maxVal)),
        (update) =>
          update.call((toUpdate) =>
            toUpdate
              .transition(t)
              .attr('r', (d) => d.r)
              .attr('cy', (d) =>
                d.value === maxVal ? 0 : scale(maxVal) - d.r,
              ),
          ),
      )

    // tick marks
    select(legendRef.current)
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('x1', (d: any, i) =>
        labelDirection === SizeLabelDirection.R
          ? d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2
          : -(d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2),
      )
      .attr(
        'x2',
        labelDirection === SizeLabelDirection.R
          ? scale(maxVal) + 15
          : -scale(maxVal) - 12,
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
              .transition(t)
              .attr('x1', (d, i) =>
                labelDirection === SizeLabelDirection.R
                  ? d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2
                  : -(d.r / 2 + (i + 15) * 0.5 - (i + 1) * 2),
              )
              .attr('y1', (d) => scale(maxVal) - 2 * d.r + 3)
              .attr('y2', (d) => scale(maxVal) - 2 * d.r + 3)
              .style('opacity', 0.25),
          ),
      )

    // labels
    select(legendRef.current)
      .selectAll('text')
      .data(legendData, (_, i) => i)
      .attr(
        'x',
        labelDirection === SizeLabelDirection.R
          ? scale(maxVal) + 18
          : -scale(maxVal) - 15,
      )
      .style('font-size', fontSize || 10)
      .attr('dominant-baseline', 'central')
      .attr(
        'text-anchor',
        labelDirection === SizeLabelDirection.R ? 'start' : 'end',
      )
      .attr('fill', color || 'currentColor')
      .text((d: any, i) =>
        format ? format(d.value, i) : d.value.toLocaleString(),
      )
      .join(
        (enter) =>
          enter.append('text').attr('y', scale(maxVal)).style('opacity', 0),
        (update) =>
          update.call((toUpdate) =>
            toUpdate
              .transition(t)
              .attr(
                'x',
                labelDirection === SizeLabelDirection.R
                  ? scale(maxVal) + 18
                  : -scale(maxVal) - 15,
              )
              .attr('y', (d) => scale(maxVal) - 2 * d.r + 3)
              .style('opacity', 0.85),
          ),
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
    labelDirection === SizeLabelDirection.R
      ? scale(maxVal) + 2
      : width - scale(maxVal) - 2

  const yTranslation = scale(maxVal) + 2

  return scale.domain()[0] && scale.domain()[1] ? (
    <div style={{ fontFamily: font?.family, ...style }}>
      {title}
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
