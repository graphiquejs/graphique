import React, { useCallback, useEffect, useState, useRef } from 'react'
import { useAtom } from 'jotai'
import {
  themeState,
  fillScaleState,
  strokeScaleState,
  IScale,
} from '@graphique/graphique'
import { interpolateRound } from 'd3-interpolate'
import { select } from 'd3-selection'
import { axisBottom } from 'd3-axis'
import { range, quantile } from 'd3-array'

export interface ColorBandLegendProps {
  scales: IScale
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
}

export const ColorBandLegend = ({
  scales,
  tickFormat,
  width = 320,
  tickSize = 6,
  height = 30 + tickSize,
  margin,
  numTicks = width / 64,
  fontSize = 10,
}: ColorBandLegendProps) => {
  const legendRef = useRef<SVGSVGElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const axisRef = useRef<SVGGElement | null>(null)
  const ticksRef = useRef<SVGGElement | null>(null)
  const imageRef = useRef<SVGImageElement | null>(null)
  const colorScale = scales?.fillScale || scales?.strokeScale
  const [{ geoms, font: themeFont, legend }] = useAtom(themeState)
  const [{ reverse: reverseFill }] = useAtom(fillScaleState)
  const [{ reverse: reverseStroke }] = useAtom(strokeScaleState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  const isReversed = reverseFill || reverseStroke

  const RAMP_N = 256

  const usedMargin = {
    top: 4,
    right: 0,
    bottom: 16 + tickSize,
    left: 0,
    ...margin,
  }
  const drawLegend = useCallback(
    (scale: any, font?: string) => {
      if (
        legendRef.current &&
        canvasRef.current &&
        axisRef.current &&
        ticksRef.current &&
        imageRef.current
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
        // let scaleType = "unknown"

        const canvas = select(canvasRef.current)
        const axis = select(axisRef.current)
        const ticks = select(ticksRef.current)
        const img = select(imageRef.current)

        if (scale?.interpolate) {
          // scaleType = "continuous"
        } else if (scale?.interpolator) {
          // scaleType = "sequential"
          x = Object.assign(
            scale
              .copy()
              .interpolator(
                interpolateRound(usedMargin.left, width - usedMargin.right)
              ),
            {
              range() {
                return [usedMargin.left, width - usedMargin.right]
              },
            }
          )

          img
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
                RAMP_N
              ).toDataURL()
            )

          if (firstRender) {
            img
              .style('opacity', 0)
              .transition()
              .duration(1000)
              .style(
                'opacity',
                ((scales?.fillScale && geoms?.bar?.fillOpacity) ||
                  (scales?.strokeScale && geoms?.bar?.strokeOpacity) ||
                  undefined) as number | string
              )
          }

          if (!x.ticks) {
            if (tickValues === undefined) {
              const n = Math.round(numTicks + 1)
              tickValues = range(n).map((i: number) =>
                quantile(scale.domain(), i / (n - 1))
              )
            }
          }

          canvas.remove()
        }

        if (isReversed) {
          x.domain(x.domain().reverse())
        }

        axis
          .attr('transform', `translate(0,${height - usedMargin.bottom})`)
          .transition()
          .duration(1000)
          .call(
            axisBottom(x)
              .ticks(
                numTicks,
                typeof tickFormat === 'string' ? tickFormat : undefined
              )
              .tickFormat(
                typeof tickFormat === 'function'
                  ? (tickFormat as any)
                  : undefined
              )
              .tickSize(tickSize)
              .tickValues(tickValues)
          )

        axis
          .call((g) => g.select('.domain').remove())
          .selectAll('line')
          .attr('stroke', legend?.tickColor || 'currentColor')
          .style('opacity', legend?.tickColor ? 1 : 0.7)

        axis
          .selectAll('.tick')
          .select('text')
          .style('font-family', font || 'sans-serif')
          .style('font-size', fontSize)
          .attr('fill', legend?.labelColor || 'currentColor')
          .style('opacity', legend?.labelColor ? 1 : 0.85)

        // ticks whose color isn't depenedent on currentColor
        ticks
          .attr('transform', `translate(0,${height - usedMargin.bottom})`)
          .transition()
          .duration(1000)
          .call(
            axisBottom(x)
              .ticks(
                numTicks,
                typeof tickFormat === 'string' ? tickFormat : undefined
              )
              .tickSize(1)
              .tickFormat(() => '')
          )
          .selectAll('line')
          .attr('stroke', '#111')

        ticks
          .call((g) => g.select('.domain').remove())
          .call((g) => g.selectAll('.tick').select('text').remove())
          .call(tickAdjust)
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
    ]
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
          <image ref={imageRef} />
          <g ref={axisRef} />
          <g ref={ticksRef} />
        </svg>
      )}
      <canvas ref={canvasRef} width={RAMP_N} height={1} />
    </div>
  )
}
