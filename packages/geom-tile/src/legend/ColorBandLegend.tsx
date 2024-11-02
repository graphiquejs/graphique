import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  themeState,
  fillScaleState,
  strokeScaleState,
  IScale,
  usePageVisibility,
} from '@graphique/graphique'
import { useAtom } from 'jotai'
import { interpolateRound } from 'd3-interpolate'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'
import { range, quantile } from 'd3-array'
import { transition } from 'd3-transition'
import { scaleLinear } from 'd3-scale'
import {
  DEFAULT_TICK_STROKE,
  INTERPOLATING_CONSTANT,
  OPACITY,
} from './constants'

export interface ColorBandLegendProps<Datum> {
  scales: IScale<Datum>
  tickFormat?: (v: unknown, i: number) => string
  width?: number
  tickSize?: number
  height?: number
  margin?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
  numTicks?: number
  fontSize?: number | string
  onSelection?: (v: string | [number, number], event: PointerEvent) => void
  focusedThresholds?: [number, number][]
}

export const ColorBandLegend = <Datum,>({
  scales,
  tickFormat,
  width = 320,
  tickSize = 6,
  height = 30 + tickSize,
  margin,
  numTicks = width / 64,
  fontSize = 10,
  onSelection,
  focusedThresholds,
}: ColorBandLegendProps<Datum>) => {
  const legendRef = useRef<SVGSVGElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const axisRef = useRef<SVGGElement | null>(null)
  const ticksRef = useRef<SVGGElement | null>(null)
  const imageRef = useRef<SVGImageElement | null>(null)
  const imageRef2 = useRef<SVGImageElement | null>(null)
  const colorScale = scales?.fillScale || scales?.strokeScale
  const [{ geoms, font: themeFont, legend, animationDuration }] =
    useAtom(themeState)
  const [{ reverse: reverseFill }] = useAtom(fillScaleState)
  const [{ reverse: reverseStroke }] = useAtom(strokeScaleState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const isVisible = usePageVisibility()
  useEffect(() => {
    if (isVisible || firstRender)
      select(legendRef.current)
        .style('opacity', OPACITY.transparent)
        .transition('entrance')
        .duration(animationDuration!)
        .style('opacity', OPACITY.opaque)
  }, [isVisible, firstRender])

  const isReversed = reverseFill || reverseStroke

  const RAMP_N = 256

  const usedMargin = {
    top: 4,
    right: 0,
    bottom: 16 + tickSize,
    left: 0,
    ...margin,
  }

  const handleLegendSelection = useCallback(
    (fill: string, event: PointerEvent) => {
      if (colorScale) {
        onSelection?.(colorScale.invertExtent(fill), event)
      }
    },
    [colorScale],
  )

  const drawLegend = useCallback(
    (scale: any, font?: string) => {
      if (
        legendRef.current &&
        canvasRef.current &&
        axisRef.current &&
        ticksRef.current
      ) {
        const ramp = (canvas: HTMLCanvasElement, color: any, n: number) => {
          const context = canvas.getContext('2d')

          for (let i = 0; i < n; i += 1) {
            if (context && color) {
              context.fillStyle = color(i / (n - 1))
              context.fillRect(isReversed ? n - i : i, 0, 1, 1)
            }
          }
          return canvas
        }

        let x: any
        let tickValues: any
        const tickAdjust = (g: any) =>
          g
            .selectAll('.tick line')
            .attr('y1', usedMargin.top + usedMargin.bottom - height)

        let thresholds: number[]
        let thresholdFormat
        let numThresholds

        const legendSvg = select(legendRef.current)
        const canvas = select(canvasRef.current)
        const axis = select(axisRef.current)
        const ticks = select(ticksRef.current)
        const img = select(imageRef.current)
        const img2 = select(imageRef2.current)

        const t = transition().duration(animationDuration!)

        if (scale?.invertExtent) {
          if (scale?.thresholds) thresholds = scale.thresholds()
          else if (scale?.quantiles) thresholds = scale.quantiles()
          else if (scale?.clusters) thresholds = scale.clusters()
          else thresholds = scale.domain()

          numThresholds = thresholds?.length

          x = scaleLinear()
            .domain([-1, scale.range().length - 1])
            .range([usedMargin.left, width - usedMargin.right])

          if (firstRender) {
            legendSvg
              .append('g')
              .selectAll('rect')
              .data<{ value: string; focusedThresholds?: [number, number][] }>(
                scale.range().map((value: string) => ({
                  value,
                  focusedThresholds,
                })),
              )
              .join('rect')
              .on('click', (event, d) => {
                handleLegendSelection(d?.value, event)
              })
              .style('opacity', OPACITY.transparent)
              .style('cursor', onSelection ? 'pointer' : 'default')
              .attr('data-testid', '__gg_legend_color_rect')
              .attr('x', (d, i) => x(i - 1))
              .attr('y', usedMargin.top)
              .attr('width', (d, i) => x(i) - x(i - 1))
              .attr('height', height - usedMargin.top - usedMargin.bottom)
              .attr('fill', (d) => d.value)
              .style('opacity', (d) => {
                const dValues = scale?.invertExtent(d?.value)
                const dFocusedThresholds = d?.focusedThresholds

                const resolvedOpacity = ((scales?.fillScale &&
                  geoms?.tile?.fillOpacity) ||
                  (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                  undefined) as number | string

                if (!dFocusedThresholds) return resolvedOpacity

                return dFocusedThresholds?.length &&
                  dFocusedThresholds.some((th) =>
                    th?.every((threshold) => dValues?.includes(threshold)),
                  )
                  ? resolvedOpacity
                  : geoms?.tile?.unfocusedStyles?.fillOpacity!
              })
          } else {
            legendSvg
              .selectAll('rect')
              .data<{ value: string; focusedThresholds?: [number, number][] }>(
                scale.range().map((value: string) => ({
                  value,
                  focusedThresholds,
                })),
              )
              .join('rect')
              .on('click', (event, d) => {
                handleLegendSelection(d?.value, event)
              })
              .style('opacity', (d) => {
                const dValues = scale?.invertExtent(d?.value)
                const dFocusedThresholds = d?.focusedThresholds

                const resolvedOpacity = ((scales?.fillScale &&
                  geoms?.tile?.fillOpacity) ||
                  (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                  undefined) as number | string

                if (!dFocusedThresholds) return resolvedOpacity

                return dFocusedThresholds?.length &&
                  dFocusedThresholds.some((th) =>
                    th?.every((threshold) => dValues?.includes(threshold)),
                  )
                  ? resolvedOpacity
                  : geoms?.tile?.unfocusedStyles?.fillOpacity!
              })

              .attr('y', usedMargin.top)

              .attr('height', height - usedMargin.top - usedMargin.bottom)
              .style('cursor', onSelection ? 'pointer' : 'default')
              .transition(t)
              .attr('x', (d, i) => x(i - 1))
              .attr('width', (d, i) => x(i) - x(i - 1))
              .attr('fill', (d) => d?.value)
          }

          tickValues = range(thresholds.length)
          thresholdFormat = (i: number): string =>
            tickFormat ? tickFormat(thresholds[i], i) : String(thresholds[i])
        }

        if (scale?.interpolator) {
          x = Object.assign(
            scale
              .copy()
              .interpolator(
                interpolateRound(usedMargin.left, width - usedMargin.right),
              ),
            {
              range() {
                return [usedMargin.left, width - usedMargin.right]
              },
            },
          )

          if (firstRender) {
            img2
              .datum(scale.interpolator()(INTERPOLATING_CONSTANT))
              .style(
                'opacity',
                focusedThresholds
                  ? geoms?.tile?.unfocusedStyles?.fillOpacity!
                  : (((scales?.fillScale && geoms?.tile?.fillOpacity) ||
                      (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                      undefined) as number | string),
              )
              .attr('x', usedMargin.left)
              .attr('y', usedMargin.top)
              .attr('width', width - usedMargin.left - usedMargin.right)
              .attr('height', height - usedMargin.top - usedMargin.bottom)
              .attr('preserveAspectRatio', 'none')
              .attr(
                'xlink:href',
                ramp(
                  canvasRef.current as HTMLCanvasElement,
                  scale.interpolator(),
                  RAMP_N,
                ).toDataURL(),
              )

            img
              .datum(scale.interpolator()(INTERPOLATING_CONSTANT))
              .style(
                'opacity',
                focusedThresholds
                  ? geoms?.tile?.unfocusedStyles?.fillOpacity!
                  : (((scales?.fillScale && geoms?.tile?.fillOpacity) ||
                      (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                      undefined) as number | string),
              )
              .attr('x', usedMargin.left)
              .attr('y', usedMargin.top)
              .attr('width', width - usedMargin.left - usedMargin.right)
              .attr('height', height - usedMargin.top - usedMargin.bottom)
              .attr('preserveAspectRatio', 'none')
              .attr(
                'xlink:href',
                ramp(
                  canvasRef.current as HTMLCanvasElement,
                  scale.interpolator(),
                  RAMP_N,
                ).toDataURL(),
              )
              .attr('description', 'GeomTile continuous legend')
          } else {
            // create transition blending effect for color scale by crossfading
            // two separate images (old/new)
            img
              .style('opacity', OPACITY.transparent)
              .datum(scale.interpolator()(INTERPOLATING_CONSTANT))
              .attr(
                'xlink:href',
                ramp(
                  canvasRef.current as HTMLCanvasElement,
                  scale.interpolator(),
                  RAMP_N,
                ).toDataURL(),
              )
              .transition(t)
              .attr('width', width - usedMargin.left - usedMargin.right)
              .style('opacity', (d) => {
                if (d === scale.interpolator()(INTERPOLATING_CONSTANT)) {
                  return focusedThresholds
                    ? geoms?.tile?.unfocusedStyles?.fillOpacity!
                    : (((scales?.fillScale && geoms?.tile?.fillOpacity) ||
                        (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                        undefined) as number | string)
                }
                return OPACITY.transparent
              })

            if (img2.datum() !== scale.interpolator()(INTERPOLATING_CONSTANT)) {
              img2
                .datum(img.datum())
                .style(
                  'opacity',
                  focusedThresholds
                    ? geoms?.tile?.unfocusedStyles?.fillOpacity!
                    : (((scales?.fillScale && geoms?.tile?.fillOpacity) ||
                        (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                        undefined) as number | string),
                )
                .transition(t)
                .attr('width', width - usedMargin.left - usedMargin.right)
                .style('opacity', OPACITY.transparent)
            } else {
              img2
                .style(
                  'opacity',
                  focusedThresholds
                    ? geoms?.tile?.unfocusedStyles?.fillOpacity!
                    : (((scales?.fillScale && geoms?.tile?.fillOpacity) ||
                        (scales?.strokeScale && geoms?.tile?.strokeOpacity) ||
                        undefined) as number | string),
                )
                .attr(
                  'xlink:href',
                  ramp(
                    canvasRef.current as HTMLCanvasElement,
                    scale.interpolator(),
                    RAMP_N,
                  ).toDataURL(),
                )
                .transition(t)
                .attr('width', width - usedMargin.left - usedMargin.right)
                .style('opacity', OPACITY.transparent)
            }
          }

          if (!x?.ticks) {
            if (tickValues === undefined) {
              const n = Math.round(numTicks + 1)
              tickValues = range(n).map((i: number) =>
                quantile(scale.domain(), i / (n - 1)),
              )
            }
          }
          if (isReversed) {
            x.domain(x.domain().reverse())
          }
        }

        canvas.remove()

        const resolvedTickFormat = (f: ((i: number) => string) | undefined) => {
          if (typeof f === 'function') {
            return (v: unknown, i: number) => f(i)
          }
          if (typeof tickFormat === 'function') {
            return tickFormat as any
          }
          return undefined
        }

        axis
          .attr('transform', `translate(0, ${height - usedMargin.bottom})`)
          .transition(t)
          .call(
            axisBottom(x)
              .ticks(
                Math.round(numTicks + 1),
                typeof tickFormat === 'string' ? tickFormat : undefined,
              )
              .tickFormat(resolvedTickFormat(thresholdFormat))
              .tickSize(tickSize)
              .tickValues(tickValues),
          )

        const tickOpacity = legend?.tickColor
          ? OPACITY.opaque
          : OPACITY.tick.focused

        axis
          .call((g) => g.select('.domain').remove())
          .selectAll('line')
          .attr('stroke', legend?.tickColor || 'currentColor')
          .style('opacity', tickOpacity)

        const labelOpacity = legend?.labelColor
          ? OPACITY.opaque
          : OPACITY.tickLabel.focused
        if (firstRender) {
          axis
            .selectAll('.tick')
            .select('text')
            .style('font-family', font || 'sans-serif')
            .style('font-size', fontSize)
            .attr('fill', legend?.labelColor || 'currentColor')
            .attr('data-testid', '__gg_legend_tick_label')
            .datum((i) =>
              scale?.invertExtent && focusedThresholds
                ? focusedThresholds?.flat()?.includes(thresholds?.[i as number])
                : !focusedThresholds,
            )
            .style('opacity', (d) =>
              d ? labelOpacity : geoms?.tile?.unfocusedStyles?.fillOpacity!,
            )
        } else {
          axis
            .selectAll('.tick')
            .select('text')
            .datum((i) =>
              scale?.invertExtent && focusedThresholds
                ? focusedThresholds?.flat()?.includes(thresholds?.[i as number])
                : !focusedThresholds,
            )
            .style('opacity', (d) =>
              d ? labelOpacity : geoms?.tile?.unfocusedStyles?.fillOpacity!,
            )
        }

        // ticks whose color isn't depenedent on currentColor
        ticks
          .attr('transform', `translate(0, ${height - usedMargin.bottom})`)
          .transition(t)
          .call(
            axisBottom(x)
              .ticks(
                numThresholds ?? Math.round(numTicks + 1),
                typeof tickFormat === 'string' ? tickFormat : undefined,
              )
              .tickSize(1)
              .tickFormat(() => ''),
          )
          .selectAll('line')
          .style('pointer-events', 'none')
          .attr('stroke', DEFAULT_TICK_STROKE)

        ticks
          .call((g) => g.select('.domain').remove())
          .call((g) => g.selectAll('.tick').select('text').remove())
          .call(tickAdjust)

        // remove the firts/last ticks since they're unlabeled
        ticks
          .selectAll<SVGLineElement, number>('.tick line')
          .filter((d) => d < 0 || d === thresholds?.length)
          .interrupt()
          .attr('stroke', 'transparent')

        ticks
          .selectAll('line')
          .style('pointer-events', 'none')
          .style('opacity', (i) => {
            const value = thresholds?.[i as number]

            return !focusedThresholds ||
              focusedThresholds?.flat()?.includes(value)
              ? tickOpacity
              : OPACITY.tick.unfocused
          })
        ticks.call(tickAdjust).raise()
      }
    },
    [
      width,
      height,
      numTicks,
      tickFormat,
      tickSize,
      usedMargin,
      legend,
      geoms,
      scales,
      fontSize,
      isReversed,
      firstRender,
      animationDuration,
      focusedThresholds,
    ],
  )

  useEffect(() => {
    drawLegend(colorScale, themeFont?.family)
  }, [themeFont, colorScale, drawLegend])

  return (
    <div>
      {themeFont?.family && (
        <svg
          ref={legendRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            overflow: 'visible',
            display: 'block',
          }}
        >
          {colorScale?.interpolator && (
            <>
              <image ref={imageRef} />
              <image ref={imageRef2} />
            </>
          )}
          <g ref={axisRef} />
          <g ref={ticksRef} />
        </svg>
      )}
      <canvas ref={canvasRef} width={RAMP_N} height={1} />
    </div>
  )
}
