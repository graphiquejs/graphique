import React, { useRef, useEffect, useState } from 'react'
import { axisLeft, AxisScale } from 'd3-axis'
import { select } from 'd3-selection'
import 'd3-transition'
import { useAtom } from 'jotai'
import { themeState, yScaleState, tooltipState } from '../../atoms'
import { defaultGridOpacity } from './constants'
import { Aes } from '../types'
import { IScale } from '../../util/autoScale'

export interface YAxisProps {
  ggState: {
    id: string | undefined
    copiedData: unknown[]
    data: unknown[]
    aes: Aes
    width: number
    height: number
    margin: {
      top: number
      right: number
      bottom: number
      left: number
    }
    copiedScales: IScale
    scales: IScale
  }
  animate?: boolean
}

export const YAxis = ({ ggState, animate = true }: YAxisProps) => {
  const [{ axis: axisTheme, axisY, grid: gridTheme, font }] =
    useAtom(themeState)
  const { aes, height, width, margin, scales } = ggState || {
    width: 0,
    height: 0,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }
  const scale = scales?.yScale as AxisScale<number | string | Date>
  const [{ datum }] = useAtom(tooltipState)

  const [{ format, numTicks, highlightOnFocus, className }] =
    useAtom(yScaleState)

  const [firstRender, setFirstRender] = useState(true)
  useEffect(() => {
    setTimeout(() => setFirstRender(false), 0)
  }, [])

  const axisRef = useRef<SVGGElement>(null)
  const gridRef = useRef<SVGGElement>(null)

  const thisAxis =
    width && format
      ? axisLeft(scale).tickFormat((v, i) =>
          format({ value: v, index: i, width })
        )
      : axisLeft(scale)

  const drawAxis: (selection: any) => void = thisAxis
    .tickSizeOuter(0)
    .ticks(
      height && typeof numTicks === 'function' ? numTicks(height) : numTicks
    )

  const drawGrid: (selection: any) => void = axisLeft(scale)
    .tickSize(-width + margin.left + margin.right)
    .tickSizeOuter(0)
    .tickFormat(() => '')
    .ticks(
      height && typeof numTicks === 'function' ? numTicks(height) : numTicks
    )

  useEffect(() => {
    const axis = select(axisRef.current)

    if (animate) {
      axis.transition().duration(1000).call(drawAxis)
    } else {
      axis.call(drawAxis)
    }

    const grid = select(gridRef.current)

    if (animate) {
      grid.transition().duration(1000).call(drawGrid)
    } else {
      grid.call(drawGrid)
    }

    // axis line
    axis
      .select('path')
      .attr(
        'stroke',
        axisTheme?.showAxisLines || axisY?.showAxisLine
          ? axisTheme?.stroke || axisY?.stroke || 'none'
          : 'none'
      )
      .attr('fill', 'none')

    // ticks
    axis
      .selectAll('line')
      .attr(
        'stroke',
        axisY?.tickStroke ||
          axisTheme?.tickStroke ||
          gridTheme?.stroke ||
          'currentColor'
      )
      .style(
        'opacity',
        axisY?.tickStroke || axisTheme?.tickStroke || gridTheme?.stroke
          ? 1
          : defaultGridOpacity
      )

    // tick labels
    axis
      .selectAll('text')
      .data(scale.bandwidth ? scale.domain() : [])
      .attr(
        'fill',
        axisY?.tickLabel?.color || axisTheme?.tickLabel?.color || 'currentColor'
      )
      .style('opacity', (d) => {
        if (scale.bandwidth && datum && highlightOnFocus && aes?.y) {
          return aes?.y(datum[0]) === d ? 1 : 0.4
        }
        if (axisY?.tickLabel?.color || axisTheme?.tickLabel?.color) {
          return 1
        }
        return 0.8
      })

    axis
      .selectAll('text')
      .style(
        'font-size',
        axisY?.tickLabel?.fontSize || axisTheme?.tickLabel?.fontSize || 12
      )
      .style(
        'font-family',
        axisY?.tickLabel?.fontFamily ||
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
    axisY,
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
      <g ref={axisRef} transform={`translate(${margin.left}, 0)`} />
      <g ref={gridRef} transform={`translate(${margin.left}, 0)`} />
    </>
  ) : null
}
