import React, { useRef, useEffect, useState, useMemo } from 'react'
import { axisBottom, AxisScale } from 'd3-axis'
import { select } from 'd3-selection'
import { useAtom } from 'jotai'
import { labelsState, themeState, xScaleState, tooltipState, TooltipProps } from '../../atoms'
import { defaultGridOpacity, defaultAnimationDuration } from './constants'
import { Aes } from '../types'
import { IScale } from '../../util/autoScale'

export interface XAxisProps<Datum> {
  ggState: {
    id: string | undefined
    copiedData: Datum[]
    data: Datum[]
    aes: Aes<Datum>
    width: number
    height: number
    margin: {
      top: number
      right: number
      bottom: number
      left: number
    }
    copiedScales: IScale<Datum>
    scales: IScale<Datum>
  }
  animate?: boolean
}

export const XAxis = <Datum,>({ ggState, animate = true }: XAxisProps<Datum>) => {
  const [{ axis: axisTheme, axisX, grid: gridTheme, font, animationDuration }] =
    useAtom(themeState)
  const { aes, width, margin, height, scales } = ggState || {
    width: 0,
    height: 0,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }
  const scale = scales?.xScale as AxisScale<number | string | Date>
  const [{ datum }] = useAtom<TooltipProps<Datum>>(tooltipState)
  const [labels] = useAtom(labelsState)
  const [{ format, numTicks, highlightOnFocus, className }] =
    useAtom(xScaleState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    const timeout = setTimeout(() => setFirstRender(false), 0)
    return () => clearTimeout(timeout)
  }, [])

  const duration = useMemo(
    () => animationDuration ?? defaultAnimationDuration,
    [animationDuration]
  )

  const axisRef = useRef<SVGGElement>(null)
  const gridRef = useRef<SVGGElement>(null)

  const thisAxis =
    width && format
      ? axisBottom(scale).tickFormat((v, i) =>
          format({ value: v, index: i, width })
        )
      : axisBottom(scale)

  const drawAxis: (selection: any) => void = thisAxis
    .tickSizeOuter(0)
    .ticks(width && typeof numTicks === 'function' ? numTicks(width) : numTicks)

  const drawGrid: (selection: any) => void = axisBottom(scale)
    .tickSize(-height + margin.top + margin.bottom)
    .tickSizeOuter(0)
    .tickFormat(() => '')
    .ticks(width && typeof numTicks === 'function' ? numTicks(width) : numTicks)

  useEffect(() => {
    const axis = select(axisRef.current)

    if (animate) {
      axis.transition().duration(duration).call(drawAxis)
    } else {
      axis.call(drawAxis)
    }

    const grid = select(gridRef.current)

    if (animate) {
      grid.transition().duration(duration).call(drawGrid)
    } else {
      grid.call(drawGrid)
    }

    // axis line
    axis
      .select('path')
      .attr(
        'stroke',
        axisTheme?.showAxisLines || axisX?.showAxisLine
          ? axisTheme?.stroke || axisX?.stroke || 'none'
          : 'none'
      )
      .attr('fill', 'none')

    // ticks
    axis
      .selectAll('line')
      .attr(
        'stroke',
        axisX?.tickStroke ||
          axisTheme?.tickStroke ||
          gridTheme?.stroke ||
          'currentColor'
      )
      .style(
        'opacity',
        axisX?.tickStroke || axisTheme?.tickStroke || gridTheme?.stroke
          ? 1
          : defaultGridOpacity
      )

    // tick labels
    axis
      .selectAll('text')
      .data(scale.bandwidth ? scale.domain() : [])
      .style('opacity', (d) => {
        if (scale.bandwidth && datum && highlightOnFocus) {
          return aes?.x(datum[0]) === d ? 1 : 0.4
        }
        if (axisX?.tickLabel?.color || axisTheme?.tickLabel?.color) {
          return 1
        }
        return 0.8
      })

    axis
      .selectAll('text')
      .attr(
        'fill',
        axisX?.tickLabel?.color || axisTheme?.tickLabel?.color || 'currentColor'
      )
      .attr('data-testid', '__gg_x_tick_label')
      .style(
        'font-size',
        axisX?.tickLabel?.fontSize || axisTheme?.tickLabel?.fontSize || '12px'
      )
      .style(
        'font-family',
        axisX?.tickLabel?.fontFamily ||
          axisTheme?.tickLabel?.fontFamily ||
          font?.family ||
          'sans-serif'
      )

    if (className) {
      axis.attr('class', className)
    }

    // grid lines
    grid
      .selectAll('line')
      .attr(
        'stroke',
        gridTheme?.stroke === null
          ? 'transparent'
          : gridTheme?.stroke || 'currentColor'
      )
      .style('opacity', gridTheme?.stroke ? 1 : defaultGridOpacity)
    grid.select('path').attr('stroke', 'none')
  }, [
    axisTheme,
    axisX,
    gridTheme,
    drawAxis,
    drawGrid,
    font,
    animate,
    aes,
    datum,
    highlightOnFocus,
    scale,
    className,
  ])

  return !firstRender ? (
    <>
      <g ref={axisRef} transform={`translate(0, ${height - margin.bottom})`} />
      <g ref={gridRef} transform={`translate(0, ${height - margin.bottom})`} />
      {labels.x && (
        <g>
          <text
            data-testid="__gg_x_label"
            style={{
              transform: `translate(${margin.left + 2}px, ${
                height - margin.bottom + 36
              }px)`,
              pointerEvents: 'none',
              fontFamily:
                axisX?.label?.fontFamily ||
                axisTheme?.label?.fontFamily ||
                font?.family,
              fontSize:
                axisX?.label?.fontSize || axisTheme?.label?.fontSize || 12,
              fill:
                axisX?.label?.color ||
                axisTheme?.label?.color ||
                'currentColor',
              fontWeight: 600,
            }}
          >
            {labels.x}
          </text>
        </g>
      )}
    </>
  ) : null
}
